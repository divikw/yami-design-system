import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { Avatar, type AvatarSize } from "./Avatar";
import type { MembershipIconTier } from "../MembershipIcon";

const meta = {
  id: "yami-components-data-display-avatar",
  title: "YAMI/Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
    controls: { localizeDescriptions: true },
    docs: {
      translations: {
        zh: {
          description: "YAMI 圆形头像：提供 32、40、48px 三种尺寸；支持默认图片、加载失败回退及会员等级标识。",
          argDescriptions: {
            src: "头像图片地址；未提供或加载失败时显示默认头像。",
            alt: "头像的无障碍名称；旁边已有可见姓名时可传空字符串。",
            size: "头像尺寸：sm 为 32px，md 为 40px，lg 为 48px。",
            membershipTier: "可选会员等级，显示对应的彩色边框和角标。",
            lang: "会员无障碍名称的语言；默认跟随顶部语言切换，也可单独指定。",
          },
        },
        en: {
          description: "YAMI circular avatar in 32, 40 and 48px sizes, with default artwork, image-error fallback and membership indicators.",
          argDescriptions: {
            src: "Image URL; uses default artwork when omitted or loading fails.",
            alt: "Accessible name; pass an empty string beside an existing visible name.",
            size: "Avatar diameter: sm is 32px, md is 40px, lg is 48px.",
            membershipTier: "Optional membership tier, shown with its ring and corner indicator.",
            lang: "Language of the accessible membership name; follows the toolbar unless overridden.",
          },
        },
      },
    },
  },
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
    await waitFor(() => expect(canvasElement.querySelectorAll('[data-slot="avatar-default"]')).toHaveLength(0));
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
