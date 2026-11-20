import { ComponentGuide } from "./component-guide";
import { componentApiRows } from "./component-docs-scope";
import type { DocsLocale } from "./component-docs-template";
import { dividerProperties } from "./layout-properties";

export function DividerDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = dividerProperties.initialValues(locale);
  const lead = dividerProperties.example(defaults, locale);
  return <ComponentGuide name="Divider" slug="divider" locale={locale}
    intro={zh ? "在列表、区块或行内信息之间建立边界。" : "Mark boundaries between list items, sections, or inline metadata."}
    previous={{ name: "Dialog", path: "yami-components-layout-dialog" }}
    next={{ name: "Drawer", path: "yami-components-layout-drawer" }}
    composition={[[ "Divider", zh ? "水平线分隔上下内容，垂直线分隔行内信息。" : "A horizontal line separates stacked content and a vertical line separates inline information." ]]}
    leadExample={lead} usageCode={'import { Divider } from "@yami/design-system";\n\n<Divider />'}
    examples={[
      { id: "strength", title: zh ? "强分隔" : "Emphasis", description: zh ? "用于明确的区块边界。" : "Use for a clear section boundary.", ...dividerProperties.example({ ...defaults, strength: "emphasis" }, locale) },
      { id: "vertical", title: zh ? "垂直分隔线" : "Vertical divider", description: zh ? "为分隔线设置高度，用于同一行的短信息。" : "Give the line a height and use it between short details in a row.", ...dividerProperties.example({ ...defaults, orientation: "vertical" }, locale) },
      { id: "inverse", title: zh ? "反色表面" : "Inverse surface", description: zh ? "在反色背景上启用 inverse。" : "Enable inverse on an inverse surface.", ...dividerProperties.example({ ...defaults, inverse: true }, locale) },
    ]}
    legacyAnchors={{ examples: ["component-specifications"], api: ["component-playground"] }}
    api={componentApiRows("divider", "YAMI/Components/Divider", locale)}
    apiNote={zh ? "默认渲染水平分隔线。强度、方向和主题可独立设置。" : "The default is horizontal. Strength, orientation, and surface polarity are independent."} />;
}
