import { Badge } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function BadgeDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const importCode = 'import { Badge } from "@yami/design-system";';
  const rowStyle = '{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-200)" }';
  const codeRow = (lines: string[]) => `${importCode}\n\n<div style={${rowStyle}}>\n${lines.map((line) => `  ${line}`).join("\n")}\n</div>`;
  const types = ["price", "sale", "low-price", "discount", "new", "hot", "exclusive", "choice", "best-sellers"] as const;
  const labels = zh ? ["价格", "促销", "低价", "折扣", "新品", "热门", "独家", "精选", "畅销"] : ["PRICE", "SALE", "LOW PRICE", "DISCOUNT", "NEW", "HOT", "EXCLUSIVE", "CHOICE", "BEST SELLERS"];
  const colors = ["neutral", "red", "blue", "green", "purple", "yellow"] as const;
  const tones = ["dark", "light", "dark-outline", "light-outline"] as const;
  const examples: GuideExample[] = [
    { id: "basic", title: zh ? "基础用法" : "Basic", description: zh ? "用于简短状态与促销信息，默认高度 20px。Badge 是展示标签，不提供按钮交互。" : "Use for short status and promotion labels. The default height is 20px. Badge is a display label without button behavior.",
      code: codeRow(['<Badge>Badge</Badge>', '<Badge type="sale">SALE</Badge>', '<Badge type="new">NEW</Badge>', '<Badge type="choice">CHOICE</Badge>']),
      preview: <div className={styles.row}><Badge>Badge</Badge><Badge type="sale">SALE</Badge><Badge type="new">NEW</Badge><Badge type="choice">CHOICE</Badge></div> },
    { id: "types", title: zh ? "语义变体" : "Semantic variants", description: zh ? "type 映射预设颜色与强调方式。独家和精选变体包含品牌旗标。" : "type selects a color and emphasis preset. Exclusive and choice variants include a brand flag.",
      code: codeRow(types.map((type, index) => `<Badge type="${type}">${labels[index]}</Badge>`)),
      preview: <div className={styles.row}>{types.map((type, index) => <Badge key={type} type={type}>{labels[index]}</Badge>)}</div> },
    { id: "colors", title: zh ? "颜色与强调" : "Color and emphasis", description: zh ? "primary 为实色，secondary 为浅底；黄色始终使用 secondary。显式 color / emphasis 优先于 type 预设。" : "primary is solid and secondary is tinted. Yellow always uses secondary. Explicit color / emphasis override the type preset.",
      code: codeRow(colors.map((color) => `<div style={{ display: "grid", justifyItems: "center", gap: "var(--space-100)" }}>\n    <Badge color="${color}" emphasis="primary">${color}</Badge>\n    <Badge color="${color}" emphasis="secondary">${color}</Badge>\n  </div>`)),
      preview: <div className={styles.row}>{colors.map((color) => <div className={styles.item} key={color}><Badge color={color} emphasis="primary">{color}</Badge><Badge color={color} emphasis="secondary">{color}</Badge></div>)}</div> },
    { id: "sizes", title: zh ? "尺寸" : "Sizes", description: zh ? "sm：20px 高 / 12px 字号；md：24px 高 / 14px 字号。PC 与 Mobile 保持一致。" : "sm: 20px height / 12px type. md: 24px height / 14px type. Sizes are identical on desktop and mobile.",
      code: codeRow(['<Badge size="sm">Small</Badge>', '<Badge size="md">Medium</Badge>']),
      preview: <div className={styles.row}><Badge size="sm">Small</Badge><Badge size="md">Medium</Badge></div> },
    { id: "tones", title: zh ? "背景适配" : "Surface tones", description: zh ? "tone 优先控制视觉样式，同时保留 Badge 的尺寸和圆角；选择与承载背景有足够对比的样式。" : "tone takes visual priority while preserving size and radius. Choose a tone with sufficient contrast against its background.",
      code: `${importCode}\n\n<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-200)", padding: "var(--space-200)", background: "color-mix(in srgb, var(--surface-primary) 50%, var(--surface-inverse))", borderRadius: "var(--radius-surface-default)" }}>\n${tones.map((tone) => `  <Badge tone="${tone}">${tone}</Badge>`).join("\n")}\n</div>`,
      preview: <div className={styles.tones}>{tones.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</div> },
  ];
  return <ComponentGuide name="Badge" slug="badge" locale={locale}
    intro={zh ? "用于商品状态、促销和计数的小型标签，支持语义变体、颜色与尺寸。" : "A compact label for product status, promotions and counts, with semantic variants, colors and sizes."}
    previous={{ name: "Avatar", path: "yami-components-data-display-avatar" }}
    next={{ name: "Breadcrumb", path: "yami-components-navigation-breadcrumb" }} composition={"Badge\n├── FlagPrefix (optional, internal)\n└── children"} examples={examples}
    apiNote={zh ? "YAMI 使用 Base UI useRender 渲染 span。公开属性如下；当前不提供 render / asChild 属性。" : "YAMI uses Base UI useRender to render a span. The public API is listed below; render / asChild are not exposed."}
    api={[["children", zh ? "标签文本；使用简短纯文本，不使用 emoji。" : "Short plain-text label; do not use emoji."], ["type", types.join(" | ")], ["color", `${colors.join(" | ")}; ${zh ? "默认 neutral" : "default: neutral"}`], ["emphasis", `primary | secondary; ${zh ? "默认 primary（黄色例外）" : "default: primary (except yellow)"}`], ["size", "sm | md; default: sm"], ["tone", tones.join(" | ")], ["className, style, ref", zh ? "支持原生 span 属性和 ref。" : "Native span attributes and ref are supported."]]}
    reference={{ label: "Base UI useRender", href: "https://base-ui.com/react/utils/use-render" }} />;
}
