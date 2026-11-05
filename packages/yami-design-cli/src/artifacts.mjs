import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import * as tar from "tar";

export const DESIGN = "@yami/design-system";
export const MCP = "@yami/design-system-mcp";
export const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
export const sha = (bytes, algorithm = "sha256") => createHash(algorithm).update(bytes).digest("hex");

function relativeFile(file) {
  assert.ok(typeof file === "string" && file && !file.includes("\\") && !file.includes("\0") && !path.posix.isAbsolute(file) && path.posix.normalize(file) === file && !file.split("/").includes(".."), `Invalid candidate path: ${file}`);
}

async function containedFile(directory, relative) {
  relativeFile(relative);
  const target = path.join(directory, relative);
  assert.ok((await fs.lstat(target)).isFile(), `Candidate file must be regular: ${relative}`);
  assert.ok((await fs.realpath(target)).startsWith(`${await fs.realpath(directory)}${path.sep}`), `Candidate path escapes package: ${relative}`);
  return fs.readFile(target);
}

export async function verifyCandidate(directory, name, expected) {
  const manifest = JSON.parse(await containedFile(directory, "candidate-manifest.json"));
  assert.equal(manifest.schemaVersion, 1, "Unsupported candidate schema");
  assert.equal(manifest.package, name, `Expected ${name}`);
  assert.match(manifest.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(typeof manifest.sourceDirty, "boolean");
  if (expected) assert.deepEqual(manifest, expected, "Installed candidate differs from the supplied artifact");
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0, "Empty candidate inventory");
  const files = new Map();
  const digest = createHash("sha256");
  for (const entry of [...manifest.files].sort((a, b) => a.path.localeCompare(b.path))) {
    assert.ok(!files.has(entry.path) && entry.path !== "candidate-manifest.json", "Duplicate candidate file");
    const bytes = await containedFile(directory, entry.path);
    assert.equal(bytes.length, entry.bytes, `Candidate size differs: ${entry.path}`);
    assert.equal(sha(bytes), entry.sha256, `Candidate digest differs: ${entry.path}`);
    digest.update(entry.path).update("\0").update(bytes).update("\0");
    files.set(entry.path, bytes);
  }
  assert.equal(digest.digest("hex"), manifest.contentDigest, "Candidate content digest differs");
  const pkg = JSON.parse(files.get("package.json"));
  assert.equal(pkg.name, name);
  assert.equal(pkg.version, manifest.packageVersion);
  assert.equal(pkg.private, true, "Only private local candidates are supported");
  return { directory, manifest, pkg, files };
}

export function verifyPair(design, mcp) {
  assert.equal(mcp.pkg.peerDependencies?.[DESIGN], design.pkg.version, "MCP and design package versions must be exactly paired");
  assert.equal(mcp.manifest.designSystemVersion, design.pkg.version);
  for (const key of ["sourceCommit", "sourceDirty"]) assert.equal(mcp.manifest[key], design.manifest[key], `Candidate provenance differs: ${key}`);
  const indexPath = design.pkg.exports["./knowledge/index.json"];
  assert.equal(typeof indexPath, "string", "Missing knowledge export");
  const index = JSON.parse(design.files.get(indexPath.replace(/^\.\//, "")));
  assert.equal(index.schemaVersion, 1, "Unsupported knowledge schema");
  for (const key of ["package", "packageVersion", "sourceCommit", "sourceDirty"]) assert.equal(index[key], design.manifest[key], `Knowledge identity differs: ${key}`);
  assert.deepEqual(index.components.map(({ name, version, status }) => ({ name, version, status })), design.manifest.entries);
  assert.ok(index.components.length > 0, "Empty public component inventory");
  const prefix = path.posix.dirname(indexPath.replace(/^\.\//, ""));
  const documents = new Map();
  assert.ok(Array.isArray(index.documents), "Missing knowledge document inventory");
  for (const { path: file } of index.documents) {
    relativeFile(file);
    assert.ok(!documents.has(file), "Duplicate knowledge document");
    const bytes = design.files.get(path.posix.join(prefix, file));
    assert.ok(bytes, `Knowledge document is missing: ${file}`);
    documents.set(file, bytes);
  }
  const document = (file) => {
    assert.ok(documents.has(file), `Knowledge reference is missing: ${file}`);
    return documents.get(file);
  };
  for (const [language, specifier] of [["en", "./skill"], ["zh-CN", "./skill/zh"]]) {
    document(index.skills?.[language]);
    assert.equal(design.pkg.exports[specifier], `./${path.posix.join(prefix, index.skills[language])}`, "Skill export differs from the knowledge index");
  }
  document(index.references?.overview);
  for (const file of Object.values(index.references)) document(file);
  for (const component of index.components) {
    assert.equal(component.import, `${DESIGN}/components/${component.name}`);
    assert.ok(design.pkg.exports[`./components/${component.name}`], "Knowledge references an unavailable public import");
    const contract = JSON.parse(document(component.contract));
    for (const key of ["name", "version", "status"]) assert.equal(contract[key], component[key], `Knowledge contract differs: ${key}`);
    assert.deepEqual(contract.exports, component.exports);
    document(component.usage);
    assert.ok(component.examples?.length > 0, "Component example is missing");
    for (const example of component.examples) document(example.path);
  }
  return index;
}

export async function openArtifacts(designFile, mcpFile) {
  const temporary = await fs.mkdtemp(path.join(tmpdir(), "yami-design-artifacts-"));
  const cleanup = () => fs.rm(temporary, { recursive: true, force: true });
  try {
    const candidates = [];
    for (const [name, input] of [[DESIGN, designFile], [MCP, mcpFile]]) {
      const file = await fs.realpath(input);
      assert.ok((await fs.stat(file)).isFile(), "Artifact must be a local file");
      const bytes = await fs.readFile(file);
      const staging = path.join(temporary, String(candidates.length));
      await fs.mkdir(staging);
      const archive = path.join(staging, "artifact.tgz");
      await fs.writeFile(archive, bytes);
      const paths = new Set();
      const files = [];
      let invalid;
      await tar.list({ file: archive, strict: true, onReadEntry(entry) {
        try {
          const relative = entry.path.replace(/\/$/, "");
          relativeFile(relative);
          assert.ok(relative === "package" || relative.startsWith("package/"), "Artifact must have a package root");
          assert.ok(["File", "Directory"].includes(entry.type), "Artifact links and special files are unsupported");
          assert.ok(!paths.has(relative), "Duplicate archive path");
          paths.add(relative);
          if (entry.type === "File") files.push(relative.slice("package/".length));
        } catch (error) { invalid ??= error; }
      } });
      if (invalid) throw invalid;
      await tar.extract({ file: archive, cwd: staging, strict: true });
      const candidate = await verifyCandidate(path.join(staging, "package"), name);
      assert.deepEqual(files.sort(), [...candidate.files.keys(), "candidate-manifest.json"].sort(), "Archive contains unlisted candidate files");
      candidates.push({ ...candidate, artifact: { file, integrity: `sha512-${createHash("sha512").update(bytes).digest("base64")}` } });
    }
    const [design, mcp] = candidates;
    const index = verifyPair(design, mcp);
    return { design, mcp, index, cleanup };
  } catch (error) { await cleanup(); throw error; }
}
