import type { Meta, StoryObj } from "@storybook/react-vite";

import { SocialMediaGallery } from "./SocialMediaGallery";
import styles from "./SocialMediaGallery.stories.module.css";
import { SocialVideoCard } from "./SocialVideoCard";
import {
  createSocialMediaGalleryFixture,
  createSocialVideoCards,
  type SocialMediaGalleryLocale,
} from "./fixtures";

function localeFromGlobals(value: unknown): SocialMediaGalleryLocale {
  return value === "en" ? "en" : "zh";
}

const meta = {
  id: "yami-components-commerce-social-media-gallery",
  title: "YAMI/Modules/Commerce/Social Media Gallery",
  component: SocialMediaGallery,
  argTypes: {
    dividerPosition: { description: "PC 分割线位置：top 顶部、bottom 底部、none 不显示。移动端卡片不显示分割线。" },
    dividerVariant: { description: "分割线样式：gray 为 1px 灰线，black 为 2px 强调分割线。" },
    title: { description: "PC 模块标题。" },
    mobileTitle: { description: "移动端专用标题，未设置时使用 title。" },
    description: { description: "标题旁的辅助说明。" },
    headingAlign: {
      options: ["start", "center"],
      control: { type: "radio" },
      description: "标题对齐方式。移动端卡片固定左对齐；PC 居中时翻页按钮位于列表两侧。",
    },
    cards: { description: "按展示顺序排列的社交视频卡片，支持纯文案、单商品和多商品底部样式。" },
    viewAllHref: { description: "查看全部的可选跳转地址。" },
    viewAllLabel: { description: "查看全部的本地化文案。" },
    previousLabel: { description: "上一页按钮的本地化标签。" },
    nextLabel: { description: "下一页按钮的本地化标签。" },
    imageLoadingStrategy: { description: "图片加载策略。" },
  },
  decorators: [
    (Story) => (
      <div className={styles.canvas}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "响应式社交视频列表，支持纯文案、单商品和多商品三种底部样式。PC 根据实际容器宽度调整列数并提供翻页按钮；Mobile 使用横向滑动。",
      },
    },
  },
  args: createSocialMediaGalleryFixture("en"),
} satisfies Meta<typeof SocialMediaGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args, { globals }) => (
    <SocialMediaGallery
      {...createSocialMediaGalleryFixture(localeFromGlobals(globals.locale))}
      headingAlign={args.headingAlign}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="social-media-gallery"]',
    );
    if (!root) throw new Error("Social media gallery did not render");

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="social-video-card"]'),
    );
    if (cards.length !== 8) {
      throw new Error(`Expected 8 social video cards, got ${cards.length}`);
    }
    const footerModes = new Set(
      cards.map(
        (card) =>
          card.querySelector<HTMLElement>(
            '[data-slot="social-video-card-products"]',
          )?.dataset.footerMode,
      ),
    );
    for (const mode of ["text", "single", "multiple"]) {
      if (!footerModes.has(mode)) {
        throw new Error(`Gallery must demonstrate the ${mode} footer mode`);
      }
    }

    const multipleFooter = root.querySelector<HTMLElement>(
      '[data-footer-mode="multiple"]',
    );
    if (!multipleFooter) throw new Error("Multiple-product footer did not render");
    const multipleProductImages = multipleFooter.querySelectorAll("img");
    if (multipleProductImages.length < 3) {
      throw new Error("Multiple-product footer must show at least three images");
    }
    // A multi-product footer renders both a three- and a two-thumbnail row and
    // a container query shows one, so the hidden row's images measure 0 and
    // only the rendered ones are the subject here.
    const productImages = Array.from(
      root.querySelectorAll<HTMLImageElement>(
        '[data-footer-mode="single"] img, [data-footer-mode="multiple"] img',
      ),
    ).filter((image) => image.offsetParent !== null);
    if (
      productImages.length === 0 ||
      productImages.some((image) => {
        const rect = image.getBoundingClientRect();
        return Math.abs(rect.width - 56) > 1 || Math.abs(rect.height - 56) > 1;
      })
    ) {
      throw new Error(
        "All product images must render at 56 by 56 pixels",
      );
    }
    // A multi-product footer carries one set of image nodes so the hidden
    // compact variant cannot trigger duplicate requests. Its wide and narrow
    // overflow labels must still account for the same catalogue.
    const rows = Array.from(
      multipleFooter.querySelectorAll<HTMLElement>("[data-product-row]"),
    );
    const row = rows[0];
    const productCount =
      row?.querySelectorAll<HTMLElement>("[data-product-index]").length ?? 0;
    const overflowFor = (mode: "wide" | "narrow") =>
      Number(
        row
          ?.querySelector<HTMLElement>(`[data-product-overflow="${mode}"]`)
          ?.textContent?.replace("+", "") ?? 0,
      );
    const totals = [
      productCount + overflowFor("wide"),
      Math.min(productCount, 2) + overflowFor("narrow"),
    ];
    if (rows.length !== 1 || new Set(totals).size !== 1) {
      throw new Error(
        `Both responsive thumbnail modes must account for the same products, got ${totals.join(" and ")}`,
      );
    }

    const moreProducts = Array.from(
      multipleFooter.querySelectorAll<HTMLElement>("[data-product-overflow]"),
    ).find(
      (indicator) => getComputedStyle(indicator).display !== "none",
    );
    if (
      !moreProducts ||
      Math.abs(moreProducts.getBoundingClientRect().height - 56) > 1
    ) {
      throw new Error("Product count indicator must be 56px high");
    }
    const footerRect = multipleFooter.getBoundingClientRect();
    const countRect = moreProducts.getBoundingClientRect();
    if (Math.abs(countRect.right - (footerRect.right - 8)) > 1) {
      throw new Error("Product count must fill the remaining width");
    }

    const textFooter = root.querySelector<HTMLElement>(
      '[data-footer-mode="text"]',
    );
    const footerText = textFooter?.querySelector<HTMLElement>("p");
    if (
      !footerText ||
      getComputedStyle(footerText).getPropertyValue("-webkit-line-clamp") !== "2"
    ) {
      throw new Error("Text-only footer must clamp the description to two lines");
    }
    if (
      getComputedStyle(multipleFooter).backgroundColor !==
      getComputedStyle(cards[0]).backgroundColor
    ) {
      throw new Error("Social card footers must use the default gray surface");
    }
    const singleProductTitle = root.querySelector<HTMLElement>(
      '[data-footer-mode="single"] span',
    );
    if (
      (document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")) &&
      (!singleProductTitle ||
        getComputedStyle(singleProductTitle).color !== "rgb(255, 255, 255)")
    ) {
      throw new Error("Single-product title must use white text in dark mode");
    }

    const firstCard = cards[0];
    // Column count follows the rail width, including embedded previews.
    if (window.innerWidth >= 1024) {
      const rail = canvasElement.querySelector<HTMLElement>(
        '[data-slot="social-media-gallery-list"]',
      );
      if (!rail) throw new Error("Gallery rail did not render");
      const perView =
        rail.clientWidth >= 1344 ? 6 : rail.clientWidth >= 1184 ? 5 : rail.clientWidth >= 768 ? 4 : rail.clientWidth >= 572 ? 3 : rail.clientWidth >= 376 ? 2 : 1;
      const gap = Number.parseFloat(getComputedStyle(rail).columnGap);
      const cardWidth = firstCard.getBoundingClientRect().width;
      const spanned = cardWidth * perView + gap * (perView - 1);
      if (Math.abs(spanned - rail.clientWidth) > 1) {
        throw new Error(
          `At ${window.innerWidth}px the rail must fit exactly ${perView} cards, got ${(rail.clientWidth + gap) / (cardWidth + gap)}`,
        );
      }
    }
    const firstMedia = firstCard.querySelector<HTMLElement>(
      '[data-slot="social-video-card-media"]',
    );
    const firstProducts = firstCard.querySelector<HTMLElement>(
      '[data-slot="social-video-card-products"]',
    );
    if (!firstMedia || !firstProducts) {
      throw new Error("Product social video card is incomplete");
    }

    const rootStyle = getComputedStyle(root);
    const mediaStyle = getComputedStyle(firstMedia);
    const productsStyle = getComputedStyle(firstProducts);
    if (window.innerWidth >= 1024) {
      if (rootStyle.borderTopWidth !== "1px") {
        throw new Error("Desktop gallery must have a 1px top divider");
      }
      if (mediaStyle.aspectRatio !== "3 / 4") {
        throw new Error(
          `Desktop product card media must use 3:4, got ${mediaStyle.aspectRatio}`,
        );
      }
      if (productsStyle.display === "none" || productsStyle.height !== "72px") {
        throw new Error("Desktop product card must show its 72px product footer");
      }
    }
  },
};

