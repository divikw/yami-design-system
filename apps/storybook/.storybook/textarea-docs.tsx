import { MessageForm } from "./textarea-message-example";
import formSource from "./textarea-message-example.tsx?raw";
import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function TextareaDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const label = zh ? "留言" : "Message";
  const placeholder = zh ? "请输入留言…" : "Write a message…";
  const hint = zh ? "可以分行填写。" : "Use a new line for each point.";
  const error = zh ? "请输入留言。" : "Enter a message.";
  const locked = zh ? "订单已确认。" : "Order confirmed.";
  const basic = `import { Textarea } from "@yami/design-system";\n\n<Textarea aria-label="${label}" placeholder="${placeholder}" />`;
  const fieldImports = 'import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";';
  const examples: GuideExample[] = [
    { id: "field", title: "Field", description: zh ? "点击“留言”标签可聚焦文本域。空白时，框内会提示可以分行填写。" : "Click the Message label to focus the textarea. The empty field shows how to enter multiple lines.",
      preview: <Field style={{ width: "100%" }}><FieldLabel>{label}</FieldLabel><Textarea placeholder={hint} /></Field>,
      code: `${fieldImports}\n\n<Field style={{ width: "100%" }}>\n  <FieldLabel>${label}</FieldLabel>\n  <Textarea placeholder="${hint}" />\n</Field>` },
    { id: "disabled", title: zh ? "禁用" : "Disabled", description: zh ? "在 Field 上设置 disabled 会同时禁用文本域。" : "Disabling Field also disables its control.",
      preview: <Field disabled style={{ width: "100%" }}><FieldLabel>{label}</FieldLabel><Textarea placeholder={placeholder} /></Field>,
      code: `${fieldImports}\n\n<Field disabled style={{ width: "100%" }}>\n  <FieldLabel>${label}</FieldLabel>\n  <Textarea placeholder="${placeholder}" />\n</Field>` },
    { id: "invalid", title: zh ? "错误" : "Invalid", description: zh ? "Field 的 invalid 标记控件，FieldError 提供关联的错误文案。" : "Mark the field invalid and associate the error with its control.",
      preview: <Field invalid style={{ width: "100%" }}><FieldLabel>{label}</FieldLabel><Textarea /><FieldError match>{error}</FieldError></Field>,
      code: `${fieldImports}\n\n<Field invalid style={{ width: "100%" }}>\n  <FieldLabel>${label}</FieldLabel>\n  <Textarea />\n  <FieldError match>${error}</FieldError>\n</Field>` },
    { id: "button", title: zh ? "提交按钮" : "Button", description: zh ? "填写留言后提交，在本示例内确认并清空文本域。" : "Submit a message to see local confirmation and clear the textarea.",
      preview: <MessageForm locale={locale} />,
      code: formSource },
    { id: "readonly", title: zh ? "只读" : "Read-only", description: zh ? "可以聚焦、选择和复制已有内容。" : "The existing value can be focused, selected and copied.",
      preview: <Textarea aria-label={label} readOnly defaultValue={locked} />,
      code: `import { Textarea } from "@yami/design-system";\n\n<Textarea aria-label="${label}" readOnly defaultValue="${locked}" />` },
  ];
  return <ComponentGuide name="Textarea" slug="textarea" locale={locale} previewMode="document"
    previous={{ name: "Tag", path: "yami-components-data-display-tag" }} next={{ name: "Toast", path: "yami-components-data-display-toast" }}
    intro={zh ? "输入多行文本。支持内容自适应高度的浏览器会随输入自动增高，指定 rows 可设置固定初始行数。" : "Enter multiline text. Supporting browsers grow the control with its content. Set rows to choose its initial height instead."}
    leadExample={{ preview: <Textarea aria-label={label} placeholder={placeholder} />, code: basic }}
    usageCode={basic} composition={"Field\n├── FieldLabel\n├── Textarea\n└── FieldDescription / FieldError"} examples={examples}
    apiNote={zh ? "支持原生 textarea 属性及 ref。鼠标点击可编辑，Tab 聚焦时显示焦点框。" : "Accepts native textarea props and a ref. Tab navigation displays a focus ring."}
    api={[["value / defaultValue / onChange", zh ? "受控或非受控的文本值。" : "Controlled or uncontrolled text value."],
      ["rows", zh ? "显式设置行数时使用原生行高。未指定时优先随内容增高。" : "An explicit row count uses native sizing. Omit it for content sizing."],
      ["disabled / readOnly / required / aria-invalid", zh ? "原生禁用、只读、必填和错误状态。" : "Disabled, read-only, required and invalid states."]]}
    reference={{ label: "shadcn/ui Textarea", href: "https://ui.shadcn.com/docs/components/base/textarea" }} />;
}
