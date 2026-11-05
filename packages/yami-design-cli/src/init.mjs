import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { DESIGN, MCP, openArtifacts, readJson, sha, verifyCandidate } from "./artifacts.mjs";
import { doctor, manualChecks } from "./doctor.mjs";
import { CONFIG, SERVER, inspectProject, managedFile, optionalStat, parseConfig, planConfiguration, resolveLocal, skillContent, verifyHost } from "./project.mjs";

const execute = promisify(execFile);
export const styleImports = ["@yami/design-system/styles/fonts.css", "@yami/design-system/tokens.css", "@yami/design-system/styles/base.css"].map((file) => `import '${file}';`).join("\n");

function refersToArtifact(specifier, file, root) {
  return typeof specifier === "string" && specifier.startsWith("file:") && path.resolve(root, specifier.slice(5)) === file;
}

async function existingCandidate(project, specifier, expected) {
  let entry;
  try { entry = await resolveLocal(project.root, specifier); }
  catch (error) { if (["MODULE_NOT_FOUND", "ENOENT"].includes(error.code)) return null; throw error; }
  const candidate = await verifyCandidate(path.dirname(entry), expected.pkg.name);
  assert.equal(candidate.pkg.version, expected.pkg.version, "init does not upgrade installed candidates; use the reviewed upgrade procedure first");
  assert.deepEqual(candidate.manifest, expected.manifest, "The installed version has different content; do not replace a version with another build");
  return entry;
}

async function writeConfiguration(project, plans) {
  for (const plan of plans) {
    const file = await managedFile(project.root, plan.relative);
    const current = await optionalStat(file) ? await fs.readFile(file, "utf8") : null;
    assert.equal(current ?? "", plan.before ?? "", `Configuration changed during installation: ${plan.relative}`);
  }
  for (const plan of plans.filter(({ before, after }) => before !== after)) {
    const file = await managedFile(project.root, plan.relative);
    await fs.mkdir(path.dirname(file), { recursive: true });
    if (plan.before === null || !await optionalStat(file)) await fs.writeFile(file, plan.after, { flag: "wx" });
    else {
      const temporary = await fs.mkdtemp(path.join(path.dirname(file), ".yami-design-"));
      try {
        const mode = (await fs.stat(file)).mode & 0o777;
        const replacement = path.join(temporary, "replacement");
        await fs.writeFile(replacement, plan.after, { flag: "wx", mode });
        await fs.chmod(replacement, mode);
        assert.equal(await fs.readFile(file, "utf8"), plan.before, `Configuration changed before writing: ${plan.relative}`);
        await fs.rename(replacement, file);
      } finally { await fs.rm(temporary, { recursive: true, force: true }); }
    }
  }
}

