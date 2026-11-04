import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { contentDigest } from "../registry/contracts.mjs";
import { verifyInstalledCandidate } from "./verify-package.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("packed candidate is complete, scoped, traceable and reproducible", async (t) => {
  const build = () => execFileSync(process.execPath, ["tooling/distribution/pack.mjs"], { cwd: root });
  build();
  const receipt = JSON.parse(await fs.readFile(path.join(root, "dist/candidate-pack.json"), "utf8"))[0];
  const directory = await fs.mkdtemp(path.join(tmpdir(), "yami-candidate-contract-"));
  try {
    execFileSync("tar", ["-xzf", path.join(root, "dist", receipt.filename), "-C", directory]);
    const unpacked = path.join(directory, "package");
    const pkg = JSON.parse(await fs.readFile(path.join(unpacked, "package.json"), "utf8"));
    const manifest = JSON.parse(await fs.readFile(path.join(unpacked, "candidate-manifest.json"), "utf8"));
    assert.equal(pkg.private, true);
    assert.deepEqual(Object.keys(pkg.peerDependencies), ["react", "react-dom"]);
    assert.equal(pkg.dependencies.react, undefined);
    assert.equal(pkg.version, manifest.packageVersion);
    assert.match(manifest.sourceCommit, /^[a-f0-9]{40}$/);
    assert.equal(typeof manifest.sourceDirty, "boolean");
    assert.deepEqual(manifest.entries.map((entry) => entry.name), ["Button", "Input", "Card", "ProductCard", "ProductList"]);
    assert.ok(manifest.entries.every((entry) => entry.status === "stable"));

    const payload = [];
    for (const entry of manifest.files) {
      const content = await fs.readFile(path.join(unpacked, entry.path));
      assert.equal(content.length, entry.bytes, entry.path);
      assert.equal(createHash("sha256").update(content).digest("hex"), entry.sha256, entry.path);
      assert.ok(!/\.(stories|figma)\.|fixtures|examples\.tsx|\.tsx$/.test(entry.path), entry.path);
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
    for (const [specifier, target] of Object.entries(pkg.exports)) {
      for (const file of typeof target === "string" ? [target] : Object.values(target)) await fs.access(path.join(unpacked, file));
      if (specifier === "." || specifier.startsWith("./components/")) {
        assert.match(await fs.readFile(path.join(unpacked, target.import), "utf8"), /^"use client";/);
      }
    }
    assert.equal(pkg.exports["./components/Header"], undefined);
    build();
    const rebuilt = JSON.parse(await fs.readFile(path.join(root, "dist/design-system-candidate/candidate-manifest.json"), "utf8"));
    assert.equal(rebuilt.contentDigest, manifest.contentDigest);
    assert.deepEqual(rebuilt.files, manifest.files);
    await t.test("installed candidate must match the expected build", async () => {
      await verifyInstalledCandidate(unpacked, manifest);
      await assert.rejects(verifyInstalledCandidate(unpacked, { ...manifest, sourceCommit: "0".repeat(40) }), /identity differs/);
    });
    await t.test("modified installed files cannot pass with the original manifest", async () => {
      const file = path.join(unpacked, "components/Button/Button.js");
      const original = await fs.readFile(file, "utf8");
      await fs.writeFile(file, original.replace("Button", "Bvtton"));
      await assert.rejects(verifyInstalledCandidate(unpacked, manifest), /Installed file digest differs/);
    });
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("a packing failure replaces any previous passing verification receipt", async () => {
  const directory = await fs.mkdtemp(path.join(tmpdir(), "yami-candidate-failure-"));
  const reportFile = path.join(root, "dist/candidate-verification/result.json");
  const previous = await fs.readFile(reportFile).catch(() => null);
  let consumers;
  try {
    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify({ status: "pass" }));
    const npm = path.join(directory, "npm");
    await fs.writeFile(npm, "#!/bin/sh\nexit 42\n", { mode: 0o700 });
    const result = spawnSync(process.execPath, ["tooling/distribution/verify.mjs"], {
      cwd: root, encoding: "utf8", env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}` }, timeout: 30_000,
    });
    assert.equal(result.status, 1, result.stderr);
    const report = JSON.parse(await fs.readFile(reportFile, "utf8"));
    consumers = report.consumers;
    assert.equal(report.status, "fail");
    assert.match(report.failure, /pack failed/);
  } finally {
    if (previous) await fs.writeFile(reportFile, previous);
    else await fs.rm(reportFile, { force: true });
    if (consumers) await fs.rm(consumers, { recursive: true, force: true });
    await fs.rm(directory, { recursive: true, force: true });
  }
});
