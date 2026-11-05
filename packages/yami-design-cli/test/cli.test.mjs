import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";
import * as tar from "tar";
import { DESIGN, MCP, openArtifacts, sha } from "../src/artifacts.mjs";
import { initialise } from "../src/init.mjs";
import { CONFIG, SERVER, SKILL, planConfiguration, parseConfig, resolveLocal, serverConfig } from "../src/project.mjs";

const execute = promisify(execFile);
const cli = fileURLToPath(new URL("../src/cli.mjs", import.meta.url));
const sourceCommit = "1".repeat(40);
const designVersion = "0.1.0-candidate.5";
const mcpVersion = "0.1.0-candidate.2";

async function fixture(t, options = {}) {
  const commit = options.sourceCommit ?? sourceCommit;
  const version = options.designVersion ?? designVersion;
  const directory = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), "yami-design-cli-test-")));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, "app");
  await fs.mkdir(root);
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ name: "consumer", private: true, dependencies: { react: options.react ?? "19.3.1", "react-dom": options.react ?? "19.3.1" }, devDependencies: { vite: "8.3.5" } }));
  for (const name of ["react", "react-dom"]) {
    await fs.mkdir(path.join(root, "node_modules", name), { recursive: true });
    await fs.writeFile(path.join(root, "node_modules", name, "package.json"), JSON.stringify({ name, version: options.react ?? "19.3.1" }));
  }
  async function candidate(name, version, peer) {
    const folder = path.join(directory, name === DESIGN ? "design" : "mcp");
    const pkgRoot = path.join(folder, "package");
    await fs.mkdir(pkgRoot, { recursive: true });
    const design = name === DESIGN;
    const exports = design ? { "./candidate-manifest.json": "./candidate-manifest.json", "./knowledge/index.json": "./knowledge/index.json", "./skill": "./knowledge/SKILL.md", "./skill/zh": "./knowledge/SKILL.zh-CN.md", "./components/Button": "./Button.js" } : { "./cli": "./cli.mjs" };
    const pkg = { name, version, private: true, type: "module", exports, peerDependencies: design ? { react: "~19.3.1", "react-dom": "~19.3.1" } : { [DESIGN]: peer } };
    const files = [{ path: "package.json", content: JSON.stringify(pkg) }];
    const entries = [{ name: "Button", version: "1.0.0", status: "stable" }];
    if (design) {
      const documents = [{ path: "SKILL.md", content: "English Skill" }, { path: "SKILL.zh-CN.md", content: "Chinese Skill" }, { path: "references/DESIGN.compact.md", content: "Design rules" }, { path: "references/Button.json", content: JSON.stringify({ ...entries[0], exports: ["Button"] }) }, { path: "references/usage.md", content: "Button usage" }, { path: "references/example.tsx", content: "export function ButtonExample() {}" }];
      files.push(...documents.map(({ path, content }) => ({ path: `knowledge/${path}`, content })));
      const index = { schemaVersion: options.knowledgeSchema ?? 1, package: name, packageVersion: version, sourceCommit: commit, sourceDirty: false, skills: { en: "SKILL.md", "zh-CN": "SKILL.zh-CN.md" }, references: { overview: "references/DESIGN.compact.md" }, documents: documents.map(({ path }) => ({ path })), components: [{ ...entries[0], import: `${DESIGN}/components/Button`, exports: ["Button"], contract: "references/Button.json", usage: options.knowledgeMissing ? "references/missing.md" : "references/usage.md", examples: [{ path: "references/example.tsx", export: "ButtonExample" }] }] };
      files.push({ path: "knowledge/index.json", content: JSON.stringify(index) }, { path: "Button.js", content: "export const Button = null;" });
    } else if (!options.missingMcpEntry) files.push({ path: "cli.mjs", content: "process.exit(1);" });
    for (const file of files) { await fs.mkdir(path.dirname(path.join(pkgRoot, file.path)), { recursive: true }); await fs.writeFile(path.join(pkgRoot, file.path), file.content); }
    const digest = createHash("sha256");
    for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) digest.update(file.path).update("\0").update(file.content).update("\0");
    const manifest = { schemaVersion: 1, package: name, packageVersion: version, sourceCommit: commit, sourceDirty: false, ...(design ? { entries } : { designSystemVersion: peer }), contentDigest: digest.digest("hex"), files: files.map(({ path, content }) => ({ path, bytes: Buffer.byteLength(content), sha256: sha(content) })) };
    await fs.writeFile(path.join(pkgRoot, "candidate-manifest.json"), JSON.stringify(manifest));
    const archive = path.join(directory, `${design ? "design" : "mcp"}.tgz`);
    await tar.create({ file: archive, cwd: folder, gzip: true }, ["package"]);
    return { folder, pkgRoot, archive, manifest };
  }
  const design = await candidate(DESIGN, version);
  const mcp = await candidate(MCP, mcpVersion, options.peer ?? version);
  const args = { cwd: root, designPackage: design.archive, mcpPackage: mcp.archive };
  return { directory, root, design, mcp, args };
}

