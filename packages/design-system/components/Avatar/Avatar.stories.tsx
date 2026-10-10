import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Avatar, type AvatarSize } from "./Avatar";
import type { MembershipIconTier } from "../MembershipIcon";

const meta = {
  title: "YAMI/Components/Data Display/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  decorators: [
    (Story, { args, globals }) => (
      <Story args={{ ...args, lang: args.lang ?? (globals.locale === "zh" ? "zh" : "en") }} />
    ),
  ],
  argTypes: {
    lang: { control: "inline-radio", options: ["en", "zh"], description: "Language of the accessible membership name. Follows the language toolbar unless overridden." },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    src: { control: "text" },
    alt: { control: "text" },
    membershipTier: {
      control: "select",
      options: ["none", "ruby-0", "ruby", "silver", "gold"],
      mapping: { none: undefined },
    },
  },
  args: { alt: "Default avatar", size: "md" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "end", gap: "var(--space-300)", fontFamily: "var(--font-family-ios)" }}>
      {(["sm", "md", "lg"] as AvatarSize[]).map((size, index) => (
        <div key={size} style={{ display: "grid", justifyItems: "center", gap: "var(--space-100)" }}>
          <Avatar {...args} size={size} />
          <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-caption-md)" }}>
            {size} · {[32, 40, 48][index]}px
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="avatar-image"]')).toHaveLength(3));
    await expect(canvasElement.querySelectorAll('[data-slot="avatar-fallback"]')).toHaveLength(0);
  },
};

export const Playground: Story = {};

export const Membership: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-300)", fontFamily: "var(--font-family-ios)" }}>
      {(["ruby-0", "ruby", "silver", "gold"] as MembershipIconTier[]).map((tier) => (
        <div key={tier} style={{ display: "grid", justifyItems: "center", gap: "var(--space-100)" }}>
          <Avatar {...args} membershipTier={tier} />
          <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-caption-sm)" }}>
            {tier === "ruby-0" ? "Ruby-0" : tier[0].toUpperCase() + tier.slice(1)}
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="avatar-image"]')).toHaveLength(4));
    await expect(canvasElement.querySelectorAll('[data-slot="avatar-membership"]')).toHaveLength(4);
  },
};
