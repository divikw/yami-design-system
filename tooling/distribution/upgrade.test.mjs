import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assertUnreleased, assertUpgrade, compareApi, compareVersions, loadReleases, versionParts } from "./upgrade.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const declaration = 'export type Size = "sm" | "md";\nexport interface Props { size?: Size; disabled?: boolean; }\nexport declare function Control(props: Props): string;\n';
function snapshot(text = declaration, version = "1.2.3") {
  return {
    package: { version, exports: { ".": { types: "./components/index.d.ts", import: "./components/index.js" } }, peerDependencies: { react: "~19.3.1" } },
    declarations: { "components/index.d.ts": text }, tokens: ["--text-primary", "--space-100"], runtime: { "components/index.js": "original" },
  };
}
function note(version = "1.2.4", changeType = "patch") {
  return { from: "1.2.3", to: version, mcpTo: "1.0.1", changeType, summary: "Reviewed change", migration: "Replace paired artifacts and lockfile; restart MCP", rollback: "Restore previous artifacts and lockfile", visualAndBehavior: "Review runtime and default changes separately" };
}

test("versions sort candidate numbers, stable releases and invalid input correctly", () => {
  assert.ok(compareVersions("0.1.0-candidate.10", "0.1.0-candidate.9") > 0);
  assert.ok(compareVersions("0.1.0", "0.1.0-candidate.10") > 0);
  assert.ok(compareVersions("0.2.0-candidate.1", "0.1.9") > 0);
  for (const version of ["01.2.3", "1.2", "1.2.3-candidate.01", "../1.2.3", "1.2.3-beta.1"]) assert.throws(() => versionParts(version), /Unsupported/);
});

test("both delivered package versions are locked, even if their local files are absent", () => {
  const releases = [{ component: snapshot(), mcp: { version: "1.0.0" } }];
  assert.throws(() => assertUnreleased({ version: "1.2.3", mcpVersion: "1.0.1" }, releases), /delivery-locked/);
  assert.throws(() => assertUnreleased({ version: "1.2.4", mcpVersion: "1.0.0" }, releases), /MCP version.*delivery-locked/);
  assertUnreleased({ version: "1.2.4", mcpVersion: "1.0.1" }, releases);
});

