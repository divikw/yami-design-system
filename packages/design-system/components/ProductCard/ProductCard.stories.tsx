import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProductCard } from "./ProductCard";
import { ProductCardAddButton } from "./ProductCardAddButton";
import type { ProductCardProps } from "./ProductCard.types";

type ProductLocale = "zh" | "en";

const meta = {
  id: "yami-components-commerce-productcard",
  title: "YAMI/Components/Commerce/Products/Product Card",
  component: ProductCard,
  decorators: [
    (Story, { args }) => (
      <div data-slot="product-card-canvas" style={{
        boxSizing: "border-box",
        minHeight: "100vh",
        padding: "var(--space-200)",
        background: args.surface === "card" ? "var(--background-secondary)" : "var(--background-primary)",
      }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "商品卡片，由图片、商品信息和价格优惠区域组成。PC、Mobile 使用同一组件，可通过 Controls 切换形态、背景及加购禁用状态。",
      },
    },
  },
  args: {
    presentation: "rich",
    addButtonDisabled: false,
    surface: "plain",
    image:
      "https://cdn.yamibuy.net/item/3ccf61fd74fd43320d647a1b8779a978_757x757.webp",
    imageAlt:
      "韩国TORRIDEN桃瑞丹 低分子玻尿酸啫喱面霜 爆水炸弹 冰淇淋面霜 焕发水润 100ml 补水舒缓保湿 强劲锁水〖23化解面霜NO.3〗",
    brand: "Torriden",
    brandHref: "https://www.yami.com/zh/b/torriden/9026",
    href: "https://www.yami.com/zh/p/low-molecular-hyaluronic-acid-soothing-cream-3-38-fl-oz/1022287761",
    title:
      "韩国TORRIDEN桃瑞丹 低分子玻尿酸啫喱面霜 爆水炸弹 冰淇淋面霜 焕发水润 100ml 补水舒缓保湿 强劲锁水〖23化解面霜NO.3〗",
    priceCurrent: "$17.59",
    priceOriginal: "$21.00",
    ranking: "乳液 面霜 加购榜 No.4",
    rating: 4.9,
    ratingCount: "8",
    soldCount: "周销 200+",
    badges: [{ label: "-16%", type: "discount" }],
  },
  argTypes: {
    presentation: { options: ["rich", "minimal", "compact"], control: "radio", description: "展示形态：完整卡片、图片为主或横向商品行。" },
    addButtonDisabled: { control: "boolean", description: "是否禁用卡片内的加购按钮。" },
    surface: {
      options: ["card", "plain"],
      control: { type: "inline-radio" },
      description:
        "plain 默认无外部内边距；card 在背景上增加 2px 内边距。",
    },
  },
} satisfies Meta<typeof ProductCard>;

const productsByLocale: Record<ProductLocale, ProductCardProps> = {
  zh: meta.args,
  en: {
    image:
      "https://cdn.yamibuy.net/item/3ccf61fd74fd43320d647a1b8779a978_757x757.webp",
    imageAlt:
      "Torriden Dive In Low Molecular Hyaluronic Acid Soothing Cream, 3.38 fl oz",
    brand: "Torriden",
    brandHref: "https://www.yami.com/en/b/torriden/9026",
    href: "https://www.yami.com/en/p/low-molecular-hyaluronic-acid-soothing-cream-3-38-fl-oz/1022287761",
    title: "Dive In Low Molecular Hyaluronic Acid Soothing Cream, 3.38 fl oz",
    priceCurrent: "$17.59",
    priceOriginal: "$21.00",
    ranking: "#4 Most in Cart Lotions & Creams",
    rating: 4.9,
    ratingCount: "8",
    soldCount: "200+ Sold",
    badges: [{ label: "-16%", type: "discount" }],
  },
};

function getProduct(locale: unknown) {
  return productsByLocale[locale === "en" ? "en" : "zh"];
}

export default meta;
type Story = StoryObj<typeof meta>;

const gridStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-300)",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 200px))",
  width: "min(920px, 100%)",
  fontFamily: "var(--font-family-ios)",
};

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const product = getProduct(globals.locale);

    return (
      <div style={gridStyle}>
        <ProductCard {...product} onAddToCart={() => {}} />
        <ProductCard {...product} onAddToCart={() => {}} />
        <ProductCard {...product} onAddToCart={() => {}} />
        <ProductCard {...product} onAddToCart={() => {}} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card"]',
    );
    const content = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-content"]',
    );
    if (!root || !content) throw new Error("ProductCard content did not render");
    const rootStyle = getComputedStyle(root);
    if (
      root.dataset.surface !== "plain" ||
      rootStyle.padding !== "0px"
    ) {
      throw new Error("ProductCard must default to the plain surface without outer padding");
    }
    const contentStyle = getComputedStyle(content);
    if (
      contentStyle.paddingTop !== "8px" ||
      contentStyle.paddingRight !== "8px" ||
      contentStyle.paddingBottom !== "8px" ||
      contentStyle.paddingLeft !== "8px"
    ) {
      throw new Error("Standard ProductCard content padding must be 8px");
    }

    const brand = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-brand"]',
    );
    const brandStyle = brand ? getComputedStyle(brand) : null;
    if (
      !brandStyle ||
      brandStyle.fontSize !== "12px" ||
      brandStyle.lineHeight !== "14px"
    ) {
      throw new Error("ProductCard brand must use 12/14 at every viewport");
    }

    const ranking = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-ranking"]',
    );
    if (!ranking || getComputedStyle(ranking).height !== "24px") {
      throw new Error("ProductCard ranking row must be 24px high");
    }

    const slots = ["product-card-rating", "product-card-price"];

    for (const slot of slots) {
      const element = canvasElement.querySelector<HTMLElement>(
        `[data-slot="${slot}"]`,
      );
      if (!element)
        throw new Error(`ProductCard ${slot} specimen did not render`);

      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(
        rect.left + Math.min(rect.width / 2, 10),
        rect.top + rect.height / 2,
      );
      if (!hit || hit.closest("a")) {
        throw new Error(`ProductCard ${slot} is covered by a link hit target`);
      }
      if (getComputedStyle(element).fontVariantNumeric !== "normal") {
        throw new Error(`ProductCard ${slot} must use default proportional numerals`);
      }
      if (slot === "product-card-price") {
        const style = getComputedStyle(element);
        if (style.alignItems !== "center" || style.columnGap !== "4px") {
          throw new Error("ProductCard price row must center items with a 4px gap");
        }
      }
    }

    canvasElement.dataset.productCardHitTargetContract = "passed";
  },
};

export const Playground: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args, { globals }) => {
    const localized = getProduct(globals.locale);
    const overrides = Object.fromEntries(Object.entries(args).filter(([key, value]) =>
      JSON.stringify(value) !== JSON.stringify(meta.args[key as keyof typeof meta.args]),
    ));
    const product = { ...localized, ...overrides } as ProductCardProps;
    const compact = args.presentation === "compact";
    const width = compact ? 480 : globals.viewport?.value === "yamiMobile" ? 152 : 200;
    return (
      <div style={{ width: `min(${width}px, 100%)` }}>
        <ProductCard {...product} presentation={args.presentation} surface={args.surface} addButtonDisabled={args.addButtonDisabled} onAddToCart={() => {}} />
      </div>
    );
  },
};

export const WithBackground: Story = {
  tags: ["!dev", "!autodocs"],
  args: { surface: "card" },
  render: Playground.render,
};

export const WithoutBackground: Story = {
  tags: ["!dev", "!autodocs"],
  args: { surface: "plain" },
  render: Playground.render,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card"]',
    );
    if (!root || getComputedStyle(root).padding !== "0px") {
      throw new Error("Plain ProductCard outer padding must be 0px");
    }
  },
};

export const LongContent: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const product = getProduct(globals.locale);

    return (
      <div style={{ width: 180 }}>
        <ProductCard {...product} onAddToCart={() => {}} />
      </div>
    );
  },
};

