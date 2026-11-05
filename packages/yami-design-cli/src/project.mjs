import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";
import { constants, promises as fs } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parse, stringify } from "smol-toml";
import semver from "semver";
import { DESIGN, readJson } from "./artifacts.mjs";

export const SKILL = ".agents/skills/yami-consumer/SKILL.md";
export const CONFIG = ".codex/config.toml";
export const SERVER = "yami_design_system";
export const TOOLS = ["list_design_documents", "search_design_documents", "read_design_document", "list_components", "get_component_contract", "get_component_example"];
export const optionalStat = async (file) => fs.lstat(file).catch((error) => { if (error.code === "ENOENT") return null; throw error; });

export async function managedFile(root, relative) {
  let file = root;
  const parts = relative.split("/");
  for (let i = 0; i < parts.length; i++) {
    file = path.join(file, parts[i]);
    const stat = await optionalStat(file);
    assert.ok(!stat || (i === parts.length - 1 ? stat.isFile() : stat.isDirectory()), `Managed path must not be a symlink or special file: ${file}`);
  }
  return file;
}

export async function inspectProject(cwd, override) {
  assert.equal(process.versions.node.split(".")[0], "24", "yami-design-cli requires Node 24");
  assert.ok(["darwin", "linux"].includes(process.platform), "This candidate supports macOS and Linux");
  const root = await fs.realpath(cwd);
  const pkg = await readJson(await managedFile(root, "package.json"));
  for (let directory = root; ; directory = path.dirname(directory)) {
    const ancestor = await optionalStat(path.join(directory, "package.json"));
    const workspace = ancestor && (await readJson(path.join(directory, "package.json"))).workspaces;
    assert.ok(!workspace && !await optionalStat(path.join(directory, "pnpm-workspace.yaml")), "Use a standalone application; workspace installation is outside this candidate's scope");
    if (directory === path.dirname(directory)) break;
  }
  const declared = pkg.packageManager?.split("@")[0];
  assert.ok(!declared || ["npm", "pnpm"].includes(declared), "Only npm and pnpm are supported");
  assert.ok(!override || ["npm", "pnpm"].includes(override), "--package-manager must be npm or pnpm");
  assert.ok(!override || !declared || override === declared, "Package manager conflicts with package.json");
  const locks = [];
  for (const [manager, file] of [["npm", "package-lock.json"], ["pnpm", "pnpm-lock.yaml"]]) {
    await managedFile(root, file);
    if (await optionalStat(path.join(root, file))) locks.push(manager);
  }
  assert.ok(override || declared || locks.length <= 1, "Ambiguous lockfiles; specify --package-manager");
  for (const file of ["yarn.lock", "bun.lock", "bun.lockb"]) assert.ok(!await optionalStat(path.join(root, file)), `Unsupported package-manager lockfile: ${file}`);
  let manager = override ?? declared ?? locks[0];
  if (!manager) {
    const pnpmLayout = await optionalStat(path.join(root, "node_modules/.modules.yaml"));
    manager = pnpmLayout?.isFile() ? "pnpm" : "npm";
  }
  const lockfile = manager === "npm" ? "package-lock.json" : "pnpm-lock.yaml";
  const dependencies = { ...pkg.devDependencies, ...pkg.dependencies };
  const framework = dependencies.next ? "next" : dependencies.vite ? "vite" : null;
  assert.ok(framework, "Expected an existing Next.js or Vite application");
  for (const relative of [SKILL, CONFIG]) await managedFile(root, relative);
  return { root, pkg, manager, framework, lockfile };
}

export async function resolveLocal(root, specifier) {
  const packageName = specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0];
  // Avoid Node's cached negative package lookup before init installs a package.
  await fs.realpath(path.join(root, "node_modules", packageName));
  const resolved = await fs.realpath(createRequire(path.join(root, "package.json")).resolve(specifier));
  assert.ok(resolved.startsWith(`${root}${path.sep}node_modules${path.sep}`), `Package must be installed inside the target application: ${specifier}`);
  return resolved;
}

