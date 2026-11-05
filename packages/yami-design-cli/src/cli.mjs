#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { doctor } from "./doctor.mjs";
import { initialise } from "./init.mjs";

const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const help = `yami-design-cli ${pkg.version} — connect YAMI design components, Skill and MCP

Usage:
  yami-design-cli init --design-package <local.tgz> --mcp-package <local.tgz> [--locale zh|en] [--dry-run]
  yami-design-cli doctor [--json]

Shared options: --cwd <application>, --package-manager npm|pnpm, --json
Other options: --help, --version

Node 24; standalone Next.js/Vite applications; project-local Codex configuration.
init preserves conflicting files and does not upgrade installed candidates.
doctor is read-only and does not replace host type/build/browser or AI-output review.
`;

try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    cwd: { type: "string" }, "package-manager": { type: "string" }, "design-package": { type: "string" }, "mcp-package": { type: "string" }, locale: { type: "string" }, "dry-run": { type: "boolean" }, json: { type: "boolean" }, help: { type: "boolean" }, version: { type: "boolean" },
  } });
  if (values.help) console.log(help);
  else if (values.version) console.log(pkg.version);
  else {
    const [command, ...extra] = positionals;
    if (!["init", "doctor"].includes(command) || extra.length) throw new Error(help);
    if (command === "doctor" && ["design-package", "mcp-package", "locale", "dry-run"].some((key) => values[key] !== undefined)) throw new Error("doctor accepts only --cwd, --package-manager and --json");
    const options = { cwd: values.cwd, packageManager: values["package-manager"] };
    const result = command === "doctor" ? await doctor(options) : await initialise({ ...options, designPackage: values["design-package"], mcpPackage: values["mcp-package"], locale: values.locale, dryRun: values["dry-run"] });
    const output = { ...result, cliVersion: pkg.version };
    if (values.json) console.log(JSON.stringify(output));
    else {
      console.log(`${pkg.name} ${pkg.version}: ${command} ${result.status}\nApplication: ${result.cwd}`);
      if (result.checks) for (const check of result.checks) console.log(`${check.status}: ${check.id}${check.error ? ` — ${check.error}` : ""}`);
      if (result.configuration) console.log(`Configuration: ${result.configuration.join(", ") || "already matches"}`);
      if (result.dependencyFiles) console.log(`Dependency files: ${result.dependencyFiles.join(", ") || "unchanged"}`);
      if (result.install) console.log(`Packages: ${result.install.map(({ name, section }) => `${name} (${section})`).join(", ") || "already installed"}`);
      if (result.styleImports) console.log(`\nReview styles at ${result.styleEntry}:\n${result.styleImports}`);
      console.log(`\nManual verification:\n${result.manualChecks.map((item) => `- ${item}`).join("\n")}`);
    }
    if (result.status === "fail") process.exitCode = 1;
  }
} catch (error) {
  if (process.argv.includes("--json")) console.log(JSON.stringify({ schemaVersion: 1, status: "fail", cliVersion: pkg.version, error: error.message }));
  else console.error(`yami-design-cli: ${error.message}`);
  process.exitCode = 1;
}
