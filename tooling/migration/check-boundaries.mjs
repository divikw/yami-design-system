import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const root = process.cwd();
const ignoredDirectories = new Set([".next", "coverage", "dist", "node_modules", "storybook-static"]);
const rules = [
  { dir: "apps/canvas", forbidden: ["@yami/topic-generator"] },
  { dir: "packages/design-system", forbidden: ["@yami/contracts", "@yami/prototypes", "next/", "motion/", "zod", "@design-labs/", "@astryxdesign/"] },
  { dir: "packages/contracts", forbidden: ["@yami/design-system", "@yami/prototypes", "next/", "motion/", "react", "@design-labs/", "@astryxdesign/"] },
  { dir: "packages/commerce-catalog", forbidden: ["@yami/design-system", "@yami/prototypes", "@yami/topic-generator", "next/", "motion/", "react", "@design-labs/", "@astryxdesign/"] },
  { dir: "packages/prototypes", forbidden: ["next/", "motion/", "@design-labs/", "@astryxdesign/"] }
];
const baseUiConsumerPaths = [
  /^packages\/prototypes\/pages\//,
  /^packages\/design-system\/storybook\//,
  /^apps\/storybook\/(?:\.storybook|stories)\//,
  /^apps\/[^/]+\/app\/(?:.*\/)?(?:page|layout)\.[mc]?[jt]sx?$/,
  /^apps\/[^/]+\/pages\//,
  /\.stories\.[mc]?[jt]sx?$/,
];
const baseUiImport = /^@base-ui\/react(?:\/([^/]+)(?:\/.*)?)?$/;
const yamiAliases = new Map([
  ["Fieldset", "FieldSet"],
  ["Menu", "DropdownMenu"],
  ["Radio", "RadioGroup"],
  ["Separator", "Divider"],
]);

async function files(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const values = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? ignoredDirectories.has(entry.name) ? [] : files(path.join(dir, entry.name))
    : /\.[mc]?[jt]sx?$/.test(entry.name) ? [path.join(dir, entry.name)] : []));
  return values.flat();
}

function baseUiNames(node, subpath) {
  if (subpath) {
    return [subpath.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())];
  }
  const named = ts.isImportDeclaration(node) ? node.importClause?.namedBindings
    : ts.isExportDeclaration(node) ? node.exportClause : undefined;
  return named && (ts.isNamedImports(named) || ts.isNamedExports(named))
    ? named.elements.map(({ propertyName, name }) => (propertyName ?? name).text)
    : [];
}

function checkBaseUiImports(relative, code, yamiExports, failures, warnings) {
  const source = ts.createSourceFile(relative, code, ts.ScriptTarget.Latest);
  function report(specifier, node) {
    if (!specifier || !ts.isStringLiteralLike(specifier)) return;
    const match = baseUiImport.exec(specifier.text);
    if (!match) return;
    const { line } = source.getLineAndCharacterOfPosition(specifier.getStart(source));
    const location = `${relative}:${line + 1}`;
    const names = baseUiNames(node, match[1]);
    if (!names.length) {
      warnings.push(`${location} imports ${specifier.text} without identifying a primitive. Use a named or subpath import to check for a YAMI equivalent.`);
      return;
    }
    for (const name of names) {
      const alternative = yamiAliases.get(name) ?? name;
      if (yamiExports.has(alternative)) {
        failures.push(`${location} directly imports Base UI ${name} from ${specifier.text}. Use YAMI ${alternative}.`);
      } else {
        warnings.push(`${location} uses Base UI ${name} from ${specifier.text}. No matching YAMI export was found. Direct use is allowed. Mention the fallback in the handoff.`);
      }
    }
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) report(node.moduleSpecifier, node);
    else if (ts.isExternalModuleReference(node)) report(node.expression, node);
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) report(node.argument.literal, node);
    else if (ts.isCallExpression(node) && (
      node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      ts.isIdentifier(node.expression) && node.expression.text === "require"
    )) report(node.arguments[0], node);
    ts.forEachChild(node, visit);
  }
  visit(source);
}

const failures = [];
for (const rule of rules) for (const file of await files(path.join(root, rule.dir))) {
  const source = await fs.readFile(file, "utf8");
  for (const dependency of rule.forbidden) if (new RegExp(`(?:from\\s+|import\\s*\\()?["']${dependency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(source)) failures.push(`${path.relative(root, file)} imports forbidden ${dependency}`);
}

const catalog = JSON.parse(await fs.readFile(path.join(root, "packages/design-system/generated/catalog.json"), "utf8"));
const yamiExports = new Set(catalog.components.flatMap(({ id, meta }) => [id, ...(meta.exports ?? [])]));
const warnings = [];
const consumerFiles = (await Promise.all(["apps", "packages"].map((dir) => files(path.join(root, dir))))).flat();
for (const file of consumerFiles) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (!baseUiConsumerPaths.some((pattern) => pattern.test(relative))) continue;
  checkBaseUiImports(relative, await fs.readFile(file, "utf8"), yamiExports, failures, warnings);
}

for (const warning of warnings) console.warn(`Warning: ${warning}`);
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log("Package boundaries verified.");
