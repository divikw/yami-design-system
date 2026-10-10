import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { MembershipBadge, type MembershipBadgeTier } from "./MembershipBadge";

const tiers: MembershipBadgeTier[] = ["ruby-0", "ruby", "silver", "gold"];

const meta = {
  title: "YAMI/Components/Data Display/MembershipBadge",
  component: MembershipBadge,
  parameters: { layout: "padded" },
  argTypes: {
    tier: { control: "inline-radio", options: tiers },
    alt: { control: "text" },
  },
  args: { tier: "ruby-0" },
} satisfies Meta<typeof MembershipBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-200)" }}>
      {tiers.map((tier) => <MembershipBadge key={tier} tier={tier} />)}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const images = [...canvasElement.querySelectorAll("img")];
    await expect(images).toHaveLength(4);
    await waitFor(() => expect(images.every((image) => image.complete && image.naturalWidth > 0)).toBe(true));
  },
};

export const Playground: Story = {};
