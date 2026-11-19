import { Card, Skeleton } from "@yami/design-system";
import { ProfileSkeleton } from "../../../packages/design-system/components/Skeleton/examples";
import exampleSource from "../../../packages/design-system/components/Skeleton/examples.tsx?raw";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";

export function SkeletonDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const usageCode = `import { Skeleton } from "@yami/design-system";

<Skeleton style={{ width: "65%", height: "var(--space-200)" }} />`;
  const examples: GuideExample[] = [
    {
      id: "avatar", title: zh ? "头像与文字" : "Avatar",
      description: zh ? "使用圆形头像和两行文字预留资料区。" : "Reserve a circular avatar and two lines of profile text.",
      preview: (
        <ProfileSkeleton en={!zh} />
      ),
      code: exampleSource,
    },
    {
      id: "card", title: zh ? "卡片" : "Card",
      description: zh ? "媒体区预留固定比例，标题预留一行。" : "Reserve the media aspect ratio and a title line.",
      preview: (
        <Card aria-busy="true" aria-label={zh ? "商品" : "Product"}>
          <Skeleton style={{ aspectRatio: "16 / 9" }} />
          <Skeleton style={{ width: "65%", height: "var(--space-200)", marginTop: "var(--space-100)" }} />
        </Card>
      ),
      code: `import { Card, Skeleton } from "@yami/design-system";

<Card aria-busy="true" aria-label="${zh ? "商品" : "Product"}">
  <Skeleton style={{ aspectRatio: "16 / 9" }} />
  <Skeleton style={{ width: "65%", height: "var(--space-200)", marginTop: "var(--space-100)" }} />
</Card>`,
    },
    {
      id: "text", title: zh ? "文本" : "Text",
      description: zh ? "按最终段落宽度绘制三行。" : "Match the expected lengths of the text lines.",
      preview: (
        <div aria-busy="true" style={{ display: "grid", gap: "var(--space-100)" }}>
          {["100%", "90%", "65%"].map(width => (
            <Skeleton key={width} style={{ width, height: "var(--space-150)" }} />
          ))}
        </div>
      ),
      code: `import { Skeleton } from "@yami/design-system";

<div aria-busy="true" style={{ display: "grid", gap: "var(--space-100)" }}>
  {["100%", "90%", "65%"].map(width => (
    <Skeleton key={width} style={{ width, height: "var(--space-150)" }} />
  ))}
</div>`,
    },
    {
      id: "form", title: zh ? "表单" : "Form",
      description: zh ? "分别为标签和输入控件预留高度。" : "Reserve separate spaces for the label and input.",
      preview: (
        <div aria-busy="true" style={{ display: "grid", gap: "var(--space-100)" }}>
          <Skeleton style={{ width: "30%", height: "var(--space-150)" }} />
          <Skeleton style={{ height: "var(--space-600)" }} />
        </div>
      ),
      code: `import { Skeleton } from "@yami/design-system";

<div aria-busy="true" style={{ display: "grid", gap: "var(--space-100)" }}>
  <Skeleton style={{ width: "30%", height: "var(--space-150)" }} />
  <Skeleton style={{ height: "var(--space-600)" }} />
</div>`,
    },
    {
      id: "table", title: zh ? "表格" : "Table",
      description: zh ? "按列预留宽度，加载后表格保持原有对齐。" : "Use the final column widths so rows retain their alignment.",
      preview: (
        <div aria-busy="true" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-150)" }}>
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} style={{ height: "var(--space-200)" }} />
          ))}
        </div>
      ),
      code: `import { Skeleton } from "@yami/design-system";

<div aria-busy="true" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-150)" }}>
  {Array.from({ length: 9 }, (_, index) => (
    <Skeleton key={index} style={{ height: "var(--space-200)" }} />
  ))}
</div>`,
    },
  ];
  return <ComponentGuide name="Skeleton" slug="skeleton" locale={locale}
    intro={zh ? "在内容加载时按实际布局预留空间。" : "Reserve space in the shape of the content being loaded."}
    previous={{ name: "Select", path: "yami-components-forms-select" }} next={{ name: "Slider", path: "yami-components-forms-slider" }}
    composition={"Loading region (aria-busy)\n└── Skeleton × n"} usageCode={usageCode} examples={examples}
    leadExample={{ title: zh ? "基础示例" : "Example", code: exampleSource, preview: <ProfileSkeleton en={!zh} /> }}
    apiNote={zh ? "在内容加载时按实际布局预留空间。" : "Reserve space in the shape of the content being loaded."}
    api={[
      ["style / className", zh ? "设置宽、高、比例和圆角，使占位块匹配最终内容。" : "Set dimensions, aspect ratio and radius to match the loaded content."],
      ["aria-hidden / aria-busy", zh ? "每个骨架块均对读屏隐藏。在等待数据的容器上声明 aria-busy。减少动态效果时骨架静止。" : "Each block is decorative. Mark the loading region aria-busy. Reduced motion shows static blocks."],
    ]}
    reference={{ label: "shadcn/ui Skeleton", href: "https://ui.shadcn.com/docs/components/base/skeleton" }} />;
}
