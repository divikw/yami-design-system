import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { promises as fs, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { contentDigest } from "../registry/contracts.mjs";
import { buildKnowledge } from "./knowledge.mjs";
import { packMcp } from "./mcp.mjs";
import { assertUnreleased, loadReleases, verifyUpgrade } from "./upgrade.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = path.join(root, "packages/design-system");
const components = path.join(source, "components");
const output = path.join(root, "dist/design-system-candidate");
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const policy = await readJson(path.join(source, "distribution.json"));
const workspacePackage = await readJson(path.join(source, "package.json"));
const upgradeReport = path.join(root, "dist/candidate-upgrade.json");
await fs.mkdir(path.dirname(upgradeReport), { recursive: true });
await fs.writeFile(upgradeReport, '{"status":"running"}\n');
// 在删除工作目录或写 tarball 之前拒绝重新打包已交付的两个版本。
try {
  assertUnreleased(policy, await loadReleases(root));
} catch (error) {
  await fs.writeFile(upgradeReport, `${JSON.stringify({ status: "fail", failure: error.message }, null, 2)}\n`);
  throw error;
}
const files = new Set();
const styles = new Set();
const external = new Set();

function resolveImport(file, specifier) {
  const base = path.resolve(path.dirname(file), specifier);
  const resolved = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")]
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!resolved || !resolved.startsWith(`${source}${path.sep}`)) {
    throw new Error(`Unresolvable or out-of-package import: ${specifier} in ${file}`);
  }
  return resolved;
}

async function visit(file) {
  if (files.has(file)) return;
  files.add(file);
  const text = await fs.readFile(file, "utf8");
  for (const { fileName: specifier } of ts.preProcessFile(text, true, true).importedFiles) {
    if (!specifier.startsWith(".")) {
      external.add(specifier);
      continue;
    }
    const target = resolveImport(file, specifier);
    if (/\.tsx?$/.test(target)) await visit(target);
    else if (target.endsWith(".module.css")) styles.add(target);
    else throw new Error(`Unsupported runtime file: ${target}`);
  }
}

const entries = [];
for (const name of policy.entries) {
  const meta = await readJson(path.join(components, name, "meta.json"));
  if (meta.status !== "stable") throw new Error(`Candidate entry must be Stable: ${name}`);
  entries.push({ name, version: meta.version, status: meta.status });
  await visit(path.join(components, name, "index.ts"));
}
for (const specifier of external) {
  if (specifier !== "react") throw new Error(`Undeclared candidate dependency: ${specifier}`);
}

// Preserve the module tree and CSS Modules. Resolve directory imports before
// emission so the result is ESM rather than a second TypeScript source package.
function rewriteModules(context) {
  return (file) => {
    const rewrite = (literal) => {
      if (!literal || !ts.isStringLiteral(literal) || !literal.text.startsWith(".")) return literal;
      const target = resolveImport(file.fileName, literal.text);
      if (!/\.tsx?$/.test(target)) return literal;
      let relative = path.relative(path.dirname(file.fileName), target).replaceAll(path.sep, "/").replace(/\.tsx?$/, ".js");
      if (!relative.startsWith(".")) relative = `./${relative}`;
      return ts.factory.createStringLiteral(relative);
    };
    const visitNode = (node) => {
      if (ts.isImportDeclaration(node)) return ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, rewrite(node.moduleSpecifier), node.attributes);
      if (ts.isExportDeclaration(node)) return ts.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, rewrite(node.moduleSpecifier), node.attributes);
      return ts.visitEachChild(node, visitNode, context);
    };
    return ts.visitNode(file, visitNode);
  };
}

await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const config = ts.readConfigFile(path.join(root, "tsconfig.base.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram([...files, path.join(source, "global.d.ts")], {
  ...parsed.options,
  noEmit: false,
  noEmitOnError: true,
  declaration: true,
  rootDir: components,
  outDir: path.join(output, "components"),
  types: ["react", "react-dom"],
  typeRoots: [path.join(source, "node_modules/@types")],
});
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  }));
}
const emitted = program.emit(undefined, undefined, undefined, false, {
  after: [rewriteModules],
  afterDeclarations: [rewriteModules],
});
if (emitted.emitSkipped) throw new Error("Candidate JavaScript/declaration emission failed");
const checker = program.getTypeChecker();
const publicExports = Object.fromEntries(policy.entries.map((name) => [name, checker.getExportsOfModule(
  checker.getSymbolAtLocation(program.getSourceFile(path.join(components, name, "index.ts"))),
).map((symbol) => symbol.name).sort()]));
const provenance = {
  sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  sourceDirty: execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim().length > 0,
};