export const SingleProduct: Story = {
  tags: ["!dev", "!autodocs"],
  name: "Single Product",
  render: (_args, { globals }) => {
    const locale = localeFromGlobals(globals.locale);
    const card = createSocialVideoCards(locale).find(
      (item) => item.products?.length === 1,
    );
    if (!card) return null;
    return (
      <div className={styles.cardCanvas}>
        <SocialVideoCard {...card} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>(
      '[data-slot="social-video-card"]',
    );
    const platformIcon = canvasElement.querySelector<HTMLImageElement>(
      '[data-slot="social-video-card"] img[aria-hidden="true"]',
    );
    const platformStyle = platformIcon && getComputedStyle(platformIcon);
    if (
      !platformIcon ||
      !platformStyle ||
      platformStyle.backgroundColor !== "rgb(255, 255, 255)" ||
      Number.parseFloat(platformStyle.borderRadius) <
        platformIcon.getBoundingClientRect().height / 2
    ) {
      throw new Error(
        "Social platform icon must use a fully rounded white background",
      );
    }
    if (
      window.innerWidth < 1024 &&
      (!card || Math.abs(card.getBoundingClientRect().width - 240) > 1)
    ) {
      throw new Error("Mobile social video card must be 240px wide");
    }
  },
};

export const MultipleProducts: Story = {
  tags: ["!dev", "!autodocs"],
  name: "Multiple Products",
  render: (_args, { globals }) => {
    const locale = localeFromGlobals(globals.locale);
    const card = createSocialVideoCards(locale).find(
      (item) => (item.products?.length ?? 0) > 1,
    );
    if (!card) return null;
    return (
      <div className={styles.cardCanvas}>
        <SocialVideoCard {...card} />
      </div>
    );
  },
};

export const WithoutProducts: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const locale = localeFromGlobals(globals.locale);
    const card = createSocialVideoCards(locale).find(
      (item) => (item.products?.length ?? 0) === 0,
    );
    if (!card) return null;
    return (
      <div className={styles.cardCanvas}>
        <SocialVideoCard {...card} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const handle = canvasElement.querySelector<HTMLElement>(
      '[data-slot="social-video-card-media"] span',
    );
    const footerText = canvasElement.querySelector<HTMLElement>(
      '[data-footer-mode="text"] p',
    );
    if (!handle || getComputedStyle(handle).color !== "rgb(255, 255, 255)") {
      throw new Error("Social account text must remain white over video media");
    }
    if (
      (document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")) &&
      (!footerText ||
        getComputedStyle(footerText).color !== "rgb(255, 255, 255)")
    ) {
      throw new Error("Text-only card footer must use white text in dark mode");
    }
  },
};

export const MobileSingleProduct: Story = {
  ...SingleProduct,
  tags: ["!dev", "!autodocs"],
  name: "Mobile Single Product",
  globals: {
    viewport: { value: "yamiMobile", isRotated: false },
  },
};

export const MobileMultipleProducts: Story = {
  ...MultipleProducts,
  tags: ["!dev", "!autodocs"],
  name: "Mobile Multiple Products",
  globals: {
    viewport: { value: "yamiMobile", isRotated: false },
  },
};

export const MobileWithoutProducts: Story = {
  ...WithoutProducts,
  tags: ["!dev", "!autodocs"],
  globals: {
    viewport: { value: "yamiMobile", isRotated: false },
  },
};

export const Centered: Story = {
  tags: ["!dev", "!autodocs"],
  render: Showcase.render,
  args: { headingAlign: "center" },
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};

export const Pc: Story = {
  name: "PC",
  render: Showcase.render,
  play: import.meta.env.MODE === "test" ? Showcase.play : undefined,
  parameters: { viewport: { defaultViewport: "yamiDesktopLg" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiDesktopLg", isRotated: false } }
    : {},
};

export const Mobile: Story = {
  render: Showcase.render,
  parameters: { viewport: { defaultViewport: "yamiMobile" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiMobile", isRotated: false } }
    : {},
};
