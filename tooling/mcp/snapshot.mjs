import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";

export async function loadSnapshot({ manifestFile, indexFile, expectedVersion }) {
  const root = await realpath(path.dirname(manifestFile));
  async function readContained(relative) {
    assert.ok(!path.isAbsolute(relative) && !relative.split(/[\\/]/).includes(".."), "Invalid snapshot path");
    const file = await realpath(path.join(root, relative));
    assert.ok(file.startsWith(`${root}${path.sep}`), "Snapshot file escapes package root");
    return readFile(file);
  }
  const manifest = JSON.parse(await readContained("candidate-manifest.json"));
  assert.equal(manifest.schemaVersion, 1, "Unsupported candidate schema");
  assert.equal(manifest.package, "@yami/design-system", "Unexpected design-system package");
  assert.equal(manifest.packageVersion, expectedVersion, "MCP peer version does not match the installed candidate");
  const inventory = new Map(manifest.files.map((entry) => [entry.path, entry]));
  async function readVerified(relative) {
    const entry = inventory.get(relative);
    assert.ok(entry, "Snapshot file is missing from the candidate manifest");
    const content = await readContained(relative);
    assert.equal(content.length, entry.bytes, "Snapshot file size differs");
    assert.equal(createHash("sha256").update(content).digest("hex"), entry.sha256, "Snapshot file digest differs");
    return content.toString("utf8");
  }
  const pkg = JSON.parse(await readVerified("package.json"));
  assert.equal(pkg.name, manifest.package);
  assert.equal(pkg.version, manifest.packageVersion);
  const resolvedIndex = await realpath(indexFile);
  assert.ok(resolvedIndex.startsWith(`${root}${path.sep}`), "Knowledge index escapes package root");
  const indexRelative = path.relative(root, resolvedIndex).split(path.sep).join("/");
  const indexText = await readVerified(indexRelative);
  const index = JSON.parse(indexText);
  assert.equal(index.schemaVersion, 1, "Unsupported knowledge schema");
  for (const key of ["package", "packageVersion", "sourceCommit", "sourceDirty"]) assert.equal(index[key], manifest[key], `Knowledge identity differs: ${key}`);
  assert.deepEqual(index.components.map(({ name, version, status }) => ({ name, version, status })), manifest.entries, "Knowledge scope differs from the candidate");
  const identity = Object.fromEntries(["package", "packageVersion", "sourceCommit", "sourceDirty", "contentDigest"].map((key) => [key, manifest[key]]));
  const files = new Map([["index.json", indexText]]);
  for (const document of index.documents) {
    assert.ok(!path.isAbsolute(document.path) && !document.path.split(/[\\/]/).includes(".."), "Invalid knowledge path");
    assert.ok(!files.has(document.path), "Duplicate knowledge path");
    files.set(document.path, await readVerified(path.posix.join(path.posix.dirname(indexRelative), document.path)));
  }
  for (const component of index.components) {
    const meta = JSON.parse(files.get(component.contract));
    assert.equal(meta.name, component.name);
    assert.equal(meta.version, component.version);
    assert.equal(meta.status, component.status);
    assert.deepEqual(meta.exports, component.exports);
    assert.ok(files.has(component.usage), "Component usage is absent");
    for (const example of component.examples) assert.ok(files.has(example.path), "Component example is absent");
  }
  return { identity, index, files };
}