async function copy(relative) {
  const destination = path.join(output, relative);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(path.join(source, relative), destination);
}
for (const file of styles) {
  await copy(path.relative(source, file));
  for (const match of (await fs.readFile(file, "utf8")).matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
    if (/^(?:data:|https?:|#)/.test(match[1])) continue;
    const asset = resolveImport(file, match[1]);
    await copy(path.relative(source, asset));
  }
}
for (const relative of [
  "generated/tokens.css", "generated/tokens.json", "styles/base.css", "styles/fonts.css",
  "assets/fonts/GT-Walsheim-Regular.woff2", "assets/fonts/GT-Walsheim-Medium.woff2", "assets/fonts/GT-Walsheim-Bold.woff2", "assets/fonts/LICENSE.txt",
]) await copy(relative);
await fs.copyFile(path.join(source, "DISTRIBUTION.md"), path.join(output, "README.md"));
await fs.mkdir(path.join(output, "distribution"), { recursive: true });
await fs.copyFile(path.join(source, "distribution/MCP.md"), path.join(output, "distribution/MCP.md"));
await fs.copyFile(path.join(source, "UPGRADING.md"), path.join(output, "UPGRADING.md"));
await fs.copyFile(path.join(source, `distribution/upgrades/${policy.version}.json`), path.join(output, "UPGRADE.json"));
const knowledgeExports = await buildKnowledge({ root, source, output, policy, packageName: workspacePackage.name, provenance, publicExports });

const exports = {
  ".": { types: "./components/index.d.ts", import: "./components/index.js" },
  "./styles/base.css": "./styles/base.css",
  "./styles/fonts.css": "./styles/fonts.css",
  "./tokens.css": "./generated/tokens.css",
  "./tokens.json": "./generated/tokens.json",
  "./candidate-manifest.json": "./candidate-manifest.json",
  ...knowledgeExports,
};
const barrel = policy.entries.map((name) => `export * from './${name}/index.js';`).join("\n");
await fs.writeFile(path.join(output, "components/index.js"), `"use client";\n${barrel}\n`);
await fs.writeFile(path.join(output, "components/index.d.ts"), `${barrel}\n`);
for (const name of policy.entries) {
  exports[`./components/${name}`] = { types: `./components/${name}/index.d.ts`, import: `./components/${name}/index.js` };
  const entry = path.join(output, `components/${name}/index.js`);
  await fs.writeFile(entry, `"use client";\n${await fs.readFile(entry, "utf8")}`);
}
await fs.writeFile(path.join(output, "package.json"), `${JSON.stringify({
  name: workspacePackage.name,
  version: policy.version,
  private: true,
  license: "UNLICENSED",
  type: "module",
  sideEffects: ["**/*.css"],
  exports,
  peerDependencies: { react: policy.react, "react-dom": policy.react },
  dependencies: Object.fromEntries(Object.entries(workspacePackage.dependencies).filter(([name]) => name.startsWith("@fontsource"))),
}, null, 2)}\n`);

async function inventory(directory, prefix = "") {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await inventory(path.join(directory, entry.name), relative));
    else result.push({ path: relative, content: await fs.readFile(path.join(directory, entry.name)) });
  }
  return result.sort((a, b) => a.path.localeCompare(b.path));
}
const payload = await inventory(output);
const manifest = {
  schemaVersion: policy.schemaVersion,
  package: workspacePackage.name,
  packageVersion: policy.version,
  ...provenance,
  buildTools: { node: process.version, typescript: ts.version },
  entries,
  verificationTargets: policy.verification,
  distribution: "local-authorized-verification-only",
  contentDigest: contentDigest(payload),
  files: payload.map(({ path: file, content }) => ({ path: file, bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") })),
};
await fs.writeFile(path.join(output, "candidate-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await verifyUpgrade(root);
const receipt = JSON.parse(execFileSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", path.dirname(output)], { cwd: output, encoding: "utf8" }));
await fs.writeFile(path.join(root, "dist/candidate-pack.json"), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`Candidate: ${path.join(root, "dist", receipt[0].filename)}\nContent: ${manifest.contentDigest}\nSource: ${manifest.sourceCommit}${manifest.sourceDirty ? " (working tree modified)" : ""}`);
await packMcp({ root, policy, provenance });
