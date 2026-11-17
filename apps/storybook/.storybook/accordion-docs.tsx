import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Card } from "@yami/design-system";
import { CodeBlock, ComponentDocsTemplate, DocsExample, Installation, type DocsLocale as Locale } from "./component-docs-template";
import styles from "./accordion-docs.module.css";
import docsStyles from "./component-docs-template.module.css";

type ExampleKind = "basic" | "multiple" | "disabled" | "borders" | "card";
const sections = ["installation", "usage", "composition", "basic", "multiple", "disabled", "borders", "card", "api"] as const;
const headings = {
  zh: ["安装", "用法", "组合结构", "基础用法", "多项展开", "禁用", "边框", "卡片", "API 参考"],
  en: ["Installation", "Usage", "Composition", "Basic", "Multiple", "Disabled", "Borders", "Card", "API Reference"],
};
const questions = {
  zh: [
    ["specifications", "商品规格", "单盒 200 毫升，每组 6 盒。"],
    ["nutrition", "营养成分表", "热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。"],
    ["ingredients", "配料", "完整配料及过敏原信息见包装标签，选购前请仔细核对。"],
  ],
  en: [
    ["specifications", "Specifications", "6 cartons per pack, 200 ml each."],
    ["nutrition", "Nutrition facts", "Check the nutrition label for calories, protein, fat and sugar content."],
    ["ingredients", "Ingredients", "Review the ingredient list and allergen information on the packaging before purchasing."],
  ],
};
const borderStyle = '{ border: "var(--stroke-default) solid var(--border-default)", borderRadius: "var(--radius-surface-default)", paddingInline: "var(--space-200)" }';

function exampleCode(locale: Locale, kind: ExampleKind = "basic") {
  const props = `defaultValue={["specifications"]}${kind === "multiple" ? " multiple" : ""}${kind === "borders" ? ` style={${borderStyle}}` : ""}`;
  const group = `<Accordion ${props}>\n${questions[locale].map(([value, label, body], index) => `  <AccordionItem value="${value}"${kind === "disabled" && index === 1 ? " disabled" : ""}>\n    <AccordionTrigger>${label}</AccordionTrigger>\n    <AccordionContent>${body}</AccordionContent>\n  </AccordionItem>`).join("\n")}\n</Accordion>`;
  return `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent${kind === "card" ? ", Card" : ""} } from "@yami/design-system";\n\n${kind === "card" ? `<Card surface="secondary" padding="md" style={{ paddingBlock: 0 }}>\n${group.split("\n").map((line) => `  ${line}`).join("\n")}\n</Card>` : group}`;
}

function Demo({ locale, kind = "basic" }: { locale: Locale; kind?: ExampleKind }) {
  const group = <Accordion defaultValue={["specifications"]} multiple={kind === "multiple"} className={kind === "borders" ? styles.bordered : undefined}>
    {questions[locale].map(([value, label, body], index) => <AccordionItem value={value} key={value} disabled={kind === "disabled" && index === 1}>
      <AccordionTrigger>{label}</AccordionTrigger>
      <AccordionContent>{body}</AccordionContent>
    </AccordionItem>)}
  </Accordion>;
  return kind === "card" ? <Card surface="secondary" padding="md" style={{ paddingBlock: 0 }}>{group}</Card> : group;
}

function Example({ locale, kind = "basic" }: { locale: Locale; kind?: ExampleKind }) {
  return <DocsExample name={kind} code={exampleCode(locale, kind)} locale={locale}><Demo locale={locale} kind={kind} /></DocsExample>;
}

