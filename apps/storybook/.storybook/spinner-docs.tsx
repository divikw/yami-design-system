import { Badge, Button, EmptyState, EmptyStateHeader, EmptyStateMedia, EmptyStateTitle, Input, Spinner, useDesktopViewport } from "@yami/design-system";
import { LoadingOrders } from "../../../packages/design-system/components/Spinner/examples";
import exampleSource from "../../../packages/design-system/components/Spinner/examples.tsx?raw";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";

export function SpinnerDocsPage({ locale }: { locale: DocsLocale }) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const zh = locale === "zh";
  const usageCode = `import { Spinner } from "@yami/design-system";

<Spinner aria-label="${zh ? "正在加载" : "Loading"}" />`;
  const examples: GuideExample[] = [
    {
      id: "customization", title: zh ? "自定义样式" : "Customization",
      description: zh ? "圆环继承文字颜色，可用语义 token 调整。" : "The ring inherits its text color. Use a semantic token to change it.",
      preview: <div style={{ textAlign: "center" }}><Spinner aria-label={zh ? "正在加载" : "Loading"} style={{ color: "var(--text-info)" }} /></div>,
      code: `import { Spinner } from "@yami/design-system";

<Spinner aria-label="${zh ? "正在加载" : "Loading"}" style={{ color: "var(--text-info)" }} />`,
    },
    {
      id: "sizes", title: zh ? "尺寸" : "Sizes",
      description: zh ? "使用 YAMI 尺寸 token 调整圆环大小。" : "Use YAMI size tokens to scale the ring.",
      preview: (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-200)" }}>
          {["var(--space-200)", "var(--space-300)", "var(--space-400)"].map(size => (
            <Spinner key={size} aria-label={zh ? "正在加载" : "Loading"} style={{ fontSize: size }} />
          ))}
        </div>
      ),
      code: `import { Spinner } from "@yami/design-system";

<div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "var(--space-200)" }}>
  {["var(--space-200)", "var(--space-300)", "var(--space-400)"].map(size => (
    <Spinner key={size} aria-label="${zh ? "正在加载" : "Loading"}" style={{ fontSize: size }} />
  ))}
</div>`,
    },
    {
      id: "button", title: zh ? "按钮" : "Button",
      description: zh ? "Button 的 loading 属性显示指示器并保留按钮名称。" : "The loading prop displays the indicator and preserves the accessible button name.",
      preview: (
        <div style={{ display: "grid", justifyItems: "center" }}><Button size={actionSize} loading>{zh ? "保存订单" : "Save order"}</Button></div>
      ),
      code: `import { Button } from "@yami/design-system";

<Button size="${actionSize}" loading>${zh ? "保存订单" : "Save order"}</Button>`,
    },
    {
      id: "badge", title: zh ? "徽标" : "Badge",
      description: zh ? "带文案的徽标只需声明一次状态。" : "Announce a text badge as one status.",
      preview: (
        <div style={{ display: "grid", justifyItems: "center" }}><Badge role="status"><Spinner /> {zh ? "正在同步" : "Syncing"}</Badge></div>
      ),
      code: `import { Badge, Spinner } from "@yami/design-system";

<Badge role="status"><Spinner /> ${zh ? "正在同步" : "Syncing"}</Badge>`,
    },
    {
      id: "input", title: zh ? "搜索输入框" : "Search input",
      description: zh ? "搜索提示在输入框内，加载指示器放在尾部。" : "Keep the search prompt in the input and place the indicator at the trailing edge.",
      preview: (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Input density="compact" aria-label={zh ? "搜索商品" : "Search products"} placeholder={zh ? "搜索商品" : "Search products"}
            trailingIcon={<Spinner aria-label={zh ? "正在搜索" : "Searching"} />} />
        </div>
      ),
      code: `import { Input, Spinner } from "@yami/design-system";

<div style={{ display: "flex", justifyContent: "center" }}>
  <Input density="compact" aria-label="${zh ? "搜索商品" : "Search products"}" placeholder="${zh ? "搜索商品" : "Search products"}"
    trailingIcon={<Spinner aria-label="${zh ? "正在搜索" : "Searching"}" />} />
</div>`,
    },
    {
      id: "empty", title: zh ? "等待内容" : "Loading content",
      description: zh ? "共用 EmptyState 的布局，文案说明正在加载。" : "Use the empty-state layout while the collection is being retrieved.",
      preview: (
        <EmptyState role="status">
          <EmptyStateHeader>
            <EmptyStateMedia><Spinner /></EmptyStateMedia>
            <EmptyStateTitle>{zh ? "正在加载收藏" : "Loading saved items"}</EmptyStateTitle>
          </EmptyStateHeader>
        </EmptyState>
      ),
      code: `import { EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateMedia, Spinner } from "@yami/design-system";

<EmptyState role="status">
  <EmptyStateHeader>
    <EmptyStateMedia><Spinner /></EmptyStateMedia>
    <EmptyStateTitle>${zh ? "正在加载收藏" : "Loading saved items"}</EmptyStateTitle>
  </EmptyStateHeader>
</EmptyState>`,
    },
  ];
  return <ComponentGuide name="Spinner" slug="spinner" locale={locale}
    intro={zh ? "表示正在处理、完成时间未知的操作。" : "Indicate that work is in progress when its duration is unknown."}
    previous={{ name: "Slider", path: "yami-components-forms-slider" }} next={{ name: "Switch", path: "yami-components-forms-switch" }}
    composition={"Spinner\nButton[loading] → Spinner"} usageCode={usageCode} examples={examples}
    leadExample={{ title: zh ? "基础示例" : "Example", code: exampleSource, preview: <div style={{ textAlign: "center" }}><LoadingOrders en={!zh} /></div> }}
    apiNote={zh ? "表示正在处理、完成时间未知的操作。" : "Indicate that work is in progress when its duration is unknown."}
    api={[
      ["aria-label / aria-labelledby", zh ? "独立使用时提供本地化名称以启用 status 语义。旁边已有加载文案时，Spinner 默认对读屏隐藏。" : "Give a standalone spinner a localized name to expose a status. Beside loading text, the unnamed spinner is decorative."],
      ["className / style", zh ? "尺寸为 1em，线条使用 currentColor。通过字号或 CSS 类设置尺寸与颜色。减少动态效果时降低转速。" : "The ring is 1em and inherits currentColor. Set font size or a CSS class for size and color. Reduced motion slows the rotation."],
    ]}
    reference={{ label: "shadcn/ui Spinner", href: "https://ui.shadcn.com/docs/components/base/spinner" }} />;
}
