import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, readdir, realpath } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import * as z from "zod/v4";

export async function verifyMcp(directory, manifest, mcpManifest) {
  const resolve = createRequire(path.join(directory, "package.json")).resolve;
  const entry = resolve("@yami/design-system-mcp/cli");
  assert.ok((await realpath(entry)).startsWith(`${directory}${path.sep}`), "MCP must be installed from the tarball");
  const knowledgeDirectory = path.dirname(resolve("@yami/design-system/knowledge/index.json"));
  const index = JSON.parse(await readFile(path.join(knowledgeDirectory, "index.json"), "utf8"));
  const identity = Object.fromEntries(["package", "packageVersion", "sourceCommit", "sourceDirty", "contentDigest"].map((key) => [key, manifest[key]]));
  const cwd = path.join(directory, "mcp-empty-cwd");
  await mkdir(cwd);
  const modes = [];
  for (const mode of ["legacy", "modern"]) {
    const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd, stderr: "pipe" });
    let stderr = "";
    transport.stderr.on("data", (chunk) => { stderr += chunk; });
    const client = new Client({ name: "yami-candidate-verifier", version: "1.0.0" }, mode === "legacy"
      ? { supportedProtocolVersions: ["2025-06-18"], versionNegotiation: "legacy" }
      : { versionNegotiation: { pin: "2026-07-28" } });
    const errors = [];
    client.onerror = (error) => errors.push(error.message);
    async function call(name, args = {}) {
      const result = await client.callTool({ name, arguments: args });
      assert.ok(!result.isError, JSON.stringify(result));
      const data = result.structuredContent;
      assert.deepEqual(data.snapshot, identity);
      assert.deepEqual(JSON.parse(result.content[0].text), data);
      return data;
    }
    // Legacy raw requests bypass Client-side tool schema checks, so invalid
    // inputs must also be rejected across the actual server boundary.
    const rejectTool = (name, args) => (mode === "legacy"
      ? client.request({ method: "tools/call", params: { name, arguments: args } }, z.object({ isError: z.boolean().optional() }).passthrough())
      : client.callTool({ name, arguments: args })).then(
      (result) => assert.equal(result.isError, true, `Invalid query unexpectedly succeeded: ${name}`),
      (error) => assert.match(error.message, /invalid|validation|unknown|not found|not registered/i),
    );
    try {
      await client.connect(transport, { timeout: 10_000 });
      assert.equal(client.getServerVersion().version, mcpManifest.packageVersion);
      const capabilities = client.getServerCapabilities();
      assert.ok(capabilities.tools && capabilities.resources);
      assert.equal(capabilities.prompts, undefined);
      const { tools } = await client.listTools();
      assert.deepEqual(tools.map((tool) => tool.name).sort(), ["get_component_contract", "get_component_example", "list_components", "list_design_documents", "read_design_document", "search_design_documents"]);
      assert.ok(tools.every((tool) => tool.annotations.readOnlyHint && !tool.annotations.destructiveHint && tool.annotations.idempotentHint && !tool.annotations.openWorldHint));
      const documents = await call("list_design_documents");
      assert.ok(documents.documents.some((document) => document.id === "DESIGN"));
      assert.ok(documents.documents.some((document) => document.id === "components/Button/usage"));
      const page = await call("read_design_document", { id: "DESIGN", maxLines: 8 });
      const design = await readFile(path.join(knowledgeDirectory, index.references.design), "utf8");
      assert.equal(page.text, design.split("\n").slice(0, 8).join("\n"));
      assert.equal(page.nextLine, 9);
      assert.equal((await call("read_design_document", { id: "DESIGN", startLine: 9, maxLines: 8 })).text, design.split("\n").slice(8, 16).join("\n"));
      const search = await call("search_design_documents", { query: "focus", id: "DESIGN", limit: 1 });
      assert.equal(search.matches.length, 1);
      assert.equal(search.truncated, true);
      assert.match(design.split("\n")[search.matches[0].line - 1], /focus/i);
      assert.equal((await call("search_design_documents", { query: "不存在的测试词__yami__" })).matches.length, 0);
      assert.equal((await call("search_design_documents", { query: "按钮", id: "DESIGN", limit: 1 })).matches.length, 1);
      const components = await call("list_components");
      assert.deepEqual(components.components.map((component) => component.name), manifest.entries.map((component) => component.name));
      for (const component of index.components) {
        const contract = await call("get_component_contract", { component: component.name });
        assert.deepEqual(contract.contract, JSON.parse(await readFile(path.join(knowledgeDirectory, component.contract), "utf8")));
        const example = await call("get_component_example", { component: component.name, example: component.examples[0].export });
        assert.equal(example.code, await readFile(path.join(knowledgeDirectory, component.examples[0].path), "utf8"));
      }
      const { resources } = await client.listResources();
      assert.equal(resources.length, index.documents.length + 1);
      for (const resource of resources) {
        const result = await client.readResource({ uri: resource.uri });
        const relative = new URL(resource.uri).pathname.split("/").slice(2).join("/");
        assert.equal(result.contents[0].text, await readFile(path.join(knowledgeDirectory, relative), "utf8"));
        assert.deepEqual(result.contents[0]._meta["yami.design/snapshot"], identity);
      }
      await rejectTool("get_component_contract", { component: "Header" });
      await rejectTool("get_component_example", { component: "Button", example: "MissingExample" });
      await rejectTool("read_design_document", { id: "../../package.json" });
      await rejectTool("read_design_document", { id: "DESIGN", startLine: page.totalLines + 1 });
      await rejectTool("read_design_document", { id: "DESIGN", maxLines: 201 });
      await rejectTool("search_design_documents", { query: "   " });
      await rejectTool("list_components", { path: "/etc/passwd" });
      await rejectTool("write_file", { path: "should-not-exist.txt", content: "test" });
      for (const uri of ["file:///etc/passwd", `yami://design-system/0.0.0/index.json`, `yami://design-system/${manifest.packageVersion}/%2e%2e/package.json`]) {
        await assert.rejects(client.readResource({ uri }));
      }
      assert.deepEqual(errors, [], "MCP protocol errors, including invalid stdout");
      modes.push(mode);
    } finally {
      await client.close();
      await transport.close();
    }
    assert.equal(stderr, "", "MCP stderr must be empty during valid startup and queries");
  }
  const indexFile = path.join(knowledgeDirectory, "index.json");
  const original = await readFile(indexFile, "utf8");
  try {
    await writeFile(indexFile, original.replace("sourceCommit", "sourceCommix"));
    const rejected = spawnSync(process.execPath, [entry], { cwd, input: "", encoding: "utf8", timeout: 10_000 });
    assert.equal(rejected.status, 1, rejected.stderr);
    assert.equal(rejected.stdout, "");
    assert.match(rejected.stderr, /YAMI MCP startup failed: Snapshot file digest differs/);
  } finally {
    await writeFile(indexFile, original);
  }
  assert.deepEqual(await readdir(cwd), [], "MCP must not create files in the consuming working directory");
  return { status: "pass", packageVersion: mcpManifest.packageVersion, contentDigest: mcpManifest.contentDigest, designSystemVersion: manifest.packageVersion, modes, tools: 6, components: index.components.length, arbitraryWorkingDirectory: "pass", tamperedStartup: "rejected", errors: [] };
}
