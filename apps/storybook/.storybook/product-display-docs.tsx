import { CollectionCard } from "@yami/design-system";
import { anuaCollection } from "../../../packages/design-system/components/CollectionCard/examples";
import { ComponentGuide } from "./component-guide";
import { componentApiRows } from "./component-docs-scope";
import { ComponentDocsTemplate, DocsApiTable, DocsExample, type DocsLocale } from "./component-docs-template";
import { horizontalScrollListExample, horizontalScrollListProperties, productCardProperties, productListProperties } from "./product-display-properties";

const scrollList = { name: "Horizontal Scroll List", path: "yami-components-commerce-product-list-horizontal-scroll-list" };
const productCard = { name: "Product Card", path: "yami-components-commerce-productcard" };
const productList = { name: "Product List", path: "yami-components-commerce-product-list" };

const collectionCard = { name: "Collection Card", path: "yami-modules-product-display-collection-card" };

export function HorizontalScrollListDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = horizontalScrollListProperties.initialValues(locale);
  const lead = horizontalScrollListProperties.example(defaults, locale);
  return <ComponentGuide name={scrollList.name} slug="horizontalscrolllist" locale={locale} next={productCard}
    intro={zh ? "可放入商品卡片等内容的原生横向滚动容器。" : "A native horizontal rail for product cards and other content."}
    leadExample={lead} usageCode={lead.code}
    usageNote={zh
      ? "为列表提供可访问名称，由调用方设置外层背景、子项宽度、间距和 scroll-snap-align。桌面端需要上一组、下一组按钮时，用 useHorizontalScrollList 接入分页控制。"
      : "Name the list and set the wrapper background, item widths, gaps and scroll-snap-align in the host. Use useHorizontalScrollList to connect previous and next controls when needed."}
    composition={zh ? [
      ["滚动容器", "负责原生滚动、边界约束和吸附。"],
      ["列表子项", "由调用方安排宽度、标签与内容。"],
      ["分页按钮", "可通过控制器为桌面布局接入。"],
    ] : [
      ["Rail", "Owns native scrolling, overscroll containment and snapping."],
      ["List item", "The host provides width, semantics and content."],
      ["Paging controls", "The host can connect desktop controls to the scrolling hook."],
    ]}
    examples={[
      { id: "disabled", title: zh ? "关闭滚动" : "Scrolling disabled",
        description: zh ? "保留同一组商品，改由调用方排成网格。" : "The same items use a grid supplied by the host.",
        ...horizontalScrollListProperties.example({ ...defaults, enabled: false }, locale) },
      { id: "masonry", title: zh ? "不等高瀑布流" : "Masonry with variable heights",
        description: zh ? "关闭滚动后，调用方用 CSS 多列布局让卡片按内容自然排列，每张卡片完整留在一列。"
          : "With scrolling off, CSS columns let cards stack at their natural heights and keep each card together.",
        ...horizontalScrollListExample({ surface: defaults.surface, background: defaults.background, layout: "masonry" }, locale) },
    ]}
    legacyAnchors={{ usage: ["horizontal-scroll-list--usage", "paging-controls", "horizontalscrolllist-card-surface"], composition: ["responsibilities"],
      examples: ["component-playground", "component-specifications"] }}
    apiNote={zh ? "组件接受所选元素的原生属性和 ref。" : "The component accepts native attributes and a ref for the selected element."}
    api={componentApiRows("HorizontalScrollList", "YAMI/Modules/Product Display/Horizontal Scroll List", locale)}
    accessibility={[zh ? "优先使用 ul 和 li 表达列表语义。开启滚动时容器默认可用 Tab 聚焦。"
      : "Prefer ul and li for list semantics. Tab can focus the rail when scrolling is enabled."]} />;
}

