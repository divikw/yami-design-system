import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./Select";
import { translations } from "./story-translations";
const meta = { id: "yami-components-forms-select", title: "YAMI/Components/Select", component: Select,
  parameters: { layout: "padded", controls: { localizeDescriptions: true }, docs: { translations } },
  argTypes: { value: { control: "text" }, onValueChange: { control: false }, items: { control: false }, disabled: { control: "boolean" }, required: { control: "boolean" }, defaultValue: { control: "text" }, name: { control: "text" } },
  render: (args, { globals }) => {
    const en = globals.locale === "en";
    const items = [{ value: "standard", label: en ? "Standard delivery" : "标准配送" }, { value: "express", label: en ? "Express delivery" : "加急配送" }, { value: "unavailable", label: en ? "Unavailable" : "暂不可用", disabled: true }];
    return <Select {...args} items={items}><SelectTrigger aria-label="Delivery"><SelectValue placeholder={en ? "Choose delivery" : "选择配送方式"} /></SelectTrigger><SelectContent>{items.map(item => <SelectItem key={item.value} value={item.value} disabled={item.disabled}>{item.label}</SelectItem>)}</SelectContent></Select>;
  },
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
export const Disabled: Story = { args: { defaultValue: "standard", disabled: true } };

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
