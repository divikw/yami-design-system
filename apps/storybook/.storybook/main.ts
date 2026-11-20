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
          name: device ? name : formatSidebarLabel(name),
        };
      });
    },
  })),
  framework: { name: "@storybook/react-vite", options: {} },
  staticDirs: [
    { from: path.join(root, "packages/design-system/assets"), to: "/assets" },
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
