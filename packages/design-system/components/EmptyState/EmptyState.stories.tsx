import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { EmptyState } from "./EmptyState";
import { SavedLists } from "./examples";

const meta = {
  id: "yami-components-data-display-emptystate",
  title: "YAMI/Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <SavedLists en={globals.locale === "en"} />,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /创建清单|Create list/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent(/已创建购物清单|Shopping list created/);
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
