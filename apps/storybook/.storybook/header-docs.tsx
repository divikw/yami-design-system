import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import { headerExample, headerProperties } from "./header-properties";

export function HeaderDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = headerProperties.initialValues(locale);
  const lead = headerExample(locale, defaults);
  return <ComponentGuide name="Header" slug="header" locale={locale} fullWidth
    intro={zh ? "商城的全局页头，包含品牌、搜索与导航入口。" : "Global storefront navigation for desktop and mobile."}
    next={{ name: "Footer", path: "yami-components-navigation-footer" }}
    leadExample={lead}
    usageCode={`import { Header } from "@yami/design-system";

<Header
  logo={logo}
  categories={categories}
  account={account}
  locale={storefrontLocale}
  cart={cart}
/>`}
    usageNote={zh
      ? "1024px 起显示桌面工具栏和分类轨道。App 首页使用默认移动版式，并可通过 mobileSearchHref 接入独立搜索页。H5 首页传入 h5-home，商品详情页传入 pdp；活动页使用 ActivityPageHeader。Properties 中可按设备试用。"
      : "At 1024px and above, Header shows a desktop utility bar and category rail. Use the default mobile layout for App Home and set mobileSearchHref for a dedicated search page. Use h5-home for H5 Home and pdp for Product Detail. Activity pages use ActivityPageHeader. Open Properties to try each device."}
    composition={zh ? [
      ["PC", "品牌、配送、语言、搜索、账号和购物车位于首行，分类在第二行。商城切换用于英文站。"],
      ["App 首页", "移动品牌、配送、消息和搜索。"],
      ["H5 首页", "移动品牌、横向配送与语言入口，以及搜索。"],
      ["商品详情页", "单行品牌、配送、搜索和购物车。"],
    ] : [
      ["PC", "Brand, delivery, locale, search, account and cart above the category rail. Hall switching is used on the English storefront."],
      ["App Home", "Mobile brand, delivery, inbox and search."],
      ["H5 Home", "Mobile brand, side-by-side delivery and locale entries, and search."],
      ["Product Detail", "A single row with brand, delivery, search and cart."],
    ]}
    examples={[{
      id: "category-menu",
      title: zh ? "桌面分类菜单" : "Desktop category menu",
      description: zh ? "在桌面预览中打开「全部分类」，浏览调用方提供的分类树。" : "Open Categories in the desktop preview to browse the supplied category tree.",
      ...headerExample(locale, { ...defaults, categoryMenu: true }),
    }]}
    practices={zh ? [
      ["do", "桌面标识跟随站点语言，移动端统一使用英文 YAMI 移动标识，并提供对应的深色资源。"],
      ["avoid", "在中文商城使用英文站的商城切换。"],
    ] : [
      ["do", "Use the storefront-language lockup on desktop and the English YAMI mobile lockup on mobile. Provide matching dark-surface assets."],
      ["avoid", "Using the English-only hall switcher on the Chinese storefront."],
    ]}
    apiNote={zh ? "HeaderProps 还支持原生 header 属性与各入口的可访问名称。" : "HeaderProps also accepts native header attributes and accessible names for the entry points."}
    api={[
      ["logo · categories · account · locale · cart", zh ? "必填的品牌及导航数据。" : "Required brand and navigation data."],
      ["mobileVariant", '"default" | "h5-home" | "pdp"'],
      ["mobileLogo · darkLogo · darkMobileLogo", zh ? "移动或深色表面的标识资源。" : "Brand assets for mobile or dark surfaces."],
      ["halls · hallId · onHallChange", zh ? "桌面商城切换及受控状态。" : "Desktop storefront switcher and controlled selection."],
      ["zipcode · inbox", zh ? "可选配送和消息入口，显示位置由版式决定。" : "Optional delivery and inbox entries, placed by layout."],
      ["categoryMenu · searchPanel", zh ? "调用方提供的桌面分类树和搜索发现内容。" : "Caller-supplied desktop category tree and search discovery content."],
      ["searchPlaceholder · searchValue · onSearchValueChange · onSearchSubmit", zh ? "搜索字段文案、受控值与提交回调。" : "Search hint, controlled value and submission callbacks."],
      ["mobileSearchHref · onScan", zh ? "移动搜索目的地与拍照搜索回调。" : "Mobile search destination and visual-search callback."],
    ]}
    accessibility={zh ? [
      "为配送、语言、账号、搜索和购物车提供本地化名称。购物车数量由读屏播报。",
      "桌面分类可用方向键浏览。按 Escape 关闭菜单并将焦点恢复到入口。",
    ] : [
      "Provide localized names for delivery, locale, account, search and cart. The cart count is announced to screen readers.",
      "Use the arrow keys to browse the desktop categories. Escape closes the menu and restores focus to its trigger.",
    ]} />;
}
