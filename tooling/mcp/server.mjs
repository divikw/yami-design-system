import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export function createServer(snapshot, version) {
  const { identity, index, files } = snapshot;
  const server = new McpServer({ name: "yami-design-system", version }, {
    instructions: "Read-only access to a frozen installed YAMI candidate. Check snapshot.packageVersion on results. Only list_components entries are public imports. Other components and repository scripts mentioned in upstream documents are reference context. No writes, network fetches, UI validation or installation tools are provided.",
  });
  const uriFor = (file) => `yami://design-system/${encodeURIComponent(identity.packageVersion)}/${file}`;
  const mimeType = (file) => file.endsWith(".md") ? "text/markdown" : file.endsWith(".json") ? "application/json" : file.endsWith(".css") ? "text/css" : "text/plain";
  const documents = [...files].filter(([file]) => file.endsWith(".md")).map(([file, text]) => ({
    id: file.replace(/^references\//, "").replace(/\.md$/, ""),
    title: text.match(/^#\s+(.+)$/m)?.[1] ?? file,
    uri: uriFor(file),
    lines: text.split("\n"),
  }));
  function documentFor(id) {
    const document = documents.find((entry) => entry.id === id);
    if (!document) throw new Error("Unknown document. Use list_design_documents for supported IDs.");
    return document;
  }
  const componentName = z.enum(index.components.map((entry) => entry.name));
  const componentFor = (name) => index.components.find((entry) => entry.name === name);
  function tool(name, description, inputSchema, handler) {
    server.registerTool(name, { description, inputSchema, annotations }, async (args) => {
      try {
        const result = { snapshot: identity, ...handler(args) };
        return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
      } catch (error) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
      }
    });
  }
  tool("list_design_documents", "List installed YAMI design documents, component usage and Skills. IDs are lookup keys, not file paths.", z.object({}).strict(), () => ({
    documents: documents.map(({ id, title, uri, lines }) => ({ id, title, uri, totalLines: lines.length })),
  }));
  tool("read_design_document", "Read a page of an installed design document. Use search_design_documents to find relevant lines; follow nextLine for more.", z.object({
    id: z.string().min(1).max(120), startLine: z.number().int().min(1).default(1), maxLines: z.number().int().min(1).max(200).default(100),
  }).strict(), ({ id, startLine, maxLines }) => {
    const document = documentFor(id);
    if (startLine > document.lines.length) throw new Error("startLine exceeds the document length.");
    const endLine = Math.min(document.lines.length, startLine + maxLines - 1);
    return { id, uri: document.uri, startLine, endLine, totalLines: document.lines.length, nextLine: endLine < document.lines.length ? endLine + 1 : null, text: document.lines.slice(startLine - 1, endLine).join("\n") };
  });
  tool("search_design_documents", "Find literal case-insensitive text in installed YAMI documents. Returns bounded line snippets; it does not search the web.", z.object({
    query: z.string().trim().min(1).max(120), id: z.string().min(1).max(120).optional(), limit: z.number().int().min(1).max(20).default(10),
  }).strict(), ({ query, id, limit }) => {
    const matches = [];
    for (const document of id ? [documentFor(id)] : documents) {
      for (let line = 0; line < document.lines.length; line++) {
        const offset = document.lines[line].toLowerCase().indexOf(query.toLowerCase());
        if (offset === -1) continue;
        if (matches.length === limit) return { matches, truncated: true };
        matches.push({ id: document.id, uri: document.uri, line: line + 1, snippet: document.lines[line].slice(Math.max(0, offset - 80), offset + query.length + 160) });
      }
    }
    return { matches, truncated: false };
  });
  tool("list_components", "List the complete public component inventory of this installed candidate. Composition dependencies are not extra public imports.", z.object({}).strict(), () => ({
    components: index.components.map(({ name, version, status, import: specifier, exports, contract, usage, examples }) => ({ name, version, status, import: specifier, exports, contractURI: uriFor(contract), usageURI: uriFor(usage), examples: examples.map((example) => ({ export: example.export, uri: uriFor(example.path) })) })),
  }));
  tool("get_component_contract", "Read a public component's installed contract, props, Token bindings and accessibility rules. usageURI provides usage context.", z.object({ component: componentName }).strict(), ({ component }) => {
    const entry = componentFor(component);
    return { component, import: entry.import, uri: uriFor(entry.contract), usageURI: uriFor(entry.usage), contract: JSON.parse(files.get(entry.contract)) };
  });
  tool("get_component_example", "Read a copyable TSX example using this candidate's public imports. Copy into the host app and connect real business callbacks.", z.object({ component: componentName, example: z.string().max(120).optional() }).strict(), ({ component, example }) => {
    const entry = componentFor(component);
    const selected = example ? entry.examples.find((item) => item.export === example) : entry.examples[0];
    if (!selected) throw new Error("Unknown example. Use list_components for supported examples.");
    return { component, export: selected.export, language: "tsx", uri: uriFor(selected.path), code: files.get(selected.path) };
  });
  for (const [file, text] of files) {
    server.registerResource(file, uriFor(file), { mimeType: mimeType(file), description: `Installed YAMI ${identity.packageVersion}: ${file}` }, async (uri) => ({
      contents: [{ uri: uri.href, mimeType: mimeType(file), text, _meta: { "yami.design/snapshot": identity } }],
    }));
  }
  return server;
}
