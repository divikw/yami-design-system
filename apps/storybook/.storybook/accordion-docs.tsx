import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Card } from "@yami/design-system";
import { ComponentGuide } from "./component-guide";
import type { DocsLocale as Locale } from "./component-docs-template";
import styles from "./accordion-docs.module.css";

const exampleKinds = ["basic", "multiple", "disabled", "borders", "card"] as const;
type ExampleKind = typeof exampleKinds[number];
const headings = {
  zh: ["基础用法", "多项展开", "禁用", "边框", "卡片"],
  en: ["Basic", "Multiple", "Disabled", "Borders", "Card"],
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

function exampleCode(locale: Locale, kind: ExampleKind | "usage" = "basic") {
  const items = kind === "usage" ? questions[locale].slice(0, 1) : questions[locale];
  const props = kind === "usage" ? "" : ` defaultValue={["specifications"]}${kind === "multiple" ? " multiple" : ""}${kind === "borders" ? ` style={${borderStyle}}` : ""}`;
  const group = `<Accordion${props}>\n${items.map(([value, label, body], index) => `  <AccordionItem value="${value}"${kind === "disabled" && index === 1 ? " disabled" : ""}>\n    <AccordionTrigger>${label}</AccordionTrigger>\n    <AccordionContent>${body}</AccordionContent>\n  </AccordionItem>`).join("\n")}\n</Accordion>`;
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

export function AccordionDocsPage({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
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
  return <ComponentGuide name="Accordion" slug="accordion" intro={intro} locale={locale}
    next={{ name: "Alert", path: "yami-components-data-display-alert" }}
    usageNote={zh ? "用折叠面板组织商品规格、配料或配送说明等可按需展开的内容。" : "Use an accordion for details people can reveal on demand, such as product specifications, ingredients, or delivery notes."}
    usageCode={exampleCode(locale, "usage")} composition={composition}
    practices={zh ? [["do", "每项使用能概括内容的标题。需要同时对照多个面板时开启 multiple。"], ["avoid", "把完成当前任务所必需的信息全部藏在折叠面板里。"]]
      : [["do", "Name each item for its content. Enable multiple when people need to compare panels."], ["avoid", "Hide all information needed for the current task inside collapsed panels."]]}
    examples={exampleKinds.map((kind, index) => ({ id: kind, title: headings[locale][index], description: descriptions[kind], code: exampleCode(locale, kind), preview: <Demo locale={locale} kind={kind} /> }))}
    apiNote={zh ? "组件命名与组合方式遵循 shadcn/ui，交互由 Base UI 提供。" : "Component names and composition follow shadcn/ui. Base UI provides the interaction."}
    api={[["Accordion", "multiple, value, defaultValue, onValueChange, disabled, keepMounted, hiddenUntilFound"], ["AccordionItem", "value, disabled, onOpenChange"], ["AccordionTrigger", "render, nativeButton"], ["AccordionContent", "render"]]}
    accessibility={zh ? ["AccordionTrigger 已包含语义标题和原生按钮。", "按 Enter 或空格展开当前面板；收起后，面板内容会退出键盘焦点顺序。"]
      : ["AccordionTrigger includes a semantic heading and a native button.", "Press Enter or Space to toggle the current panel. Collapsed content leaves the keyboard focus order."]}
    reference={{ label: "Base UI Accordion", href: "https://base-ui.com/react/components/accordion" }} />;
}
