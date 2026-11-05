import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { DESIGN, MCP, verifyCandidate, verifyPair } from "./artifacts.mjs";
import { CONFIG, SERVER, SKILL, TOOLS, inspectProject, parseConfig, resolveLocal, sameServer, serverConfig, skillContent, verifyHost } from "./project.mjs";

export const manualChecks = ["Connect runtime CSS and authorized fonts at the host entry; inspect the existing reset.", "Trust/reconnect the project in Codex and confirm Skill/tool discovery in the client.", "Run the consuming app's type check, production build and browser checks; inspect responsive, theme and keyboard states.", "AI-generated output quality has not been evaluated by this command."];
const { version } = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));

export async function installedPair(project) {
  const design = await verifyCandidate(path.dirname(await resolveLocal(project.root, `${DESIGN}/candidate-manifest.json`)), DESIGN);
  const entry = await resolveLocal(project.root, `${MCP}/cli`);
  const mcp = await verifyCandidate(path.dirname(entry), MCP);
  assert.equal(entry, path.join(mcp.directory, "cli.mjs"), "Resolved MCP entry differs from the verified executable");
  const index = verifyPair(design, mcp);
  assert.ok((await fs.stat(path.join(project.root, project.lockfile))).isFile(), "A package-manager lockfile is required");
  assert.ok(project.pkg.dependencies?.[DESIGN], "The design package must be an application dependency");
  assert.ok(project.pkg.devDependencies?.[MCP] && !project.pkg.dependencies?.[MCP], "MCP must be a development dependency");
  return { design, mcp, index, entry };
}

async function queryMcp(pair, config) {
  const identity = Object.fromEntries(["package", "packageVersion", "sourceCommit", "sourceDirty", "contentDigest"].map((key) => [key, pair.design.manifest[key]]));
  const transport = new StdioClientTransport({ command: process.execPath, args: config.args, cwd: config.cwd, stderr: "pipe" });
  let stderr = "";
  transport.stderr.on("data", (data) => { stderr = (stderr + data).slice(-4000); });
  const client = new Client({ name: "yami-design-cli", version }, { supportedProtocolVersions: ["2025-06-18"], versionNegotiation: "legacy" });
  const errors = [];
  client.onerror = (error) => errors.push(error.message);
  const options = { timeout: 10_000, signal: AbortSignal.timeout(30_000) };
  const call = async (name, args = {}) => {
    const result = await client.callTool({ name, arguments: args }, options);
    assert.ok(!result.isError, `${name} failed`);
    assert.deepEqual(result.structuredContent.snapshot, identity, "MCP snapshot differs from the installed candidate");
    return result.structuredContent;
  };
  try {
    await client.connect(transport, options);
    assert.equal(client.getServerVersion().version, pair.mcp.pkg.version);
    const { tools } = await client.listTools({}, options);
    assert.deepEqual(tools.map((tool) => tool.name).sort(), [...TOOLS].sort());
    assert.ok(tools.every((tool) => tool.annotations?.readOnlyHint === true));
    const inventory = await call("list_components");
    assert.deepEqual(inventory.components.map(({ name }) => name), pair.index.components.map(({ name }) => name));
    const document = await call("read_design_document", { id: "DESIGN.compact", maxLines: 8 });
    const prefix = path.posix.dirname(pair.design.pkg.exports["./knowledge/index.json"].replace(/^\.\//, ""));
    const content = (file) => pair.design.files.get(path.posix.join(prefix, file)).toString();
    assert.equal(document.text, content(pair.index.references.overview).split("\n").slice(0, 8).join("\n"));
    const component = pair.index.components[0];
    const contract = await call("get_component_contract", { component: component.name });
    assert.deepEqual(contract.contract, JSON.parse(content(component.contract)));
    const example = await call("get_component_example", { component: component.name, example: component.examples[0].export });
    assert.equal(example.code, content(component.examples[0].path));
    assert.deepEqual(errors, []);
    assert.equal(stderr, "", "Unexpected MCP stderr");
    return { snapshot: identity, tools: tools.length, queries: 4, component: component.name };
  } finally { await client.close(); await transport.close(); }
}

export async function doctor({ cwd = process.cwd(), packageManager } = {}) {
  const checks = ["project", "packages", "host", "skill", "mcp_config", "mcp_queries"].map((id) => ({ id, status: "not_run" }));
  const check = async (id, action) => {
    const record = checks.find((item) => item.id === id);
    try { const result = await action(); record.status = "pass"; return result; }
    catch (error) { Object.assign(record, { status: "fail", error: error.message }); return null; }
  };
  const project = await check("project", () => inspectProject(cwd, packageManager));
  const pair = project && await check("packages", () => installedPair(project));
  let config;
  let mcp;
  if (pair) {
    await check("host", () => verifyHost(project, pair.design));
    await check("skill", async () => {
      const text = await fs.readFile(path.join(project.root, SKILL), "utf8");
      const locale = ["zh", "en"].find((value) => text === skillContent(value));
      assert.ok(locale, "Missing or modified YAMI consumer Skill bridge");
      const target = await resolveLocal(project.root, `${DESIGN}/skill${locale === "zh" ? "/zh" : ""}`);
      const indexFile = await resolveLocal(project.root, `${DESIGN}/knowledge/index.json`);
      assert.equal(target, await fs.realpath(path.join(path.dirname(indexFile), pair.index.skills[locale === "zh" ? "zh-CN" : "en"])));
    });
    config = await check("mcp_config", async () => {
      const value = parseConfig(await fs.readFile(path.join(project.root, CONFIG), "utf8")).mcp_servers?.[SERVER];
      assert.ok(await sameServer(value, serverConfig(project.root, pair.entry)), "Missing or conflicting project MCP configuration; review it before running init");
      return value;
    });
    if (config) mcp = await check("mcp_queries", () => queryMcp(pair, config));
  }
  return { schemaVersion: 1, command: "doctor", status: checks.every((check) => check.status === "pass") ? "pass" : "fail", cwd: project?.root ?? path.resolve(cwd), checks, ...(pair ? { versions: { design: pair.design.pkg.version, mcp: pair.mcp.pkg.version }, snapshot: mcp?.snapshot ?? Object.fromEntries(["package", "packageVersion", "sourceCommit", "sourceDirty", "contentDigest"].map((key) => [key, pair.design.manifest[key]])) } : {}), ...(mcp ? { mcp } : {}), manualChecks, modelCalls: 0 };
}
