import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storyNameFromExport } from "storybook/internal/csf";
import { formatSidebarLabel } from "./sidebar-label.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");

const config: StorybookConfig = {
  stories: [
    "../../../packages/design-system/*.stories.@(ts|tsx|mdx)",
    "../../../packages/design-system/components/**/*.stories.@(ts|tsx|mdx)",
    "../../../packages/prototypes/pages/**/*.stories.@(ts|tsx|mdx)",
    "../docs/**/*.mdx"
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  docs: { defaultName: "docs" },
  experimental_indexers: async (indexers = []) => indexers.map((indexer) => ({
    ...indexer,
    createIndex: async (fileName, options) => (await indexer.createIndex(fileName, options)).map((entry) => ({
      ...entry,
      title: entry.title === undefined ? undefined : formatSidebarLabel(entry.title),
      name: formatSidebarLabel(entry.name ?? (entry.type === "docs" ? "docs" : storyNameFromExport(entry.exportName))),
    })),
  })),
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: [
    { from: path.join(root, "packages/design-system/assets"), to: "/assets" },
    { from: path.join(here, "../public"), to: "/" }
  ],
  typescript: { reactDocgen: "react-docgen" },
  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    optimizeDeps: { ...viteConfig.optimizeDeps, include: [...(viteConfig.optimizeDeps?.include ?? []), "@yami/design-system > @base-ui/react/select"] },
    resolve: { ...viteConfig.resolve, preserveSymlinks: false }
  })
};

export default config;
