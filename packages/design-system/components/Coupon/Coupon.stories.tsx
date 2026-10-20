import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Coupon, type CouponProps } from "./Coupon";

function Controlled(props: CouponProps) {
  const [selected, setSelected] = useState(props.selected);
  return <Coupon {...props} selected={selected} onSelectedChange={setSelected} />;
}

const meta = {
  title: "YAMI/Components/Commerce/Coupon",
  component: Coupon,
  parameters: { layout: "padded", docs: { playground: "Playground", showStories: false, translations: {
    zh: { description: "受控优惠券卡片。业务方维护可用性、单选或多选，以及保存后的应用逻辑。" },
    en: { description: "Controlled coupon selection card. The host owns eligibility, selection limits and saving." },
  } } },
  args: { title: "立享 20% OFF", description: "亚米自营商品通用，特殊商品除外", validity: "有效期至 01/01/2027 15:59", selected: false, disabled: false, onSelectedChange: () => {} },
  argTypes: { onSelectedChange: { control: false } },
} satisfies Meta<typeof Coupon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { render: (args) => <div style={{ maxWidth: 416 }}><Controlled key={`${args.selected}-${args.disabled}`} {...args} /></div> };
export const Showcase: Story = {
  name: "Overview",
  render: (args, { globals }) => {
    const en = globals.locale === "en";
    const copy = en ? { title: "Save 20%", description: "Yami fulfilled items; exclusions apply.", validity: "Valid until 01/01/2027 15:59" } : {};
    return <div style={{ display: "grid", gap: "var(--space-300)", maxWidth: 416 }}>
      <Controlled {...args} {...copy} />
      <Controlled {...args} {...copy} selected />
      <Controlled {...args} {...copy} disabled description={en ? "Requirements not met" : "尚未满足使用条件"} />
    </div>;
  },
};
export const Interaction: Story = {
  ...Playground,
  tags: ["!dev"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    await userEvent.click(canvas.getByText("亚米自营商品通用，特殊商品除外"));
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
  },
};
