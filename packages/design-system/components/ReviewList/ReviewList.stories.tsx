import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReviewList } from "./ReviewList";
import type { ReviewListProps } from "./ReviewList.types";

import styles from "./ReviewList.stories.module.css";
import {
  createReviewListProps,
  type ReviewListLocale,
} from "./fixtures";

type ReviewListStoryArgs = ReviewListProps & { showProduct: boolean };

function localeFromGlobals(value: unknown): ReviewListLocale {
  return value === "zh" ? "zh" : "en";
}

const meta = {
  id: "yami-components-commerce-review-list",
  title: "YAMI/Modules/Commerce/Review List",
  component: ReviewList,
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
          "响应式用户评论列表，复用 ProductList 的标题结构，通过 ReviewCard 展示评分、评论、用户昵称及可选关联商品。省略每条评论的 product 可展示纯评论；预览中可通过 showProduct 切换。",
      },
      source: {
        language: "tsx",
        code: `import { ReviewList } from "@yami/design-system";
import { createReviewListProps } from "@yami/design-system/components/ReviewList/fixtures";

<ReviewList {...createReviewListProps()} />`,
      },
    },
  },
  argTypes: {
    showProduct: {
      control: { type: "boolean" },
      description: "预览是否显示关联商品。关闭后仅展示评分、评论和用户昵称；实际使用时省略评论数据中的 product。",
    },
    mobileSurface: {
      options: ["card", "plain"],
      control: { type: "radio" },
      description:
        "移动端外观：card 为内缩圆角面板；plain 为通栏布局，内容内边距 16px，并支持分割线。",
    },
    dividerPosition: {
      options: ["top", "bottom", "none"],
      control: { type: "radio" },
      description:
        "分割线位置。PC 始终支持，Mobile 仅 plain 外观支持。",
    },
    dividerVariant: {
      options: ["gray", "black"],
      control: { type: "radio" },
      description: "gray 为 1px 灰色分割线；black 为 2px 强调分割线。",
    },
  },
  args: {
    ...createReviewListProps(),
    showProduct: true,
    mobileSurface: "card",
    dividerPosition: "top",
    dividerVariant: "gray",
  },
} satisfies Meta<ReviewListStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args, { globals }) => {
    const { showProduct, ...componentArgs } = args;
    const localized = createReviewListProps(localeFromGlobals(globals.locale));
    const overrides = Object.fromEntries(
      Object.entries(componentArgs).filter(([key, value]) =>
        JSON.stringify(value) !== JSON.stringify(meta.args[key as keyof typeof meta.args]),
      ),
    );
    const props = { ...localized, ...overrides } as ReviewListProps;
    return (
      <ReviewList
        {...props}
        reviews={showProduct ? props.reviews : props.reviews.map((review) => ({ ...review, product: undefined }))}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list"]',
    );
    const heading = root?.querySelector('[data-slot="review-list-title"]');
    const rail = root?.querySelector<HTMLElement>(
      '[data-slot="review-list-items"]',
    );
    const container = root?.querySelector<HTMLElement>(
      '[data-slot="review-list-container"]',
    );
    const cards = root?.querySelectorAll('[data-slot="review-card"]');
    const railNavigation = root?.querySelector('[data-slot="rail-navigation"]');

    if (
      !root ||
      !heading ||
      !rail ||
      !container ||
      !cards ||
      cards.length !== 3 ||
      railNavigation
    ) {
      throw new Error(
        "ReviewList must render its shared heading, rail and three Figma review cards",
      );
    }

    if (
      !root.textContent?.includes("It feels so gentle") ||
      !root.textContent.includes("Vien L***") ||
      !root.textContent.includes("❤️❤️❤️❤️")
    ) {
      throw new Error("ReviewList is missing the Figma review content");
    }

    const rating = root.querySelector('[data-slot="review-card-rating"]');
    const productImages = root.querySelectorAll("[data-slot=\"review-card-product\"] img");
    if (!rating || rating.getAttribute("aria-label") !== "Rating 4.5 out of 5") {
      throw new Error("ReviewCard must expose its rating to assistive technology");
    }
    const halfStar = rating.querySelector('[data-star-state="half"]');
    if (
      !halfStar ||
      !getComputedStyle(halfStar, "::after").clipPath.includes("50%")
    ) {
      throw new Error("ReviewCard must render the half star from the full icon shape");
    }
    const starStyles = getComputedStyle(halfStar);
    const cardStyles = getComputedStyle(cards[1] as HTMLElement);
    const reviewCopy = root.querySelector<HTMLElement>(
      '[data-slot="review-card-content"]',
    );
    const reviewerCopy = root.querySelector<HTMLElement>(
      '[data-slot="review-card-reviewer"]',
    );
    const productFooter = root.querySelector<HTMLElement>(
      '[data-slot="review-card-product"]',
    );
    const reviewStyles = reviewCopy ? getComputedStyle(reviewCopy) : null;
    const reviewerStyles = reviewerCopy ? getComputedStyle(reviewerCopy) : null;
    const productFooterStyles = productFooter
      ? getComputedStyle(productFooter)
      : null;
    if (
      starStyles.width !== "16px" ||
      starStyles.height !== "16px" ||
      cardStyles.paddingTop !== "12px" ||
      cardStyles.borderRadius !== "8px" ||
      !reviewStyles ||
      reviewStyles.fontSize !== "14px" ||
      reviewStyles.height !== "60px" ||
      reviewStyles.lineHeight !== "20px" ||
      reviewStyles.paddingLeft !== "4px" ||
      reviewStyles.paddingRight !== "4px" ||
      !reviewerStyles ||
      reviewerStyles.paddingLeft !== "4px" ||
      reviewerStyles.paddingRight !== "4px" ||
      !productFooterStyles ||
      productFooterStyles.paddingTop !== "4px" ||
      productFooterStyles.paddingRight !== "8px" ||
      productFooterStyles.paddingBottom !== "4px" ||
      productFooterStyles.paddingLeft !== "4px" ||
      productFooterStyles.borderRadius !== "4px" ||
      getComputedStyle(productImages[0] as HTMLElement).borderRadius !== "2px"
    ) {
      throw new Error(
        "ReviewCard must use the approved card, rating, copy and product-footer spacing",
      );
    }
    if (productImages.length !== 3) {
      throw new Error("ReviewCard must render one product image per review");
    }

    if (window.innerWidth >= 1024) {
      const rootStyles = getComputedStyle(root);
      if (
        rootStyles.borderTopWidth !== "1px" ||
        rootStyles.borderBottomWidth !== "0px"
      ) {
        throw new Error(
          "ReviewList must render its default gray divider on the desktop top edge",
        );
      }
      if (getComputedStyle(container).rowGap !== "16px") {
        throw new Error("ReviewList desktop heading gap must be 16px");
      }
      const firstCard = cards[0] as HTMLElement;
      const gap = Number.parseFloat(getComputedStyle(rail).columnGap);
      const visibleCount = window.innerWidth >= 1920 ? 4 : 3;
      const expected =
        firstCard.getBoundingClientRect().width * visibleCount +
        gap * (visibleCount - 1);
      if (Math.abs(expected - rail.clientWidth) > 2) {
        throw new Error(
          `ReviewList desktop rail must fit ${visibleCount} cards, got ${expected.toFixed(1)}px for a ${rail.clientWidth}px rail`,
        );
      }
    }
  },
};

