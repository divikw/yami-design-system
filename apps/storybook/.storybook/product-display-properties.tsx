import type { CSSProperties } from "react";
import { HorizontalScrollList } from "@yami/design-system/components/HorizontalScrollList";
import { ProductCard, type ProductCardProps } from "@yami/design-system/components/ProductCard";
import { ProductList, type ProductListProps } from "@yami/design-system/components/ProductList";
import { createProductListProducts, productListCopy } from "../../../packages/design-system/components/ProductList/fixtures";
import { createThemeProductListProps } from "../../../packages/design-system/components/ThemeProductList/fixtures";
import type { DocsLocale } from "./component-docs-template";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";
import styles from "./product-display-docs.module.css";

const banner = new URL("../../../packages/design-system/components/ProductList/assets/mega-saver-banner.webp", import.meta.url).href;
const mobileBanner = new URL("../../../packages/design-system/components/ProductList/assets/campaign-banner-mobile.png", import.meta.url).href;
const desktopBackdrop = new URL("../../../packages/design-system/components/ProductList/assets/atmospheric-pc.jpg", import.meta.url).href;
const mobileBackdrop = new URL("../../../packages/design-system/components/ProductList/assets/atmospheric-mobile.jpg", import.meta.url).href;

const previewProducts = (locale: DocsLocale) => createProductListProducts(locale).slice(0, 6);

const previewBackgrounds = {
  white: "var(--background-primary)",
  gray: "color-mix(in srgb, var(--background-primary), var(--background-secondary))",
};

const railContainerStyle = { containerType: "inline-size", width: "100%" } as const;
const railSizingRules = `[data-whole-card-rail] { padding: 0; }
@container (min-width: 280px) {
  [data-whole-card-rail] { --visible-rail-cards: 2; }
}
@container (min-width: 448px) {
  [data-whole-card-rail] { --visible-rail-cards: 3; }
}
@container (min-width: 640px) {
  [data-whole-card-rail] { --visible-rail-cards: 4; }
}`;

type ScrollListValues = {
  enabled: boolean;
  surface: "plain" | "card";
  background: "auto" | keyof typeof previewBackgrounds;
  staticLayout: "grid" | "masonry";
};

export const horizontalScrollListProperties: PropertiesDefinition<ScrollListValues> = {
  slug: "horizontalscrolllist",
  initialValues: () => ({ enabled: true, surface: "plain", background: "auto", staticLayout: "grid" }),
  fields({ enabled }, locale) {
    const zh = locale === "zh";
    const previewGroup = { key: "preview", title: zh ? "预览设置" : "Preview settings" } as const;
    return [
      { key: "enabled", label: zh ? "启用横向滚动" : "Enable horizontal scrolling", kind: "switch",
        description: zh ? "关闭后可在预览设置中选择网格或瀑布流。" : "Turn off scrolling to try a grid or masonry layout in Preview settings." },
      { key: "surface", label: zh ? "列表外观" : "List surface", kind: "select", options: ["plain", "card"],
        description: zh ? "card 为列表增加边缘留白，plain 使用通栏布局。" : "Use card for inset spacing or plain for a full-width rail." },
      ...(!enabled ? [{
        key: "staticLayout", name: "layout", label: zh ? "关闭滚动后的布局" : "Layout with scrolling off", kind: "select",
        options: ["grid", "masonry"], optionLabels: { grid: zh ? "网格" : "Grid", masonry: zh ? "不等高瀑布流" : "Masonry" },
        group: previewGroup,
        description: zh ? "通过调用方的 CSS 排列商品卡片。" : "Arrange product cards with CSS supplied by the host.",
      }] as const : []),
      { key: "background", name: "style.background", label: zh ? "预览背景" : "Preview background", kind: "select",
        type: "CSS background", options: ["auto", "white", "gray"],
        optionLabels: { auto: zh ? "跟随外观" : "Follow surface", white: zh ? "白底" : "White", gray: zh ? "灰底" : "Gray" },
        group: previewGroup,
        description: zh ? "默认 plain 用白底、card 用灰底，也可直接指定底色。"
          : "Defaults to white for plain and gray for card. Choose either background to override it." },
    ];
  },
  example({ enabled, staticLayout, ...values }, locale) {
    return horizontalScrollListExample({ ...values, layout: enabled ? "rail" : staticLayout }, locale);
  },
};

