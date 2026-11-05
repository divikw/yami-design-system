import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import ts from "typescript";
import { verifyInstalledCandidate } from "./verify-package.mjs";

// 交付版本只使用稳定版或 candidate.N，避免把预发布序号按字符串排序。
export function versionParts(version) {
  const number = "(0|[1-9][0-9]*)";
  const match = new RegExp(`^${number}\\.${number}\\.${number}(?:-candidate\\.${number})?$`).exec(version);
  assert.ok(match, `Unsupported distribution version: ${version}`);
  return [...match.slice(1, 4).map(Number), match[4] === undefined ? Infinity : Number(match[4])];
}

export function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}

export async function loadReleases(root) {
  const directory = path.join(root, "tooling/distribution/releases");
  assert.ok((await fs.lstat(directory)).isDirectory(), "Delivery records must use a regular directory, not a symlink");
  const releases = await Promise.all((await fs.readdir(directory)).filter((file) => file.endsWith(".json")).map(async (file) => {
    const target = path.join(directory, file);
    assert.ok((await fs.lstat(target)).isFile(), `Delivery record must be a regular file: ${file}`);
    const release = JSON.parse(await fs.readFile(target, "utf8"));
    assert.equal(release.schemaVersion, 1);
    assert.equal(file, `${release.component.package.version}.json`);
    return release;
  }));
  assert.ok(releases.length, "A reviewed delivery baseline is required");
  for (const release of releases) versionParts(release.mcp.version);
  assert.equal(new Set(releases.map((release) => release.mcp.version)).size, releases.length, "A delivered MCP version cannot be reused for another component delivery");
  return releases.sort((a, b) => compareVersions(a.component.package.version, b.component.package.version));
}

export function assertUnreleased(policy, releases) {
  versionParts(policy.version);
  versionParts(policy.mcpVersion);
  for (const release of releases) {
    assert.notEqual(policy.version, release.component.package.version, `Component version ${policy.version} is delivery-locked; restore its original tarball or increment the candidate version`);
    assert.notEqual(policy.mcpVersion, release.mcp.version, `MCP version ${policy.mcpVersion} is delivery-locked; increment its version with its exact component peer`);
  }
}

export async function capturePackage(directory) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, "candidate-manifest.json"), "utf8"));
  await verifyInstalledCandidate(directory, manifest);
  const pkg = JSON.parse(await fs.readFile(path.join(directory, "package.json"), "utf8"));
  const declarations = {};
  for (const file of manifest.files.filter((file) => file.path.endsWith(".d.ts"))) declarations[file.path] = await fs.readFile(path.join(directory, file.path), "utf8");
  const css = await fs.readFile(path.join(directory, "generated/tokens.css"), "utf8");
  return {
    package: pkg,
    identity: { sourceCommit: manifest.sourceCommit, sourceDirty: manifest.sourceDirty, contentDigest: manifest.contentDigest },
    declarations,
    tokens: [...new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]))].sort(),
    runtime: Object.fromEntries(manifest.files.filter((file) => /^(components\/|generated\/tokens\.|styles\/|assets\/)/.test(file.path) && !file.path.endsWith(".d.ts")).map((file) => [file.path, file.sha256])),
  };
}

