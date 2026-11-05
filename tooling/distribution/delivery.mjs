import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { distributionOutput } from "./output.mjs";
import { assertUnreleased, capturePackage, loadReleases, verifyUpgrade } from "./upgrade.mjs";
import { verifyInstalledCandidate } from "./verify-package.mjs";

export function assertVerifiedDelivery(report, component, mcp, head, artifacts) {
  assert.equal(component.identity.sourceDirty, false, "Delivery requires a clean source build");
  assert.equal(mcp.sourceDirty, false, "Delivery requires a clean MCP build");
  assert.equal(component.identity.sourceCommit, head, "Rebuild and verify the current source commit");
  assert.equal(mcp.sourceCommit, head);
  assert.equal(report.status, "pass", "Independent consumer verification must pass");
  assert.deepEqual(report.results.map((result) => result.host).sort(), ["next", "vite"]);
  for (const result of report.results) {
    assert.equal(result.packageVersion, component.package.version);
    assert.equal(result.contentDigest, component.identity.contentDigest, "Consumer receipt belongs to different component bytes");
    assert.equal(result.mcp.packageVersion, mcp.packageVersion);
    assert.equal(result.mcp.contentDigest, mcp.contentDigest, "Consumer receipt belongs to different MCP bytes");
    for (const check of [result.types, result.build, result.browser.status, result.mcp.status, result.knowledge.browser]) assert.equal(check, "pass");
    assert.equal(result.artifactIntegrity, artifacts.component.integrity, "Component tarball changed after verification");
    assert.equal(result.mcpArtifactIntegrity, artifacts.mcp.integrity, "MCP tarball changed after verification");
  }
}

export async function checkReleaseHistory(root, base) {
  const git = (args) => execFileSync("git", args, { cwd: root });
  const directory = path.join(root, "tooling/distribution/releases");
  const stat = await fs.lstat(directory).catch(() => null);
  assert.ok(stat?.isDirectory(), "Delivery history is immutable and must remain a regular directory");
  const files = git(["ls-tree", "-r", "--name-only", base, "--", "tooling/distribution/releases"]).toString().trim().split("\n").filter((file) => file.endsWith(".json"));
  for (const file of files) {
    const target = path.join(root, file);
    const stat = await fs.lstat(target).catch(() => null);
    assert.ok(stat?.isFile(), `Delivery record is immutable and must remain a regular file: ${file}`);
    const current = await fs.readFile(target);
    assert.deepEqual(current, git(["show", `${base}:${file}`]), `Delivery record is immutable: ${file}`);
  }
  return files.length;
}

async function recordDelivery(root) {
  const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  const dist = distributionOutput(root);
  assert.equal(git(["status", "--porcelain"]), "", "Commit the reviewed source, then build and verify before recording delivery");
  const policy = JSON.parse(await fs.readFile(path.join(root, "packages/design-system/distribution.json"), "utf8"));
  assertUnreleased(policy, await loadReleases(root));
  await verifyUpgrade(root, dist);
  const component = await capturePackage(path.join(dist, "design-system-candidate"));
  const mcpDirectory = path.join(dist, "design-system-mcp-candidate");
  const mcp = JSON.parse(await fs.readFile(path.join(mcpDirectory, "candidate-manifest.json"), "utf8"));
  await verifyInstalledCandidate(mcpDirectory, mcp);
  assert.equal(mcp.packageVersion, policy.mcpVersion);
  assert.equal(mcp.designSystemVersion, component.package.version);
  const artifacts = {};
  for (const [key, name, version] of [["component", "yami-design-system", policy.version], ["mcp", "yami-design-system-mcp", policy.mcpVersion]]) {
    const filename = `${name}-${version}.tgz`;
    const content = await fs.readFile(path.join(dist, filename));
    artifacts[key] = { filename, integrity: `sha512-${createHash("sha512").update(content).digest("base64")}` };
  }
  const report = JSON.parse(await fs.readFile(path.join(dist, "candidate-verification/result.json"), "utf8"));
  assertVerifiedDelivery(report, component, mcp, git(["rev-parse", "HEAD"]), artifacts);
  const release = { schemaVersion: 1, component: { ...component, artifact: artifacts.component }, mcp: { version: mcp.packageVersion, sourceCommit: mcp.sourceCommit, sourceDirty: mcp.sourceDirty, contentDigest: mcp.contentDigest, artifact: artifacts.mcp } };
  const file = path.join(root, `tooling/distribution/releases/${policy.version}.json`);
  await fs.writeFile(file, `${JSON.stringify(release, null, 2)}\n`, { flag: "wx" });
  console.log(`Recorded local delivery lock: ${file}. No package was published. Advance the next development candidate before packing again.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  if (process.argv[2] === "check") console.log(`Preserved ${await checkReleaseHistory(root, process.argv[3] ?? "origin/main")} delivery records.`);
  else {
    assert.equal(process.argv[2], "record", "Use delivery.mjs check [base-ref] or delivery.mjs record");
    await recordDelivery(root);
  }
}
