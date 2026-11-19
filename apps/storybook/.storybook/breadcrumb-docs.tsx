import { Breadcrumb } from "@yami/design-system";
import { CollapsedBreadcrumb } from "../../../packages/design-system/components/Breadcrumb/examples";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

const imports = 'import { Breadcrumb } from "@yami/design-system";';
const legacyAnchors = {
  usage: ["breadcrumb--使用说明", "breadcrumb--usage", "使用场景", "when-to-use"],
  basic: ["component-playground", "路径与语义", "path-and-semantics", "键盘焦点", "keyboard-focus"],
  category: ["component-specifications"],
  appearance: ["样式与响应式", "appearance-and-responsiveness"],
  api: ["中英文与框架链接", "localization-and-framework-links"],
};

export function BreadcrumbDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const beauty = { label: zh ? "美妆护肤" : "Beauty", href: `https://www.yami.com/us/${locale}/c/beauty/2` };
  const masks = zh ? "面膜" : "Masks";
  const currentPage = [beauty, { label: masks, current: true }];
  const categories = [beauty, { label: masks, href: `https://www.yami.com/us/${locale}/c/masks/59` }, { label: zh ? "贴片面膜" : "Sheet masks" }];

  function snippet(items: { label: string; href?: string; current?: boolean }[], props = "") {
    const entries = items.map(({ label, href, current }) =>
      `  { label: "${label}"${href ? `, href: "${href}"` : ""}${current ? ", current: true" : ""} },`);
    return `<Breadcrumb locale="${locale}"${props} items={[\n${entries.join("\n")}\n]} />`;
  }

  const examples: GuideExample[] = [
    {
      id: "basic", title: zh ? "当前页" : "Current page",
      description: zh ? "上级页面提供 href，鼠标悬停时显示下划线。当前页设置 current: true。用 Tab 聚焦上级链接，按 Enter 打开。" : "Give the parent page an href. Its link is underlined on mouse hover. Mark the current page with current: true. Tab to the parent link and press Enter to open it.",
      code: `${imports}\n\n${snippet(currentPage)}`,
      preview: <Breadcrumb locale={locale} items={currentPage} />,
    },
    {
      id: "category", title: zh ? "商品分类路径" : "Product category path",
      description: zh ? "商品详情页的路径可以止于所属分类。省略 current，末项作为普通文字显示。" : "On a product page, the trail can stop at the product’s category. Omit current to leave the last item as plain text.",
      code: `${imports}\n\n${snippet(categories)}`,
      preview: <Breadcrumb locale={locale} items={categories} />,
    },
    {
      id: "collapsed", title: zh ? "折叠路径" : "Collapsed",
      description: zh ? "用省略号标出省略的中间层级，保留首页、最近的上级和当前页。保留的链接可照常访问。" : "Mark omitted levels with an ellipsis and keep the home, nearest parent and current page visible. The remaining links support normal navigation.",
      code: `import { Breadcrumb, BreadcrumbEllipsis } from "@yami/design-system";

<Breadcrumb locale="${locale}" items={[
  { label: "${zh ? "首页" : "Home"}", href: "https://www.yami.com/us/${locale}" },
  { label: <BreadcrumbEllipsis aria-label="${zh ? "已省略中间层级" : "Omitted levels"}" /> },
  { label: "${masks}", href: "https://www.yami.com/us/${locale}/c/masks/59" },
  { label: "${zh ? "贴片面膜" : "Sheet masks"}", current: true },
]} />`,
      preview: <CollapsedBreadcrumb locale={locale} />,
    },
    {
      id: "appearance", title: zh ? "字号与下划线" : "Size and underline",
      description: zh ? "size=\"md\" 使用正文字号，underline={false} 关闭鼠标悬停下划线。长标签自动换行。切换 Mobile 可检查 44px 的链接触达区域。" : 'Use size="md" for body text and underline={false} to disable hover underlines. Long labels wrap. Switch to Mobile to inspect the 44px link targets.',
      code: `${imports}\n\n${snippet(currentPage, ' size="md" underline={false}')}`,
      preview: <Breadcrumb locale={locale} size="md" underline={false} items={currentPage} />,
    },
    {
      id: "inverse", title: zh ? "反色背景" : "Inverse surface",
      description: zh ? "在反色表面使用 inverse，链接文字和键盘焦点框会随主题适配。" : "Use inverse on an inverse surface. Link text and the keyboard focus outline follow the active theme.",
      code: `${imports}\n\n<div style={{ display: "grid", placeItems: "center", padding: "var(--space-200)", background: "var(--surface-inverse)" }}>\n${snippet(currentPage, " inverse").split("\n").map(line => "  " + line).join("\n")}\n</div>`,
      previewBackground: "var(--surface-inverse)",
      preview: <Breadcrumb locale={locale} inverse items={currentPage} />,
    },
  ];

  return <ComponentGuide name="Breadcrumb" slug="breadcrumb" locale={locale}
    intro={zh ? "按层级顺序传入 items，Breadcrumb 会生成路径和分隔符。为上级链接提供 href，用 current 标记当前页。" : "Pass items in hierarchy order. Breadcrumb renders the trail and its separators. Use href for parent links and current to mark the current page."}
    previous={{ name: "Badge", path: "yami-components-data-display-badge" }}
    next={{ name: "Button", path: "yami-components-actions-button" }}
    composition={`Breadcrumb (nav)\n└── ol\n    └── li\n        ├── / (aria-hidden)\n        └── a | span`}
    legacyAnchors={legacyAnchors}
    examples={examples.map(example => ({ ...example, preview: <div className={styles.row}>{example.preview}</div> }))}
    apiNote={zh ? "Breadcrumb 用 Base UI 的 useRender 渲染导航容器。PC 链接最小为 24 × 24px，低于 1024px 时为 44 × 44px。由宿主页面决定是否显示整条路径。" : "Breadcrumb uses Base UI’s useRender for the navigation container. Links have a minimum target of 24 × 24px on desktop and 44 × 44px below 1024px. The host page controls visibility."}
    api={[
      ["items", zh ? "必填，按从上级到下级传入 BreadcrumbItem[]。空数组不渲染，单项省略分隔符。" : "Required ordered array of BreadcrumbItem, from parent to child. An empty array renders nothing. A single item has no separator."],
      ["label / href / current", zh ? "label 为必填的 ReactNode。提供 href 时渲染链接。仅对实际当前页设置 current: true，每条路径最多一项。" : "label is a required ReactNode. Supply href to render a link. Set current: true on at most one item, the actual current page."],
      ["BreadcrumbEllipsis", zh ? "放入静态项的 label，使用 aria-label 说明已省略的层级。" : "Use as the label of a static item. Set aria-label to describe the omitted levels."],
      ["locale", zh ? "zh 或 en，默认 en。设置导航名称与 lang。调用方提供对应语言的标签和地址。" : "zh or en, default en. Sets the navigation name and lang. Supply localized labels and URLs."],
      ["size / underline / inverse", zh ? "size 支持 sm（默认）和 md。underline 默认 true（悬停时显示），inverse 默认 false。" : "size accepts sm (default) or md. underline defaults to true (on hover) and inverse to false."],
      ["renderLink", zh ? "通过 (props: BreadcrumbLinkProps) => ReactNode 接入框架链接，将 href、className、children 和 ARIA 属性传给实际链接。" : "Adapt a router link with (props: BreadcrumbLinkProps) => ReactNode. Forward href, className, children and ARIA attributes to the link."],
      ["aria-label / ref", zh ? "支持原生 nav 属性和 ref。页面包含多条路径时，可用 aria-label 单独命名。" : "Accepts native nav attributes and a ref. Use aria-label to distinguish multiple trails on one page."],
    ]}
    reference={{ label: "WAI-ARIA Breadcrumb Pattern", href: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/" }} />;
}
