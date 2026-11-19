import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Slider } from "./Slider";
import { BudgetSlider } from "./examples";

const meta = {
  id: "yami-components-forms-slider",
  title: "YAMI/Components/Slider",
  component: Slider,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <BudgetSlider en={globals.locale === "en"} />,
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const low = canvas.getByRole("slider", { name: /最低价格|Minimum price/ });
    const high = canvas.getByRole("slider", { name: /最高价格|Maximum price/ });
    await userEvent.tab();
    await expect(low).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(low).toHaveValue("25");
    await expect(high).toHaveValue("80");
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
