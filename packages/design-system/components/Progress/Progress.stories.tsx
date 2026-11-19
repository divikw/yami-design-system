import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Progress } from "./Progress";
import { TransferProgress } from "./examples";

const meta = {
  id: "yami-components-data-display-progress",
  title: "YAMI/Components/Progress",
  component: Progress,
  args: { value: 50 },
  parameters: { layout: "padded" },
  render: (_, { globals }) => <TransferProgress en={globals.locale === "en"} />,
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar", { name: /上传进度|Upload progress/ });
    await expect(bar).toHaveAttribute("aria-valuenow", "50");
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(bar).toHaveAttribute("aria-valuenow", "100");
    await expect(bar).toHaveAttribute("data-complete");
    await expect(canvas.getByText("100%")).toBeVisible();
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
