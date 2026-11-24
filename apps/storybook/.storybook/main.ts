import type { StorybookConfig } from "@storybook/react-vite";
import { buildSync } from "esbuild";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileFunction } from "node:vm";
import { storyNameFromExport } from "storybook/internal/csf";
import { formatSidebarLabel } from "./sidebar-label.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const headerArtwork = path.join(root, "packages/design-system/components/Header/assets");

type LoadingHeight = [width: number, titleLines: number, introLines: number, previewHeight: number];
type LoadingHeights = Record<string, Record<string, LoadingHeight[]>>;

function docsLoadingHeightStyles() {
  const heights: LoadingHeights = JSON.parse(readFileSync(path.join(here, "docs-loading-heights.json"), "utf8"));
  const rules = Object.entries(heights).flatMap(([id, locales]) => Object.entries(locales).flatMap(([locale, sizes]) =>
    sizes.map(([width, titleLines, introLines, previewHeight], index) => {
      const selector = `[data-yami-docs-id="${id}"][data-yami-docs-locale="${locale}"]`;
      const rule = `${selector}{--yami-docs-title-lines:${titleLines};--yami-docs-intro-lines:${introLines};--yami-docs-preview-height:${previewHeight}px}`;
      return index === 0 ? rule : `@media (width >= ${width}px){${rule}}`;
    }),
  ));
  return `@media (width <= 600px){\n${rules.join("\n")}\n}`;
}

let docsLoading: { html: string; css: string } | undefined;
function getDocsLoading() {
  if (docsLoading) return docsLoading;

  // Compile the JSX and its CSS module together, then render once in Node.
  const entry = path.join(here, "docs-loading.tsx");
  const { outputFiles } = buildSync({
    entryPoints: [entry],
    outfile: "docs-loading.cjs",
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    jsx: "automatic",
    external: ["react", "react-dom"],
    loader: { ".module.css": "local-css" },
  });
  const script = outputFiles.find((file) => file.path.endsWith(".cjs"));
  const styles = outputFiles.find((file) => file.path.endsWith(".css"));
  if (!script || !styles) throw new Error("Expected Docs skeleton JavaScript and CSS");

  const module = { exports: {} as typeof import("./docs-loading.tsx") };
  const load = compileFunction(script.text, ["module", "require"], { filename: entry });
  load(module, createRequire(import.meta.url));
  return docsLoading = { html: module.exports.renderDocsLoading(), css: styles.text };
}

const config: StorybookConfig = {
  stories: [
    "../../../packages/design-system/*.stories.@(ts|tsx|mdx)",
    "../../../packages/design-system/components/**/*.stories.@(ts|tsx|mdx)",
    "../../../packages/prototypes/pages/**/*.stories.@(ts|tsx|mdx)",
    "../docs/**/*.mdx"
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  docs: { defaultName: "docs" },
  // The browser paints the pre-rendered skeleton before loading preview JavaScript.
  previewHead: (head) => `${head}<style>
${readFileSync(path.join(root, "packages/design-system/generated/tokens.css"), "utf8")}
${getDocsLoading().css}
${readFileSync(path.join(here, "preview.css"), "utf8")}
${docsLoadingHeightStyles()}
</style>`,
  previewBody: (body) => `${getDocsLoading().html}${body}`,
  experimental_indexers: async (indexers = []) => indexers.map((indexer) => ({
    ...indexer,
    createIndex: async (fileName, options) => {
      const entries = await indexer.createIndex(fileName, options);
      const isComponent = fileName.includes("/design-system/components/");
      const isDevice = (entry: (typeof entries)[number]) => entry.tags?.includes("component-device") ?? false;
      // Autodocs inherits the first indexed story's tags, so start with a visible device.
      const ordered = isComponent ? [...entries.filter(isDevice), ...entries.filter((entry) => !isDevice(entry))] : entries;
      return ordered.map((entry) => {
        const device = isComponent && isDevice(entry);
        const name = entry.name ?? (entry.type === "docs" ? "docs" : storyNameFromExport(entry.exportName));
        const sourceTitle = entry.title;
        const flatComponent = sourceTitle && /^YAMI\/Components\/[^/]+$/i.test(sourceTitle);
        return {
          ...entry,
          tags: device ? entry.tags?.filter((tag) => tag !== "play-fn")
            : isComponent && entry.type === "story" ? [...(entry.tags ?? []), "!dev"] : entry.tags,
          title: flatComponent ? `YAMI/components/${sourceTitle.split("/").at(-1)}`
            : sourceTitle === undefined ? undefined : formatSidebarLabel(sourceTitle),
          name: device || entry.tags?.includes("preserve-story-name") ? name : formatSidebarLabel(name),
        };
      });
    },
  })),
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: [
    { from: path.join(root, "packages/design-system/assets"), to: "/assets" },
    ...readdirSync(headerArtwork).filter((name) => name.endsWith(".png")).map((name) => ({
      from: path.join(headerArtwork, name),
      to: `/assets/header-categories/${name}`,
    })),
    { from: path.join(here, "../public"), to: "/" }
  ],
  typescript: { reactDocgen: "react-docgen" },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    // Storybook already copies public through staticDirs.
    build: { ...viteConfig.build, copyPublicDir: false },
    optimizeDeps: { ...viteConfig.optimizeDeps, include: [...(viteConfig.optimizeDeps?.include ?? []), "@yami/design-system > @base-ui/react/accordion", "@yami/design-system > @base-ui/react/alert-dialog", "@yami/design-system > @base-ui/react/dialog", "@yami/design-system > @base-ui/react/drawer", "@yami/design-system > @base-ui/react/internals/createBaseUIEventDetails", "@yami/design-system > @base-ui/react/button", "@yami/design-system > @base-ui/react/select", "@yami/design-system > @base-ui/react/popover", "@yami/design-system > @base-ui/react/switch", "@yami/design-system > @base-ui/react/input", "@yami/design-system > @base-ui/react/separator", "@yami/design-system > @base-ui/react/tabs", "@yami/design-system > @base-ui/react/toggle", "@yami/design-system > @base-ui/react/field", "@yami/design-system > @base-ui/react/combobox", "@yami/design-system > @base-ui/react/slider", "@yami/design-system > @base-ui/react/menu", "@yami/design-system > @base-ui/react/navigation-menu", "@yami/design-system > @base-ui/react/progress", "@yami/design-system > @base-ui/react/fieldset", "@yami/design-system > @base-ui/react/toast", "@yami/design-system > @base-ui/react/tooltip"] },
    resolve: { ...viteConfig.resolve, preserveSymlinks: false }
  })
};

export default config;
