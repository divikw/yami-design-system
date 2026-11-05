import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { assertVerifiedDelivery, checkReleaseHistory } from "./delivery.mjs";

test("delivery requires both hosts and binds clean source, package bytes and original tarballs", () => {
  const head = "a".repeat(40);
  const component = { package: { version: "1.0.0" }, identity: { sourceCommit: head, sourceDirty: false, contentDigest: "component" } };
  const mcp = { packageVersion: "1.0.0", sourceCommit: head, sourceDirty: false, contentDigest: "mcp" };
  const artifacts = { component: { integrity: "sha512-component" }, mcp: { integrity: "sha512-mcp" } };
  const report = { status: "pass", results: ["next", "vite"].map((host) => ({ host, packageVersion: "1.0.0", contentDigest: "component", artifactIntegrity: artifacts.component.integrity, mcpArtifactIntegrity: artifacts.mcp.integrity, types: "pass", build: "pass", browser: { status: "pass" }, mcp: { status: "pass", packageVersion: "1.0.0", contentDigest: "mcp" }, knowledge: { browser: "pass" } })) };
  assertVerifiedDelivery(report, component, mcp, head, artifacts);
  assert.throws(() => assertVerifiedDelivery(report, { ...component, identity: { ...component.identity, sourceDirty: true } }, mcp, head, artifacts), /clean source/);
  assert.throws(() => assertVerifiedDelivery(report, component, mcp, "b".repeat(40), artifacts), /current source/);
  for (const change of [
    (value) => { value.status = "fail"; },
    (value) => { value.results.pop(); },
    (value) => { value.results[0].contentDigest = "stale"; },
    (value) => { value.results[0].mcp.contentDigest = "stale"; },
    (value) => { value.results[0].artifactIntegrity = "different tarball"; },
    (value) => { value.results[0].mcpArtifactIntegrity = "different tarball"; },
    (value) => { value.results[0].browser.status = "fail"; },
    (value) => { value.results[0].knowledge.browser = "running"; },
  ]) {
    const changed = structuredClone(report);
    change(changed);
    assert.throws(() => assertVerifiedDelivery(changed, component, mcp, head, artifacts));
  }
});

test("history accepts appended records but rejects edits and deletions of delivered versions", async () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  const directory = await fs.mkdtemp(path.join(root, "dist/delivery-history-"));
  const git = (args) => execFileSync("git", args, { cwd: directory, stdio: "pipe" });
  try {
    git(["init", "--quiet"]);
    const records = path.join(directory, "tooling/distribution/releases");
    await fs.mkdir(records, { recursive: true });
    const first = path.join(records, "1.0.0.json");
    await fs.writeFile(first, '{"original":"bytes"}\n');
    git(["add", "."]);
    git(["-c", "user.name=YAMI test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "--quiet", "-m", "baseline"]);
    await fs.writeFile(path.join(records, "1.0.1.json"), '{"new":"delivery"}\n');
    assert.equal(await checkReleaseHistory(directory, "HEAD"), 1);
    const moved = path.join(directory, "moved-records");
    await fs.rename(records, moved);
    await fs.symlink(moved, records, "dir");
    await assert.rejects(checkReleaseHistory(directory, "HEAD"), /immutable/);
    await fs.unlink(records);
    await fs.rename(moved, records);
    const target = path.join(directory, "same-record.json");
    await fs.writeFile(target, '{"original":"bytes"}\n');
    await fs.unlink(first);
    await fs.symlink(target, first);
    await assert.rejects(checkReleaseHistory(directory, "HEAD"), /immutable/);
    await fs.unlink(first);
    await fs.writeFile(first, '{"original":"bytes"}\n');
    await fs.writeFile(first, '{"original":"replaced"}\n');
    await assert.rejects(checkReleaseHistory(directory, "HEAD"), /immutable/);
    await fs.unlink(first);
    await assert.rejects(checkReleaseHistory(directory, "HEAD"), /immutable/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});
