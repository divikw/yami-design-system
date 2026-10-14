import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { QuantitySelect, type QuantitySelectProps } from "./QuantitySelect";

function Controlled(props: QuantitySelectProps) {
  const [value, setValue] = useState(props.value);
  return <QuantitySelect {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: "YAMI/Components/Form/QuantitySelect",
  component: QuantitySelect,
  globals: { theme: "light" },
  parameters: { layout: "padded", docs: { playground: "Playground", showStories: false,
    translations: {
      zh: { description: "购物车受控数量选择：原生 1–9 与 10+ 输入；业务提供库存／限购上限。支持取消、键盘、更新中、禁用和错误。" },
      en: { description: "Controlled cart quantity select with native 1–9 options and a validated 10+ editor. The host supplies purchase limits and asynchronous state." },
    },
  } },
  args: { value: 1, max: 25, label: "商品数量", disabled: false, loading: false, onValueChange: () => {} },
  argTypes: { value: { control: "number" }, max: { control: "number" }, label: { control: "text" }, locale: { control: false }, onValueChange: { control: false } },
} satisfies Meta<typeof QuantitySelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Overview",
  render: (args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return <div style={{ display: "grid", gap: "var(--space-300)", maxWidth: 320 }}>
      <p>{locale === "zh" ? "选择 10+ 可输入更多数量" : "Choose 10+ to enter a larger quantity"}</p>
      <Controlled {...args} locale={locale} label={locale === "zh" ? "面膜数量" : "Mask quantity"} />
    </div>;
  },
};
export const Playground: Story = { render: (args, { globals }) => <Controlled key={`${args.value}-${args.max}`} {...args} locale={globals.locale === "en" ? "en" : "zh"} /> };
export const PC: Story = { ...Showcase, globals: { viewport: { value: "yamiDesktop", isRotated: false } } };
export const Mobile: Story = { ...Showcase, globals: { viewport: { value: "yamiMobile", isRotated: false } } };
export const States: Story = {
  render: (args, { globals }) => {
    const zh = globals.locale !== "en";
    const variants = [
      { title: zh ? "默认" : "Default", value: 1 },
      { title: zh ? "仅剩 2 件" : "Limit: 2", value: 2, max: 2 },
      { title: "10+", value: 12 },
      { title: zh ? "禁用" : "Disabled", value: 1, disabled: true },
      { title: zh ? "更新中" : "Updating", value: 2, loading: true },
      { title: zh ? "更新失败" : "Update failed", value: 3, error: zh ? "数量更新失败，请重试" : "Could not update quantity. Try again." },
    ];
    return <div style={{ display: "grid", gap: "var(--space-400)", maxWidth: 320 }}>
      {variants.map(({ title, ...props }) => <section key={title}><p>{title}</p><Controlled {...args} {...props} label={title} locale={zh ? "zh" : "en"} /></section>)}
    </div>;
  },
};
export const Interaction: Story = {
  tags: ["!dev"],
  render: (args) => <Controlled {...args} locale="en" label="Mask quantity" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Mask quantity" });
    await userEvent.selectOptions(select, "3");
    await expect(select).toHaveValue("3");
    await userEvent.selectOptions(select, "custom");
    const input = canvas.getByRole("textbox", { name: "Mask quantity: enter quantity" });
    await expect(input).toHaveFocus();
    for (const value of ["", "0", "-2", "1.5", "1e1", "26"]) {
      await userEvent.clear(input);
      if (value) await userEvent.type(input, value);
      await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
      await expect(canvas.getByRole("alert")).toHaveTextContent("Enter a whole number from 1 to 25");
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(select).not.toHaveAttribute("aria-invalid", "true");
      await expect(select).toHaveValue("3");
    }
    await userEvent.clear(input);
    await userEvent.type(input, "12");
    await userEvent.keyboard("{Enter}");
    await expect(select).toHaveDisplayValue("12");
    await userEvent.click(canvas.getByRole("button", { name: "Edit Mask quantity" }));
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "24");
    await userEvent.keyboard("{Escape}");
    await expect(select).toHaveDisplayValue("12");
    await expect(select).toHaveFocus();
  },
};
