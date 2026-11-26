import { ServiceCommitment } from "@yami/design-system";
import { ComponentDocsTemplate, DocsApiTable, DocsExample, type DocsLocale } from "./component-docs-template";

export function ServiceCommitmentDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const code = `import { ServiceCommitment } from "@yami/design-system";

<ServiceCommitment locale="${locale}" />`;

  return (
    <ComponentDocsTemplate
      name="Service Commitment"
      slug="service-commitment"
      locale={locale}
      intro={zh ? "按页面语言展示配送等服务承诺。" : "Show localized shipping and service commitments."}
    >
      <DocsExample name="lead" locale={locale} code={code} fillContentWidth previewBackground="var(--background-primary)">
        <ServiceCommitment locale={locale} />
      </DocsExample>
      <section>
        <h2 id="service-commitment-layout">{zh ? "响应式布局" : "Responsive layout"}</h2>
        <p>{zh ? "内容区最小高度为 80px，列表水平和垂直居中。中文可用宽度达到 928px、英文达到 1120px 时，承诺项单行排列并显示分隔线。窄容器内自动换行，横向间距为 16px，行间距为 8px。" : "The content area has an 80px minimum height and centers the list on both axes. Items sit in a row with vertical dividers from 928px of usable width in Chinese and 1120px in English. At narrower widths, items wrap with 16px between items and 8px between rows."}</p>
      </section>
      <section>
        <h2 id="service-commitment-api">{zh ? "API 参考" : "API Reference"}</h2>
        <DocsApiTable locale={locale} rows={[
          ["locale", zh ? "中文（默认）显示五项，英文显示四项。" : "Chinese (default) displays five commitments. English displays four."],
          ["mobileCarousel", zh ? "开启后，宽度低于 1024px 时在 36px 高的栏内逐条轮播。键盘聚焦时暂停，启用减少动态效果时可手动滚动。" : "Below 1024px, cycle through one benefit at a time in a 36px strip. Keyboard focus pauses autoplay. Reduced motion uses manual scrolling."],
          ["className", zh ? "用于页面布局的外层类名。" : "Optional class for page layout."],
        ]} />
      </section>
    </ComponentDocsTemplate>
  );
}
