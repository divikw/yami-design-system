import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Alert } from "./Alert";
import { StockAlert } from "./examples";

const meta = {
  id: "yami-components-data-display-alert",
  title: "YAMI/Components/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <div style={{ maxWidth: "28rem", marginInline: "auto" }}>
    <StockAlert en={globals.locale === "en"} />
  </div>,
} satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const notice = within(canvasElement).getByRole("alert");
    await expect(notice).toHaveAttribute("data-variant", "destructive");
    await userEvent.click(within(notice).getByRole("button", { name: /改为 2 件|Change to 2/ }));
    await expect(notice).toHaveAttribute("data-variant", "default");
    await expect(notice).toHaveTextContent(/数量已更新|Quantity updated/);
  },
};

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
