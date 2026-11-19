import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";
import { LoadingOrders } from "./examples";

const meta = {
  id: "yami-components-data-display-spinner",
  title: "YAMI/Components/Spinner",
  component: Spinner,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <LoadingOrders en={globals.locale === "en"} />,
} satisfies Meta<typeof Spinner>;

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
