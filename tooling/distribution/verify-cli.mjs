import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { verifyInstalledCandidate } from "./verify-package.mjs";

async function fingerprint(root) {
  const files = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (["node_modules", ".next", "dist"].includes(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files.push([path.relative(root, file), createHash("sha256").update(await fs.readFile(file)).digest("hex")]);
    }
  }
  await walk(root);
  return files.sort((a, b) => a[0].localeCompare(b[0]));
}

export async function verifyCliSetup({ root, directory, host, tarball, mcpTarball, run }) {
  const expected = JSON.parse(await fs.readFile(path.join(root, "dist/yami-design-cli-candidate/candidate-manifest.json"), "utf8"));
  const cliRoot = await fs.realpath(path.join(directory, "node_modules/yami-design-cli"));
  assert.ok(cliRoot.startsWith(`${directory}${path.sep}`), "CLI must be installed from the tarball");
  await verifyInstalledCandidate(cliRoot, expected);
  const pkg = JSON.parse(await fs.readFile(path.join(cliRoot, "package.json"), "utf8"));
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.bin, { "yami-design-cli": "./src/cli.mjs" });
  const binary = path.join(directory, "node_modules/.bin/yami-design-cli");
  const manager = host === "next" ? "npm" : "pnpm";
  const locale = host === "next" ? "zh" : "en";
  const artifacts = path.join(directory, "design artifacts");
  await fs.mkdir(artifacts);
  const designInput = path.join(artifacts, path.basename(tarball));
  const mcpInput = path.join(artifacts, path.basename(mcpTarball));
  await fs.copyFile(tarball, designInput);
  await fs.copyFile(mcpTarball, mcpInput);
  const args = ["init", "--design-package", designInput, "--mcp-package", mcpInput, "--locale", locale, "--package-manager", manager, "--json"];
  const configFile = path.join(directory, ".codex/config.toml");
  await fs.mkdir(path.dirname(configFile));
  const originalConfig = "# Preserve consumer comments and unrelated MCP settings.\n[mcp_servers.consumer_fixture]\ncommand = 'false'\nenabled = false\n";
  await fs.writeFile(configFile, originalConfig, { mode: 0o600 });
  await fs.writeFile(path.join(directory, "AGENTS.md"), "Consumer-owned instructions: preserve this file.\n");
  const before = await fingerprint(directory);
  const dryRun = JSON.parse(await fs.readFile(await run(binary, [...args, "--dry-run"], directory, `${host}-cli-dry-run`), "utf8"));
  assert.equal(dryRun.status, "planned");
  assert.deepEqual(await fingerprint(directory), before, "dry-run modified the consuming project");
  const init = JSON.parse(await fs.readFile(await run(binary, args, directory, `${host}-cli-init`), "utf8"));
  assert.equal(init.status, "pass");
  const configured = await fs.readFile(configFile, "utf8");
  assert.ok(configured.startsWith(originalConfig));
  assert.equal((await fs.stat(configFile)).mode & 0o777, 0o600, "init changed existing Codex file permissions");
  const installed = await fingerprint(directory);
  const repeated = JSON.parse(await fs.readFile(await run(binary, args, directory, `${host}-cli-repeat`), "utf8"));
  assert.equal(repeated.status, "pass");
  assert.deepEqual(repeated.install, []);
  assert.deepEqual(repeated.configuration, []);
  assert.deepEqual(await fingerprint(directory), installed, "repeat init changed project files");
  const health = JSON.parse(await fs.readFile(await run(binary, ["doctor", "--json"], directory, `${host}-cli-doctor`), "utf8"));
  assert.equal(health.status, "pass");
  assert.equal(health.modelCalls, 0);
  assert.equal(health.mcp.queries, 4);
  assert.deepEqual(await fingerprint(directory), installed, "doctor modified the consuming project");
  // A modified config must not let doctor execute an arbitrary command.
  try {
    await fs.writeFile(configFile, configured.replace(/args = \[[^\]]*\]/, 'args = ["-e", "process.exit(77)"]'));
    await assert.rejects(run(binary, ["doctor", "--json"], directory, `${host}-cli-conflict`), /failed \(1\)/);
    const conflict = JSON.parse(await fs.readFile(path.join(root, "dist/cli-verification", `${host}-cli-conflict.log`), "utf8"));
    assert.equal(conflict.checks.find(({ id }) => id === "mcp_config").status, "fail");
    assert.equal(conflict.checks.find(({ id }) => id === "mcp_queries").status, "not_run");
  } finally { await fs.writeFile(configFile, configured); }
  assert.deepEqual(await fingerprint(directory), installed);
  const lockfile = path.join(directory, manager === "npm" ? "package-lock.json" : "pnpm-lock.yaml");
  try {
    await fs.rename(lockfile, `${lockfile}.saved`);
    await assert.rejects(run(binary, ["doctor", "--json"], directory, `${host}-cli-missing-lock`), /failed \(1\)/);
  } finally { await fs.rename(`${lockfile}.saved`, lockfile); }
  assert.deepEqual(await fingerprint(directory), installed);
  const application = JSON.parse(await fs.readFile(path.join(directory, "package.json"), "utf8"));
  assert.ok(application.dependencies["@yami/design-system"]);
  assert.ok(application.devDependencies["@yami/design-system-mcp"]);
  assert.equal(application.dependencies["@yami/design-system-mcp"], undefined);
  return { status: "pass", packageVersion: pkg.version, contentDigest: expected.contentDigest, manager, locale, dryRun: "unchanged", repeat: "unchanged", doctor: health, conflictingCommand: "rejected" };
}
