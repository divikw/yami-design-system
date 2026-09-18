import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import type { AppDownloadSectionDividers } from "./sectionDividers";
import { AppDownloadPageV2 } from "./AppDownloadPageV2";
import { SocialMediaGallery } from "../../../design-system/components/SocialMediaGallery/SocialMediaGallery";
import socialTrends from "./social-trends.json";

const meta = {
  id: "yami-pages-app-download-v2",
  title: "YAMI/Pages/App Download/Draft/V2",
  component: AppDownloadPageV2,
  tags: ["!autodocs", "draft"],
  parameters: {
    viewport: { defaultViewport: "yamiDesktopLg" },
    layout: "fullscreen",
    controls: { disable: true },
    docs: { description: { component: "**Draft · 草稿**：当前页面及全部预览内容尚未定稿或完成 review。" } },
  },
  globals: { theme: "light", ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiDesktopLg", isRotated: false } } : {}) },
} satisfies Meta<typeof AppDownloadPageV2>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PC: Story = { args: { initialLocale: "ko" } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "yamiMobileLg" } },
  args: { initialLocale: "ko" },
  globals: { ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiMobileLg", isRotated: false } } : {}) },
};
export const StoryBanner: Story = {
  tags: ["!dev", "!autodocs"],
  args: { initialLocale: "ko" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvasElement.querySelector("main")!;
    const banner = main.querySelector<HTMLElement>('[data-slot="section-banner"]')!;
    await expect(banner.nextElementSibling).toBe(main.querySelector("#brand-special"));
    await expect(within(banner).getByRole("heading", { name: "Best Stories & Products" })).toBeVisible();
    await expect(within(banner).getByText("See what's trending on Yami")).toBeVisible();
    const cards = banner.querySelectorAll('[data-slot="hero-banner-item"]');
    await expect(new Set(Array.from(cards, (card) => card.getAttribute("href"))).size).toBe(8);
    for (const card of cards) {
      await expect(card.getAttribute("data-hero-banner-content")).toBe("image-text-products");
      await expect(card.getAttribute("href")).toContain("/en/story/");
    }
    await userEvent.click(canvas.getByRole("button", { name: "Switch to English" }));
    await expect(banner.querySelector('[data-slot="hero-banner-item"]')?.getAttribute("href")).toContain("/en/story/");
    await expect(within(banner).getByRole("heading", { level: 2 })).toHaveTextContent("Best Stories & Products");
  },
};

