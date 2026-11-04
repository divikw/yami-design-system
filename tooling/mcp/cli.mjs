#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { loadSnapshot } from "./snapshot.mjs";
import { createServer } from "./server.mjs";

try {
  if (process.argv.length !== 2) throw new Error("This stdio server accepts no arguments; it reads its installed @yami/design-system peer.");
  const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
  const resolve = createRequire(import.meta.url).resolve;
  const snapshot = await loadSnapshot({
    manifestFile: resolve("@yami/design-system/candidate-manifest.json"),
    indexFile: resolve("@yami/design-system/knowledge/index.json"),
    expectedVersion: pkg.peerDependencies["@yami/design-system"],
  });
  const handle = serveStdio(() => createServer(snapshot, pkg.version));
  process.once("SIGINT", () => { void handle.close(); });
  process.once("SIGTERM", () => { void handle.close(); });
} catch (error) {
  console.error(`YAMI MCP startup failed: ${error.message}`);
  process.exitCode = 1;
}