export const Horizontal: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const product = getProduct(globals.locale);

    return (
      <div style={{ width: "min(480px, 100%)" }}>
        <ProductCard
          {...product}
          presentation="compact"
          onAddToCart={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card"]',
    );
    const media = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-media"]',
    );
    const content = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-content"]',
    );
    const priceActionRow = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-price-action-row"]',
    );
    const price = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-price"]',
    );
    const quickAdd = canvasElement.querySelector<HTMLElement>(
      '[data-slot="product-card-quick-add"]',
    );

    if (!root || !media || !content || !priceActionRow || !price || !quickAdd) {
      throw new Error("Horizontal ProductCard anatomy did not render");
    }

    const mediaRect = media.getBoundingClientRect();
    const priceRect = price.getBoundingClientRect();
    const quickAddRect = quickAdd.getBoundingClientRect();
    const contentStyle = getComputedStyle(content);
    if (
      getComputedStyle(root).flexDirection !== "row" ||
      mediaRect.width !== 132 ||
      mediaRect.height !== 132 ||
      contentStyle.flexGrow !== "1" ||
      contentStyle.paddingTop !== "0px" ||
      contentStyle.paddingRight !== "0px" ||
      contentStyle.paddingBottom !== "0px" ||
      contentStyle.paddingLeft !== "0px" ||
      getComputedStyle(priceActionRow).display !== "flex" ||
      priceRect.bottom <= quickAddRect.top ||
      quickAddRect.bottom <= priceRect.top
    ) {
      throw new Error(
        "Horizontal ProductCard must use 132px media, flexible content, and one price-action row",
      );
    }
  },
};

export const AdaptiveSalesLabel: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const product = {
      ...getProduct(globals.locale),
      ratingCount: "1,888",
      soldCount: globals.locale === "en" ? "140+ Sold" : "周销 140+",
    };

    return (
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div data-slot="wide-product-card" style={{ width: 200 }}>
          <ProductCard {...product} />
        </div>
        <div data-slot="narrow-product-card" style={{ width: 120 }}>
          <ProductCard {...product} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const cardParts = (slot: string) => {
      const card = canvasElement.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
      const row = card?.querySelector<HTMLElement>(
        '[data-slot="product-card-rating-sold"]',
      );
      const rating = card?.querySelector<HTMLElement>(
        '[data-slot="product-card-rating"]',
      );
      const sold = card?.querySelector<HTMLElement>(
        '[data-slot="product-card-sold"]',
      );
      if (!row || !rating || !sold) {
        throw new Error(`${slot} sales row did not render`);
      }
      return { row, rating, sold };
    };
    const isVisuallyInside = ({ row, sold }: ReturnType<typeof cardParts>) => {
      const rowRect = row.getBoundingClientRect();
      const soldRect = sold.getBoundingClientRect();
      return soldRect.top < rowRect.bottom && soldRect.bottom > rowRect.top;
    };

    const wide = cardParts("wide-product-card");
    const narrow = cardParts("narrow-product-card");
    if (
      getComputedStyle(wide.row).columnGap !== "2px" ||
      getComputedStyle(wide.rating).columnGap !== "0px"
    ) {
      throw new Error("ProductCard rating gaps must be 2px and 0px");
    }
    if (!isVisuallyInside(wide) || isVisuallyInside(narrow)) {
      throw new Error(
        "ProductCard must show a fitting sales label and hide one that wraps",
      );
    }
  },
};

export const PresentationMatrix: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => {
    const product = getProduct(globals.locale);

    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-300)",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          width: "min(960px, 100%)",
        }}
      >
        <ProductCard
          {...product}
          presentation="rich"
          onAddToCart={() => {}}
        />
        <ProductCard
          {...product}
          presentation="minimal"
          onAddToCart={() => {}}
        />
        <ProductCard
          {...product}
          presentation="compact"
          onAddToCart={() => {}}
        />
      </div>
    );
  },
};

export const DisabledAddButton: Story = {
  tags: ["!dev", "!autodocs"],
  render: (_args, { globals }) => (
    <div>
      <ProductCardAddButton disabled />
      {(["rich", "minimal", "compact"] as const).map((presentation) => (
        <ProductCard key={presentation} {...getProduct(globals.locale)} presentation={presentation} addButtonDisabled onAddToCart={() => { throw new Error("Disabled quick add must not fire"); }} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const buttons = canvasElement.querySelectorAll<HTMLButtonElement>("button");
    if (buttons.length !== 4 || Array.from(buttons).some((button) => !button.disabled)) {
      throw new Error("All ProductCard presentations must disable quick add");
    }
    buttons.forEach((button) => button.click());
  },
};


export const PC: Story = {
  name: "PC",
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
  render: Playground.render,
};

export const Mobile: Story = {
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  render: Playground.render,
};
