import { useId, useState } from "react";
import { Switch } from "../Switch";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectGroupLabel, SelectSeparator, type SelectProps, type SelectTriggerProps } from "./Select";
import { translations } from "./story-translations";

function DeliverySelect({ en, alignItemWithTrigger, triggerProps, ...props }: SelectProps & {
  en: boolean;
  alignItemWithTrigger?: boolean;
  triggerProps?: SelectTriggerProps;
}) {
  const items = [
    { value: "standard", label: en ? "Standard delivery" : "标准配送" },
    { value: "express", label: en ? "Express delivery" : "加急配送" },
    { value: "unavailable", label: en ? "Unavailable" : "暂不可用", disabled: true },
  ];
  return <Select {...props} items={items}>
    <SelectTrigger aria-label={en ? "Delivery" : "配送方式"} {...triggerProps}>
      <SelectValue placeholder={en ? "Choose delivery" : "选择配送方式"} />
    </SelectTrigger>
    <SelectContent alignItemWithTrigger={alignItemWithTrigger}>{items.map(item =>
      <SelectItem key={item.value} value={item.value} disabled={item.disabled}>{item.label}</SelectItem>
    )}</SelectContent>
  </Select>;
}

const meta = { id: "yami-components-forms-select", title: "YAMI/Components/Select", component: Select,
  parameters: { layout: "padded", controls: { localizeDescriptions: true }, docs: { translations, stateSections: {
    Alignment: { zh: "选中项与触发器对齐", en: "Align item with trigger" },
    Groups: { zh: "分组选项", en: "Groups" },
    Scrollable: { zh: "可滚动列表", en: "Scrollable" },
    Disabled: { zh: "禁用", en: "Disabled" },
    Invalid: { zh: "错误状态", en: "Invalid" },
  } } },
  argTypes: { value: { control: "text" }, onValueChange: { control: false }, items: { control: false }, disabled: { control: "boolean" }, required: { control: "boolean" }, defaultValue: { control: "text" }, name: { control: "text" } },
  render: (args, { globals }) => <DeliverySelect {...args} en={globals.locale === "en"} />,
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = { args: { defaultValue: "standard" }, play: async ({ canvasElement }) => {
  const trigger = within(canvasElement).getByRole("combobox"); await userEvent.click(trigger);
  const express = await within(canvasElement.ownerDocument.body).findByRole("option", { name: /Express delivery|加急配送/ });
  await userEvent.click(express);
  await expect(trigger).toHaveTextContent(/Express|加急/); await expect(trigger).toHaveAttribute("aria-expanded", "false");
} };
export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };

function AlignmentDemo({ en }: { en: boolean }) {
  const [align, setAlign] = useState(true);
  return <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-150)" }}>
    <Switch checked={align} onCheckedChange={setAlign}>{en ? "Align selected item" : "对齐选中项"}</Switch>
    <DeliverySelect en={en} defaultValue="express" alignItemWithTrigger={align} />
  </div>;
}
export const Alignment: Story = { render: (_, { globals }) => <AlignmentDemo en={globals.locale === "en"} /> };

export const Groups: Story = {
  render: (_, { globals }) => {
    const en = globals.locale === "en";
    const fruit = [{ value: "apple", label: en ? "Apple" : "苹果" }, { value: "pear", label: en ? "Pear" : "梨" }];
    const vegetables = [{ value: "carrot", label: en ? "Carrot" : "胡萝卜" }, { value: "onion", label: en ? "Onion" : "洋葱" }];
    const label = en ? "Choose produce" : "选择果蔬";
    return <Select items={[...fruit, ...vegetables]}>
      <SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>{en ? "Fruit" : "水果"}</SelectGroupLabel>
          {fruit.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>{en ? "Vegetables" : "蔬菜"}</SelectGroupLabel>
          {vegetables.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>;
  },
};

export const Scrollable: Story = {
  render: (_, { globals }) => {
    const items = ["America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
      "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Africa/Cairo", "Asia/Kolkata",
      "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney"].map(zone => ({ value: zone, label: zone.replaceAll("_", " ") }));
    const label = globals.locale === "en" ? "Select a timezone" : "选择时区";
    return <Select items={items}>
      <SelectTrigger aria-label={label}><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent style={{ maxHeight: "min(12rem, var(--available-height))" }}>
        {items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
      </SelectContent>
    </Select>;
  },
};

function InvalidDemo({ en }: { en: boolean }) {
  const id = useId();
  const [value, setValue] = useState<string | null>(null);
  return <div style={{ display: "grid", gap: "var(--space-050)" }}>
    <DeliverySelect en={en} value={value} onValueChange={setValue}
      triggerProps={{ "aria-invalid": !value, "aria-describedby": value ? undefined : id }} />
    {!value && <span id={id} style={{ color: "var(--text-error)" }}>{en ? "Choose a delivery method." : "请选择配送方式。"}</span>}
  </div>;
}
export const Invalid: Story = { render: (_, { globals }) => <InvalidDemo en={globals.locale === "en"} /> };

export const PCPreview: Story = {
  ...Showcase,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Showcase,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