export function horizontalScrollListExample(
  { layout, surface, background }: Pick<ScrollListValues, "surface" | "background"> & {
    layout: "rail" | ScrollListValues["staticLayout"];
  },
  locale: DocsLocale,
) {
  const enabled = layout === "rail";
  const label = locale === "zh" ? "精选商品" : "Featured products";
  const listStyle = {
    width: "100%", margin: 0, gap: "var(--space-100)", listStyle: "none",
    ...{
      rail: { display: "flex" },
      grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 132px), 1fr))" },
      masonry: { columnCount: 2 },
    }[layout],
  };
  const itemStyles: Record<typeof layout, CSSProperties | undefined> = {
    rail: {
      flex: "0 0 calc((100% + var(--space-100)) / var(--visible-rail-cards, 1) - var(--space-100))",
      minWidth: 0,
      scrollSnapAlign: "start",
    },
    grid: undefined,
    masonry: { breakInside: "avoid", marginBlockEnd: "var(--space-100)" },
  };
  const itemStyle = itemStyles[layout];
  const products = layout === "masonry" ? createThemeProductListProps(locale).products : previewProducts(locale).slice(0, enabled ? 6 : 4);
  const attributes = jsxAttributes({ enabled, surface, "aria-label": label });
  const defaultBackground = surface === "card" ? "gray" : "white";
  const previewBackground = previewBackgrounds[background === "auto" ? defaultBackground : background];
  const containerCode = enabled ? ', containerType: "inline-size", width: "100%"' : "";
  const sizingCode = enabled ? "\n  <style>{`" + railSizingRules + "`}</style>" : "";
  const list = <HorizontalScrollList as="ul" enabled={enabled} surface={surface} aria-label={label}
    className={enabled ? undefined : styles.list} style={listStyle} data-whole-card-rail={enabled ? "" : undefined}>
    {products.map(({ id, ...product }) =>
      <li key={id} style={itemStyle}><ProductCard {...(product as ProductCardProps)} surface={surface} /></li>,
    )}
  </HorizontalScrollList>;
  return {
    previewBackground,
    fillContentWidth: enabled,
    ...jsxExample("HorizontalScrollList, ProductCard, type ProductCardProps", `<div style={{ background: "${previewBackground}"${containerCode} }}>${sizingCode}
  <HorizontalScrollList as="ul"${attributes}${enabled ? ' data-whole-card-rail=""' : " className={styles.list}"}
    style={${JSON.stringify(listStyle)}}
  >
    {products.map(({ id, ...product }) => (
      <li key={id}${itemStyle ? ` style={${JSON.stringify(itemStyle)}}` : ""}>
        <ProductCard {...(product as ProductCardProps)} surface="${surface}" />
      </li>
    ))}
  </HorizontalScrollList>
</div>`,
    enabled ? <div style={railContainerStyle}><style>{railSizingRules}</style>{list}</div> : list),
  };
}

type ProductCardValues = {
  presentation: NonNullable<ProductCardProps["presentation"]>;
  surface: NonNullable<ProductCardProps["surface"]>;
  brand: string;
  title: string;
  priceCurrent: string;
  priceOriginal: string;
  onSale: boolean;
  availability: NonNullable<ProductCardProps["availability"]>;
};

export const productCardProperties: PropertiesDefinition<ProductCardValues> = {
  slug: "productcard",
  stickyPreview: true,
  initialValues(locale) {
    const [product] = previewProducts(locale);
    return {
      presentation: "rich", surface: "plain", brand: String(product.brand ?? ""), title: String(product.title),
      priceCurrent: String(product.priceCurrent), priceOriginal: String(product.priceOriginal ?? ""), onSale: true,
      availability: "available",
    };
  },
  fields({ onSale, presentation }, locale) {
    const zh = locale === "zh";
    const group = { key: "required", title: zh ? "必填属性" : "Required" } as const;
    const saleLabel = zh ? "促销" : "On sale";
    return [
      { key: "brand", label: zh ? "品牌名称" : "Brand name", kind: "text", group,
        description: zh ? "显示在商品标题上方，使用示例的品牌链接。" : "Shown above the product title with the example's brand link." },
      { key: "title", label: zh ? "商品标题" : "Product title", kind: "text", group },
      ...(presentation !== "minimal" ? [{
        key: "onSale", label: saleLabel, kind: "switch",
        group,
        description: zh ? "开启时显示红色现价和划线原价，关闭时只显示黑色现价。"
          : "Shows the sale price in red with a struck-through original price. Turn off to show the current price alone.",
      }] as const : []),
      { key: "priceCurrent", label: zh ? "当前售价" : "Current price", kind: "text", group },
      ...(onSale && presentation !== "minimal" ? [{
        key: "priceOriginal", label: zh ? "原价" : "Original price", kind: "text", group, required: true,
        description: zh ? "开启促销时必填，显示为划线原价。" : "Required when on sale. Displayed as a struck-through original price.",
      }] as const : []),
      { key: "presentation", label: zh ? "卡片形态" : "Presentation", kind: "select", options: ["rich", "minimal", "compact"],
        description: zh ? "完整卡片、精简卡片或横向商品行。" : "Full card, image-led card, or compact product row." },
      { key: "surface", label: zh ? "卡片外观" : "Card surface", kind: "select", options: ["plain", "card"],
        description: zh ? "card 增加 2px 内边距，商品图使用白底，外层预览使用浅灰底。" : "Card adds a 2px inset. The product image has a white background within a light gray preview." },
      { key: "availability", label: zh ? "库存状态" : "Availability", kind: "select", options: ["available", "sold-out", "delisted"],
        optionLabels: { available: zh ? "有货" : "Available", "sold-out": zh ? "售完" : "Sold out", delisted: zh ? "已下架" : "Delisted" } },
    ];
  },
  example({ onSale, priceOriginal, ...values }, locale, device) {
    const zh = locale === "zh";
    const [{ id, ...product }] = previewProducts(locale);
    const props: ProductCardProps = {
      ...(product as ProductCardProps), ...values,
      priceOriginal: onSale && values.presentation !== "minimal" ? priceOriginal.trim() || product.priceOriginal : undefined,
      badges: onSale ? product.badges : product.badges?.filter(badge => badge.type !== "sale" && badge.type !== "discount"),
      brandHref: product.brandHref ?? "",
      availabilityLabel: values.availability === "sold-out" ? (zh ? "已售完" : "Sold out")
        : values.availability === "delisted" ? (zh ? "已下架" : "Delisted") : undefined,
      addButtonAriaLabel: zh ? "加入购物车" : "Add to cart",
    };
    const width = values.presentation === "compact" ? 480 : device === "Mobile" ? 152 : 200;
    return {
      previewBackground: previewBackgrounds[values.surface === "card" ? "gray" : "white"],
      ...jsxExample("ProductCard", `<ProductCard {...${JSON.stringify(props, null, 2)}} onAddToCart={handleAddToCart} />`,
        <div style={{ width: `min(${width}px, 100%)` }}><ProductCard key={id} {...props} onAddToCart={() => {}} /></div>),
    };
  },
};

