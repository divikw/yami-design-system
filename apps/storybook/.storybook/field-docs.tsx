import { PriceRange } from "../../../packages/design-system/components/Field/price-range/examples";
import priceSource from "../../../packages/design-system/components/Field/price-range/examples.tsx?raw";
import { ExternalErrors } from "./field-external-errors";
import errorSource from "./field-external-errors.tsx?raw";
import { DeliveryFields } from "./field-density-example";
import densitySource from "./field-density-example.tsx?raw";
import { Checkbox, Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle, Input, RadioGroup, RadioGroupItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea } from "@yami/design-system";
import { DeliveryPreferences } from "../../../packages/design-system/components/Field/delivery/examples";
import formSource from "../../../packages/design-system/components/Field/delivery/examples.tsx?raw";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function FieldDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const name = zh ? "收件人" : "Recipient";
  const city = zh ? "城市" : "City";
  const preference = zh ? "送达时按门铃" : "Ring the doorbell on arrival";
  const notes = zh ? "配送备注（必填）" : "Delivery notes (required)";
  const help = zh ? "请填写送达位置。" : "Enter a drop-off location.";
  const error = zh ? "请输入配送备注。" : "Enter your delivery notes.";
  const door = zh ? "门口" : "At the door";
  const desk = zh ? "前台" : "At reception";
  const dropoff = zh ? "送达位置" : "Drop-off location";
  const radioRow = { display: "flex", alignItems: "center", gap: "var(--space-100)" };
  const notify = zh ? "配送通知" : "Delivery updates";
  const notifyHint = zh ? "配送状态变化时通知我。" : "Notify me when the delivery status changes.";
  const fullWidthStyle = { width: "100%" };
  const input = (label: string) => <Field><FieldLabel>{label}</FieldLabel><Input fullWidth density="compact" /></Field>;
  const fieldCode = (label: string) => `<Field>
  <FieldLabel>${label}</FieldLabel>
  <Input fullWidth density="compact" />
</Field>`;
  const basic = `import { Field, FieldLabel, Input } from "@yami/design-system";\n\n${fieldCode(name)}`;
  const examples: GuideExample[] = [
    { id: "default-density", title: zh ? "宽松字段" : "Default density",
      description: zh ? "由 Field 统一指定宽松规格，控件高 56 px，标签在框内。" : "Field sets the 56 px density with embedded labels for its controls.",
      code: densitySource.trim() + `\n\n<DeliveryFields density="default" en={${!zh}} />`,
      preview: <DeliveryFields density="default" en={!zh} /> },
    { id: "compact-density", title: zh ? "紧凑字段" : "Compact density",
      description: zh ? "由 Field 统一指定紧凑规格，控件高 40 px，标签在框外。" : "Field sets the 40 px density with external labels for its controls.",
      code: densitySource.trim() + `\n\n<DeliveryFields density="compact" en={${!zh}} />`,
      preview: <DeliveryFields density="compact" en={!zh} /> },
    { id: "input", title: zh ? "单个字段" : "Single field",
      description: zh ? "每个 Field 管理一个控件。点击标签即可将焦点移到输入框。" : "Place one control in each Field. Click its label to focus the input.",
      code: basic, preview: input(name) },
    { id: "group", title: zh ? "响应式字段组" : "Responsive field group",
      description: zh ? "字段组按可用宽度排列。两个字段各有至少 11rem 空间时并排显示，窄容器自动换行。" : "Fields sit side by side when each can fit at least 11rem, and wrap in narrower containers.",
      code: `import { Field, FieldGroup, FieldLabel, Input } from "@yami/design-system";\n\n<FieldGroup layout="responsive" style={{ width: "100%" }}>\n${fieldCode(name)}\n${fieldCode(city)}\n</FieldGroup>`,
      preview: <FieldGroup layout="responsive" style={fullWidthStyle}>{input(name)}{input(city)}</FieldGroup> },
    { id: "checkbox", title: zh ? "横向复选框" : "Horizontal checkbox",
      description: zh ? "把复选框放在标签前，整段标签都可以切换选项。" : "Place the checkbox before the label so the entire label toggles the option.",
      code: `import { Checkbox, Field, FieldLabel } from "@yami/design-system";\n\n<Field orientation="horizontal">\n  <Checkbox />\n  <FieldLabel>${preference}</FieldLabel>\n</Field>`,
      preview: <Field orientation="horizontal"><Checkbox /><FieldLabel>{preference}</FieldLabel></Field> },
    { id: "validation", title: zh ? "校验与错误" : "Validation and errors",
      description: zh ? "输入一些文字，清空后移开焦点可查看必填提示。填写提示在框内，校验错误显示在框下。" : "Enter text, clear it, then leave the field to see the required message. The hint appears inside the textarea and the error appears below it.",
      code: `import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";\n\n<Field validationMode="onBlur" style={{ width: "100%" }}>\n  <FieldLabel>${notes}</FieldLabel>\n  <Textarea required placeholder="${help}" />\n  <FieldError match="valueMissing">${error}</FieldError>\n</Field>`,
      preview: <Field validationMode="onBlur" style={fullWidthStyle}><FieldLabel>{notes}</FieldLabel><Textarea required placeholder={help} /><FieldError match="valueMissing">{error}</FieldError></Field> },
    { id: "disabled", title: zh ? "禁用字段" : "Disabled field",
      description: zh ? "在 Field 上设置 disabled 会禁用关联控件。" : "Set disabled on Field to disable its control.",
      code: `import { Field, FieldLabel, Textarea } from "@yami/design-system";\n\n<Field disabled style={{ width: "100%" }}>\n  <FieldLabel>${notes}</FieldLabel>\n  <Textarea required />\n</Field>`,
      preview: <Field disabled style={fullWidthStyle}><FieldLabel>{notes}</FieldLabel><Textarea required /></Field> },
    { id: "textarea", title: zh ? "多行输入" : "Textarea",
      description: zh ? "文本域为空时，在框内提示填写送达位置。" : "Show the drop-off hint inside the empty textarea.",
      code: `import { Field, FieldLabel, Textarea } from "@yami/design-system";

<Field style={{ width: "100%" }}>
  <FieldLabel>${notes}</FieldLabel>
  <Textarea required rows={3} placeholder="${help}" />
</Field>`,
      preview: <Field style={fullWidthStyle}>
        <FieldLabel>{notes}</FieldLabel>
        <Textarea required rows={3} placeholder={help} />
      </Field> },
    { id: "select", title: zh ? "下拉选择" : "Select",
      description: zh ? "聚焦选择框后，用键盘打开送达位置选项。" : "Focus the drop-off selector and open its options with the keyboard.",
      code: `import { Field, FieldLabel, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@yami/design-system";

<Field name="dropoff" style={{ width: "100%" }}>
  <FieldLabel>${dropoff}</FieldLabel>
  <Select defaultValue="door" items={[{ value: "door", label: ${JSON.stringify(door)} }, { value: "desk", label: ${JSON.stringify(desk)} }]}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="door">${door}</SelectItem>
      <SelectItem value="desk">${desk}</SelectItem>
    </SelectContent>
  </Select>
</Field>`,
      preview: <Field name="dropoff" style={fullWidthStyle}>
        <FieldLabel>{dropoff}</FieldLabel>
        <Select defaultValue="door" items={[{ value: "door", label: door }, { value: "desk", label: desk }]}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="door">{door}</SelectItem>
            <SelectItem value="desk">{desk}</SelectItem>
          </SelectContent>
        </Select>
      </Field> },
    { id: "slider", title: zh ? "滑块" : "Slider",
      description: zh ? "拖动两个手柄或用方向键分别调整最低价和最高价。" : "Drag either handle or use the arrow keys to adjust the minimum and maximum prices.",
      code: priceSource.trim() + `\n\n<div style={{ width: "100%" }}>\n  <PriceRange en={${!zh}} />\n</div>`,
      preview: <div style={fullWidthStyle}><PriceRange en={!zh} /></div> },
    { id: "radio", title: zh ? "单选组" : "Radio",
      description: zh ? "用方向键切换配送方式。" : "Use arrow keys to change the delivery method.",
      code: `import { FieldLegend, FieldSet, RadioGroup, RadioGroupItem } from "@yami/design-system";

<FieldSet>
  <FieldLegend variant="label">${dropoff}</FieldLegend>
  <RadioGroup aria-label={${JSON.stringify(dropoff)}} defaultValue="door" name="location">
    <label style={${JSON.stringify(radioRow)}}><RadioGroupItem value="door" /><span>${door}</span></label>
    <label style={${JSON.stringify(radioRow)}}><RadioGroupItem value="desk" /><span>${desk}</span></label>
  </RadioGroup>
</FieldSet>`,
      preview: <FieldSet>
        <FieldLegend variant="label">{dropoff}</FieldLegend>
        <RadioGroup aria-label={dropoff} defaultValue="door" name="location">
          <label style={radioRow}><RadioGroupItem value="door" /><span>{door}</span></label>
          <label style={radioRow}><RadioGroupItem value="desk" /><span>{desk}</span></label>
        </RadioGroup>
      </FieldSet> },
    { id: "switch", title: zh ? "开关与说明" : "Switch",
      description: zh ? "FieldContent 将标签和说明排在开关旁。" : "FieldContent keeps the label and description together beside the switch.",
      code: `import { Field, FieldContent, FieldDescription, FieldLabel, Switch } from "@yami/design-system";

<Field name="updates" orientation="horizontal">
  <Switch />
  <FieldContent>
    <FieldLabel>${notify}</FieldLabel>
    <FieldDescription>${notifyHint}</FieldDescription>
  </FieldContent>
</Field>`,
      preview: <Field name="updates" orientation="horizontal">
        <Switch />
        <FieldContent>
          <FieldLabel>{notify}</FieldLabel>
          <FieldDescription>{notifyHint}</FieldDescription>
        </FieldContent>
      </Field> },
    { id: "choice", title: zh ? "选项卡片" : "Choice card",
      description: zh ? "点击卡片标题可切换复选框。" : "Click the card title to toggle the checkbox.",
      code: `import { Checkbox, Field, FieldDescription, FieldLabel, FieldTitle } from "@yami/design-system";

<Field style={{ width: "100%" }}>
  <FieldLabel>
    <Checkbox />
    <FieldTitle>${notify}</FieldTitle>
  </FieldLabel>
  <FieldDescription>${notifyHint}</FieldDescription>
</Field>`,
      preview: <Field style={fullWidthStyle}>
        <FieldLabel>
          <Checkbox />
          <FieldTitle>{notify}</FieldTitle>
        </FieldLabel>
        <FieldDescription>{notifyHint}</FieldDescription>
      </Field> },
    { id: "fieldset", title: zh ? "字段集与分隔" : "Fieldset and separator",
      description: zh ? "用组标题和分隔线组织相关字段。" : "Name related fields and separate sections inside a group.",
      code: `import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, Input } from "@yami/design-system";

<FieldSet style={{ width: "100%" }}>
  <FieldLegend>${dropoff}</FieldLegend>
  <FieldGroup>
    <Field><FieldLabel>${name}</FieldLabel><Input fullWidth density="compact" /></Field>
    <FieldSeparator />
    <Field><FieldLabel>${city}</FieldLabel><Input fullWidth density="compact" /></Field>
  </FieldGroup>
</FieldSet>`,
      preview: <FieldSet style={fullWidthStyle}>
        <FieldLegend>{dropoff}</FieldLegend>
        <FieldGroup>
          <Field><FieldLabel>{name}</FieldLabel><Input fullWidth density="compact" /></Field>
          <FieldSeparator />
          <Field><FieldLabel>{city}</FieldLabel><Input fullWidth density="compact" /></Field>
        </FieldGroup>
      </FieldSet> },
    { id: "orientation", title: zh ? "响应式标签排列" : "Responsive layout",
      description: zh ? "宽容器中标签与输入框并排，窄容器中上下排列。" : "Labels sit beside inputs in wider groups and above them in narrower groups.",
      code: `import { Field, FieldGroup, FieldLabel, Input } from "@yami/design-system";

<FieldGroup style={{ width: "100%" }}>
  <Field orientation="responsive">
    <FieldLabel>${city}</FieldLabel>
    <Input fullWidth density="compact" />
  </Field>
</FieldGroup>`,
      preview: <FieldGroup style={fullWidthStyle}>
        <Field orientation="responsive">
          <FieldLabel>{city}</FieldLabel>
          <Input fullWidth density="compact" />
        </Field>
      </FieldGroup> },
    { id: "external", title: zh ? "外部校验错误" : "External errors",
      description: zh ? "空值和字数不足会分别提示。输入至少 5 个字符后，两条错误都会清除。" : "Empty and short notes have separate messages. Enter at least five characters to clear both errors.",
      code: errorSource, preview: <ExternalErrors en={!zh} /> },
  ];
  return <ComponentGuide name="Field" slug="field" locale={locale} previewMode="document"
    previous={{ name: "EmptyState", path: "yami-components-data-display-emptystate" }} next={{ name: "FilterChip", path: "yami-components-forms-filterchip" }}
    intro={zh ? "用 Field 将标签、控件、说明和错误关联起来，用 FieldSet 和 FieldGroup 组织完整表单。" : "Use Field to connect a label, control, hint and error. Organize related fields into sets and responsive groups."}
    leadExample={{ code: formSource, preview: <DeliveryPreferences locale={locale} /> }}
    usageCode={basic} composition={"FieldSet\n├── FieldLegend\n└── FieldGroup\n    └── Field\n        ├── FieldLabel\n        ├── Input / Textarea / Select / Checkbox\n        ├── FieldDescription\n        └── FieldError"}
    examples={examples} apiNote={zh ? "每组相关字段用 FieldSet 和 FieldLegend 命名。实际必填规则设置在控件上。" : "Name each set of related fields with FieldSet and FieldLegend. Set required on the control."}
    api={[
      ["Field.density", zh ? "default 或 compact；Input、SelectTrigger 和 Combobox 控件可继承。自适应内容决定整个 Field 的高度。" : "Default or compact. Input, SelectTrigger and Combobox fields can inherit it. Field grows with its content."],
      ["FieldSet / FieldLegend", zh ? "语义化分组与组标题。FieldSet 支持 disabled。" : "Semantic fieldset and legend. FieldSet supports disabled."],
      ["FieldGroup.layout", zh ? "stack（默认）纵向排列，responsive 按容器宽度分列。" : "stack (default) or responsive columns based on container width."],
      ["Field.orientation", zh ? "vertical（默认）、horizontal 或 responsive。responsive 随 FieldGroup 的容器宽度切换。" : "vertical (default), horizontal, or responsive to the FieldGroup width."],
      ["Field.name / disabled / invalid", zh ? "表单字段名、禁用状态与外部校验状态。" : "Submission name, disabled state and external invalid state."],
      ["Field.validationMode / validate", zh ? "按 onSubmit、onBlur 或 onChange 校验。validate 可返回错误文案。" : "Validate on submit, blur or change. Supply validate for a custom error."],
      ["FieldLabel / FieldDescription", zh ? "放在所属 Field 内，自动关联控件的标签与说明。" : "Place these inside their Field to associate the label and description automatically."],
      ["FieldContent / FieldTitle / FieldSeparator", zh ? "组织关联文案、卡片标题和分隔线。分隔线可以包含文字。" : "Compose supporting text, a card title and an optionally labeled separator."],
      ["FieldLegend.variant", zh ? "legend（默认）或较小的 label。" : "legend (default) or the smaller label style."],
      ["FieldError.errors", zh ? "外部错误的 message 数组，显示时去重。" : "An array of external message objects, deduplicated for display."],
      ["FieldError.match", zh ? "根据 ValidityState 键显示错误。true 用于显示外部错误。" : "Match a ValidityState key or use true for an external error."],
    ]} reference={{ label: "Base UI Field", href: "https://base-ui.com/react/components/field" }} />;
}
