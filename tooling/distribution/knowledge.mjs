import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const prefix = "knowledge/yami-design-system";
const sourceRepository = "https://github.com/divikw/yami-design-system";

export async function buildKnowledge({ root, source, output, policy, entries, packageName, provenance, publicExports }) {
  const directory = path.join(output, prefix);
  const mappings = new Map();
  const documents = [];
  const register = (from, to) => mappings.set(path.join(source, from), to);
  for (const file of ["SKILL.md", "SKILL.zh-CN.md"]) register(`distribution/knowledge/${file}`, file);
  for (const file of ["DESIGN.md", "DESIGN.compact.md", "DISTRIBUTION.md", "schema/component.json", "generated/tokens.css", "generated/tokens.json"]) {
    register(file, `references/${file}`);
  }
  register("distribution/MCP.md", "references/MCP.md");
  for (const folder of ["content", "motion"]) {
    for (const file of (await fs.readdir(path.join(source, folder))).filter((name) => name.endsWith(".md")).sort()) {
      register(`${folder}/${file}`, `references/${folder}/${file}`);
    }
  }
  for (const { name } of entries) {
    register(`components/${name}/meta.json`, `references/components/${name}/meta.json`);
    register(`components/${name}/usage.md`, `references/components/${name}/usage.md`);
    register(`distribution/knowledge/examples/${name}.tsx`, `references/components/${name}/examples.tsx`);
  }

  // Legacy source links use tokens.css at the package root.
  const aliases = new Map(["css", "json"].map((extension) => [path.join(source, `tokens.${extension}`), `references/generated/tokens.${extension}`]));
  const relativeLink = (from, to) => {
    const relative = path.posix.relative(path.posix.dirname(from), to);
    return relative.startsWith(".") ? relative : `./${relative}`;
  };
  const rewriteLinks = async (text, from, to) => {
    const links = [...text.matchAll(/\[([^\]]*)\]\(([^)]+)\)/g)];
    for (const [original, label, target] of links) {
      if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(target)) continue;
      const hash = target.indexOf("#");
      const file = hash === -1 ? target : target.slice(0, hash);
      const anchor = hash === -1 ? "" : target.slice(hash);
      const resolved = path.resolve(path.dirname(from), file);
      const local = mappings.get(resolved) ?? aliases.get(resolved);
      let replacement;
      if (local) {
        replacement = `[${label}](${relativeLink(to, local)}${anchor})`;
      } else {
        const stat = await fs.stat(resolved).catch(() => null);
        if (!stat || !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Unresolvable knowledge link: ${target} in ${from}`);
        const upstream = path.relative(root, resolved).split(path.sep).map(encodeURIComponent).join("/");
        replacement = `[${label} (upstream reference)](${sourceRepository}/${stat.isDirectory() ? "tree" : "blob"}/${provenance.sourceCommit}/${upstream}${anchor})`;
      }
      text = text.replace(original, replacement);
    }
    return text;
  };

  const banner = "> Versioned upstream reference. Only components in [index.json]({index}) are public in this candidate. Repository scripts and other APIs mentioned below are source context. Use the indexed examples for copyable consumer code.\n\n";
  for (const [from, to] of mappings) {
    const original = await fs.readFile(from);
    let content = original;
    let transform;
    if (to.endsWith(".md") && to.startsWith("references/")) {
      content = `${banner.replace("{index}", relativeLink(to, "index.json"))}${await rewriteLinks(original.toString(), from, to)}`;
      transform = "scope-banner-and-portable-links";
    } else if (to.endsWith("/meta.json")) {
      const meta = JSON.parse(original);
      content = `${JSON.stringify({ ...meta, exports: publicExports[meta.name], examples: [`./examples.tsx#${meta.name}Example`] }, null, 2)}\n`;
      transform = "public-exports-and-consumer-examples";
    }
    const destination = path.join(directory, to);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content);
    documents.push({ path: to, source: path.relative(root, from).split(path.sep).join("/"), sourceSha256: createHash("sha256").update(original).digest("hex"), ...(transform ? { transform } : {}) });
  }

  const sourceSkill = await fs.readFile(path.join(source, "SKILL.md"));
  const index = {
    schemaVersion: 1,
    package: packageName,
    packageVersion: policy.version,
    ...provenance,
    sourceRepository,
    sourceSkill: { path: "packages/design-system/SKILL.md", version: sourceSkill.toString().match(/^version:\s*(\S+)/m)[1], sha256: createHash("sha256").update(sourceSkill).digest("hex") },
    skills: { en: "SKILL.md", "zh-CN": "SKILL.zh-CN.md" },
    references: { overview: "references/DESIGN.compact.md", design: "references/DESIGN.md", installation: "references/DISTRIBUTION.md", mcp: "references/MCP.md", componentSchema: "references/schema/component.json", tokensCSS: "references/generated/tokens.css", tokensJSON: "references/generated/tokens.json" },
    components: entries.map(({ name, version, status }) => ({
      name,
      version,
      status,
      import: `${packageName}/components/${name}`,
      exports: publicExports[name],
      contract: `references/components/${name}/meta.json`,
      usage: `references/components/${name}/usage.md`,
      examples: [{ path: `references/components/${name}/examples.tsx`, export: `${name}Example` }],
    })),
    documents,
  };
  await fs.writeFile(path.join(directory, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  return { "./knowledge/index.json": `./${prefix}/index.json`, "./skill": `./${prefix}/SKILL.md`, "./skill/zh": `./${prefix}/SKILL.zh-CN.md` };
}
