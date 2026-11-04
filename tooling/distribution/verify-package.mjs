import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { contentDigest } from "../registry/contracts.mjs";

export async function verifyInstalledCandidate(directory, expected) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, "candidate-manifest.json"), "utf8"));
  assert.deepEqual(manifest, expected, "Installed candidate identity differs from the packed candidate");
  const payload = [];
  for (const file of manifest.files) {
    const content = await fs.readFile(path.join(directory, file.path));
    assert.equal(content.length, file.bytes, `Installed file size differs: ${file.path}`);
    assert.equal(createHash("sha256").update(content).digest("hex"), file.sha256, `Installed file digest differs: ${file.path}`);
    payload.push({ path: file.path, content });
  }
  assert.equal(contentDigest(payload), manifest.contentDigest, "Installed candidate content digest differs");
  return manifest;
}