export function ProductCardDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = productCardProperties.initialValues(locale);
  const lead = productCardProperties.example(defaults, locale);
  return <ComponentGuide name={productCard.name} slug="productcard" locale={locale} previous={scrollList} next={productList}
    intro={zh ? "展示商品图片、信息、价格和加购入口。" : "A card for product images, details, prices and add to cart."}
    leadExample={lead} usageCode={lead.code}
    usageNote={zh
      ? "提供商品标题、当前价格和商品链接。传入图片时同时提供替代文本。加购由调用方通过回调处理。"
      : "Provide a title, current price and product link. Supply alt text with an image. The host handles the add-to-cart callback."}
    composition={zh ? [
      ["图片区", "展示商品图片，可叠加最多两个徽标。"],
      ["商品信息", "可展示品牌、标题、销量和评分。"],
      ["价格与操作", "呈现当前售价、划线原价、促销和加购入口。"],
    ] : [
      ["Media", "Shows the product image and up to two badges."],
      ["Summary", "Can show brand, title, sales and rating."],
      ["Offer", "Displays price, original price, promotions and add to cart."],
    ]}
    practices={[
      ["do", zh ? "同一个列表使用一致的卡片形态。" : "Use a consistent presentation within a list."],
      ["avoid", zh ? "给整张卡片再套一层链接，造成商品链接与加购操作嵌套。" : "Avoid wrapping product links and the add-to-cart action inside another link."],
    ]}
    examples={[
      { id: "minimal", title: zh ? "精简卡片" : "Minimal card",
        description: zh ? "图片和售价优先，适合密集的商品集合。" : "Emphasizes the image and price in dense product displays.",
        ...productCardProperties.example({ ...defaults, presentation: "minimal" }, locale) },
      { id: "compact", title: zh ? "横向商品行" : "Compact row",
        description: zh ? "商品图和信息并排，加购入口位于价格旁。" : "Places the image beside the details and add to cart beside the price.",
        ...productCardProperties.example({ ...defaults, presentation: "compact" }, locale) },
      { id: "sold-out", title: zh ? "售完" : "Sold out",
        description: zh ? "保留商品信息和价格，显示库存状态。" : "Shows the stock state alongside the product details and price.",
        ...productCardProperties.example({ ...defaults, availability: "sold-out" }, locale) },
    ]}
    legacyAnchors={{ usage: ["productcard--使用说明", "使用场景", "storybook-预览"], composition: ["结构与形态"],
      examples: ["component-playground", "component-specifications", "背景与属性", "加购按钮"],
      "sold-out": ["库存状态"], api: ["徽标与价格", "相关资源"], accessibility: ["链接与无障碍", "keyboard-focus-geometry"] }}
    apiNote={zh ? "图片、品牌与优惠字段由调用方提供。" : "The host supplies images, brand and optional promotions."}
    api={componentApiRows("ProductCard", "YAMI/Modules/Product Display/Product Card", locale)}
    accessibility={[zh ? "商品图片和标题指向同一地址。品牌链接和加购按钮各自独立，使用清晰的可访问名称。"
      : "Use the same destination for the image and title. Give the separate brand link and cart button clear accessible names."]} />;
}