async function installFixture({ root, design, mcp }) {
  for (const candidate of [design, mcp]) {
    await fs.cp(candidate.pkgRoot, path.join(root, "node_modules", candidate.manifest.package), { recursive: true });
  }
  const file = path.join(root, "package.json");
  const pkg = JSON.parse(await fs.readFile(file, "utf8"));
  pkg.dependencies[DESIGN] = `file:${design.archive}`;
  pkg.devDependencies[MCP] = `file:${mcp.archive}`;
  await fs.writeFile(file, JSON.stringify(pkg));
  await fs.writeFile(path.join(root, "package-lock.json"), JSON.stringify({ lockfileVersion: 3, packages: { "": pkg } }));
  return pkg;
}

async function fingerprint(root) {
  const files = [];
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files.push([path.relative(root, file), entry.isSymbolicLink() ? await fs.readlink(file) : sha(await fs.readFile(file))]);
    }
  }
  await walk(root);
  return files.sort((a, b) => a[0].localeCompare(b[0]));
}

test("help/version work without a consuming project and invalid commands fail as JSON", async () => {
  assert.match((await execute(process.execPath, [cli, "--help"])).stdout, /yami-design-cli.*connect YAMI/);
  assert.match((await execute(process.execPath, [cli, "--version"])).stdout, /^0\.1\.0-candidate\.1/);
  await assert.rejects(execute(process.execPath, [cli, "doctor", "--dry-run", "--json"]), (error) => {
    assert.equal(error.code, 1);
    assert.equal(JSON.parse(error.stdout).status, "fail");
    assert.equal(error.stderr, "");
    return true;
  });
});

test("dry-run validates artifacts and reports changes without writing any application file", async (t) => {
  const { root, args } = await fixture(t);
  const before = await fingerprint(root);
  const plan = await initialise({ ...args, dryRun: true });
  assert.equal(plan.status, "planned");
  assert.deepEqual(plan.install.map(({ section }) => section), ["dependencies", "devDependencies"]);
  assert.deepEqual(plan.configuration, [SKILL, CONFIG]);
  assert.match(plan.styleImports, /fonts\.css[\s\S]*tokens\.css[\s\S]*base\.css/);
  assert.deepEqual(await fingerprint(root), before);
});

test("a missing package lookup before installation does not poison resolution after installation", async (t) => {
  const { root, mcp } = await fixture(t);
  await assert.rejects(resolveLocal(root, `${MCP}/cli`), { code: "ENOENT" });
  await fs.cp(mcp.pkgRoot, path.join(root, "node_modules", MCP), { recursive: true });
  assert.equal(await resolveLocal(root, `${MCP}/cli`), path.join(root, "node_modules", MCP, "cli.mjs"));
});

test("init binds matching installed bytes to the supplied local artifact instead of retaining registry ranges", async (t) => {
  const app = await fixture(t);
  const { root, args } = app;
  const pkg = await installFixture(app);
  pkg.dependencies[DESIGN] = designVersion;
  pkg.devDependencies[MCP] = mcpVersion;
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify(pkg));
  const before = await fingerprint(root);
  const plan = await initialise({ ...args, dryRun: true });
  assert.deepEqual(plan.install.map(({ name }) => name), [DESIGN, MCP]);
  assert.deepEqual(await fingerprint(root), before);
});

test("init preflight rejects an artifact without its declared MCP executable", async (t) => {
  const { root, args } = await fixture(t, { missingMcpEntry: true });
  const before = await fingerprint(root);
  await assert.rejects(initialise({ ...args, dryRun: true }), /MCP entry.*manifest/);
  assert.deepEqual(await fingerprint(root), before);
});

