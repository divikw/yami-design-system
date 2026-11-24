import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { CollectionCard } from "./CollectionCard";
import { anuaCollection } from "./examples";

const meta = {
  title: "YAMI/Modules/Product Display/Collection Card",
  component: CollectionCard,
  parameters: { layout: "padded" },
  args: { item: anuaCollection },
  render: ({ item }, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    const device = globals.viewport?.value === "yamiMobile" ? "mobile" : "pc";
    const href = `./?path=/story/yami-pages-landing-page-collection-page-brand--${device}&globals=locale:${locale}`;
    return (
      <div style={{ display: "grid", gap: "var(--space-200)", width: "min(320px, 100%)", marginInline: "auto" }}>
        <CollectionCard item={{ ...item, href, target: "_top" }} />
        <CollectionCard item={{ ...item, products: item.products.slice(0, 3), href, target: "_top" }} />
      </div>
    );
  },
} satisfies Meta<typeof CollectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const [grid, strip] = within(canvasElement).getAllByRole("link", { name: "ANUA" });
    await expect(grid.querySelectorAll("img")).toHaveLength(4);
    await expect(grid).toHaveAttribute("target", "_top");
    const thumbnails = Array.from(strip.querySelectorAll("img"));
    await expect(thumbnails).toHaveLength(3);
    await expect(new Set(thumbnails.map(image => image.getBoundingClientRect().top)).size).toBe(1);
    await expect(strip.getBoundingClientRect().height).toBeLessThan(grid.getBoundingClientRect().height);
  },
};

export const PCPreview: Story = {
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
};

export const MobilePreview: Story = {
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