export async function verifyHost(project, design) {
  for (const name of ["react", "react-dom"]) {
    assert.ok(project.pkg.dependencies?.[name] || project.pkg.devDependencies?.[name], `Declare ${name} in the consuming application`);
    const pkg = await readJson(await resolveLocal(project.root, `${name}/package.json`));
    assert.ok(semver.satisfies(pkg.version, design.pkg.peerDependencies?.[name]), `${name}@${pkg.version} does not satisfy the candidate peer requirement`);
  }
}

export function skillContent(locale) {
  assert.ok(["zh", "en"].includes(locale), "--locale must be zh or en");
  const target = `../../../node_modules/${DESIGN}/knowledge/yami-design-system/SKILL${locale === "zh" ? ".zh-CN" : ""}.md`;
  return locale === "zh"
    ? `---\nname: yami-consumer\ndescription: 在当前项目制作或检查 YAMI 品牌的 React 界面时使用，读取实际安装版本的规范、契约和示例。\n---\n\n先读取 ${target}。\n按相邻 index.json 确认安装版本，仅使用索引中的公开组件。\n通过 ${SERVER} MCP 读取所用组件的契约与示例，每次核对 snapshot。\n缺少组件时说明缺口，不编造 API，不回退到其他版本的全局 Skill。\n遵守当前项目的修改范围和验证要求；本 Skill 不授权发布。\n`
    : `---\nname: yami-consumer\ndescription: Use when creating or reviewing YAMI-branded React UI in this project; read the installed version's rules, contracts and examples.\n---\n\nRead ${target} first.\nConfirm the installed version using the adjacent index.json and use only its public components.\nRead component contracts and examples through ${SERVER} MCP; check every snapshot.\nReport missing capabilities without inventing APIs or falling back to another version's global Skill.\nFollow the current project's edit scope and verification requirements. This Skill does not authorize publishing.\n`;
}

export const serverConfig = (root, entry) => ({ command: process.execPath, args: [entry], cwd: root, enabled_tools: TOOLS, startup_timeout_sec: 20, tool_timeout_sec: 30 });
export const parseConfig = (text) => parse(text, { unsafeKeyBehaviour: "throw" });

async function nodeOnPath(cwd) {
  for (const directory of process.env.PATH?.split(path.delimiter) ?? []) {
    const file = path.resolve(cwd, directory, "node");
    try {
      if (!(await fs.stat(file)).isFile()) continue;
      await fs.access(file, constants.X_OK);
      return await fs.realpath(file);
    } catch (error) {
      if (!["ENOENT", "ENOTDIR", "EACCES"].includes(error.code)) throw error;
    }
  }
  return null;
}

export async function sameServer(actual, expected) {
  if (!actual || typeof actual !== "object") return false;
  const normalized = { ...actual };
  if (normalized.command === "node") {
    if (await nodeOnPath(expected.cwd) !== await fs.realpath(expected.command)) return false;
    normalized.command = expected.command;
  }
  if (Array.isArray(normalized.enabled_tools)) normalized.enabled_tools = [...normalized.enabled_tools].sort();
  return isDeepStrictEqual(normalized, { ...expected, enabled_tools: [...expected.enabled_tools].sort() });
}

export async function planConfiguration(project, locale, entry) {
  const skill = await managedFile(project.root, SKILL);
  const config = await managedFile(project.root, CONFIG);
  const expectedSkill = skillContent(locale);
  const skillBefore = await optionalStat(skill) ? await fs.readFile(skill, "utf8") : null;
  assert.ok(skillBefore === null || skillBefore === expectedSkill, `Skill conflict: ${skill}; preserve and review the existing file`);
  const before = await optionalStat(config) ? await fs.readFile(config, "utf8") : "";
  const existing = parseConfig(before).mcp_servers?.[SERVER];
  const expected = serverConfig(project.root, entry);
  assert.ok(existing === undefined || await sameServer(existing, expected), `MCP configuration conflict: ${CONFIG} [mcp_servers.${SERVER}]`);
  const after = existing === undefined ? `${before}${before && !before.endsWith("\n") ? "\n" : ""}\n# yami-design-cli: project-local read-only design knowledge\n${stringify({ mcp_servers: { [SERVER]: expected } })}` : before;
  parseConfig(after);
  return [
    { relative: SKILL, before: skillBefore, after: expectedSkill },
    { relative: CONFIG, before, after },
  ];
}