test("init can infer pnpm from the installed layout when its lockfile is missing", async (t) => {
  const app = await fixture(t);
  await installFixture(app);
  await fs.unlink(path.join(app.root, "package-lock.json"));
  await fs.writeFile(path.join(app.root, "node_modules/.modules.yaml"), "packageManager: pnpm@11.20.0\n");
  const before = await fingerprint(app.root);
  const plan = await initialise({ ...app.args, dryRun: true });
  assert.equal(plan.packageManager, "pnpm");
  assert.deepEqual(plan.dependencyFiles, ["package.json", "pnpm-lock.yaml"]);
  assert.deepEqual(await fingerprint(app.root), before);
});

test("mismatched peer versions, knowledge schema and host React fail before project changes", async (t) => {
  for (const options of [{ peer: "0.1.0-candidate.4" }, { knowledgeSchema: 2 }, { knowledgeMissing: true }, { react: "18.3.1" }]) {
    const { root, args } = await fixture(t, options);
    const before = await fingerprint(root);
    await assert.rejects(initialise(args), /preflight:/);
    assert.deepEqual(await fingerprint(root), before);
  }
});

test("existing Skill and MCP conflicts are rejected before dependency installation", async (t) => {
  for (const relative of [SKILL, CONFIG]) {
    const { root, args } = await fixture(t);
    await fs.mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await fs.writeFile(path.join(root, relative), relative === SKILL ? "User-authored Skill\n" : `[mcp_servers.${SERVER}]\ncommand = 'custom-server'\n`);
    const before = await fingerprint(root);
    await assert.rejects(initialise(args), /conflict/);
    assert.deepEqual(await fingerprint(root), before);
  }
});

test("Codex comments and unrelated tables remain byte-identical when planning an appended MCP table", async (t) => {
  const { root } = await fixture(t);
  const original = "# User comment\nmodel = 'example'\n[mcp_servers.other]\ncommand = 'other-tool'\n# Keep this comment\n";
  await fs.mkdir(path.join(root, ".codex"));
  await fs.writeFile(path.join(root, CONFIG), original);
  const entry = path.join(root, "node_modules/@yami/design-system-mcp/cli.mjs");
  const plans = await planConfiguration({ root }, "zh", entry);
  const config = plans.find(({ relative }) => relative === CONFIG);
  assert.ok(config.after.startsWith(original));
  assert.deepEqual({ ...parseConfig(config.after).mcp_servers[SERVER] }, serverConfig(root, entry));
  assert.equal(await fs.readFile(path.join(root, CONFIG), "utf8"), original);
  await fs.writeFile(path.join(root, CONFIG), config.after);
  const repeated = await planConfiguration({ root }, "zh", entry);
  assert.equal(repeated.find(({ relative }) => relative === CONFIG).after, config.after);
});

test("symlinked managed directories and workspace roots are rejected without writing outside the application", async (t) => {
  const { root, args, directory } = await fixture(t);
  const outside = path.join(directory, "outside");
  await fs.mkdir(outside);
  await fs.writeFile(path.join(outside, "sentinel"), "keep");
  await fs.symlink(outside, path.join(root, ".codex"));
  const before = await fingerprint(root);
  await assert.rejects(initialise(args), /symlink/);
  assert.deepEqual(await fingerprint(root), before);
  assert.deepEqual(await fs.readdir(outside), ["sentinel"]);
  await fs.rm(path.join(root, ".codex"));
  await fs.writeFile(path.join(directory, "pnpm-workspace.yaml"), "packages: ['app']\n");
  await assert.rejects(initialise(args), /standalone application/);
});

test("archive links, duplicate paths and files absent from the manifest are rejected", async (t) => {
  for (const kind of ["link", "duplicate", "unlisted"]) {
    const { design, mcp, directory } = await fixture(t);
    if (kind === "link") await fs.symlink(path.join(directory, "app/package.json"), path.join(design.pkgRoot, "link"));
    if (kind === "unlisted") await fs.writeFile(path.join(design.pkgRoot, "unexpected.js"), "throw new Error('unlisted');");
    await tar.create({ file: design.archive, cwd: design.folder, gzip: true }, kind === "duplicate" ? ["package", "package/package.json"] : ["package"]);
    await assert.rejects(openArtifacts(design.archive, mcp.archive), /links|Duplicate archive|unlisted/);
  }
});

