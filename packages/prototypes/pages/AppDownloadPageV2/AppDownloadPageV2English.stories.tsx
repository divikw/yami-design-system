import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppDownloadPageV2 } from "./AppDownloadPageV2";

const meta = {
  id: "yami-pages-app-download-english-v2",
  title: "YAMI/Pages/App Download/English",
  component: AppDownloadPageV2,
  tags: ["!autodocs", "draft"],
  args: { englishOnly: true },
  parameters: {
    viewport: { defaultViewport: "yamiDesktopLg" },
    layout: "fullscreen",
    controls: { disable: true },
  },
  globals: { locale: "en", theme: "light", ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiDesktopLg", isRotated: false } } : {}) },
} satisfies Meta<typeof AppDownloadPageV2>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PC: Story = {};
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "yamiMobileLg" } },
  globals: { ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiMobileLg", isRotated: false } } : {}) },
};
