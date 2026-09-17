import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeProductList } from "./ThemeProductList";
import { createThemeProductListProps } from "./fixtures";
import storyStyles from "./ThemeProductList.stories.module.css";

const meta = {
  id: "yami-components-commerce-theme-product-list",
  title: "YAMI/Modules/Commerce/Theme Product List",
  component: ThemeProductList,
  decorators: [
    (Story) => (
      <div className={storyStyles.canvas}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "主题商品列表：PC 首部使用两个商品卡片宽度展示主题图片及文字，后接商品列表；Mobile 将主题内容置于商品列表上方。",
      },
      source: {
        language: "tsx",
        code: `import { ThemeProductList } from "@yami/design-system";
import { createThemeProductListProps } from "@yami/design-system/components/ThemeProductList/fixtures";

<ThemeProductList {...createThemeProductListProps()} />`,
      },
    },
  },
  argTypes: {
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
    ...createThemeProductListProps(),
    mobileSurface: "card",
    dividerPosition: "top",
    dividerVariant: "gray",
  },
} satisfies Meta<typeof ThemeProductList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const themeList = canvasElement.querySelector<HTMLElement>(
      '[data-slot="theme-product-list"]',
    );
    const list = themeList?.querySelector<HTMLElement>(
      '[data-slot="product-list-items"]',
    );
    const desktopContent = list?.querySelector<HTMLElement>(
      '[data-slot="theme-product-list-content"]',
    );
    const mobileContent = themeList?.querySelector<HTMLElement>(
      '[data-slot="product-list-leading-content-mobile"] [data-slot="theme-product-list-content"]',
    );
    const content = window.innerWidth < 1024 ? mobileContent : desktopContent;
    const image = content?.querySelector<HTMLImageElement>("img");
    const overlay = content?.querySelector<HTMLElement>(
      '[data-slot="theme-product-list-overlay"]',
    );
    const scrim = content?.querySelector<HTMLElement>(
      '[data-slot="theme-product-list-scrim"]',
    );
    const contentTitle = overlay?.querySelector<HTMLElement>("h3");
    const contentDescription = overlay?.querySelector<HTMLElement>("p");

    if (
      !themeList ||
      !list ||
      !content ||
      !image ||
      !overlay ||
      !scrim ||
      !contentTitle ||
      !contentDescription
    ) {
      throw new Error(
        "ThemeProductList must render its content panel, image, overlay and product rail",
      );
    }
    if (!image.alt.trim() || !overlay.textContent?.includes("Start Fresh")) {
      throw new Error("ThemeProductList content requires meaningful copy and alt text");
    }
    const contentStyle = getComputedStyle(content);
    const scrimStyle = getComputedStyle(scrim);
    const scrimBox = scrim.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    const overlayBox = overlay.getBoundingClientRect();
    const overlayStyle = getComputedStyle(overlay);
    const expectedOverlayHeight =
      contentTitle.getBoundingClientRect().height +
      contentDescription.getBoundingClientRect().height +
      Number.parseFloat(overlayStyle.rowGap) +
      Number.parseFloat(overlayStyle.paddingTop) +
      Number.parseFloat(overlayStyle.paddingBottom);
    if (
      scrim.dataset.adaptiveImageScrim !== "true" ||
      scrim.parentElement !== overlay ||
      Math.abs(scrimBox.width - overlayBox.width) > 1 ||
      Math.abs(scrimBox.height - overlayBox.height) > 1 ||
      (window.innerWidth < 1024
        ? Math.abs(scrimBox.height - contentBox.height) > 1
        : scrimBox.height >= contentBox.height ||
          Math.abs(overlayBox.height - expectedOverlayHeight) > 1) ||
      (window.innerWidth < 1024
        ? scrimStyle.backgroundColor !== "rgba(0, 0, 0, 0.29)" ||
          scrimStyle.backdropFilter !== "none" ||
          scrimStyle.maskImage !== "none"
        : !scrimStyle.backgroundImage.includes("linear-gradient") ||
          !contentStyle
            .getPropertyValue("--adaptive-image-scrim-surface-color")
            .trim() ||
          scrimStyle.backdropFilter !== "blur(16px)" ||
          !scrimStyle.maskImage.includes("linear-gradient"))
    ) {
      throw new Error(
        "ThemeProductList scene art must use the mobile brand scrim and preserve the adaptive desktop scrim",
      );
    }
    if (!content.matches('[data-foreground="light"], [data-foreground="dark"]')) {
      throw new Error(
        "ThemeProductList scene art must expose the sampled foreground contrast",
      );
    }
    if (
      window.innerWidth < 1024 &&
      (overlayStyle.paddingTop !== "40px" ||
        overlayStyle.paddingRight !== "8px" ||
        overlayStyle.paddingBottom !== "8px" ||
        overlayStyle.paddingLeft !== "8px")
    ) {
      throw new Error(
        "ThemeProductList mobile content must use 40px top and 8px inline and bottom padding",
      );
    }
    const expectedTitleSize =
      window.innerWidth < 1024
        ? "14px"
        : "18px";
    const expectedTitleLineHeight =
      window.innerWidth < 1024
        ? "20px"
        : "24px";
    const titleStyle = getComputedStyle(contentTitle);
    if (
      titleStyle.fontSize !== expectedTitleSize ||
      titleStyle.lineHeight !== expectedTitleLineHeight
    ) {
      throw new Error(
        `ThemeProductList content title must use ${expectedTitleSize}/${expectedTitleLineHeight}`,
      );
    }
    const descriptionStyle = getComputedStyle(contentDescription);
    const expectedDescriptionSize = "14px";
    const expectedDescriptionLineHeight = "20px";
    if (
      descriptionStyle.fontSize !== expectedDescriptionSize ||
      descriptionStyle.lineHeight !== expectedDescriptionLineHeight ||
      descriptionStyle.fontWeight !== "400"
    ) {
      throw new Error(
        `ThemeProductList description must use regular ${expectedDescriptionSize}/${expectedDescriptionLineHeight}`,
      );
    }
    if (list.firstElementChild?.getAttribute("data-slot") !== "product-list-leading-content") {
      throw new Error("ThemeProductList content must reserve the first rail position");
    }

    const productItems = list.querySelectorAll<HTMLElement>(
      '[data-slot="product-list-item"]',
    );
    const firstProductCard = productItems[0]?.querySelector<HTMLElement>(
      '[data-slot="product-card"]',
    );
    if (
      productItems.length === 0 ||
      !firstProductCard ||
      list.dataset.surface !== "plain" ||
      firstProductCard.dataset.surface !== "plain" ||
      getComputedStyle(firstProductCard).padding !== "0px"
    ) {
      throw new Error("ThemeProductList must continue with ProductList products");
    }

    const productText = list.textContent ?? "";
    if (
      !productText.includes("#10 Most Liked Makeup Remover") ||
      !productText.includes("80+ Sold") ||
      !productText.includes("30+ Sold") ||
      !list.querySelector('[data-slot="product-card-badges"]')
    ) {
      throw new Error(
        "ThemeProductList must expose the live ANUA product signals",
      );
    }

    if (window.innerWidth >= 1024) {
      const card = productItems[0];
      if (!card) throw new Error("ThemeProductList rendered no product card");
      const gap = Number.parseFloat(getComputedStyle(list).columnGap);
      const contentWidth = content.getBoundingClientRect().width;
      const cardWidth = card.getBoundingClientRect().width;
      if (Math.abs(contentWidth - (cardWidth * 2 + gap)) > 2) {
        throw new Error(
          `ThemeProductList content must span two cards plus one gap, got ${contentWidth.toFixed(1)}px for ${cardWidth.toFixed(1)}px cards`,
        );
      }

      const container = themeList.querySelector<HTMLElement>(
        '[data-slot="product-list-container"]',
      );
      if (!container || container.getBoundingClientRect().width > 1441) {
        throw new Error("ThemeProductList desktop content must cap at 1440px");
      }
      if (getComputedStyle(list).scrollSnapType !== "none") {
        throw new Error(
          "ThemeProductList desktop must keep its image-led start stable during resize",
        );
      }
    } else {
      const canvas = themeList.parentElement;
      const canvasStyles = canvas ? getComputedStyle(canvas) : null;
      const mobileWrapper = themeList.querySelector<HTMLElement>(
        '[data-slot="product-list-leading-content-mobile"]',
      );
      const desktopWrapper = list.querySelector<HTMLElement>(
        '[data-slot="product-list-leading-content"]',
      );
      const firstProduct = list.querySelector<HTMLElement>(
        '[data-slot="product-list-item"]',
      );
      const container = themeList.querySelector<HTMLElement>(
        '[data-slot="product-list-container"]',
      );
      const listStyles = getComputedStyle(list);
      if (
        !mobileWrapper ||
        !desktopWrapper ||
        !firstProduct ||
        !container ||
        !canvasStyles ||
        canvasStyles.backgroundColor !== "rgb(245, 245, 245)" ||
        getComputedStyle(container).rowGap !== "12px" ||
        getComputedStyle(mobileWrapper).display === "none" ||
        getComputedStyle(desktopWrapper).display !== "none" ||
        Math.abs(firstProduct.getBoundingClientRect().top -
          mobileWrapper.getBoundingClientRect().bottom - 8) > 1 ||
        listStyles.paddingTop !== "4px" ||
        listStyles.paddingRight !== "8px" ||
        listStyles.paddingBottom !== "4px" ||
        listStyles.paddingLeft !== "8px"
      ) {
        throw new Error(
          "ThemeProductList mobile must use a 12px container gap and an 8px panel-to-card gap above a 4px/8px padded product rail",
        );
      }
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
  play: Showcase.play,
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
  play: async ({ canvasElement }) => {
    const themeList = canvasElement.querySelector<HTMLElement>(
      '[data-slot="theme-product-list"]',
    );
    const root = themeList?.querySelector<HTMLElement>(
      '[data-slot="product-list"]',
    );
    const container = root?.querySelector<HTMLElement>(
      '[data-slot="product-list-container"]',
    );
    const tabs = root?.querySelector<HTMLElement>('[role="tablist"]');
    const mobileContent = root?.querySelector<HTMLElement>(
      '[data-slot="product-list-leading-content-mobile"]',
    );
    const list = root?.querySelector<HTMLElement>(
      '[data-slot="product-list-items"]',
    );
    const firstProduct = list?.querySelector<HTMLElement>(
      '[data-slot="product-list-item"]',
    );
    const firstCard = firstProduct?.querySelector<HTMLElement>(
      '[data-slot="product-card"]',
    );
    if (
      !themeList ||
      !root ||
      !container ||
      !tabs ||
      !mobileContent ||
      !list ||
      !firstProduct ||
      !firstCard
    ) {
      throw new Error("Plain mobile ThemeProductList did not render");
    }

    const rootStyle = getComputedStyle(root);
    const containerStyle = getComputedStyle(container);
    const listStyle = getComputedStyle(list);
    const rootRect = root.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (
      root.dataset.mobileSurface !== "plain" ||
      rootRect.left !== 0 ||
      rootRect.right !== window.innerWidth ||
      rootStyle.marginLeft !== "0px" ||
      rootStyle.marginRight !== "0px" ||
      rootStyle.borderRadius !== "0px" ||
      rootStyle.borderTopWidth !== "1px" ||
      rootStyle.borderBottomWidth !== "0px" ||
      containerStyle.padding !== "16px" ||
      tabs.getBoundingClientRect().left !== 0 ||
      tabs.getBoundingClientRect().right !== window.innerWidth ||
      mobileContent.getBoundingClientRect().left !== 16 ||
      mobileContent.getBoundingClientRect().right !== window.innerWidth - 16 ||
      listRect.left !== 0 ||
      listRect.right !== window.innerWidth ||
      list.dataset.surface !== "plain" ||
      firstProduct.getBoundingClientRect().left !== 16 ||
      Math.abs(firstProduct.getBoundingClientRect().top -
        mobileContent.getBoundingClientRect().bottom - 8) > 1 ||
      listStyle.columnGap !== "8px" ||
      listStyle.marginLeft !== "-16px" ||
      listStyle.marginRight !== "-16px" ||
      listStyle.paddingTop !== "4px" ||
      listStyle.paddingRight !== "16px" ||
      listStyle.paddingBottom !== "4px" ||
      listStyle.paddingLeft !== "16px" ||
      listStyle.scrollPaddingInline !== "16px" ||
      firstCard.dataset.surface !== "plain" ||
      getComputedStyle(firstCard).padding !== "0px" ||
      list.scrollWidth <= list.clientWidth
    ) {
      throw new Error(
        "Plain mobile ThemeProductList must use the shared full-bleed ProductList surface",
      );
    }
  },
};
