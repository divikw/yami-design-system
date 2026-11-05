import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import ts from "typescript";
import { contentDigest } from "../registry/contracts.mjs";
import { verifyInstalledCandidate } from "./verify-package.mjs";
import { loadSnapshot } from "../mcp/snapshot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const stableEntries = ["Button", "Input", "Card", "ProductCard", "ProductList", "HeroBanner", "ShortcutRail", "Billboard"];

test("packed candidate is complete, scoped, traceable and reproducible", async (t) => {
  const directory = await fs.mkdtemp(path.join(tmpdir(), "yami-candidate-contract-"));
  const dist = path.join(directory, "dist");
  const env = { ...process.env, YAMI_DISTRIBUTION_OUTPUT_DIR: dist };
  const build = () => execFileSync(process.execPath, ["tooling/distribution/pack.mjs"], { cwd: root, env });
  try {
    build();
    const receipt = JSON.parse(await fs.readFile(path.join(dist, "candidate-pack.json"), "utf8"))[0];
    execFileSync("tar", ["-xzf", path.join(dist, receipt.filename), "-C", directory]);
    const unpacked = path.join(directory, "package");
    const pkg = JSON.parse(await fs.readFile(path.join(unpacked, "package.json"), "utf8"));
    const manifest = JSON.parse(await fs.readFile(path.join(unpacked, "candidate-manifest.json"), "utf8"));
    const upgrade = JSON.parse(await fs.readFile(path.join(dist, "candidate-upgrade.json"), "utf8"));
    assert.equal(upgrade.status, "pass");
    assert.equal(upgrade.contentDigest, manifest.contentDigest);
    assert.equal(pkg.private, true);
    assert.deepEqual(Object.keys(pkg.peerDependencies), ["react", "react-dom"]);
    assert.equal(pkg.dependencies.react, undefined);
    assert.equal(pkg.dependencies["@modelcontextprotocol/server"], undefined);
    assert.equal(pkg.dependencies.zod, undefined);
    assert.equal(pkg.version, manifest.packageVersion);
    assert.match(manifest.sourceCommit, /^[a-f0-9]{40}$/);
    assert.equal(typeof manifest.sourceDirty, "boolean");
    assert.deepEqual(manifest.entries.map(({ name, status }) => [name, status]), [
      ...stableEntries.map((name) => [name, "stable"]), ["Header", "beta"],
    ]);

    const payload = [];
    for (const entry of manifest.files) {
      const content = await fs.readFile(path.join(unpacked, entry.path));
      assert.equal(content.length, entry.bytes, entry.path);
      assert.equal(createHash("sha256").update(content).digest("hex"), entry.sha256, entry.path);
      assert.ok(!/\.(stories|figma)\.|fixtures/.test(entry.path), entry.path);
      assert.doesNotMatch(entry.path, /inventory-?workbench/i);
      assert.ok(!entry.path.endsWith(".tsx") || manifest.entries.some(({ name }) => entry.path === `knowledge/yami-design-system/references/components/${name}/examples.tsx`), entry.path);
      assert.doesNotMatch(entry.path, /assets\/(logos|hero-banner)\/|\.(webp|png|jpe?g|gif)$/i);
      assert.ok(!entry.path.endsWith(".ts") || entry.path.endsWith(".d.ts"), entry.path);
      payload.push({ path: entry.path, content });
      if (entry.path.endsWith(".css")) {
        for (const match of content.toString().matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) {
          if (!/^(?:data:|https?:|#)/.test(match[1])) await fs.access(path.resolve(unpacked, path.dirname(entry.path), match[1]));
        }
      }
      if (entry.path.endsWith(".js") || entry.path.endsWith(".d.ts")) {
        for (const match of content.toString().matchAll(/from\s+["'](\.[^"']+)["']|import\s+["'](\.[^"']+)["']/g)) {
          const specifier = match[1] ?? match[2];
          assert.match(specifier, /\.(js|css)$/, `${entry.path}: ${specifier}`);
          await fs.access(path.resolve(unpacked, path.dirname(entry.path), specifier));
        }
      }
    }
    assert.equal(contentDigest(payload), manifest.contentDigest);
    assert.deepEqual(receipt.files.map((entry) => entry.path).sort(), [...manifest.files.map((entry) => entry.path), "candidate-manifest.json"].sort());
    for (const target of Object.values(pkg.exports)) {
      for (const file of typeof target === "string" ? [target] : Object.values(target)) await fs.access(path.join(unpacked, file));
      if (typeof target === "object") {
        assert.match(await fs.readFile(path.join(unpacked, target.import), "utf8"), /^"use client";/);
      }
    }
    assert.equal(pkg.exports["./components/Footer"], undefined);
    assert.ok(pkg.exports["./components/Header"]);
    assert.doesNotMatch(await fs.readFile(path.join(unpacked, pkg.exports["."].import), "utf8"), /Header/);
    const mcpReceipt = JSON.parse(await fs.readFile(path.join(dist, "candidate-mcp-pack.json"), "utf8"))[0];
    const mcpDirectory = path.join(directory, "mcp");
    await fs.mkdir(mcpDirectory);
    execFileSync("tar", ["-xzf", path.join(dist, mcpReceipt.filename), "-C", mcpDirectory]);
    const mcpRoot = path.join(mcpDirectory, "package");
    const mcpManifest = JSON.parse(await fs.readFile(path.join(mcpRoot, "candidate-manifest.json"), "utf8"));
    const mcpPackage = JSON.parse(await fs.readFile(path.join(mcpRoot, "package.json"), "utf8"));
    assert.equal(mcpPackage.private, true);
    assert.equal(mcpPackage.peerDependencies["@yami/design-system"], pkg.version);
    assert.deepEqual(Object.keys(mcpPackage.dependencies), ["@modelcontextprotocol/server", "zod"]);
    assert.equal(mcpManifest.sourceCommit, manifest.sourceCommit);
    assert.equal(mcpManifest.sourceDirty, manifest.sourceDirty);
    assert.equal(mcpManifest.designSystemVersion, manifest.packageVersion);
    assert.equal(mcpPackage.bin["yami-design-system-mcp"], "./cli.mjs");
    assert.match(await fs.readFile(path.join(mcpRoot, "cli.mjs"), "utf8"), /^#!\/usr\/bin\/env node\n/);
    assert.ok((await fs.stat(path.join(mcpRoot, "cli.mjs"))).mode & 0o111);
    await verifyInstalledCandidate(mcpRoot, mcpManifest);
    assert.deepEqual(mcpReceipt.files.map((entry) => entry.path).sort(), [...mcpManifest.files.map((entry) => entry.path), "candidate-manifest.json"].sort());
    await t.test("MCP loads only the matching verified knowledge snapshot", async () => {
      const options = { manifestFile: path.join(unpacked, "candidate-manifest.json"), indexFile: path.join(unpacked, "knowledge/yami-design-system/index.json"), expectedVersion: pkg.version };
      const snapshot = await loadSnapshot(options);
      assert.equal(snapshot.identity.contentDigest, manifest.contentDigest);
      assert.equal(snapshot.files.size, snapshot.index.documents.length + 1);
      await assert.rejects(loadSnapshot({ ...options, expectedVersion: "0.0.0" }), /peer version/);
      await fs.writeFile(options.manifestFile, JSON.stringify({ ...manifest, schemaVersion: 2 }));
      await assert.rejects(loadSnapshot(options), /Unsupported candidate schema/);
      await fs.writeFile(options.manifestFile, JSON.stringify(manifest));
      const original = await fs.readFile(options.indexFile, "utf8");
      async function rejectIndex(change, message) {
        const changed = JSON.parse(original);
        change(changed);
        const content = JSON.stringify(changed);
        const updated = structuredClone(manifest);
        Object.assign(updated.files.find((entry) => entry.path === "knowledge/yami-design-system/index.json"), { bytes: Buffer.byteLength(content), sha256: createHash("sha256").update(content).digest("hex") });
        try {
          await fs.writeFile(options.indexFile, content);
          await fs.writeFile(options.manifestFile, JSON.stringify(updated));
          await assert.rejects(loadSnapshot(options), message);
        } finally {
          await fs.writeFile(options.indexFile, original);
          await fs.writeFile(options.manifestFile, JSON.stringify(manifest));
        }
      }
      await rejectIndex((index) => { index.schemaVersion = 2; }, /Unsupported knowledge schema/);
      await rejectIndex((index) => { index.packageVersion = "0.0.0"; }, /Knowledge identity differs/);
      await rejectIndex((index) => { index.components.pop(); }, /Knowledge scope differs/);
      await rejectIndex((index) => { index.documents[0].path = "../../outside.txt"; }, /Invalid knowledge path/);
      const skill = path.join(unpacked, "knowledge/yami-design-system/SKILL.md");
      const instructions = await fs.readFile(skill);
      const outside = path.join(directory, "outside.txt");
      await fs.writeFile(outside, "must never be exposed by MCP");
      try {
        await fs.rm(skill);
        await fs.symlink(outside, skill);
        await assert.rejects(loadSnapshot(options), /escapes package root/);
      } finally {
        await fs.rm(skill);
        await fs.writeFile(skill, instructions);
      }
    });
    await t.test("knowledge is self-contained and bound to the installed component contract", async () => {
      const knowledge = path.join(unpacked, "knowledge/yami-design-system");
      const index = JSON.parse(await fs.readFile(path.join(knowledge, "index.json"), "utf8"));
      assert.equal(index.schemaVersion, 1);
      for (const key of ["package", "packageVersion", "sourceCommit", "sourceDirty"]) assert.equal(index[key], manifest[key], key);
      assert.deepEqual(index.components.map(({ name, version, status }) => ({ name, version, status })), manifest.entries);
      assert.deepEqual(Object.keys(index.skills), ["en", "zh-CN"]);
      assert.doesNotMatch(JSON.stringify(index), /inventory-?workbench/i);
      for (const file of Object.values(index.skills)) {
        assert.doesNotMatch(await fs.readFile(path.join(knowledge, file), "utf8"), /inventory[- ]?workbench|库存与采购工作台/i);
      }
      for (const file of [...Object.values(index.skills), ...Object.values(index.references)]) await fs.access(path.join(knowledge, file));
      for (const extension of ["css", "json"]) {
        assert.deepEqual(await fs.readFile(path.join(knowledge, `references/generated/tokens.${extension}`)), await fs.readFile(path.join(unpacked, `generated/tokens.${extension}`)));
      }
      const schema = JSON.parse(await fs.readFile(path.join(knowledge, index.references.componentSchema), "utf8"));
      const validate = new Ajv2020({ strict: false }).compile(schema);
      for (const component of index.components) {
        assert.ok(pkg.exports[component.import.replace(pkg.name, ".")]);
        const meta = JSON.parse(await fs.readFile(path.join(knowledge, component.contract), "utf8"));
        const upstream = JSON.parse(await fs.readFile(path.join(root, `packages/design-system/components/${component.name}/meta.json`), "utf8"));
        assert.ok(validate(meta), JSON.stringify(validate.errors));
        assert.deepEqual(meta, { ...upstream, exports: component.exports, examples: component.examples.map((example) => `./examples.tsx#${example.export}`) });
        await fs.access(path.join(path.dirname(path.join(knowledge, component.contract)), meta.$schema));
        assert.equal(path.resolve(knowledge, component.usage), path.resolve(knowledge, path.dirname(component.contract), meta.usageRef));
        for (const example of component.examples) {
          const content = await fs.readFile(path.join(knowledge, example.path), "utf8");
          assert.ok(content.includes(`export function ${example.export}(`));
          for (const { fileName } of ts.preProcessFile(content, true, true).importedFiles) {
            assert.ok(fileName === "react" || index.components.some((entry) => entry.import === fileName), fileName);
          }
          assert.ok(!/https?:\/\//.test(content), "Examples must not require external media");
        }
      }
      for (const document of index.documents) {
        assert.ok(!path.isAbsolute(document.path) && !document.path.split("/").includes(".."), document.path);
        const original = await fs.readFile(path.join(root, document.source));
        assert.equal(createHash("sha256").update(original).digest("hex"), document.sourceSha256);
        const file = path.join(knowledge, document.path);
        const content = await fs.readFile(file, "utf8");
        if (!document.transform) assert.deepEqual(Buffer.from(content), original);
        if (!file.endsWith(".md")) continue;
        for (const [, label, target] of content.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)) {
          if (label.includes("upstream reference")) assert.ok(target.includes(`/${manifest.sourceCommit}/`));
          if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(target)) continue;
          const resolved = path.resolve(path.dirname(file), target.split("#")[0]);
          assert.ok(resolved.startsWith(`${knowledge}${path.sep}`), `${file}: ${target}`);
          await fs.access(resolved);
        }
      }
      const skillSource = await fs.readFile(path.join(root, index.sourceSkill.path));
      assert.equal(createHash("sha256").update(skillSource).digest("hex"), index.sourceSkill.sha256);
      assert.ok(skillSource.toString().includes(`version: ${index.sourceSkill.version}`));
    });
    build();
    const rebuilt = JSON.parse(await fs.readFile(path.join(dist, "design-system-candidate/candidate-manifest.json"), "utf8"));
    assert.equal(rebuilt.contentDigest, manifest.contentDigest);
    assert.deepEqual(rebuilt.files, manifest.files);
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(dist, "design-system-mcp-candidate/candidate-manifest.json"), "utf8")), mcpManifest);
    await t.test("installed candidate must match the expected build", async () => {
      await verifyInstalledCandidate(unpacked, manifest);
      await assert.rejects(verifyInstalledCandidate(unpacked, { ...manifest, sourceCommit: "0".repeat(40) }), /identity differs/);
    });
    await t.test("modified installed files cannot pass with the original manifest", async () => {
      const file = path.join(unpacked, "components/Button/Button.js");
      const original = await fs.readFile(file, "utf8");
      await fs.writeFile(file, original.replace("Button", "Bvtton"));
      await assert.rejects(verifyInstalledCandidate(unpacked, manifest), /Installed file digest differs/);
      await fs.writeFile(file, original);
      const skill = path.join(unpacked, "knowledge/yami-design-system/SKILL.md");
      const instructions = await fs.readFile(skill, "utf8");
      await fs.writeFile(skill, instructions.replace("YAMI", "YAMX"));
      await assert.rejects(verifyInstalledCandidate(unpacked, manifest), /Installed file digest differs/);
    });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("a packing failure replaces any previous passing verification receipt", async () => {
  const directory = await fs.mkdtemp(path.join(tmpdir(), "yami-candidate-failure-"));
  const dist = path.join(directory, "dist");
  const reportFile = path.join(dist, "candidate-verification/result.json");
  let consumers;
  try {
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify({ status: "pass" }));
    const npm = path.join(directory, "npm");
    await fs.writeFile(npm, "#!/bin/sh\nexit 42\n", { mode: 0o700 });
    const result = spawnSync(process.execPath, ["tooling/distribution/verify.mjs"], {
      cwd: root, encoding: "utf8",
      env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}`, YAMI_DISTRIBUTION_OUTPUT_DIR: dist },
      timeout: 30_000,
    });
    assert.equal(result.status, 1, result.stderr);
    const report = JSON.parse(await fs.readFile(reportFile, "utf8"));
    consumers = report.consumers;
    assert.equal(report.status, "fail");
    assert.match(report.failure, /pack failed/);
  } finally {
    if (consumers) await fs.rm(consumers, { recursive: true, force: true });
    await fs.rm(directory, { recursive: true, force: true });
  }
});
