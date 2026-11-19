import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";
import { ProfileSkeleton } from "./examples";

const meta = {
  id: "yami-components-data-display-skeleton",
  title: "YAMI/Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <ProfileSkeleton en={globals.locale === "en"} />,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {};

export const PCPreview: Story = {
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