export function AccordionDocsPage({ locale }: { locale: Locale }) {
  const intro = locale === "zh" ? "一组纵向排列的交互标题，点击标题可以展开或收起对应内容。" : "A vertical group of interactive headings. Select a heading to expand or collapse its content.";
  const descriptions: Record<ExampleKind, string> = locale === "zh" ? {
    basic: "默认同时展开一项。首项初始展开，再次点击可收起。",
    multiple: "设置 multiple，允许同时展开多个面板。",
    disabled: "在 AccordionItem 上设置 disabled，可禁用指定面板。",
    borders: "通过 Accordion 的 style 或 className 添加外边框；面板之间保留现有分隔线。",
    card: "使用 YAMI Card 包裹 Accordion；上下间距由折叠项自身提供，卡片仅保留左右内边距。",
  } : {
    basic: "One panel opens at a time by default. The first panel starts open; select it again to close it.",
    multiple: "Set multiple to allow several panels to remain open together.",
    disabled: "Set disabled on AccordionItem to disable an individual panel.",
    borders: "Add an outer border with Accordion style or className. Existing dividers remain between panels.",
    card: "Wrap Accordion in a YAMI Card with horizontal padding only; the accordion items provide vertical spacing.",
  };
  const composition = "Accordion\n├── AccordionItem\n│   ├── AccordionTrigger\n│   └── AccordionContent\n└── AccordionItem\n    ├── AccordionTrigger\n    └── AccordionContent";
  const pageText = [`# Accordion`, intro, ...sections.map((section, index) => `## ${headings[locale][index]}\n${section in descriptions ? descriptions[section as ExampleKind] + "\n\n```tsx\n" + exampleCode(locale, section as ExampleKind) + "\n```" : section === "composition" ? composition : section === "usage" ? exampleCode(locale) : section === "installation" ? 'pnpm add "@yami/design-system@workspace:*"' : "https://base-ui.com/react/components/accordion"}`)].join("\n\n");
  const heading = (id: typeof sections[number]) => <h2 id={`accordion-${id}`}>{headings[locale][sections.indexOf(id)]}</h2>;
  return <ComponentDocsTemplate name="Accordion" slug="accordion" intro={intro} locale={locale} pageText={pageText} next={{ name: "AspectRatio", path: "yami-components-layout-aspectratio" }}>
    <Example key={locale} locale={locale} />
    <section>{heading("installation")}<Installation locale={locale} /></section>
    <section>{heading("usage")}<CodeBlock locale={locale} code={'import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@yami/design-system";'} /><CodeBlock locale={locale} code={exampleCode(locale).split("\n\n")[1]} /></section>
    <section>{heading("composition")}<p>{locale === "zh" ? "使用以下结构组合面板，属性和状态由 Base UI 管理。" : "Compose panels using these parts. Base UI manages their properties and state."}</p><CodeBlock locale={locale} code={composition} language="text" /></section>
    {(["basic", "multiple", "disabled", "borders", "card"] as const).map((kind) => <section key={kind}>{heading(kind)}<p>{descriptions[kind]}</p><Example key={`${kind}-${locale}`} locale={locale} kind={kind} /></section>)}
    <section>{heading("api")}<p>{locale === "zh" ? "组件命名与组合方式遵循 shadcn/ui，行为由 Base UI 提供。完整属性、事件与数据属性请查看 " : "Component names and composition follow shadcn/ui, with behavior provided by Base UI. See all props, events and data attributes in the "}<a href="https://base-ui.com/react/components/accordion" target="_blank" rel="noreferrer">Base UI Accordion {locale === "zh" ? "文档" : "documentation"}</a>{locale === "zh" ? "。" : "."}</p>
      <div className={docsStyles.tableScroll}><table><thead><tr><th>{locale === "zh" ? "部件" : "Part"}</th><th>{locale === "zh" ? "常用属性" : "Common props"}</th></tr></thead><tbody>{[["Accordion", "multiple, value, defaultValue, onValueChange, disabled, keepMounted, hiddenUntilFound"], ["AccordionItem", "value, disabled, onOpenChange"], ["AccordionTrigger", "render, nativeButton"], ["AccordionContent", "render"]].map(([part, props]) => <tr key={part}><td><code>{part}</code></td><td><code>{props}</code></td></tr>)}</tbody></table></div>
      <p>{locale === "zh" ? "AccordionTrigger 内部包含语义标题 Header，无需额外包裹。单面板也采用相同组合结构。" : "AccordionTrigger includes the semantic Header internally. Use the same composition for a single panel."}</p>
    </section>
  </ComponentDocsTemplate>;
}