export async function initialise({ cwd = process.cwd(), packageManager, designPackage, mcpPackage, locale = "zh", dryRun = false } = {}) {
  let stage = "preflight";
  let artifacts;
  try {
    assert.ok(designPackage && mcpPackage, "init requires --design-package and --mcp-package local tarballs");
    skillContent(locale);
    const project = await inspectProject(cwd, packageManager);
    artifacts = await openArtifacts(path.resolve(designPackage), path.resolve(mcpPackage));
    await verifyHost(project, artifacts.design);
    const designEntry = await existingCandidate(project, `${DESIGN}/candidate-manifest.json`, artifacts.design);
    const mcpEntry = await existingCandidate(project, `${MCP}/cli`, artifacts.mcp);
    const configFile = path.join(project.root, CONFIG);
    const existingConfig = await optionalStat(configFile) ? parseConfig(await fs.readFile(configFile, "utf8")).mcp_servers?.[SERVER] : undefined;
    assert.ok(!existingConfig || mcpEntry, `MCP configuration conflict: ${CONFIG}; installed MCP is missing`);
    const plans = await planConfiguration(project, locale, mcpEntry ?? path.join(project.root, "node_modules", MCP, "cli.mjs"));
    const install = [];
    const missingLockfile = !await optionalStat(path.join(project.root, project.lockfile));
    if (missingLockfile || !designEntry || !refersToArtifact(project.pkg.dependencies?.[DESIGN], artifacts.design.artifact.file, project.root) || project.pkg.devDependencies?.[DESIGN]) {
      install.push({ candidate: artifacts.design, dev: false });
    }
    if (!mcpEntry || !refersToArtifact(project.pkg.devDependencies?.[MCP], artifacts.mcp.artifact.file, project.root) || project.pkg.dependencies?.[MCP]) {
      install.push({ candidate: artifacts.mcp, dev: true });
    }
    const result = {
      schemaVersion: 1,
      command: "init",
      status: dryRun ? "planned" : "running",
      cwd: project.root,
      packageManager: project.manager,
      framework: project.framework,
      packages: [artifacts.design, artifacts.mcp].map(({ pkg, artifact }) => ({ name: pkg.name, version: pkg.version, ...artifact })),
      install: install.map(({ candidate, dev }) => ({ name: candidate.pkg.name, section: dev ? "devDependencies" : "dependencies" })),
      dependencyFiles: install.length ? ["package.json", project.lockfile] : [],
      configuration: plans.filter(({ before, after }) => before !== after).map(({ relative }) => relative),
      styleEntry: project.framework === "next" ? "app/layout.tsx (or src/app/layout.tsx)" : "src/main.tsx",
      styleImports,
      manualChecks,
    };
    if (dryRun) return result;
    stage = "install";
    for (const { candidate, dev } of install) {
      assert.equal(sha(await fs.readFile(candidate.artifact.file), "sha512"), Buffer.from(candidate.artifact.integrity.slice("sha512-".length), "base64").toString("hex"), "Artifact changed after preflight");
      const dependency = [dev ? "--save-dev" : "--save-prod", "--save-exact", "--ignore-scripts", candidate.artifact.file];
      const args = project.manager === "npm"
        ? ["install", "--prefix", project.root, "--no-global", "--include=dev", "--package-lock", "--no-audit", "--no-fund", ...dependency]
        : ["add", ...dependency];
      await execute(project.manager, args, { cwd: project.root, timeout: 180_000, maxBuffer: 4 * 1024 * 1024 });
    }
    stage = "installed-artifacts";
    await verifyCandidate(path.dirname(await resolveLocal(project.root, `${DESIGN}/candidate-manifest.json`)), DESIGN, artifacts.design.manifest);
    const installedEntry = await resolveLocal(project.root, `${MCP}/cli`);
    await verifyCandidate(path.dirname(installedEntry), MCP, artifacts.mcp.manifest);
    for (const candidate of [artifacts.design, artifacts.mcp]) assert.equal(sha(await fs.readFile(candidate.artifact.file), "sha512"), Buffer.from(candidate.artifact.integrity.slice("sha512-".length), "base64").toString("hex"), "Artifact changed during installation");
    const installedPackage = await readJson(await managedFile(project.root, "package.json"));
    assert.ok(refersToArtifact(installedPackage.dependencies?.[DESIGN], artifacts.design.artifact.file, project.root), "The design dependency must reference the supplied tarball");
    assert.ok(refersToArtifact(installedPackage.devDependencies?.[MCP], artifacts.mcp.artifact.file, project.root), "The MCP development dependency must reference the supplied tarball");
    stage = "configuration";
    const finalPlans = await planConfiguration(project, locale, installedEntry);
    await writeConfiguration(project, finalPlans);
    stage = "doctor";
    const health = await doctor({ cwd: project.root, packageManager: project.manager });
    assert.equal(health.status, "pass", JSON.stringify(health.checks.filter(({ status }) => status === "fail")));
    return { ...result, status: "pass", doctor: health };
  } catch (error) {
    throw new Error(`${stage}: ${error.message}\n${stage === "preflight" ? "Preflight failed; the project was not modified." : "Review the installation/configuration state and restore reviewed artifacts/lockfile if needed; no automatic project rollback is performed."}`, { cause: error });
  } finally { await artifacts?.cleanup(); }
}
