import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import { createServer } from "node:net";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { verifyInstalledCandidate } from "./verify-package.mjs";
import { verifyMcp } from "./verify-mcp.mjs";
import { verifyCliSetup } from "./verify-cli.mjs";
import { verifyNativeCodex } from "./verify-cli-codex.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtures = path.join(root, "tests/distribution/fixtures");
const withCli = process.argv.includes("--cli");
const reportDir = path.join(root, withCli ? "dist/cli-verification" : "dist/candidate-verification");
await fs.mkdir(reportDir, { recursive: true });
const consumers = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), "yami-candidate-consumers-")));
const policy = JSON.parse(await fs.readFile(path.join(root, "packages/design-system/distribution.json"), "utf8"));
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
delete env.NODE_PATH;

async function run(command, args, cwd, label, envOverrides = {}) {
  console.log(label);
  const log = path.join(reportDir, `${label}.log`);
  const stream = createWriteStream(log);
  const child = spawn(command, args, { cwd, env: { ...env, ...envOverrides }, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(stream);
  child.stderr.pipe(stream);
  const status = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
  await new Promise((resolve) => stream.end(resolve));
  if (status !== 0) throw new Error(`${label} failed (${status}):\n${(await fs.readFile(log, "utf8")).slice(-6000)}`);
  return log;
}

const results = [];
const reportFile = path.join(reportDir, "result.json");
await fs.writeFile(reportFile, `${JSON.stringify({ status: "running", consumers }, null, 2)}\n`);
let tarball;
let browser;
let failure;

// FontFaceSet.check() can return true with no matching @font-face at all.
// This function runs in the browser and requires actual loaded brand faces.
async function loadBrandFonts() {
  for (const weight of [400, 500, 700]) {
    const faces = await document.fonts.load(`${weight} 18px "GT Walsheim"`);
    if (faces.length === 0 || !faces.every((face) => face.status === "loaded" && face.family.includes("GT Walsheim"))) {
      throw new Error(`Brand font is missing or not loaded: GT Walsheim ${weight}`);
    }
  }
}

try {
  await run(process.execPath, ["tooling/distribution/pack.mjs"], root, "pack");
  const packed = JSON.parse(await fs.readFile(path.join(root, "dist/candidate-pack.json"), "utf8"))[0];
  tarball = path.join(root, "dist", packed.filename);
  const expected = JSON.parse(await fs.readFile(path.join(root, "dist/design-system-candidate/candidate-manifest.json"), "utf8"));
  const mcpPacked = JSON.parse(await fs.readFile(path.join(root, "dist/candidate-mcp-pack.json"), "utf8"))[0];
  const mcpTarball = path.join(root, "dist", mcpPacked.filename);
  const mcpExpected = JSON.parse(await fs.readFile(path.join(root, "dist/design-system-mcp-candidate/candidate-manifest.json"), "utf8"));
  let cliReceipt;
  if (withCli) {
    await run(process.execPath, ["tooling/distribution/pack-cli.mjs"], root, "pack-cli");
    cliReceipt = JSON.parse(await fs.readFile(path.join(root, "dist/yami-design-cli-pack.json"), "utf8"))[0];
  }
  for (const host of ["next", "vite"]) {
    const directory = path.join(consumers, host);
    const src = path.join(directory, host === "next" ? "app" : "src");
    await fs.mkdir(src, { recursive: true });
    await fs.mkdir(path.join(directory, "public"));
    for (const file of ["Demo.tsx", "contract-types.tsx", "host.css"]) await fs.copyFile(path.join(fixtures, "shared", file), path.join(src, file));
    await fs.copyFile(path.join(fixtures, "shared/product.svg"), path.join(directory, "public/product.svg"));
    for (const file of await fs.readdir(path.join(fixtures, host))) await fs.copyFile(path.join(fixtures, host, file), path.join(src, file));
    const scripts = host === "next"
      ? { build: "next build", start: "next start --hostname 127.0.0.1", typecheck: "tsc --noEmit" }
      : { build: "vite build", start: "vite preview --host 127.0.0.1", typecheck: "tsc --noEmit" };
    await fs.writeFile(path.join(directory, "package.json"), JSON.stringify({
      name: `yami-${host}-candidate-consumer`, private: true, type: "module", scripts,
      ...(withCli && host === "vite" ? { packageManager: "pnpm@11.20.0" } : {}),
      dependencies: { ...(!withCli ? { "@yami/design-system": `file:${tarball}`, "@yami/design-system-mcp": `file:${mcpTarball}` } : {}), react: "19.3.1", "react-dom": "19.3.1", [host]: policy.verification[host] },
      devDependencies: { ...(withCli ? { "yami-design-cli": `file:${path.join(root, "dist", cliReceipt.filename)}` } : {}), typescript: policy.verification.typescript, "@types/react": "19.3.0", "@types/react-dom": "19.3.0", ...(host === "next" ? { "@types/node": "26.6.5" } : {}) },
    }, null, 2));
    await fs.writeFile(path.join(directory, "tsconfig.json"), JSON.stringify({
      compilerOptions: { target: "ES2022", lib: ["ES2022", "DOM", "DOM.Iterable"], module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true, skipLibCheck: true, esModuleInterop: true, resolveJsonModule: true, noEmit: true, types: [host === "next" ? "next" : "vite/client"], ...(host === "next" ? { plugins: [{ name: "next" }] } : {}) },
      include: host === "next" ? ["next-env.d.ts", "app/**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"] : ["src"],
      exclude: ["node_modules"],
    }, null, 2));
    if (host === "vite") await fs.writeFile(path.join(directory, "index.html"), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>YAMI candidate · Vite</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>');
    const manager = withCli && host === "vite" ? "pnpm" : "npm";
    await run(manager, manager === "npm" ? ["install", "--no-audit", "--no-fund"] : ["install", "--ignore-scripts"], directory, `${host}-install`);
    const cli = withCli ? await verifyCliSetup({ root, directory, host, tarball, mcpTarball, run }) : undefined;
    const installed = await fs.realpath(path.join(directory, "node_modules/@yami/design-system"));
    assert.ok(installed.startsWith(`${directory}${path.sep}`), `Consumer must install tarball bytes, not link to the repository: ${installed}`);
    const manifest = await verifyInstalledCandidate(installed, expected);
    const mcpInstalled = await fs.realpath(path.join(directory, "node_modules/@yami/design-system-mcp"));
    await verifyInstalledCandidate(mcpInstalled, mcpExpected);
    const mcp = await verifyMcp(directory, manifest, mcpExpected);
    console.log(`${host}: legacy/modern stdio MCP verification passed`);
    await verifyInstalledCandidate(installed, expected);
    await verifyInstalledCandidate(mcpInstalled, mcpExpected);
    const resolve = createRequire(path.join(directory, "package.json")).resolve;
    const knowledgeFile = resolve("@yami/design-system/knowledge/index.json");
    const knowledgeDirectory = path.dirname(knowledgeFile);
    const knowledge = JSON.parse(await fs.readFile(knowledgeFile, "utf8"));
    for (const key of ["packageVersion", "sourceCommit", "sourceDirty"]) assert.equal(knowledge[key], manifest[key]);
    assert.deepEqual(knowledge.components.map(({ name, version, status }) => ({ name, version, status })), manifest.entries);
    for (const [specifier, language] of [["skill", "en"], ["skill/zh", "zh-CN"]]) {
      assert.equal(resolve(`@yami/design-system/${specifier}`), path.join(knowledgeDirectory, knowledge.skills[language]));
    }
    const imports = [];
    const sections = [];
    await fs.mkdir(path.join(src, "knowledge"));
    for (const component of knowledge.components) {
      const example = component.examples[0];
      // Compile and render the installed package's examples, never repository fixtures.
      await fs.copyFile(path.join(knowledgeDirectory, example.path), path.join(src, "knowledge", `${component.name}.tsx`));
      imports.push(`import { ${example.export} } from "./knowledge/${component.name}";`);
      sections.push(`<section aria-label="${component.name} packaged example"><h3>${component.name}</h3><${example.export} /></section>`);
    }
    await fs.writeFile(path.join(src, "KnowledgeExamples.tsx"), `"use client";\n${imports.join("\n")}\nexport function KnowledgeExamples() { return <section aria-label="Packaged examples"><h2>Versioned knowledge examples</h2>${sections.join("\n")}</section>; }\n`);
    const versions = Object.fromEntries(await Promise.all([host, "react", "react-dom", "typescript"].map(async (name) => [
      name, JSON.parse(await fs.readFile(path.join(directory, "node_modules", name, "package.json"), "utf8")).version,
    ])));
    await run("npm", ["run", "typecheck"], directory, `${host}-typecheck`);
    await run("npm", ["run", "build"], directory, `${host}-build`);
    results.push({ host, directory, installed, versions, packageVersion: manifest.packageVersion, contentDigest: manifest.contentDigest, artifactIntegrity: packed.integrity, mcpArtifactIntegrity: mcpPacked.integrity, ...(cli ? { cli: { ...cli, artifactIntegrity: cliReceipt.integrity } } : {}), mcp, knowledge: { packageVersion: knowledge.packageVersion, skills: Object.keys(knowledge.skills), examples: knowledge.components.map((entry) => entry.name) }, types: "pass", build: "pass" });
  }

  if (withCli && process.argv.includes("--native-codex")) {
    const native = await verifyNativeCodex(results);
    for (const result of results) result.cli.nativeCodex = native;
    console.log("Native Codex recognized both generated MCP configurations and Skills; no model calls.");
  }

  async function unusedPort() {
    const server = createServer();
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    await new Promise((resolve) => server.close(resolve));
    return port;
  }

  browser = await chromium.launch();
  const fontProbe = await browser.newPage();
  try {
    await assert.rejects(fontProbe.evaluate(loadBrandFonts), /Brand font is missing or not loaded/);
  } finally {
    await fontProbe.close();
  }
  for (const result of results) {
    const port = await unusedPort();
    const url = `http://127.0.0.1:${port}`;
    const log = createWriteStream(path.join(reportDir, `${result.host}-server.log`));
    const server = spawn("npm", ["run", "start", "--", "--port", String(port)], { cwd: result.directory, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    server.stdout.pipe(log);
    server.stderr.pipe(log);
    let context;
    let cleanupError;
    try {
      context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: "reduce" });
      let ready = false;
      for (let attempt = 0; attempt < 120; attempt++) {
        if (server.exitCode !== null) break;
        ready = await fetch(url, { signal: AbortSignal.timeout(1000) }).then((response) => response.ok).catch(() => false);
        if (ready) break;
        await setTimeout(250);
      }
      assert.ok(ready, `${result.host} production server did not start`);
      const page = await context.newPage();
      const errors = [];
      const failures = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
      page.on("requestfailed", (request) => failures.push(`${request.failure()?.errorText} ${request.url()}`));
      await page.goto(url);
      await expect(page.getByRole("heading", { name: "Component candidate", exact: true })).toBeVisible();
      await expect(page.getByTestId("host-card")).toHaveCSS("border-radius", "12px");
      const apply = page.getByRole("button", { name: "Apply", exact: true });
      await expect(apply).toHaveCSS("background-color", "rgb(224, 0, 0)");
      await apply.focus();
      await apply.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(apply).toBeFocused();
      await expect(apply).toHaveCSS("outline-width", "2px");
      await apply.press("Enter");
      await expect(page.getByTestId("result")).toContainText("Applications: 1");
      const input = page.getByRole("textbox", { name: "Search products", exact: true });
      await input.fill("invalid");
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveAccessibleDescription("Enter another search");
      await page.locator("form").getByRole("button", { name: "Clear input", exact: true }).click();
      await expect(input).toHaveValue("");
      await expect(input).not.toHaveAttribute("aria-invalid", "true");
      const disabled = page.getByRole("button", { name: "Unavailable action" });
      await expect(disabled).toHaveAttribute("aria-disabled", "true");
      await disabled.evaluate((button) => button.click());
      await expect(page.getByTestId("result")).toContainText("Applications: 1");
      await page.getByRole("button", { name: "Add sample product", exact: true }).click();
      await expect(page.getByTestId("result")).toContainText("Cart: 1");
      await page.getByRole("button", { name: "Add saved item", exact: true }).click();
      await expect(page.getByTestId("result")).toContainText("Cart: 2");
      assert.equal(page.url(), `${url}/`, "Adding products must not trigger product navigation");
      await page.getByRole("tab", { name: "Sold out products", exact: true }).click();
      await expect(page.getByRole("button", { name: "Add sample product", exact: true })).toHaveCount(0);
      await page.getByRole("tab", { name: "All products", exact: true }).click();
      await expect(page.getByAltText("Neutral product image fixture")).toBeVisible();
      assert.ok(await page.getByAltText("Neutral product image fixture").evaluate((image) => image.complete && image.naturalWidth === 240));
      await page.evaluate(loadBrandFonts);
      await expect(apply).toHaveCSS("font-weight", "500");
      await page.getByTestId("language").click();
      await expect(apply).toHaveCSS("font-weight", "600");
      await page.getByTestId("language").click();
      await expect(page.getByRole("region", { name: / packaged example$/ })).toHaveCount(5);
      const buttonExample = page.getByRole("region", { name: "Button packaged example", exact: true });
      await buttonExample.getByRole("button", { name: "Save example", exact: true }).click();
      await expect(buttonExample.getByRole("status")).toHaveText("Example saved");
      await expect(buttonExample.getByRole("link", { name: "View example order", exact: true })).toHaveAttribute("href", "#example-order");
      const inputExample = page.getByRole("region", { name: "Input packaged example", exact: true });
      await inputExample.getByRole("textbox", { name: "Example search", exact: true }).fill("example");
      await inputExample.getByRole("button", { name: "Clear input", exact: true }).click();
      await expect(inputExample.getByRole("textbox")).toHaveValue("");
      await expect(page.getByRole("region", { name: "Card packaged example", exact: true }).getByRole("link")).toHaveAttribute("href", "#example-order");
      const productExample = page.getByRole("region", { name: "ProductCard packaged example", exact: true });
      await productExample.getByRole("button", { name: "Add example product", exact: true }).click();
      await expect(productExample.getByRole("status")).toHaveText("Example items added: 1");
      assert.equal(page.url(), `${url}/`, "Packaged product quick-add must preserve navigation");
      const listExample = page.getByRole("region", { name: "ProductList packaged example", exact: true });
      await listExample.getByRole("tab", { name: "Sold out examples", exact: true }).click();
      await expect(listExample.getByRole("link", { name: /Available example/ })).toHaveCount(0);
      await expect(listExample.getByRole("listitem").filter({ hasText: "Sold out example" })).toBeVisible();
      await listExample.getByRole("tab", { name: "All examples", exact: true }).click();
      await expect(listExample.getByRole("listitem").filter({ hasText: "Available example" })).toBeVisible();
      result.knowledge.browser = "pass";
      await page.screenshot({ path: path.join(reportDir, `${result.host}-desktop-light.png`), fullPage: true });
      const light = await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
      await page.getByTestId("theme").click();
      const dark = await page.locator("body").evaluate((body) => getComputedStyle(body).backgroundColor);
      assert.notEqual(dark, light);
      await page.setViewportSize({ width: 375, height: 812 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Mobile layout must not overflow horizontally");
      await expect(page.getByRole("button", { name: "Add sample product", exact: true })).toBeVisible();
      await page.screenshot({ path: path.join(reportDir, `${result.host}-mobile-dark.png`), fullPage: true });
      assert.deepEqual(errors, [], `${result.host} browser errors`);
      assert.deepEqual(failures, [], `${result.host} failed asset requests`);
      result.browser = { status: "pass", desktop: "1440/light/en", mobile: "375/dark/en", languageWeights: "en:500/zh:600", fonts: "400/500/700 loaded", interactions: ["keyboard-focus-submit", "input-error-clear", "disabled-action", "add-to-cart", "controlled-tabs"], errors, failures };
      result.screenshots = [`${result.host}-desktop-light.png`, `${result.host}-mobile-dark.png`];
      console.log(`${result.host}: production browser verification passed`);
    } finally {
      try {
        await context?.close();
      } catch (error) {
        cleanupError = error;
      }
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch (error) {
        if (error.code !== "ESRCH") cleanupError ??= error;
      }
      log.end();
    }
    if (cleanupError) throw cleanupError;
  }
} catch (error) {
  failure = error.message;
  throw error;
} finally {
  await browser?.close();
  await fs.writeFile(reportFile, `${JSON.stringify({ status: failure ? "fail" : "pass", failure, node: process.version, consumers, tarball, results }, null, 2)}\n`);
}
console.log(`Verification receipt: ${reportFile}\nIndependent consumers: ${consumers}`);
