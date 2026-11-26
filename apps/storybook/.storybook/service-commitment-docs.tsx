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
      intro={zh ? "在页尾展示免运费、配送、正品和退换承诺。" : "Show shipping, delivery, authenticity, and returns commitments at the bottom of a page."}
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
          ["locale", zh ? "支持 zh（默认）和 en，均显示五项。" : "Both zh (default) and en display five commitments."],
          ["className", zh ? "用于页面布局的外层类名。" : "Optional class for page layout."],
        ]} />
      </section>
    </ComponentDocsTemplate>
  );
}