test("a delivery ledger cannot bind the same MCP version to two component releases", async () => {
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, "dist/release-load-"));
  try {
    const records = path.join(directory, "tooling/distribution/releases");
    await fs.mkdir(records, { recursive: true });
    for (const version of ["1.0.0", "1.0.1"]) await fs.writeFile(path.join(records, `${version}.json`), JSON.stringify({ schemaVersion: 1, component: { package: { version } }, mcp: { version: "1.0.0" } }));
    await assert.rejects(loadReleases(directory), /MCP version cannot be reused/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("unchanged APIs can advance a patch candidate", async () => {
  const current = snapshot(declaration, "1.2.4");
  const diff = await compareApi(snapshot(), current, root);
  assert.deepEqual(diff, { breaking: [], additions: [], runtimeChanged: false });
  assertUpgrade(snapshot(), current, note(), diff, "1.0.1");
});

for (const [name, text] of [
  ["removed optional prop", declaration.replace(" disabled?: boolean;", "")],
  ["new required prop", declaration.replace("size?:", "size:")],
  ["narrowed enum", declaration.replace('"sm" | "md"', '"sm"')],
  ["changed function return", declaration.replace("): string", "): number")],
  ["removed public export", declaration.replace("export declare function Control(props: Props): string;", "")],
  ["erased prop type", declaration.replace('export type Size = "sm" | "md";', "export type Size = any;")],
]) {
  test(`${name} fails a patch upgrade and requires a major version`, async () => {
    const current = snapshot(text, "1.2.4");
    const diff = await compareApi(snapshot(), current, root);
    assert.ok(diff.breaking.length > 0, name);
    assert.throws(() => assertUpgrade(snapshot(), current, note(), diff, "1.0.1"), /major version/);
    const major = { ...current, package: { ...current.package, version: "2.0.0" } };
    assertUpgrade(snapshot(), major, note("2.0.0", "major"), diff, "1.0.1");
  });
}

test("added optional props, exports and enum values require a minor version", async () => {
  const current = snapshot(declaration.replace('"sm" | "md"', '"sm" | "md" | "lg"').replace("disabled?: boolean;", "disabled?: boolean; label?: string;") + "export type Extra = string;\n", "1.2.4");
  const diff = await compareApi(snapshot(), current, root);
  assert.deepEqual(diff.breaking, []);
  assert.ok(diff.additions.length > 0);
  assert.throws(() => assertUpgrade(snapshot(), current, note(), diff, "1.0.1"), /minor version/);
  assertUpgrade(snapshot(), { ...current, package: { ...current.package, version: "1.3.0" } }, note("1.3.0", "minor"), diff, "1.0.1");
});

test("variant-only optional props cannot be removed or added without the matching version bump", async () => {
  const text = 'export type Props = { kind: "text"; label?: string } | { kind: "image"; src: string };\nexport declare function Control(props: Props): string;\n';
  const withoutLabel = text.replace(" label?: string", "");
  const removed = await compareApi(snapshot(text), snapshot(withoutLabel, "1.2.4"), root);
  assert.ok(removed.breaking.length > 0, "Removing a union branch's optional prop must be detected");
  assert.throws(() => assertUpgrade(snapshot(text), snapshot(withoutLabel, "1.2.4"), note(), removed, "1.0.1"), /major version/);
  const added = await compareApi(snapshot(withoutLabel), snapshot(text, "1.2.4"), root);
  assert.deepEqual(added.breaking, []);
  assert.ok(added.additions.length > 0);
  assert.throws(() => assertUpgrade(snapshot(withoutLabel), snapshot(text, "1.2.4"), note(), added, "1.0.1"), /minor version/);
});

test("dependency and runtime map key ordering does not change the compatibility result", async () => {
  const previous = snapshot();
  previous.package.peerDependencies = { react: "~19.3.1", "react-dom": "~19.3.1" };
  previous.package.dependencies = { first: "1.0.0", second: "2.0.0" };
  previous.runtime = { "components/index.js": "original", "styles/base.css": "original" };
  const current = structuredClone(previous);
  current.package.version = "1.2.4";
  for (const [object, key] of [[current.package, "peerDependencies"], [current.package, "dependencies"], [current, "runtime"]]) object[key] = Object.fromEntries(Object.entries(object[key]).reverse());
  assert.deepEqual(await compareApi(previous, current, root), { breaking: [], additions: [], runtimeChanged: false });
  current.package.peerDependencies.react = "~20.0.0";
  assert.ok((await compareApi(previous, current, root)).breaking.some((item) => item.includes("peer requirements")));
});

test("Token rename and removed package entry are breaking even when declarations match", async () => {
  const current = snapshot(declaration, "1.2.4");
  const previous = snapshot();
  previous.package.exports["./tokens.css"] = "./tokens.css";
  current.tokens = ["--text-renamed", "--space-100"];
  const diff = await compareApi(previous, current, root);
  assert.ok(diff.breaking.some((item) => item.includes("--text-primary")));
  assert.ok(diff.breaking.some((item) => item.includes("./tokens.css")));
});

test("runtime changes require explicit migration, rollback and visual review notes", async () => {
  const current = snapshot(declaration, "1.2.4");
  current.runtime["components/index.js"] = "changed default behavior";
  const diff = await compareApi(snapshot(), current, root);
  assert.equal(diff.runtimeChanged, true);
  for (const field of ["summary", "migration", "rollback", "visualAndBehavior"]) assert.throws(() => assertUpgrade(snapshot(), current, { ...note(), [field]: " " }, diff, "1.0.1"), new RegExp(field));
  assert.throws(() => assertUpgrade(snapshot(), current, { ...note(), from: "1.2.2" }, diff, "1.0.1"), /latest delivered/);
  assert.throws(() => assertUpgrade(snapshot(), current, { ...note(), to: "1.2.5" }, diff, "1.0.1"));
  assert.throws(() => assertUpgrade(snapshot(), current, { ...note(), mcpTo: "1.0.0" }, diff, "1.0.1"));
  const dependencyOnly = snapshot(declaration, "1.2.4");
  dependencyOnly.package.dependencies = { "font-package": "2.0.0" };
  assert.equal((await compareApi(snapshot(), dependencyOnly, root)).runtimeChanged, true);
});

test("defaulted generic props are compared while required generic types fail closed", async () => {
  const text = 'export interface Props<T = "div"> { as?: T; label?: string; }\nexport declare function Control<T = "div">(props: Props<T>): string;\n';
  const diff = await compareApi(snapshot(text), snapshot(text, "1.2.4"), root);
  assert.deepEqual(diff.breaking, []);
  await assert.rejects(compareApi(snapshot(text.replaceAll('T = "div"', "T")), snapshot(text, "2.0.0"), root), /Required generic/);
  await assert.rejects(compareApi(snapshot(text), snapshot(text + "export type Required<T> = T;\n", "1.3.0"), root), /Required generic/);
});

test("delivery ledger entries cannot be symlinks to matching JSON bytes", async () => {
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, "dist/release-symlink-"));
  try {
    const records = path.join(directory, "tooling/distribution/releases");
    await fs.mkdir(records, { recursive: true });
    const target = path.join(directory, "data.json");
    await fs.writeFile(target, JSON.stringify({ schemaVersion: 1, component: { package: { version: "1.0.0" } }, mcp: { version: "1.0.0" } }));
    await fs.symlink(target, path.join(records, "1.0.0.json"));
    await assert.rejects(loadReleases(directory), /regular file/);
    await fs.unlink(path.join(records, "1.0.0.json"));
    await fs.rmdir(records);
    const targetDirectory = path.join(directory, "record-data");
    await fs.mkdir(targetDirectory);
    await fs.copyFile(target, path.join(targetDirectory, "1.0.0.json"));
    await fs.symlink(targetDirectory, records, "dir");
    await assert.rejects(loadReleases(directory), /regular directory/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