export const BlackBottomDivider: Story = {
  tags: ["!dev", "!autodocs"],
  args: {
    dividerPosition: "bottom",
    dividerVariant: "black",
  },
  render: Showcase.render,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list"]',
    );
    if (!root) throw new Error("ReviewList did not render");
    const style = getComputedStyle(root);
    if (style.borderBottomWidth !== "2px" || style.borderTopWidth !== "0px") {
      throw new Error(
        "ReviewList black divider must render 2px on the bottom edge only",
      );
    }
  },
};

export const PC: Story = {
  ...Showcase,
  tags: ["dev", "autodocs"],
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};

export const Mobile: Story = {
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  render: Showcase.render,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list"]',
    );
    const rail = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list-items"]',
    );
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list-container"]',
    );
    const viewAll = canvasElement.querySelector(
      '[data-slot="review-list-view-all-mobile"]',
    );
    const railNavigation = canvasElement.querySelector<HTMLElement>(
      '[data-slot="rail-navigation"]',
    );
    const firstItem = rail?.querySelector<HTMLElement>("li");

    if (
      !root ||
      !rail ||
      !container ||
      !railNavigation ||
      !firstItem
    ) {
      throw new Error("ReviewList mobile rail did not render");
    }

    const rootStyles = getComputedStyle(root);
    const containerStyles = getComputedStyle(container);
    const railStyles = getComputedStyle(rail);
    const railNavigationStyles = getComputedStyle(railNavigation);
    const canvas = root.parentElement;
    const canvasStyles = canvas ? getComputedStyle(canvas) : null;
    const cardStyles = getComputedStyle(
      firstItem.querySelector<HTMLElement>('[data-slot="review-card"]')!,
    );
    const itemWidth = firstItem.getBoundingClientRect().width;
    if (
      rootStyles.marginLeft !== "8px" ||
      rootStyles.marginRight !== "8px" ||
      root.dataset.mobileSurface !== "card" ||
      rootStyles.borderTopWidth !== "0px" ||
      rootStyles.borderBottomWidth !== "0px" ||
      !canvasStyles ||
      canvasStyles.paddingTop !== "8px" ||
      canvasStyles.backgroundColor !== "rgb(245, 245, 245)" ||
      containerStyles.rowGap !== "8px" ||
      itemWidth !== 344 ||
      cardStyles.borderRadius !== "8px" ||
      viewAll !== null ||
      railNavigationStyles.display !== "none" ||
      railStyles.paddingLeft !== "8px" ||
      railStyles.paddingRight !== "8px" ||
      railStyles.paddingTop !== "0px" ||
      railStyles.paddingBottom !== "0px"
    ) {
      throw new Error(
        "ReviewList mobile must use the shared mobile heading, gray canvas, and 344px cards",
      );
    }
  },
};