export function ProductListDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = productListProperties.initialValues(locale);
  const lead = productListProperties.example(defaults, locale);
  return <ComponentGuide name={productList.name} slug="productlist" locale={locale} previous={productCard} next={collectionCard} fullWidth
    intro={zh ? "用横向滚动或响应式网格展示商品集合。" : "Show a product collection in a horizontal rail or responsive grid."}
    leadExample={lead} usageCode={lead.code}
    usageNote={zh
      ? "为每件商品提供稳定的 id。调用方可添加分类标签、加载更多与加购回调，并负责筛选及请求数据。"
      : "Provide a stable ID for each product. The host handles filtering, data requests and callbacks for loading more and adding to cart."}
    composition={zh ? [
      ["列表头部", "包含标题，可追加分类标签、说明和查看全部。"],
      ["商品集合", "按 rail 或 waterfall 布局排列 ProductCard。"],
      ["加载状态", "骨架屏使用对应布局，示例可在 Properties 切换。"],
    ] : [
      ["Header", "Contains the title, with optional tabs, description and a see-all link."],
      ["Products", "Arranges ProductCard items in the rail or waterfall layout."],
      ["Loading", "Displays skeletons for the current layout. Try it in Properties."],
    ]}
    examples={[
      { id: "waterfall", title: zh ? "响应式网格" : "Responsive grid",
        description: zh ? "列数随设备宽度变化，适合浏览较多商品。" : "Adapts the columns to the device width for browsing larger collections.",
        ...productListProperties.example({ ...defaults, layout: "waterfall" }, locale) },
      { id: "themed", title: zh ? "主题横幅" : "Themed banner",
        description: zh ? "为 PC 和手机提供各自的横幅素材。" : "Supply separate banner artwork for PC and mobile.",
        ...productListProperties.example({ ...defaults, appearance: "themed" }, locale) },
      { id: "loading", title: zh ? "加载状态" : "Loading",
        description: zh ? "加载商品时以相同布局显示占位。" : "Reserves the collection layout while products load.",
        ...productListProperties.example({ ...defaults, loading: true }, locale) },
    ]}
    legacyAnchors={{ usage: ["productlist--使用说明", "使用场景", "storybook-预览"],
      composition: ["布局与商品", "标题与对齐", "分割线与移动端外观", "标签"],
      examples: ["component-playground", "component-specifications"], themed: ["外观"],
      loading: ["加载与分页"], accessibility: ["无障碍与相关资源"] }}
    apiNote={zh ? "使用主题外观时需要提供 banner。" : "Themed appearances require a banner."}
    api={componentApiRows("ProductList", "YAMI/Modules/Product Display/Product List", locale)}
    accessibility={[zh ? "列表以标题命名。活动横幅需要替代文本，加载时通过 aria-busy 公布状态。"
      : "The title names the list. Supply alt text for campaign banners. Loading is announced through aria-busy."]} />;
}

export function CollectionCardDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const item = {
    ...anuaCollection,
    href: `./?path=/story/yami-pages-landing-page-collection-page-brand--pc&globals=locale:${locale}`,
    target: "_top" as const,
  };
  const code = (products = anuaCollection.products) => `import { CollectionCard } from "@yami/design-system";\n\nconst item = ${JSON.stringify({ ...anuaCollection, products }, null, 2)};\n\n<CollectionCard item={item} />`;
  return (
    <ComponentDocsTemplate name={collectionCard.name} slug="collectioncard" locale={locale} previous={productList}
      intro={zh ? "三张商品图排成一行，四张排成两行两列。点击整张卡片即可打开专辑。" : "Three product images form one row. Four form a two-by-two grid. The whole card links to the collection."}>
      <DocsExample locale={locale} code={code()} name="lead" previewBackground="var(--background-primary)">
        <div style={{ width: "min(360px, 100%)" }}><CollectionCard item={item} /></div>
      </DocsExample>
      <section>
        <h2 id="collectioncard-single-row">{zh ? "单行三图" : "Single row of three"}</h2>
        <DocsExample locale={locale} code={code(item.products.slice(0, 3))} name="single-row" previewBackground="var(--background-primary)">
          <div style={{ width: "min(360px, 100%)" }}><CollectionCard item={{ ...item, products: item.products.slice(0, 3) }} /></div>
        </DocsExample>
      </section>
      <section>
        <h2 id="collectioncard-usage">{zh ? "用法" : "Usage"}</h2>
        <p>{zh ? "卡片默认使用浅灰底色，由外层网格决定宽度。标题沿用 Banner 的单行样式，整张卡片链接到专辑。" : "The parent grid sets the width. The card uses the secondary surface and the same single-line title as the banner."}</p>
      </section>
      <section>
        <h2 id="collectioncard-api">{zh ? "API 参考" : "API Reference"}</h2>
        <DocsApiTable locale={locale} rows={[["item", zh ? "提供 id、title、href 和 products，可选 target。每张商品图包含 src 和 alt。" : "Supply id, title, href and products, plus an optional target. Each product image has a src and alt."]]} />
      </section>
    </ComponentDocsTemplate>
  );
}
