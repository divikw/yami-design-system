import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const directory = path.dirname(fileURLToPath(import.meta.url));

const storybookDependencies = [
  "@yami/design-system > @base-ui/react/accordion",
  "@yami/design-system > @base-ui/react/alert-dialog",
  "@yami/design-system > @base-ui/react/dialog",
  "@yami/design-system > @base-ui/react/drawer",
  "@yami/design-system > @base-ui/react/internals/createBaseUIEventDetails",
  "@yami/design-system > @base-ui/react/avatar",
  "@yami/design-system > @base-ui/react/button",
  "@yami/design-system > @base-ui/react/checkbox",
  "@yami/design-system > @base-ui/react/field",
  "@yami/design-system > @base-ui/react/combobox", "@yami/design-system > @base-ui/react/slider", "@yami/design-system > @base-ui/react/menu", "@yami/design-system > @base-ui/react/navigation-menu", "@yami/design-system > @base-ui/react/progress", "@yami/design-system > @base-ui/react/fieldset",
  "@yami/design-system > @base-ui/react/input",
  "@yami/design-system > @base-ui/react/popover",
  "@yami/design-system > @base-ui/react/radio",
  "@yami/design-system > @base-ui/react/radio-group",
  "@yami/design-system > @base-ui/react/select",
  "@yami/design-system > @base-ui/react/separator",
  "@yami/design-system > @base-ui/react/switch",
  "@yami/design-system > @base-ui/react/tabs",
  "@yami/design-system > @base-ui/react/toggle",
  "@yami/design-system > @base-ui/react/toast", "@yami/design-system > @base-ui/react/tooltip",
  "@yami/design-system > @base-ui/react/use-render",
  "@storybook/react-vite",
  "@storybook/addon-docs/blocks",
  "storybook/theming",
  "storybook/internal/components",
  "react/jsx-dev-runtime",
  "storybook/test",
];

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: storybookDependencies },
  test: {
    projects: [
      {
        extends: false,
        optimizeDeps: { include: storybookDependencies },
        plugins: [
          storybookTest({
            configDir: path.join(directory, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [path.join(directory, ".storybook/vitest.setup.ts")],
        },
      },
      {
        extends: false,
        plugins: [react()],
        optimizeDeps: { include: storybookDependencies },
        test: {
          name: "browser",
          include: ["tests/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
