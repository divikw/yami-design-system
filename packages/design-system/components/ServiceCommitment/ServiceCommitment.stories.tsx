import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceCommitment } from "./index";

const meta = {
  title: "YAMI/Modules/Commerce/Service Commitment",
  component: ServiceCommitment,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: (args, { globals }) => <ServiceCommitment {...args} locale={globals.locale === "en" ? "en" : "zh"} />,
} satisfies Meta<typeof ServiceCommitment>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = { tags: ["!dev", "!autodocs"] };

export const PCPreview: Story = {
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};

export const MobilePreview: Story = {
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
