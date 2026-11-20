import {
  Checkbox, Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxInput, ComboboxContent,
  ComboboxEmpty, ComboboxList, ComboboxItem, ComboboxValue, useComboboxAnchor, type ComboboxInputProps,
  Field, FieldLabel, FieldDescription, FieldError, FilterChip, Input,
  RadioGroup, RadioGroupItem, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Slider, Switch, Textarea, type FieldDensity,
} from "@yami/design-system";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";

export const checkboxProperties: PropertiesDefinition<{ density: "default" | "compact"; defaultChecked: boolean; indeterminate: boolean; disabled: boolean }> = {
  slug: "checkbox",
  initialValues: () => ({ density: "default", defaultChecked: false, indeterminate: false, disabled: false }),
  fields: (_, locale) => [
    { key: "density", kind: "select", options: ["default", "compact"] },
    { key: "defaultChecked", kind: "switch", description: locale === "zh" ? "设置试用示例的初始选中状态。" : "Set the demo’s initial checked state." },
    { key: "indeterminate", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: (props, locale) => {
    const label = locale === "zh" ? "订阅配送动态" : "Subscribe to delivery updates";
    return jsxExample("Checkbox",
      `<div style={{ display: "flex", alignItems: "center", gap: "var(--space-100)" }}>
  <Checkbox id="delivery-updates"${jsxAttributes(props)} />
  <label htmlFor="delivery-updates">{${JSON.stringify(label)}}</label>
</div>`,
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-100)" }}>
        <Checkbox key={String(props.defaultChecked)} id="properties-delivery-updates" {...props} />
        <label htmlFor="properties-delivery-updates">{label}</label>
      </div>);
  },
};

export const comboboxProperties: PropertiesDefinition<{ multiple: boolean; density: FieldDensity; placeholder: string; autoHighlight: boolean; showClear: boolean; showTrigger: boolean; disabled: boolean }> = {
  slug: "combobox",
  previewMode: "document",
  initialValues: locale => ({ multiple: false, density: "compact", placeholder: locale === "zh" ? "搜索城市" : "Search cities", autoHighlight: false, showClear: false, showTrigger: true, disabled: false }),
  fields: ({ multiple }, locale) => [
    { key: "multiple", kind: "switch" },
    { key: "density", name: multiple ? "ComboboxChips.density" : "ComboboxInput.density", kind: "select", options: ["default", "compact"],
      description: multiple ? (locale === "zh"
        ? "default 最低 56 px，compact 最低 40 px。多选标题均在框外。"
        : "Default is at least 56 px and compact is at least 40 px. The multi-select label sits above the control in both sizes.") : undefined },
    { key: "placeholder", name: multiple ? "ComboboxChipsInput.placeholder" : "ComboboxInput.placeholder", kind: "text", label: locale === "zh" ? "输入提示" : "Placeholder", description: locale === "zh" ? "在输入前提示可搜索的内容。" : "Hint at what can be searched." },
    { key: "autoHighlight", kind: "switch" },
    ...(!multiple ? [
      { key: "showClear", name: "ComboboxInput.showClear", kind: "switch" },
      { key: "showTrigger", name: "ComboboxInput.showTrigger", kind: "switch" },
    ] as const : []),
    { key: "disabled", kind: "switch" },
  ],
  example: ({ multiple, density, placeholder, autoHighlight, showClear, showTrigger, disabled }, locale) => {
    const zh = locale === "zh";
    const cities = zh ? ["东京", "首尔", "上海", "台北"] : ["Tokyo", "Seoul", "Shanghai", "Taipei"];
    const label = zh ? "城市" : "City";
    const input = { density, label, placeholder, showTrigger, showClear,
      triggerLabel: zh ? "显示城市" : "Show cities", clearLabel: zh ? "清除城市" : "Clear city" };
    const removeLabel = zh ? "移除" : "Remove ";
    const empty = zh ? "没有匹配的城市" : "No matching cities";
    const control = multiple
      ? `<ComboboxChips ref={anchor}${jsxAttributes({ density, label })}>
    <ComboboxValue>{(selected: string[]) => selected.map(city => (
      <ComboboxChip key={city} removeLabel={${JSON.stringify(removeLabel)} + city}>{city}</ComboboxChip>
    ))}</ComboboxValue>
    <ComboboxChipsInput${jsxAttributes({ placeholder })} />
  </ComboboxChips>`
      : `<ComboboxInput${jsxAttributes(input)} />`;
    const example = `<Combobox items={cities}${jsxAttributes({ multiple, autoHighlight, disabled })}>
  ${control}
  <ComboboxContent${multiple ? " anchor={anchor}" : ""}>
    <ComboboxEmpty>{${JSON.stringify(empty)}}</ComboboxEmpty>
    <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>`;
    const source = multiple ? `export function CityPicker() {
  const anchor = useComboboxAnchor();

  return (
${example.replace(/^/gm, "    ")}
  );
}` : example;
    const controlImports = multiple
      ? "ComboboxChips, ComboboxChipsInput, ComboboxValue, ComboboxChip, useComboboxAnchor"
      : "ComboboxInput";
    return jsxExample(`Combobox, ${controlImports}, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem`,
      `const cities = ${JSON.stringify(cities)};\n\n${source}`,
      <ComboboxPropertiesPreview key={String(multiple)} {...{ cities, multiple, autoHighlight, disabled, input, removeLabel, empty }} />);
  },
};

function ComboboxPropertiesPreview({ cities, multiple, autoHighlight, disabled, input, removeLabel, empty }: {
  cities: string[];
  multiple: boolean;
  autoHighlight: boolean;
  disabled: boolean;
  input: ComboboxInputProps;
  removeLabel: string;
  empty: string;
}) {
  const anchor = useComboboxAnchor();
  return <Combobox items={cities} multiple={multiple} autoHighlight={autoHighlight} disabled={disabled}>
    {multiple ? <ComboboxChips ref={anchor} density={input.density} label={input.label}>
      <ComboboxValue>{(selected: string[]) => selected.map(city =>
        <ComboboxChip key={city} removeLabel={removeLabel + city}>{city}</ComboboxChip>
      )}</ComboboxValue>
      <ComboboxChipsInput placeholder={input.placeholder} />
    </ComboboxChips> : <ComboboxInput {...input} />}
    <ComboboxContent anchor={multiple ? anchor : undefined}>
      <ComboboxEmpty>{empty}</ComboboxEmpty>
      <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}

export const fieldProperties: PropertiesDefinition<{ density: FieldDensity; orientation: "vertical" | "horizontal" | "responsive"; invalid: boolean; disabled: boolean }> = {
  slug: "field",
  initialValues: () => ({ density: "compact", orientation: "vertical", invalid: false, disabled: false }),
  fields: () => [
    { key: "density", kind: "select", options: ["default", "compact"] },
    { key: "orientation", kind: "select", options: ["vertical", "horizontal", "responsive"] },
    { key: "invalid", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: (props, locale) => {
    const [label, help, error] = locale === "zh"
      ? ["邮编", "用于查询配送范围。", "请输入 5 位邮编。"]
      : ["ZIP code", "Used to check delivery availability.", "Enter a five-digit ZIP code."];
    const embedded = props.density === "default";
    const inputLabel = embedded ? { label } : {};
    return jsxExample("Field, FieldLabel, FieldDescription, FieldError, Input",
      `<Field name="zip"${jsxAttributes(props)}>
  ${embedded ? "" : `<FieldLabel>{${JSON.stringify(label)}}</FieldLabel>\n  `}<Input${jsxAttributes(inputLabel)} inputMode="numeric" fullWidth />
  <FieldDescription>{${JSON.stringify(help)}}</FieldDescription>
  <FieldError match={${props.invalid}}>{${JSON.stringify(error)}}</FieldError>
</Field>`,
      <div style={{ width: "100%" }}><Field name="zip" {...props}>
        {!embedded && <FieldLabel>{label}</FieldLabel>}
        <Input {...inputLabel} inputMode="numeric" fullWidth />
        <FieldDescription>{help}</FieldDescription>
        <FieldError match={props.invalid}>{error}</FieldError>
      </Field></div>);
  },
};

export const filterChipProperties: PropertiesDefinition<{ variant: "outlined" | "filled"; defaultPressed: boolean; disabled: boolean }> = {
  slug: "filterchip",
  initialValues: () => ({ variant: "outlined", defaultPressed: false, disabled: false }),
  fields: () => [
    { key: "variant", kind: "select", options: ["outlined", "filled"] },
    { key: "defaultPressed", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: (props, locale) => {
    const label = locale === "zh" ? "仅看有货" : "In stock only";
    return jsxExample("FilterChip", `<FilterChip${jsxAttributes(props)}>{${JSON.stringify(label)}}</FilterChip>`,
      <FilterChip key={String(props.defaultPressed)} {...props}>{label}</FilterChip>);
  },
};

export const inputProperties: PropertiesDefinition<{ density: "default" | "compact"; placeholder: string; clearable: boolean; disabled: boolean }> = {
  slug: "input",
  initialValues: locale => ({ density: "compact", placeholder: locale === "zh" ? "输入配送地址" : "Enter a delivery address", clearable: false, disabled: false }),
  fields: (_, locale) => [
    { key: "density", kind: "select", options: ["default", "compact"] },
    { key: "placeholder", kind: "text", label: locale === "zh" ? "输入提示" : "Placeholder", description: locale === "zh" ? "输入前显示的提示。" : "Hint shown before typing." },
    { key: "clearable", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: (props, locale) => {
    const label = locale === "zh" ? "配送地址" : "Delivery address";
    const input = { ...props, label };
    return jsxExample("Input", `<Input${jsxAttributes(input)} />`, <Input {...input} />);
  },
};

export const radioGroupProperties: PropertiesDefinition<{ defaultValue: "standard" | "express"; disabled: boolean; required: boolean }> = {
  slug: "radiogroup",
  initialValues: () => ({ defaultValue: "standard", disabled: false, required: false }),
  fields: () => [
    { key: "defaultValue", kind: "select", options: ["standard", "express"] },
    { key: "disabled", kind: "switch" },
    { key: "required", kind: "switch" },
  ],
  example: (props, locale) => {
    const zh = locale === "zh";
    const label = zh ? "配送方式" : "Delivery method";
    const choices = [["standard", zh ? "标准配送" : "Standard shipping"], ["express", zh ? "加急配送" : "Express shipping"]];
    const row = { display: "flex", alignItems: "center", gap: "var(--space-100)" };
    return jsxExample("RadioGroup, RadioGroupItem",
      `<RadioGroup${jsxAttributes({ ...props, "aria-label": label })}>
${choices.map(([value, text]) => `  <div style={${JSON.stringify(row)}}>
    <RadioGroupItem value="${value}" id="shipping-${value}" />
    <label htmlFor="shipping-${value}">{${JSON.stringify(text)}}</label>
  </div>`).join("\n")}
</RadioGroup>`,
      <RadioGroup key={props.defaultValue} {...props} aria-label={label}>
        {choices.map(([value, text]) => <div key={value} style={row}>
          <RadioGroupItem value={value} id={`properties-shipping-${value}`} />
          <label htmlFor={`properties-shipping-${value}`}>{text}</label>
        </div>)}
      </RadioGroup>);
  },
};

export const selectProperties: PropertiesDefinition<{ density: FieldDensity; defaultValue: "empty" | "standard" | "express"; align: "start" | "center" | "end"; disabled: boolean }> = {
  slug: "select",
  previewMode: "document",
  initialValues: () => ({ density: "compact", defaultValue: "empty", align: "start", disabled: false }),
  fields: (_, locale) => [
    { key: "density", name: "SelectTrigger.density", kind: "select", options: ["default", "compact"] },
    { key: "defaultValue", kind: "select", type: "string", options: ["empty", "standard", "express"], description: locale === "zh" ? "empty 表示初始未选中。" : "Empty starts without a selection." },
    { key: "align", name: "SelectContent.align", kind: "select", options: ["start", "center", "end"], description: locale === "zh" ? "设置选项浮层与触发器的对齐方式。" : "Align the options with the trigger." },
    { key: "disabled", kind: "switch" },
  ],
  example: ({ density, defaultValue, align, disabled }, locale) => {
    const zh = locale === "zh";
    const triggerProps = { density, label: zh ? "配送方式" : "Delivery method" };
    const placeholder = zh ? "选择配送方式" : "Choose a delivery method";
    const items = [{ value: "standard", label: zh ? "标准配送" : "Standard shipping" }, { value: "express", label: zh ? "加急配送" : "Express shipping" }];
    const props = { defaultValue: defaultValue === "empty" ? undefined : defaultValue, disabled };
    return jsxExample("Select, SelectTrigger, SelectValue, SelectContent, SelectItem",
      `const items = ${JSON.stringify(items)};

<div style={{ display: "grid", width: "100%" }}>
  <Select items={items}${jsxAttributes(props)}>
    <SelectTrigger${jsxAttributes(triggerProps)}>
      <SelectValue${jsxAttributes({ placeholder })} />
    </SelectTrigger>
    <SelectContent align="${align}">
      {items.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
    </SelectContent>
  </Select>
</div>`,
      <div style={{ display: "grid", width: "100%" }}>
        <Select key={defaultValue} items={items} {...props}>
          <SelectTrigger {...triggerProps}><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent align={align}>{items.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
        </Select>
      </div>);
  },
};

export const sliderProperties: PropertiesDefinition<{ defaultValue: "20" | "50" | "80"; step: "1" | "5" | "10"; orientation: "horizontal" | "vertical"; disabled: boolean }> = {
  slug: "slider",
  initialValues: () => ({ defaultValue: "50", step: "1", orientation: "horizontal", disabled: false }),
  fields: () => [
    { key: "defaultValue", kind: "select", type: "number", options: ["20", "50", "80"] },
    { key: "step", kind: "select", type: "number", options: ["1", "5", "10"] },
    { key: "orientation", kind: "select", options: ["horizontal", "vertical"] },
    { key: "disabled", kind: "switch" },
  ],
  example: ({ defaultValue, step, orientation, disabled }, locale) => {
    const props = { defaultValue: Number(defaultValue), step: Number(step), orientation, disabled, "aria-label": locale === "zh" ? "音量" : "Volume" };
    return jsxExample("Slider", `<Slider${jsxAttributes(props)} />`,
      <div style={{ width: "100%", display: "grid", justifyItems: "center" }}><Slider key={defaultValue} {...props} /></div>);
  },
};

export const switchProperties: PropertiesDefinition<{ size: "default" | "sm"; defaultChecked: boolean; readOnly: boolean; disabled: boolean }> = {
  slug: "switch",
  initialValues: () => ({ size: "default", defaultChecked: false, readOnly: false, disabled: false }),
  fields: () => [
    { key: "size", kind: "select", options: ["default", "sm"] },
    { key: "defaultChecked", kind: "switch" },
    { key: "readOnly", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: (props, locale) => {
    const label = locale === "zh" ? "配送通知" : "Delivery notifications";
    return jsxExample("Switch",
      `<div style={{ display: "flex", alignItems: "center", gap: "var(--space-100)" }}>
  <label htmlFor="delivery-notifications">{${JSON.stringify(label)}}</label>
  <Switch id="delivery-notifications"${jsxAttributes(props)} />
</div>`,
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-100)" }}>
        <label htmlFor="properties-notifications">{label}</label>
        <Switch key={String(props.defaultChecked)} id="properties-notifications" {...props} />
      </div>);
  },
};

export const textareaProperties: PropertiesDefinition<{ rows: "auto" | "3" | "5"; placeholder: string; readOnly: boolean; disabled: boolean }> = {
  slug: "textarea",
  initialValues: locale => ({ rows: "auto", placeholder: locale === "zh" ? "填写配送备注" : "Write delivery instructions", readOnly: false, disabled: false }),
  fields: (_, locale) => [
    { key: "rows", kind: "select", type: "number", options: ["auto", "3", "5"], description: locale === "zh" ? "auto 让高度随内容变化。" : "Auto sizes the field to its content." },
    { key: "placeholder", kind: "text", label: locale === "zh" ? "输入提示" : "Placeholder", description: locale === "zh" ? "输入前显示的提示。" : "Hint shown before typing." },
    { key: "readOnly", kind: "switch" },
    { key: "disabled", kind: "switch" },
  ],
  example: ({ rows, placeholder, readOnly, disabled }, locale) => {
    const label = locale === "zh" ? "配送备注" : "Delivery instructions";
    const props = { rows: rows === "auto" ? undefined : Number(rows), placeholder, readOnly, disabled, "aria-label": label };
    return jsxExample("Textarea", `<Textarea${jsxAttributes(props)} />`,
      <div style={{ width: "100%" }}><Textarea {...props} /></div>);
  },
};
