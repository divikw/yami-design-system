import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const checker = fileURLToPath(new URL("./check-boundaries.mjs", import.meta.url));

function runCheck(t, sources) {
  const cwd = mkdtempSync(path.join(tmpdir(), "yami-boundaries-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  for (const directory of ["apps/canvas", "packages/design-system", "packages/contracts", "packages/commerce-catalog", "packages/prototypes"]) {
    mkdirSync(path.join(cwd, directory), { recursive: true });
  }
  const catalogDir = path.join(cwd, "packages/design-system/generated");
  mkdirSync(catalogDir, { recursive: true });
  writeFileSync(path.join(catalogDir, "catalog.json"), JSON.stringify({
    components: ["Drawer", "Popover", "Select", "Tabs", "DropdownMenu", "FilterChip"].map((id) => ({ id, meta: {} })),
  }));
  for (const [filename, source] of Object.entries(sources)) {
    const target = path.join(cwd, filename);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
  return spawnSync(process.execPath, [checker], { cwd, encoding: "utf8" });
}

test("page and Storybook code rejects Base UI imports with corresponding YAMI exports", (t) => {
  const sources = {
    "packages/prototypes/pages/Home/Overlay.tsx": 'import { Drawer } from "@base-ui/react/drawer";',
    "apps/canvas/app/preview/page.tsx": '\nimport { Drawer as Primitive, Collapsible } from "@base-ui/react";',
    "packages/design-system/components/Header/Header.draft.stories.tsx": 'void import("@base-ui/react/popover");',
    "packages/design-system/storybook/header/overlay.ts": 'export { Select } from "@base-ui/react/select";',
    "apps/storybook/.storybook/draft-helper.cjs": 'require("@base-ui/react/tabs");',
    "packages/prototypes/pages/Home/Menu.tsx": 'import { Menu } from "@base-ui/react/menu";',
  };
  const result = runCheck(t, sources);
  assert.equal(result.status, 1, result.stderr);
  for (const filename of Object.keys(sources)) {
    const line = filename.endsWith("/page.tsx") ? 2 : 1;
    assert.ok(result.stderr.includes(`${filename}:${line} directly imports Base UI`), result.stderr);
  }
  assert.ok(result.stderr.includes("Use YAMI Drawer"), result.stderr);
  assert.ok(result.stderr.includes("Use YAMI DropdownMenu"), result.stderr);
  assert.match(result.stderr, /Warning: .*uses Base UI Collapsible/);
});

test("missing YAMI equivalents warn without failing the check", (t) => {
  const result = runCheck(t, {
    "packages/prototypes/pages/Home/Details.tsx": 'import { Collapsible } from "@base-ui/react/collapsible";',
    "packages/design-system/components/Header/Header.draft.stories.tsx": 'import { NumberField } from "@base-ui/react";',
    "packages/design-system/storybook/header/toggle.ts": 'import { Toggle } from "@base-ui/react/toggle";',
    "apps/storybook/.storybook/draft-helper.cjs": 'const baseUi = require("@base-ui/react");',
  });
  assert.equal(result.status, 0, result.stderr);
  for (const name of ["Collapsible", "NumberField", "Toggle"]) {
    assert.match(result.stderr, new RegExp(`Warning: .*uses Base UI ${name}.*Direct use is allowed`));
  }
  assert.match(result.stderr, /Warning: .*without identifying a primitive/);
});

test("YAMI wrapper imports and examples in comments or strings pass", (t) => {
  const result = runCheck(t, {
    "packages/design-system/components/Drawer/Drawer.tsx": 'import { Drawer } from "@base-ui/react/drawer";',
    "packages/design-system/components/Header/Header.draft.stories.tsx": 'import { Drawer } from "../Drawer";',
    "packages/prototypes/pages/Home/Home.tsx": [
      'import { Popover } from "@yami/design-system";',
      'import other from "@base-ui/react-example";',
      '// import { Popover } from "@base-ui/react/popover";',
      `const example = 'import { Drawer } from "@base-ui/react/drawer"';`,
      'const snippet = <code>import("@base-ui/react/popover")</code>;',
    ].join("\n"),
    "apps/storybook/storybook-static/assets/Preview.stories.js": 'import "@base-ui/react/drawer";',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
});
