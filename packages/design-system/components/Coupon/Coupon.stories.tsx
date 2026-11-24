import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Coupon, type CouponProps } from "./Coupon";

import { NewUserCouponExample } from "./fixtures";

type SelectionProps = Extract<CouponProps, { selected: boolean }>;

function Controlled(props: SelectionProps) {
  const [selected, setSelected] = useState(props.selected);
  return <Coupon {...props} selected={selected} onSelectedChange={setSelected} />;
}

const englishCopy = { title: "Save 10%", description: "Valid on Yami-fulfilled items. Exclusions apply.", validity: "Valid until 01/01/2027 15:59" };

const meta = {
  id: "yami-components-commerce-coupon",
  title: "YAMI/Modules/Commerce/Coupon",
  component: Coupon,
  parameters: { layout: "padded", docs: { playground: "Playground", showStories: false, translations: {
    zh: { argDescriptions: { claim: "设置领取状态、按钮文案和领取回调。选券时使用 selected 和 onSelectedChange。" }, description: "可在卡片右上角领取优惠券，也可在结算时整卡选券。领取状态和选中状态由业务方维护。" },
    en: { argDescriptions: { claim: "Claim status, localized button text and claim callback. For checkout selection use selected and onSelectedChange." }, description: "Use the top-right button to claim a coupon, or select a coupon at checkout. The host controls both interactions." },
  } } },
  args: { title: "立享 10% OFF", description: "亚米自营商品通用，特殊商品除外", validity: "有效期至 01/01/2027 15:59", selected: false, disabled: false, onSelectedChange: () => {} },
  argTypes: { claim: { control: false }, onSelectedChange: { control: false } },
} satisfies Meta<typeof Coupon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => {
    const en = globals.locale === "en";
    const { disabled } = args;
    const title = en && args.title === meta.args.title ? englishCopy.title : args.title;
    const description = en && args.description === meta.args.description ? englishCopy.description : args.description;
    const validity = en && args.validity === meta.args.validity ? englishCopy.validity : args.validity;
    return <div style={{ display: "grid", gap: "var(--space-300)", maxWidth: 416 }}>
      <NewUserCouponExample title={title} description={description} disabled={disabled} en={en} />
      <Controlled key={String(args.selected)} {...args} title={title} description={description} validity={validity} />
    </div>;
  },
};
export const Showcase: Story = {
  name: "Overview",
  render: (args, { globals }) => {
    const en = globals.locale === "en";
    const copy = en ? englishCopy : args;
    return <div style={{ display: "grid", gap: "var(--space-300)", maxWidth: 416 }}>
      <NewUserCouponExample title={copy.title} description={copy.description} en={en} />
      <Controlled {...args} {...copy} />
      <Controlled {...args} {...copy} selected />
      <Controlled {...args} {...copy} disabled description={en ? "Requirements not met" : "尚未满足使用条件"} />
    </div>;
  },
};
export const Interaction: Story = {
  ...Playground,
  tags: ["!dev"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");
    const selectionCard = checkbox.closest("label")!;
    await userEvent.click(within(selectionCard).getByText(/亚米自营商品通用|Valid on Yami/));
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    checkbox.focus();
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();
    const claimButton = canvas.getByRole("button", { name: /^(Claim|领取)$/ });
    claimButton.focus();
    await userEvent.keyboard("{Enter}");
    await expect(claimButton.closest('[data-slot="coupon"]')).toHaveAttribute("aria-busy", "true");
    await expect(claimButton).toHaveAccessibleName(/^(Claiming…|领取中)$/);
    await expect(claimButton).toHaveAttribute("aria-disabled", "true");
    const useLink = await canvas.findByRole("link", { name: /^(Use now|去使用)$/ });
    await expect(useLink).toHaveAttribute("href", `https://www.yamibuy.com/${globals.locale === "en" ? "en" : "zh"}`);
    await expect(checkbox).toBeChecked();
  },
};

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
