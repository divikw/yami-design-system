import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { contentDigest } from "../registry/contracts.mjs";

export async function packMcp({ root, policy, provenance }) {
  const output = path.join(root, "dist/design-system-mcp-candidate");
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  for (const file of ["cli.mjs", "server.mjs", "snapshot.mjs"]) await fs.copyFile(path.join(root, "tooling/mcp", file), path.join(output, file));
  await fs.chmod(path.join(output, "cli.mjs"), 0o755);
  await fs.copyFile(path.join(root, "packages/design-system/distribution/MCP.md"), path.join(output, "README.md"));
  const workspace = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
  const pkg = {
    name: "@yami/design-system-mcp", version: policy.mcpVersion, private: true, license: "UNLICENSED", type: "module",
    engines: { node: "~24" }, bin: { "yami-design-system-mcp": "./cli.mjs" },
    exports: { "./cli": "./cli.mjs", "./candidate-manifest.json": "./candidate-manifest.json" },
    peerDependencies: { "@yami/design-system": policy.version },
    dependencies: Object.fromEntries(["@modelcontextprotocol/server", "zod"].map((name) => [name, workspace.devDependencies[name]])),
  };
  await fs.writeFile(path.join(output, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  const payload = await Promise.all((await fs.readdir(output)).sort().map(async (file) => ({ path: file, content: await fs.readFile(path.join(output, file)) })));
  const manifest = {
    schemaVersion: 1, package: pkg.name, packageVersion: pkg.version, ...provenance,
    designSystemVersion: policy.version, distribution: "local-authorized-verification-only",
    contentDigest: contentDigest(payload),
    files: payload.map(({ path: file, content }) => ({ path: file, bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") })),
  };
  await fs.writeFile(path.join(output, "candidate-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  const receipt = JSON.parse(execFileSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", path.dirname(output)], { cwd: output, encoding: "utf8" }));
  await fs.writeFile(path.join(root, "dist/candidate-mcp-pack.json"), `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(`MCP candidate: ${path.join(root, "dist", receipt[0].filename)}\nContent: ${manifest.contentDigest}`);
}