test("manifest path escape and content tampering are rejected", async (t) => {
  for (const kind of ["escape", "tamper"]) {
    const { design, mcp } = await fixture(t);
    if (kind === "escape") {
      design.manifest.files[0].path = "../outside";
      await fs.writeFile(path.join(design.pkgRoot, "candidate-manifest.json"), JSON.stringify(design.manifest));
    } else await fs.appendFile(path.join(design.pkgRoot, "Button.js"), "changed");
    await tar.create({ file: design.archive, cwd: design.folder, gzip: true }, ["package"]);
    await assert.rejects(openArtifacts(design.archive, mcp.archive), /Invalid candidate path|Candidate size differs/);
  }
});

test("init refuses to replace installed versions or same-version content", async (t) => {
  for (const kind of ["version", "content"]) {
    const { root, args } = await fixture(t);
    const previous = await fixture(t, kind === "version" ? { designVersion: "0.1.0-candidate.4" } : { sourceCommit: "2".repeat(40) });
    const installed = path.join(root, "node_modules", DESIGN);
    await fs.cp(previous.design.pkgRoot, installed, { recursive: true });
    const before = await fingerprint(root);
    await assert.rejects(initialise(args), /does not upgrade|different content|another build/);
    assert.deepEqual(await fingerprint(root), before);
  }
});

test("installation failure is nonzero and does not create Skill or MCP configuration", async (t) => {
  const { root, args, directory } = await fixture(t);
  const bin = path.join(directory, "bin");
  await fs.mkdir(bin);
  await fs.writeFile(path.join(bin, "npm"), "#!/bin/sh\nexit 42\n", { mode: 0o755 });
  const before = await fingerprint(root);
  await assert.rejects(execute(process.execPath, [cli, "init", "--cwd", root, "--design-package", args.designPackage, "--mcp-package", args.mcpPackage, "--json"], { env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } }), (error) => {
    assert.match(JSON.parse(error.stdout).error, /^install:/);
    assert.equal(error.code, 1);
    return true;
  });
  assert.deepEqual(await fingerprint(root), before);
});

test("doctor reports failed/skipped checks and nonzero exit without changing the application", async (t) => {
  const { root } = await fixture(t);
  const before = await fingerprint(root);
  await assert.rejects(execute(process.execPath, [cli, "doctor", "--cwd", root, "--json"]), (error) => {
    const result = JSON.parse(error.stdout);
    assert.equal(result.status, "fail");
    assert.equal(result.modelCalls, 0);
    assert.ok(result.checks.some(({ id, status }) => id === "packages" && status === "fail"));
    assert.ok(result.checks.some(({ id, status }) => id === "mcp_queries" && status === "not_run"));
    return true;
  });
  assert.deepEqual(await fingerprint(root), before);
});

test("doctor refuses to execute a Node wrapper from the consumer PATH", async (t) => {
  const app = await fixture(t);
  const { root, directory } = app;
  await installFixture(app);
  const entry = path.join(root, "node_modules", MCP, "cli.mjs");
  for (const plan of await planConfiguration({ root }, "zh", entry)) {
    const file = path.join(root, plan.relative);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, plan.relative === CONFIG ? plan.after.replace(/^command = .*$/m, 'command = "node"') : plan.after);
  }
  const bin = path.join(directory, "bin");
  await fs.mkdir(bin);
  await fs.writeFile(path.join(bin, "node"), '#!/bin/sh\nprintf ran > doctor-ran-node-wrapper\nprintf "v24.18.0\\n"\n', { mode: 0o755 });
  const before = await fingerprint(root);
  await assert.rejects(execute(process.execPath, [cli, "doctor", "--cwd", root, "--json"], { env: { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` } }), (error) => {
    const checks = JSON.parse(error.stdout).checks;
    assert.equal(checks.find(({ id }) => id === "mcp_config").status, "fail");
    assert.equal(checks.find(({ id }) => id === "mcp_queries").status, "not_run");
    return true;
  });
  assert.deepEqual(await fingerprint(root), before);
});