export const StoryBannerMobile: Story = {
  ...StoryBanner,
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "yamiMobileLg", isRotated: false } },
};
export const Interactions: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$22.99");
    await userEvent.click(canvas.getByRole("tab", { name: "Cookware" }));
    await expect(canvas.getAllByRole("link", { name: "Round Dutch Oven, White Truffle, 4QT", exact: true }).length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("tab", { name: /Coupon 2/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$0.00");
    const productCheckbox = await canvas.findByRole("checkbox", { name: /Zeus III RF Facial Lifting Device/ });
    const productTile = productCheckbox.closest("li")!;
    await userEvent.click(within(productTile).getByRole("img"));
    await expect(productCheckbox).toBeChecked();
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$664.72");
    await expect(canvas.getByTestId("total-savings")).toHaveTextContent("$79.85");
    await expect(canvas.getByTestId("selected-items-total")).toHaveTextContent("$664.72");
    await expect(canvas.getByText("1 selected · Shipping excluded")).toBeVisible();
    await expect(canvas.getByTestId("selection-savings-hint")).toHaveTextContent("Save up to $79.85 on your selected items!");
    const selectedCard = canvasElement.querySelector('#calculator-panel-app li[data-selected="true"]')!;
    await expect(selectedCard).toHaveTextContent("$664.72");
    await expect(within(selectedCard as HTMLElement).queryByText("$738.58")).not.toBeInTheDocument();
    await expect(canvas.getByTestId("total-savings")).not.toHaveTextContent("−");
    await userEvent.click(canvas.getByRole("checkbox", { name: /Zeus III RF Facial Lifting Device/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$0.00");
    await userEvent.click(canvas.getByRole("tab", { name: /Coupon 1/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$22.99");
    await userEvent.click(canvas.getByRole("button", { name: "한국어로 전환" }));
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("미국 최대 아시안 마켓 Yami");
  },
};

export const SectionNavigation: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en" },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement.querySelector("nav")!);
    const target = nav.getByRole("tab", { name: "Calculator", exact: true });
    await userEvent.click(target);
    const deadline = performance.now() + 1500;
    while (performance.now() < deadline) {
      await expect(target).toHaveAttribute("aria-selected", "true");
      await new Promise(requestAnimationFrame);
    }
    const section = canvasElement.querySelector("#savings-calculator")!;
    await expect(Math.abs(section.getBoundingClientRect().top - 128)).toBeLessThan(2);
    const first = nav.getByRole("tab", { name: "Coupon Packs", exact: true });
    await userEvent.click(first);
    const returnDeadline = performance.now() + 1500;
    while (performance.now() < returnDeadline) {
      await expect(first).toHaveAttribute("aria-selected", "true");
      await new Promise(requestAnimationFrame);
    }
  },
};

export const ContentWidth: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en", contentMaxWidth: 1440 },
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector<HTMLElement>('[data-slot="app-download-page"]')!;
    const header = page.querySelector<HTMLElement>("header > div")!;
    const products = page.querySelector<HTMLElement>('[data-slot="product-list-container"]')!;
    await expect(header.getBoundingClientRect().width).toBe(1440);
    await expect(products.getBoundingClientRect().width).toBe(1440);
    await expect(getComputedStyle(products).padding).toBe("64px 48px");
    for (const section of page.querySelectorAll<HTMLElement>("main > section:not(#discount-products):not(#sns-trend):not(#reviews)")) {
      await expect(getComputedStyle(section).paddingTop).toBe("64px");
      await expect(getComputedStyle(section).paddingBottom).toBe("64px");
    }
    await userEvent.click(within(page.querySelector("nav")!).getByRole("tab", { name: "How to Use" }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await expect(within(page).queryByRole("link", { name: "Claim Your App-Only Deal", exact: true })).toBeInTheDocument();
  },
};

export const SocialTrends: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en" },
  play: async ({ canvasElement }) => {
    const gallery = canvasElement.querySelector<HTMLElement>("#sns-trend")!;
    await expect(gallery).toHaveAttribute("data-heading-align", "center");
    await expect(gallery.querySelectorAll('[data-slot="social-video-card-media"] a')).toHaveLength(9);
    await expect(gallery.querySelectorAll("video")).toHaveLength(9);
    for (const video of gallery.querySelectorAll("video")) {
      await expect(video.autoplay && video.muted && video.loop && video.playsInline).toBe(true);
      await expect(video.controls).toBe(false);
    }
    await expect(gallery.querySelectorAll('[data-slot="social-video-card-products"] a')).toHaveLength(11);
    await expect(within(gallery).getByRole("heading")).toHaveTextContent("Social Trends");
    for (const link of gallery.querySelectorAll('[data-slot="social-video-card-media"] a')) {
      await expect(link.getAttribute("href")).toMatch(/\.mp4(?:\?|$)/);
    }
    await userEvent.click(within(canvasElement).getByRole("button", { name: "한국어로 전환" }));
    await expect(within(gallery).getByRole("heading")).toHaveTextContent("화제의 트렌드");
  },
};

const dividerSectionIds = ["hero", "welcome-coupon", "discount-products", "coupon-guide", "savings-calculator", "brand-special", "sns-trend", "reviews", "bottom-cta-section"] as const;

export const SectionDividers: Story = {
  tags: ["!dev"],
  args: {
    sectionDividers: Object.fromEntries(dividerSectionIds.map((id, index) => [id, {
      dividerPosition: (["top", "bottom", "none"] as const)[index % 3],
      dividerVariant: index % 2 ? "gray" : "black",
    }])) as AppDownloadSectionDividers,
  },
  play: async ({ canvasElement }) => {
    for (const [index, id] of dividerSectionIds.entries()) {
      const section = canvasElement.querySelector<HTMLElement>(id === "hero" ? "[data-campaign-hero]" : `#${id}`)!;
      const style = getComputedStyle(section);
      const position = ["top", "bottom", "none"][index % 3];
      const width = index % 2 ? "1px" : "2px";
      await expect(style.borderTopWidth).toBe(position === "top" ? width : "0px");
      await expect(style.borderBottomWidth).toBe(position === "bottom" ? width : "0px");
    }
  },
};

// Repeat two source entries only in this test fixture to exercise overflow.
const overflowCards = [...socialTrends.cards.slice(0, 6), ...socialTrends.cards.slice(0, 2)].map((card, index) => ({
  id: `overflow-video-${index}`,
  posterSrc: new URL(`./assets/social/${card.poster}`, import.meta.url).href,
  posterAlt: card.products.map((product) => product.title).join(", "),
  videoSrc: new URL(`./assets/social/${card.video}`, import.meta.url).href,
  username: null,
  platformIconSrc: "",
  caption: "",
  products: card.products.map((product) => ({
    id: product.id, title: product.title, imageAlt: product.title,
    imageSrc: new URL(`./assets/social/${product.image}`, import.meta.url).href,
    href: product.href,
  })),
}));

export const SocialVideoOverflow: Story = {
  tags: ["!dev"],
  render: () => <SocialMediaGallery {...socialTrends.en} headingAlign="center" cards={overflowCards} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rail = canvasElement.querySelector<HTMLElement>('[data-slot="social-media-gallery-list"]')!;
    const videos = rail.querySelectorAll<HTMLVideoElement>("video");
    await expect(videos).toHaveLength(8);
    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
    const next = canvas.getByRole("button", { name: "Next social videos" });
    const previous = canvas.getByRole("button", { name: "Previous social videos" });
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(next);
    await waitFor(() => expect(next).toHaveAttribute("aria-disabled", "true"));
    await expect(previous).not.toHaveAttribute("aria-disabled", "true");
    await waitFor(() => expect(videos[7].paused).toBe(false), { timeout: 10000 });
    await waitFor(() => expect(videos[0].paused).toBe(true));
    await userEvent.click(previous);
    await waitFor(() => expect(previous).toHaveAttribute("aria-disabled", "true"));
    await waitFor(() => expect(videos[7].paused).toBe(true));
  },
};

export const MobileSocialVideoOverflow: Story = {
  ...SocialVideoOverflow,
  tags: ["!dev"],
  globals: { viewport: { value: "yamiMobileLg", isRotated: false } },
  play: async ({ canvasElement }) => {
    const rail = canvasElement.querySelector<HTMLElement>('[data-slot="social-media-gallery-list"]')!;
    const videos = rail.querySelectorAll<HTMLVideoElement>("video");
    await expect(videos).toHaveLength(8);
    await expect(within(canvasElement).queryByRole("button", { name: "Next social videos" })).toBeNull();
    await expect(getComputedStyle(rail).overflowX).toBe("auto");
    rail.scrollTo({ left: rail.scrollWidth, behavior: "instant" });
    await waitFor(() => expect(rail.scrollLeft).toBeGreaterThan(0));
    await waitFor(() => expect(videos[7].paused).toBe(false), { timeout: 10000 });
    await waitFor(() => expect(videos[0].paused).toBe(true));
  },
};
