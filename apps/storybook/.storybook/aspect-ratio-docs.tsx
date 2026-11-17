import { AspectRatio } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function AspectRatioDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const importCode = 'import { AspectRatio } from "@yami/design-system";';
  const surface = '{ display: "grid", placeItems: "center", background: "var(--surface-secondary)", borderRadius: "var(--radius-surface-default)" }';
  const surfaceStyle = { display: "grid", placeItems: "center", background: "var(--surface-secondary)", borderRadius: "var(--radius-surface-default)" };
  const examples: GuideExample[] = [
    { id: "basic", title: zh ? "基础用法" : "Basic", description: zh ? "比例为宽度除以高度；容器宽度变化时，高度自动按比例调整。" : "The ratio is width divided by height. Height follows the available width.",
      code: `${importCode}\n\n<AspectRatio ratio={16 / 9} style={${surface}}>\n  16 : 9\n</AspectRatio>`,
      preview: <AspectRatio ratio={16 / 9} style={surfaceStyle}>16 : 9</AspectRatio> },
    { id: "ratios", title: zh ? "常用比例" : "Ratios", description: zh ? "正方形、横向和竖向内容使用同一接口。外部布局决定宽度。" : "Square, landscape and portrait content use the same API. The surrounding layout sets the width.",
      code: `${importCode}\n\n<div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-200)" }}>\n  <AspectRatio ratio={1} style={${surface}}>1 : 1</AspectRatio>\n  <AspectRatio ratio={16 / 9} style={${surface}}>16 : 9</AspectRatio>\n  <AspectRatio ratio={3 / 4} style={${surface}}>3 : 4</AspectRatio>\n</div>`,
      preview: <div className={styles.ratios}>{[[1, "1 : 1"], [16 / 9, "16 : 9"], [3 / 4, "3 : 4"]].map(([ratio, label]) => <AspectRatio key={label} ratio={Number(ratio)} style={surfaceStyle}>{label}</AspectRatio>)}</div> },
    { id: "content", title: zh ? "自定义内容" : "Custom content", description: zh ? "组件只约束比例。内容布局、背景和图片裁切由调用方设置。" : "The component constrains the ratio. Callers control content layout, backgrounds and image cropping.",
      code: `${importCode}\n\n<AspectRatio ratio={1} style={${surface}}>\n  <span>${zh ? "商品展示区域" : "Product media area"}</span>\n</AspectRatio>`,
      preview: <AspectRatio ratio={1} style={surfaceStyle}><span>{zh ? "商品展示区域" : "Product media area"}</span></AspectRatio> },
  ];
  return <ComponentGuide name="AspectRatio" slug="aspectratio" locale={locale}
    intro={zh ? "按指定宽高比约束内容，适用于商品图片和媒体展示区域。" : "Constrain content to a width-to-height ratio for product images and media."}
    previous={{ name: "Accordion", path: "yami-components-layout-accordion" }}
    next={{ name: "Avatar", path: "yami-components-data-display-avatar" }} composition={"AspectRatio\n└── children"} examples={examples}
    apiNote={zh ? "YAMI 使用 Base UI useRender 渲染 div，比例由 CSS 管理。以下是当前公开接口。" : "YAMI uses Base UI useRender to render a div; CSS manages the ratio. The public API is listed below."}
    api={[["ratio", zh ? "必填 number；宽度 / 高度，例如 1、16 / 9。" : "Required number: width / height, such as 1 or 16 / 9."], ["children", zh ? "容器中的内容。" : "Content inside the container."], ["className, style", zh ? "设置布局与视觉样式；比例由 ratio 决定。" : "Layout and visual styles; ratio controls the aspect ratio."], ["data-slot", zh ? "默认 aspect-ratio，可覆盖。支持其他原生 div 属性。" : "Defaults to aspect-ratio and can be overridden. Native div attributes are supported."]]}
    reference={{ label: "Base UI useRender", href: "https://base-ui.com/react/utils/use-render" }} />;
}
