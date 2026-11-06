---
slug: consume-package
title: Use YAMI in an existing project
description: "Install local React Web candidates, connect the versioned Skill and read-only MCP, and verify upgrades and rollback."
group: start
order: 25
keywords: ["Install", "Package", "Consumer", "Skill", "MCP", "Codex", "Upgrade", "Rollback"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/yami-design-cli/README.md
  - docs/adr/009-agent-ready-contracts-and-distribution.md
  - packages/design-system/DISTRIBUTION.md
  - packages/design-system/distribution.json
  - packages/design-system/distribution/MCP.md
  - packages/design-system/UPGRADING.md
  - tooling/distribution/upgrade.mjs
---

For teams that already have a React Web application and want to reuse YAMI components and design knowledge. Follow this page for installation, styles, Skill, MCP and verification without forking the entire YAMI repository or running upstream Storybook.

## Check the supported scope

These are local candidates for the authorized environment. They are not published to npm or an internal package registry.

| Item | Current scope |
| --- | --- |
| Component package | `@yami/design-system@0.2.0-candidate.4` |
| Companion MCP | `@yami/design-system-mcp@0.1.0-candidate.8`, bound to that exact component version |
| Setup CLI (optional) | `yami-design-cli@0.1.0-candidate.1` |
| Stable components | Button (including ButtonLink), Input, Card, ProductCard, ProductList, HeroBanner, ShortcutRail, Billboard |
| Beta preview | `@yami/design-system/components/Header` (includes the sticky storefront header) |
| Runtime | Node 24; React / React DOM `~19.3.1` |
| Verified hosts | Next.js 16.4.3 App Router, Vite 8.3.5, TypeScript 6.0.2 |

The full source, Storybook and legacy Registry contain more components than the candidate exposes. React Native and other host versions are outside this verification scope.

Consumer projects use YAMI's own versioned package, packaged Skill and read-only MCP; the internal Registry maintains the source-distribution contract. shadcn is a reference for structured distribution, AI discovery and contract/example retrieval. Its CLI/Registry compatibility layer is outside the roadmap and is not a prerequisite for using YAMI.

## Obtain and verify the candidates

Ask the maintainer for the original component and MCP tarballs from the same delivery and the SHA-512 integrity value for each filename (in `sha512-...` format). If you use the CLI, obtain its original tarball and integrity value as well. This example places the received files under `./.artifacts/` and calculates their integrity values from the consumer project root.

```bash
node -e '
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
for (const file of process.argv.slice(1)) {
  const digest = createHash("sha512").update(readFileSync(file)).digest("base64");
  console.log(file, "sha512-" + digest);
}
' ./.artifacts/*.tgz
```

Check that all required files are present and compare each result by filename with the value supplied by the maintainer. Install after all values match. If a file is missing or a value differs, request the corresponding original file again.

## Initialize with yami-design-cli

The CLI is a separate private local candidate named `yami-design-cli`, with the same executable name. It supports Node 24, npm/pnpm and standalone Next.js/Vite applications, targeting macOS/Linux. Local verification runs on macOS; Linux verification is configured in a dedicated CI job. Workspaces and Windows are outside that scope.

Use the three verified tarballs from the consumer project root:

```bash
npm install --save-dev ./.artifacts/yami-design-cli-0.1.0-candidate.1.tgz
./node_modules/.bin/yami-design-cli init \
  --design-package ./.artifacts/yami-design-system-0.2.0-candidate.4.tgz \
  --mcp-package ./.artifacts/yami-design-system-mcp-0.1.0-candidate.8.tgz \
  --locale en --dry-run
```

Remove `--dry-run` to initialize. The CLI adds the design package to dependencies and MCP to devDependencies, then connects the same project Skill and MCP configuration documented below. Repeated matching setup makes no additional changes. Conflicting content, mismatched artifacts and unsupported environments fail before installation. A later failure can leave completed dependency/configuration changes; inspect the reported phase and restore reviewed artifacts and lockfile as needed.

```bash
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` reads installed contents, versions, Skill and MCP configuration, then actually queries a design document, component contract and example. Exit 0 means connection checks passed; blockers produce a nonzero exit. It does not call a model or establish visual/behavioral acceptance.

The CLI does not modify application entry points, global resets, AGENTS.md, client trust or global settings. Load styles below, reconnect the trusted client and run consumer checks. Use `--cwd` to select the application and `--package-manager npm|pnpm` to choose a manager explicitly; relative tarball paths use the invocation directory. The manual steps below also remain available independently.

## Install and lock the artifacts

For manual setup, install the component package first, then add the paired MCP package as a development dependency. Run both commands from the consumer project root.

```bash
npm install ./.artifacts/yami-design-system-0.2.0-candidate.4.tgz
npm install --save-dev ./.artifacts/yami-design-system-mcp-0.1.0-candidate.8.tgz
```

Commit the consumer's `package.json` and lockfile together. Keep the original tarballs in the team's authorized artifact location. On a new machine or in CI, obtain and verify the same files, then place them at the paths recorded by the `file:` references. Use paths relative to the project so the layout can be reproduced on another machine.

Include development dependencies when verifying the CLI and MCP. Use `npm ci` or `pnpm install --frozen-lockfile` to restore the locked installation.

If the project carries an MCP configuration from the previous environment, follow [Configure project read-only MCP](#configure-project-read-only-mcp) after installation to update the local Node path, MCP entry and working directory before running `doctor` or querying in Codex.

GT Walsheim remains subject to its existing license. Confirm the target environment before loading its font entry; a preview with missing fonts is not a brand visual acceptance result.

## Load styles and use components

Load once in Next.js `app/layout.tsx` or Vite `src/main.tsx`:

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

`base.css` affects global typography, headings and links. Inspect the host reset first; a partial integration may omit it while maintaining its own baseline and verifying the components used. Do not copy Token values or private component styles.

```tsx
'use client';
import { Button } from '@yami/design-system/components/Button';

export function SaveButton() {
  return <Button htmlType="button" onClick={() => window.alert('Saved')}>Save</Button>;
}
```

Replace the example feedback with real application behavior. Keep event handlers and controlled state in consumer Client Components. Declare `lang="en"` or `lang="zh"` on `html`; add the `dark` class for dark mode. If omitting the font entry, provide an authorized host font loader.

## Let Codex discover the packaged Skill

This example assumes installation at the project root. In a monorepo, adapt paths to the actual application; do not point to knowledge in another checkout.

Create `.agents/skills/yami-consumer/SKILL.md`:

```markdown
---
name: yami-consumer
description: Use when creating or reviewing YAMI-branded React UI in this project; read the installed version's rules, contracts and examples.
---

Read ../../../node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.md first.
Confirm the installed version using the adjacent index.json and use only its public components.
Read component contracts and examples through yami_design_system MCP; check every snapshot.
Report missing capabilities without inventing APIs or falling back to another version's global Skill.
Follow the current project's edit scope and verification requirements. This Skill does not authorize publishing.
```

The reading convention can also be placed in `AGENTS.md` at the project root, using `node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.md` relative to that root. Do not copy the Skill directory's `../../../` prefix. Locate the installed entry points:

```bash
node -p "require.resolve('@yami/design-system/skill')"
node -p "require.resolve('@yami/design-system/knowledge/index.json')"
```

This configuration guides existing AI tools to packaged knowledge. It does not install an independent agent or prove generated output has passed acceptance checks.

## Configure project read-only MCP

From the consumer project root, resolve the local Node path, MCP entry and project directory.

```bash
node -p "process.execPath"
node -p "require.resolve('@yami/design-system-mcp/cli')"
pwd -P
```

Put the three results into `command`, `args` and `cwd` in the project's `.codex/config.toml`, respectively. If `[mcp_servers.yami_design_system]` already exists, update its paths and preserve the rest of the project configuration.

```toml
[mcp_servers.yami_design_system]
command = "/absolute/path/to/node"
args = ["/absolute/path/returned/by/require.resolve/cli.mjs"]
cwd = "/absolute/path/to/consumer"
enabled_tools = ["list_design_documents", "search_design_documents", "read_design_document", "list_components", "get_component_contract", "get_component_example"]
startup_timeout_sec = 20
tool_timeout_sec = 30
```

Project configuration follows Codex's trusted project rules. If you use `command = "node"`, the PATH for both Codex and `doctor` should resolve to the same Node 24 executable. [Official MCP documentation](https://developers.openai.com/codex/mcp)

```bash
codex mcp get yami_design_system --json
```

The command above checks the configuration. Open and trust the consumer project in Codex, reconnect or restart the client, then ask it to make a real query. For example, “Call the project's `yami_design_system` MCP tool `list_components` and show the tool response's `snapshot`.”

Confirm that `list_components` succeeded and read the `snapshot` in the actual tool response. With the CLI, confirm that `doctor --json` reports `status` as `pass` and compare every field in the two snapshots, including `packageVersion`, `sourceCommit` and `contentDigest`. With manual setup, compare the snapshot fields with the installed component package's `candidate-manifest.json`. Then read the contracts, examples and rules you need. The server reads indexed package files only and provides read-only knowledge queries.

## Verify first use

Give AI a small task with a clear boundary and require a report containing:

- Package version, Skill path, MCP snapshot, and the contracts and examples actually read.
- Changed files, application behavior and missing component capabilities.
- Results from the project's own typecheck, production build and browser verification.
- Languages, light/dark themes, desktop/mobile layouts, keyboard focus and main interactions checked.

A successful MCP query proves knowledge is readable. The page must still use real components and pass the consumer's checks; do not require consumers to run `pnpm validate`, which exists only in the YAMI source repository.

## Upgrade and roll back

1. Keep both previous original tarballs and their integrity values, the consumer's `package.json` and lockfile, and the verified snapshot and page test results. Read the new component package's `UPGRADE.json` for the paired versions, migration steps and page acceptance checks.
2. Update both component and MCP `file:` references in `package.json`, then use the project's package manager to run `npm install` or `pnpm install` and update the lockfile. If the install path changes, update the MCP configuration as described above. Reconnect Codex, verify the new snapshot in the same way and check the page again.
3. To roll back, restore the previous `package.json`, lockfile and the two original tarballs they reference, then reinstall from the lockfile. Check the MCP paths and reconnect. Confirm a real query returns the previous snapshot, then rerun the consumer build and key browser checks.

The packaged `UPGRADING.md` explains version gates and their limits. Use the original files for rollback.

## Troubleshoot common problems

| Symptom | Action |
| --- | --- |
| Package or CLI not found | Check the dependencies and tarball paths in the consumer project. If using the CLI, confirm that it is also installed |
| MCP will not start | Check Node 24, the absolute CLI path and project directory; keep script logs out of protocol stdout |
| Codex cannot find `list_components` | Open the trusted consumer project, check `codex mcp get yami_design_system --json`, then reconnect |
| Snapshot version differs | Check the exact pair, lockfile and real installation path, then restart MCP |
| Styles or fonts differ | Check CSS order, host reset, font requests and the authorized scope |
| Missing component or prop | Read the current index and contract; report the gap without borrowing unopened source entries |
| A new machine or CI cannot install a local path | Obtain and verify the original tarballs, restore them at the paths recorded by the `file:` references and reinstall from the lockfile |
