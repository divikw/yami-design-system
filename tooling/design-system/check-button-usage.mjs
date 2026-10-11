import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

// Deliberately limited to imported YAMI components and explicit JSX contracts.
// Computed props, external callbacks, and visual priority need separate review.
export function checkButtonUsage(code, filename = "source.tsx") {
  const source = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const components = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const moduleName = statement.moduleSpecifier.text;
    if (!/^@yami\/design-system(?:\/|$)/.test(moduleName) && !/^(?:\.\.?\/)+(?:.*\/)?(?:Button|ButtonLink|ButtonGroup)(?:\/(?:Button|ButtonLink|ButtonGroup))?$/.test(moduleName)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const binding of bindings.elements) {
      const imported = (binding.propertyName ?? binding.name).text;
      if (["Button", "ButtonLink", "ButtonGroup"].includes(imported)) components.set(binding.name.text, imported);
    }
  }

  const violations = [];
  const report = (node, message) => {
    const start = node.getStart(source);
    const position = source.getLineAndCharacterOfPosition(start);
    violations.push({ ruleId: "button-usage", severity: "error", message,
      locations: [{ line: position.line + 1, column: position.character + 1, length: node.getWidth(source) }] });
  };
  const opening = (node) => ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  const attribute = (node, name) => node.attributes.properties.find((prop) => ts.isJsxAttribute(prop) && prop.name.getText(source) === name);
  const hasSpread = (node) => node.attributes.properties.some(ts.isJsxSpreadAttribute);
  const literal = (attr) => {
    if (!attr?.initializer) return undefined;
    const value = ts.isJsxExpression(attr.initializer) ? attr.initializer.expression : attr.initializer;
    return value && (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) ? value.text : undefined;
  };
  const navigation = (node) => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      /^window\.location(?:\.href)?$/.test(node.left.getText(source))) return true;
    if (ts.isCallExpression(node) && /^window\.location\.(assign|replace)$/.test(node.expression.getText(source))) return true;
    return false;
  };
  const redirectOnly = (handler) => {
    const callback = ts.isJsxExpression(handler) && handler.expression;
    if (!callback || !(ts.isArrowFunction(callback) || ts.isFunctionExpression(callback))) return false;
    if (!ts.isBlock(callback.body)) return navigation(callback.body);
    if (callback.body.statements.length !== 1) return false;
    const statement = callback.body.statements[0];
    return (ts.isExpressionStatement(statement) || ts.isReturnStatement(statement)) && statement.expression && navigation(statement.expression);
  };
  const visit = (node) => {
    const host = opening(node);
    const component = host && components.get(host.tagName.getText(source));
    if (component === "Button") {
      for (const name of ["href", "as", "asChild"]) {
        const attr = attribute(host, name);
        if (attr) report(attr, `Button does not support ${name}; use an anchor with href for navigation.`);
      }
      const handler = attribute(host, "onClick")?.initializer;
      if (handler && redirectOnly(handler)) report(handler, "Button only redirects from onClick; preserve navigation with an anchor and a real href.");
    }
    if (component === "ButtonGroup") {
      const label = attribute(host, "aria-label");
      if ((!label && !hasSpread(host)) || (label && (!label.initializer || literal(label)?.trim() === ""))) {
        report(host, "ButtonGroup requires a nonempty aria-label describing its actions.");
      }
      if (ts.isJsxElement(node)) {
        const sizes = node.children.map(opening).filter((child) => child && ["Button", "ButtonLink"].includes(components.get(child.tagName.getText(source))))
          .map((child) => literal(attribute(child, "size")) ?? (!attribute(child, "size") && !hasSpread(child) ? "md" : undefined))
          .filter((size) => size !== undefined);
        if (new Set(sizes).size > 1) report(host, "Related Button / ButtonLink entries in a ButtonGroup must use a consistent size (default md).");
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { pass: violations.length === 0, violations };
}

async function checkRepository() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const ignored = new Set(["node_modules", ".next", "dist", "storybook-static", "tests", "__tests__", "generated"]);
  let count = 0;
  let failed = false;
  async function walk(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory() && !ignored.has(entry.name)) await walk(filename);
      if (!entry.isFile() || !entry.name.endsWith(".tsx") || /\.(test|figma)\.tsx$/.test(entry.name)) continue;
      count += 1;
      const result = checkButtonUsage(await fs.readFile(filename, "utf8"), filename);
      for (const violation of result.violations) {
        failed = true;
        console.error(`${path.relative(root, filename)}:${violation.locations[0].line}: ${violation.message}`);
      }
    }
  }
  for (const directory of ["apps", "packages/design-system/components", "packages/prototypes/pages"]) await walk(path.join(root, directory));
  if (failed) process.exitCode = 1;
  else console.log(`Button usage contracts verified in ${count} TSX files (explicit props, redirects, group names and sizes).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await checkRepository();
