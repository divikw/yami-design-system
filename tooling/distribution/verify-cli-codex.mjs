import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { promisify } from "node:util";

const execute = promisify(execFile);

export async function verifyNativeCodex(consumers) {
  const globalConfig = path.join(homedir(), ".codex/config.toml");
  const readGlobal = () => fs.readFile(globalConfig).catch((error) => { if (error.code === "ENOENT") return null; throw error; });
  const before = await readGlobal();
  const { stdout: version } = await execute("codex", ["--version"], { timeout: 10_000 });
  // Fixture trust is scoped to these test subprocesses, never persisted globally.
  const trust = `projects={${consumers.map(({ directory }) => `${JSON.stringify(directory)}={trust_level="trusted"}`).join(",")}}`;
  for (const { directory } of consumers) {
    const resolve = createRequire(path.join(directory, "package.json")).resolve;
    const { stdout } = await execute("codex", ["-c", trust, "mcp", "get", "yami_design_system", "--json"], { cwd: directory, timeout: 10_000 });
    const config = JSON.parse(stdout);
    assert.equal(config.enabled, true);
    assert.equal(config.transport.command, process.execPath);
    assert.deepEqual(config.transport.args, [resolve("@yami/design-system-mcp/cli")]);
    assert.equal(config.transport.cwd, directory);
  }
  const server = spawn("codex", ["-c", trust, "app-server", "--listen", "stdio://"], { stdio: ["pipe", "pipe", "pipe"] });
  server.stderr.resume();
  const reader = createInterface({ input: server.stdout });
  const pending = new Map();
  let nextId = 0;
  const failPending = (error) => {
    for (const { reject, timer } of pending.values()) { clearTimeout(timer); reject(error); }
    pending.clear();
  };
  server.on("error", failPending);
  server.on("close", () => failPending(new Error("Codex app-server closed before the request completed")));
  reader.on("line", (line) => {
    let result;
    try { result = JSON.parse(line); } catch (error) { failPending(error); return; }
    const entry = pending.get(result.id);
    if (!entry) return;
    pending.delete(result.id);
    clearTimeout(entry.timer);
    if (result.error) entry.reject(new Error(result.error.message)); else entry.resolve(result.result);
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Codex ${method} timed out`)); }, 20_000);
    pending.set(id, { resolve, reject, timer });
    server.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
  });
  try {
    await request("initialize", { clientInfo: { name: "yami-design-cli-verifier", version: "1.0.0" }, capabilities: { experimentalApi: true } });
    server.stdin.write('{"method":"initialized"}\n');
    const catalog = await request("skills/list", { cwds: consumers.map(({ directory }) => directory), forceReload: true });
    for (const { directory } of consumers) {
      const project = catalog.data.find(({ cwd }) => path.resolve(cwd) === directory);
      const skill = project?.skills.find(({ name }) => name === "yami-consumer");
      assert.ok(skill?.enabled, `Native Codex did not discover the generated Skill: ${directory}`);
      assert.equal(await fs.realpath(skill.path), await fs.realpath(path.join(directory, ".agents/skills/yami-consumer/SKILL.md")));
    }
  } finally {
    reader.close(); server.stdin.end(); server.kill("SIGTERM");
    failPending(new Error("Codex verification ended"));
  }
  assert.deepEqual(await readGlobal(), before, "Native verification changed global Codex configuration");
  return { status: "pass", version: version.trim(), configurations: consumers.length, skills: consumers.length, modelCalls: 0, fixtureTrust: "subprocess_only", globalConfig: "unchanged" };
}
