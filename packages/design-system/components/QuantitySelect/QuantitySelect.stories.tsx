import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { QuantitySelect, type QuantitySelectProps } from "./QuantitySelect";

function Controlled(props: QuantitySelectProps) {
  const [value, setValue] = useState(props.value);
  return <QuantitySelect {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  id: "yami-components-form-quantityselect",
  title: "YAMI/Components/QuantitySelect",
  component: QuantitySelect,
  globals: { theme: "light" },
  parameters: { layout: "padded", controls: { localizeDescriptions: true }, docs: { playground: "Playground", showStories: false,
    translations: {
      zh: { description: "购物车受控数量选择：自定义下拉列表与 10+ 输入；业务提供库存／限购上限。失焦或 Enter 提交，支持键盘、更新中、禁用和错误。",
        argDescriptions: {
          value: "当前数量，受控值；取值为 1 至 max 的整数。",
          max: "由业务提供的库存／限购上限，必须为正整数。",
          onValueChange: "数量提交回调，返回校正后的整数；相同数量不重复触发。",
          label: "控件的无障碍名称；多个数量选择器并列时，应包含商品名称。",
          locale: "内置操作和提示文案的语言；示例跟随顶部语言切换。",
          disabled: "禁用数量选择和输入。",
          loading: "更新中状态，锁定编辑并播报进度。",
          error: "业务错误提示，与数量控件关联显示。",
        },
      },
      en: { description: "Controlled cart quantity select with accessible 1–9 options and a validated 10+ editor. The host supplies purchase limits and asynchronous state.",
        argDescriptions: {
          value: "Controlled quantity; an integer from 1 to max.",
          max: "Positive integer stock/purchase limit supplied by the host.",
          onValueChange: "Called with the normalized integer on commit; unchanged quantities do not trigger it.",
          label: "Accessible control name; include the product name when multiple selectors appear together.",
          locale: "Language for built-in actions and messages; examples follow the toolbar language.",
          disabled: "Disables quantity selection and input.",
          loading: "Locks editing and announces progress while updating.",
          error: "Host-provided error message displayed and associated with the control.",
        },
      },
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
    await userEvent.click(select);
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "3", exact: true }));
    await expect(select).toHaveTextContent("3");
    await userEvent.click(select);
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "10+", exact: true }));
    const input = canvas.getByRole("textbox", { name: "Mask quantity: enter quantity" });
    await expect(input).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: "Apply" })).toBeNull();
    await expect(canvas.queryByRole("button", { name: "Cancel" })).toBeNull();
    await userEvent.clear(input);
    await userEvent.type(input, "12");
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("12");
    await expect(input).not.toHaveFocus();
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "26");
    await userEvent.tab();
    await expect(input).toHaveValue("25");
    await expect(await within(canvasElement.ownerDocument.body).findByRole("alert")).toHaveTextContent("Maximum quantity is 25");
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "24");
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("25");
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");
    const restored = canvas.getByRole("combobox", { name: "Mask quantity" });
    await expect(restored).toHaveTextContent("1");
    await expect(restored).toHaveFocus();
  },
};

export const PCPreview: Story = {
  ...PC,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Mobile,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