// 比较实际随包 .d.ts；契约 JSON 不能覆盖继承的原生属性和所有公开类型。
export async function compareApi(previous, current, root) {
  const breaking = [];
  const additions = [];
  for (const name of Object.keys(previous.package.exports)) if (!(name in current.package.exports)) breaking.push(`Removed package export ${name}`);
  for (const name of Object.keys(current.package.exports)) if (!(name in previous.package.exports)) additions.push(`Added package export ${name}`);
  for (const token of previous.tokens) if (!current.tokens.includes(token)) breaking.push(`Removed Token ${token}`);
  for (const token of current.tokens) if (!previous.tokens.includes(token)) additions.push(`Added Token ${token}`);
  if (!isDeepStrictEqual(previous.package.peerDependencies ?? {}, current.package.peerDependencies ?? {})) breaking.push("Changed host peer requirements (manual compatibility review required)");

  await fs.mkdir(path.join(root, "dist"), { recursive: true });
  const temporary = await fs.mkdtemp(path.join(root, "dist/upgrade-types-"));
  try {
    for (const [side, snapshot] of [["previous", previous], ["current", current]]) {
      for (const [file, text] of Object.entries(snapshot.declarations)) {
        assert.ok(/^components\/[\w./-]+\.d\.ts$/.test(file) && !file.split("/").includes(".."), `Invalid declaration path: ${file}`);
        const target = path.join(temporary, side, file);
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, text);
      }
      await fs.writeFile(path.join(temporary, side, "package.json"), '{"type":"module"}\n');
    }
    const entries = Object.entries(previous.package.exports).filter(([, target]) => target.types);
    const roots = entries.flatMap(([name, target]) => [path.join(temporary, "previous", target.types), ...(current.package.exports[name]?.types ? [path.join(temporary, "current", current.package.exports[name].types)] : [])]);
    const options = {
      strict: true, noEmit: true, skipLibCheck: false, types: [], target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
      lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
      paths: { react: [path.join(root, "packages/design-system/node_modules/@types/react/index.d.ts")], "react/*": [path.join(root, "packages/design-system/node_modules/@types/react/*")] },
    };
    const program = ts.createProgram(roots, options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, { getCurrentDirectory: () => root, getCanonicalFileName: (file) => file, getNewLine: () => "\n" }));
    const checker = program.getTypeChecker();
    const lines = ["type Assert<T extends true> = T;", "type IsAny<T> = 0 extends (1 & T) ? true : false;", "type Keys<T> = T extends unknown ? keyof T : never;"];
    const checks = new Map();
    function check(expression, kind, label) {
      checks.set(lines.length, { kind, label });
      lines.push(`type Check${lines.length} = Assert<${expression}>;`);
    }
    for (const [i, [name, target]] of entries.entries()) {
      const next = current.package.exports[name];
      if (!next?.types) { breaking.push(`Removed type entry ${name}`); continue; }
      const oldFile = program.getSourceFile(path.join(temporary, "previous", target.types));
      const newFile = program.getSourceFile(path.join(temporary, "current", next.types));
      const oldExports = checker.getExportsOfModule(checker.getSymbolAtLocation(oldFile));
      const newExports = new Map(checker.getExportsOfModule(checker.getSymbolAtLocation(newFile)).map((symbol) => [symbol.name, symbol]));
      for (const symbol of newExports.values()) {
        const value = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
        assert.ok(!(value.flags & ts.SymbolFlags.Type) || !value.declarations?.some((declaration) => declaration.typeParameters?.some((parameter) => !parameter.default)), `Required generic public type needs an explicit compatibility fixture: ${name}: ${symbol.name}`);
      }
      lines.push(`import type * as Old${i} from ${JSON.stringify(`./previous/${target.types.replace(/^\.\//, "").replace(/\.d\.ts$/, ".js")}`)};`);
      lines.push(`import type * as New${i} from ${JSON.stringify(`./current/${next.types.replace(/^\.\//, "").replace(/\.d\.ts$/, ".js")}`)};`);
      for (const symbol of oldExports) {
        const other = newExports.get(symbol.name);
        const label = `${name}: ${symbol.name}`;
        if (!other) { breaking.push(`Removed symbol ${label}`); continue; }
        const unwrap = (value) => value.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(value) : value;
        const oldSymbol = unwrap(symbol);
        const newSymbol = unwrap(other);
        for (const [flag, prefix] of [[ts.SymbolFlags.Type, ""], [ts.SymbolFlags.Value, "typeof "]]) {
          if (!(oldSymbol.flags & flag)) continue;
          if (!(newSymbol.flags & flag)) { breaking.push(`Changed export kind ${label}`); continue; }
          assert.ok(prefix || !oldSymbol.declarations?.some((declaration) => declaration.typeParameters?.some((parameter) => !parameter.default)), `Required generic public type needs an explicit compatibility fixture: ${label}`);
          const oldType = `${prefix}Old${i}.${symbol.name}`;
          const newType = `${prefix}New${i}.${symbol.name}`;
          // 参数类型允许旧值进入新 API；函数值则要求新实现能替代旧实现。
          const [from, to] = prefix ? [newType, oldType] : [oldType, newType];
          check(`${from} extends ${to} ? true : false`, "breaking", label);
          check(`${to} extends ${from} ? true : false`, "additions", label);
          check(`IsAny<${oldType}> extends true ? true : IsAny<${newType}> extends true ? false : true`, "breaking", label);
          for (const [fromKeys, toKeys] of [[oldType, newType], ...(prefix && checker.getTypeOfSymbolAtLocation(oldSymbol, oldFile).getCallSignatures().length ? [[`Parameters<${oldType}>[0]`, `Parameters<${newType}>[0]`]] : [])]) {
            // keyof 联合类型只返回共有属性；分支独有的可选属性也必须保留。
            check(`Exclude<Keys<${fromKeys}>, Keys<${toKeys}>> extends never ? true : false`, "breaking", label);
            check(`Exclude<Keys<${toKeys}>, Keys<${fromKeys}>> extends never ? true : false`, "additions", label);
          }
        }
      }
      for (const symbol of newExports.keys()) if (!oldExports.some((old) => old.name === symbol)) additions.push(`Added symbol ${name}: ${symbol}`);
    }
    const checkFile = path.join(temporary, "check.mts");
    await fs.writeFile(checkFile, `${lines.join("\n")}\n`);
    for (const diagnostic of ts.getPreEmitDiagnostics(ts.createProgram([checkFile], options))) {
      const item = diagnostic.file?.fileName === checkFile && checks.get(diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line);
      assert.ok(item, ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
      (item.kind === "breaking" ? breaking : additions).push(`Type compatibility ${item.label}`);
    }
    return { breaking: [...new Set(breaking)], additions: [...new Set(additions)], runtimeChanged: !isDeepStrictEqual(previous.runtime, current.runtime) || !isDeepStrictEqual(previous.package.dependencies ?? {}, current.package.dependencies ?? {}) };
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

export function assertUpgrade(previous, current, note, diff, mcpVersion) {
  assert.equal(note.from, previous.package.version, "Upgrade note must reference the latest delivered baseline");
  assert.equal(note.to, current.package.version);
  assert.equal(note.mcpTo, mcpVersion);
  for (const field of ["summary", "migration", "rollback", "visualAndBehavior"]) assert.ok(typeof note[field] === "string" && note[field].trim(), `Upgrade note requires ${field}`);
  assert.ok(["patch", "minor", "major"].includes(note.changeType), "Upgrade note requires changeType");
  assert.ok(compareVersions(current.package.version, previous.package.version) > 0, "Component version must increase");
  const old = versionParts(previous.package.version);
  const next = versionParts(current.package.version);
  const required = diff.breaking.length || note.changeType === "major" ? "major" : diff.additions.length || note.changeType === "minor" ? "minor" : "patch";
  assert.ok(required !== "major" || next[0] > old[0], `Breaking API/Token changes require a major version: ${diff.breaking.join(", ")}`);
  assert.ok(required !== "minor" || next[0] > old[0] || next[1] > old[1], `Additive API/Token changes require a minor version: ${diff.additions.join(", ")}`);
  assert.ok(["patch", "minor", "major"].indexOf(note.changeType) >= ["patch", "minor", "major"].indexOf(required), `Upgrade note understates ${required} changes`);
}

export async function verifyUpgrade(root, dist) {
  const reportFile = path.join(dist, "candidate-upgrade.json");
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  await fs.writeFile(reportFile, '{"status":"running"}\n');
  try {
    const policy = JSON.parse(await fs.readFile(path.join(root, "packages/design-system/distribution.json"), "utf8"));
    const releases = await loadReleases(root);
    assertUnreleased(policy, releases);
    const baseline = releases.at(-1);
    assert.ok(compareVersions(policy.mcpVersion, baseline.mcp.version) > 0, "MCP version must increase with its component peer");
    const current = await capturePackage(path.join(dist, "design-system-candidate"));
    assert.equal(current.package.version, policy.version, "Pack the current candidate before checking upgrades");
    const note = JSON.parse(await fs.readFile(path.join(root, `packages/design-system/distribution/upgrades/${policy.version}.json`), "utf8"));
    assert.equal(note.mcpFrom, baseline.mcp.version);
    const diff = await compareApi(baseline.component, current, root);
    assertUpgrade(baseline.component, current, note, diff, policy.mcpVersion);
    const report = { status: "pass", from: note.from, to: note.to, mcpFrom: note.mcpFrom, mcpTo: note.mcpTo, contentDigest: current.identity.contentDigest, ...diff };
    await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } catch (error) {
    await fs.writeFile(reportFile, `${JSON.stringify({ status: "fail", failure: error.message }, null, 2)}\n`);
    throw error;
  }
}