export const MobilePlain: Story = {
  name: "Mobile / Plain",
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  args: {
    mobileSurface: "plain",
    dividerPosition: "top",
    dividerVariant: "gray",
  },
  render: Showcase.render,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="review-list"]',
    );
    const rail = root?.querySelector<HTMLElement>(
      '[data-slot="review-list-items"]',
    );
    const container = root?.querySelector<HTMLElement>(
      '[data-slot="review-list-container"]',
    );
    const firstItem = rail?.querySelector<HTMLElement>("li");
    if (!root || !rail || !container || !firstItem) {
      throw new Error("Plain mobile ReviewList did not render");
    }

    const rootStyle = getComputedStyle(root);
    const railStyle = getComputedStyle(rail);
    const containerStyle = getComputedStyle(container);
    const rootRect = root.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    if (
      root.dataset.mobileSurface !== "plain" ||
      rootRect.left !== 0 ||
      rootRect.right !== window.innerWidth ||
      rootStyle.marginLeft !== "0px" ||
      rootStyle.marginRight !== "0px" ||
      rootStyle.borderRadius !== "0px" ||
      rootStyle.borderTopWidth !== "1px" ||
      rootStyle.borderBottomWidth !== "0px" ||
      containerStyle.paddingTop !== "16px" ||
      containerStyle.paddingRight !== "16px" ||
      containerStyle.paddingBottom !== "16px" ||
      containerStyle.paddingLeft !== "16px" ||
      containerStyle.rowGap !== "8px" ||
      railRect.left !== 0 ||
      railRect.right !== window.innerWidth ||
      firstItem.getBoundingClientRect().left !== 16 ||
      firstItem.getBoundingClientRect().width !== 344 ||
      railStyle.columnGap !== "8px" ||
      railStyle.marginLeft !== "-16px" ||
      railStyle.marginRight !== "-16px" ||
      railStyle.paddingLeft !== "16px" ||
      railStyle.paddingRight !== "16px" ||
      railStyle.paddingTop !== "0px" ||
      railStyle.paddingBottom !== "0px" ||
      railStyle.scrollPaddingInline !== "16px" ||
      rail.scrollWidth <= rail.clientWidth
    ) {
      throw new Error(
        "Plain mobile ReviewList must be full-bleed with square corners and 16px content insets",
      );
    }
  },
};

export const WithoutProduct: Story = {
  tags: ["!dev", "!autodocs"],
  args: { showProduct: false },
  render: Showcase.render,
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[data-slot="review-card"]');
    if (cards.length !== 3 || canvasElement.querySelector('[data-slot="review-card-product"]')) {
      throw new Error("Without-product reviews must retain all cards and omit product footers");
    }
    for (const card of cards) {
      for (const slot of ["rating", "content", "reviewer"]) {
        if (!card.querySelector(`[data-slot="review-card-${slot}"]`)?.textContent?.trim() && slot !== "rating") {
          throw new Error("Without-product reviews must preserve their review content and reviewer");
        }
      }
      if (!card.querySelector('[data-slot="review-card-rating"]')) {
        throw new Error("Without-product reviews must preserve their rating");
      }
    }
  },
};

export const MobileWithoutProduct: Story = {
  ...WithoutProduct,
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
