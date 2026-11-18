import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { MembershipIcon, type MembershipIconTier } from "./MembershipIcon";

const tiers: MembershipIconTier[] = ["ruby-0", "ruby", "silver", "gold"];

const meta = {
  id: "yami-components-data-display-membershipicon",
  title: "YAMI/Assets/Membership/MembershipIcon",
  component: MembershipIcon,
  parameters: { layout: "padded" },
  argTypes: {
    tier: { control: "inline-radio", options: tiers },
    alt: { control: "text" },
  },
  args: { tier: "ruby-0" },
} satisfies Meta<typeof MembershipIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-200)" }}>
      {tiers.map((tier) => <MembershipIcon key={tier} tier={tier} />)}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const images = [...canvasElement.querySelectorAll("img")];
    await expect(images).toHaveLength(4);
    await waitFor(() => expect(images.every((image) => image.complete && image.naturalWidth > 0)).toBe(true));
  },
};

export const Playground: Story = {};

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
