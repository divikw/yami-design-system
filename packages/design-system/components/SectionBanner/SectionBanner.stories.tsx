import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SectionBanner } from "./SectionBanner";
import { createSectionBannerItems } from "./fixtures";
import styles from "./SectionBanner.stories.module.css";

const meta = {
  title: "YAMI/Modules/Commerce/Section Banner",
  component: SectionBanner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: { component: "页面中部的带标题活动模块，仅支持图文商品卡和纯商品卡。" },
    },
  },
  args: {
    title: "精选主题",
    headingAlign: "start",
    items: createSectionBannerItems("zh"),
  },
  argTypes: {
    description: { control: "text", description: "模块标题的补充描述。" },
    title: { control: "text", description: "整组 Banner 上方的模块标题。" },
    headingAlign: {
      options: ["start", "center"],
      control: { type: "radio", labels: { start: "左对齐", center: "居中" } },
      description: "模块标题对齐方式。",
    },
  },
  render: (args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return (
      <SectionBanner
        {...args}
        title={args.title === "精选主题" && locale === "en" ? "Featured collections" : args.title}
        items={createSectionBannerItems(locale)}
        previousLabel={locale === "en" ? "Previous promotions" : "上一组活动"}
        nextLabel={locale === "en" ? "Next promotions" : "下一组活动"}
      />
    );
  },
} satisfies Meta<typeof SectionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  args: { autoAdvance: false },
  play: async ({ canvasElement, args }) => {
    const heading = within(canvasElement).getByRole("heading", { level: 2 });
    const region = within(canvasElement).getByRole("region", { name: heading.textContent ?? "" });
    await expect(region).toHaveAttribute("aria-labelledby", heading.id);
    const card = region.querySelector('[data-slot="hero-banner-item"]');
    if (!card) throw new Error("Section Banner must render campaign cards");
    for (const item of region.querySelectorAll('[data-slot="hero-banner-item"]')) {
      await expect(item.querySelectorAll('[data-slot="hero-banner-product"]').length).toBeGreaterThan(0);
    }
    const headingBox = heading.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    await expect(headingBox.bottom).toBeLessThan(cardBox.top);
    if (args.headingAlign === "center") {
      await expect(getComputedStyle(heading).textAlign).toBe("center");
      const bannerBox = region.getBoundingClientRect();
      await expect(Math.abs(headingBox.left + headingBox.width / 2 - bannerBox.left - bannerBox.width / 2)).toBeLessThan(1);
    } else {
      await expect(Math.abs(headingBox.left - cardBox.left)).toBeLessThan(1);
    }
    if (window.innerWidth >= 1024) {
      await expect(within(region).queryByRole("progressbar")).toBeNull();
      const previous = region.querySelector<HTMLButtonElement>('[data-direction="left"]');
      const next = region.querySelector<HTMLButtonElement>('[data-direction="right"]');
      const rail = region.querySelector<HTMLElement>('[data-slot="hero-banner-list"]');
      if (!previous || !next || !rail) throw new Error("Missing side navigation");
      for (const button of [previous, next]) {
        const box = button.getBoundingClientRect();
        await expect(Math.abs(box.top + box.height / 2 - cardBox.top - cardBox.height / 2)).toBeLessThan(1);
      }
      await expect(previous.getBoundingClientRect().right).toBeLessThan(next.getBoundingClientRect().left);
      const scrollLeft = rail.scrollLeft;
      await userEvent.click(next);
      await waitFor(() => expect(rail.scrollLeft).toBeGreaterThan(scrollLeft));
    }
  },
};

export const Pc: Story = {
  name: "PC",
  play: Showcase.play,
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
  parameters: {
    docs: { story: { inline: false, height: "500px" }, canvas: { className: styles.docsPc } },
  },
};

export const Centered: Story = {
  tags: ["!dev", "!autodocs"],
  args: { headingAlign: "center", autoAdvance: false },
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
  play: Showcase.play,
};

export const CenteredMobile: Story = {
  ...Centered,
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};

export const Mobile: Story = {
  play: Showcase.play,
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  parameters: {
    docs: { story: { inline: false, height: "440px" }, canvas: { className: styles.docsMobile } },
  },
};