type ProductListValues = {
  title: string;
  layout: NonNullable<ProductListProps["layout"]>;
  appearance: NonNullable<ProductListProps["appearance"]>;
  headingAlign: NonNullable<ProductListProps["headingAlign"]>;
  mobileSurface: NonNullable<ProductListProps["mobileSurface"]>;
  loading: boolean;
};

export const productListProperties: PropertiesDefinition<ProductListValues> = {
  slug: "productlist",
  fullWidth: "fluid",
  initialValues: locale => ({ title: productListCopy[locale].heading, layout: "rail", appearance: "standard",
    headingAlign: "start", mobileSurface: "card", loading: false }),
  fields(_values, locale, device) {
    const zh = locale === "zh";
    return [
      { key: "title", label: zh ? "列表标题" : "List title", kind: "text", group: { key: "required", title: zh ? "必填属性" : "Required" } },
      { key: "layout", label: zh ? "布局" : "Layout", kind: "select", options: ["rail", "waterfall"],
        optionLabels: { rail: zh ? "横向滚动" : "Horizontal rail", waterfall: zh ? "响应式网格" : "Responsive grid" } },
      { key: "appearance", label: zh ? "模块外观" : "Appearance", kind: "select", options: ["standard", "background", "themed", "themed-background", "atmospheric"],
        description: zh ? "主题外观提供横幅示例，氛围外观提供背景图示例。" : "Themed appearances include a banner. The atmospheric appearance includes a backdrop." },
      { key: "headingAlign", label: zh ? "标题对齐" : "Heading alignment", kind: "select", options: ["start", "center"] },
      ...(device === "Mobile" ? [{
        key: "mobileSurface", label: zh ? "移动端外观" : "Mobile surface", kind: "select", options: ["card", "plain"],
        description: zh ? "切换内缩卡片与通栏布局。" : "Switch between the inset card and full-width treatment.",
      }] as const : []),
      { key: "loading", label: zh ? "加载状态" : "Loading state", kind: "switch",
        description: zh ? "显示与当前布局匹配的骨架屏。" : "Show the skeleton for the current layout." },
    ];
  },
  example({ appearance, ...values }, locale, device) {
    const copy = productListCopy[locale];
    const basic = { ...values, products: previewProducts(locale), loadingLabel: copy.loading };
    const props: ProductListProps = appearance === "themed" || appearance === "themed-background"
      ? { ...basic, appearance, banner: { src: banner, mobileSrc: mobileBanner, alt: copy.bannerAlt } }
      : appearance === "atmospheric"
        ? { ...basic, appearance, backgroundImage: desktopBackdrop, backgroundImageMobile: mobileBackdrop }
        : appearance === "background"
          ? { ...basic, appearance, backgroundColor: "var(--brand-tertiary)" }
          : { ...basic, appearance };
    const attributes = jsxAttributes({ ...values, appearance, loadingLabel: copy.loading });
    const artwork = "banner" in props && props.banner
      ? `\n  banner={{ src: bannerDesktop, mobileSrc: bannerMobile, alt: ${JSON.stringify(copy.bannerAlt)} }}`
      : props.appearance === "atmospheric"
        ? "\n  backgroundImage={backdropDesktop}\n  backgroundImageMobile={backdropMobile}"
        : jsxAttributes({ backgroundColor: props.backgroundColor });
    const pc = device === "PC";
    const previewProps = !pc ? props
      : props.banner ? { ...props, banner: { ...props.banner, mobileSrc: undefined } }
      : { ...props, backgroundImageMobile: undefined };
    const list = <ProductList {...previewProps} style={{ width: "100%" }} />;
    return jsxExample("ProductList", `<ProductList${attributes}\n  products={products}${artwork}\n/>`,
      pc ? <div className={styles.pcProductList}>{list}</div> : list);
  },
};
