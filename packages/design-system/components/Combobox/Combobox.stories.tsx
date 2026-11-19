import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Combobox } from "./Combobox";
import { BasicCombobox } from "./examples";

const meta = {
  id: "yami-components-forms-combobox",
  title: "YAMI/Components/Combobox",
  component: Combobox,
  parameters: { layout: "padded" },
  render: (_, { globals }) => <div style={{ maxWidth: "24rem" }}><BasicCombobox en={globals.locale === "en"} /></div>,
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement, globals }) => {
    const input = within(canvasElement).getByRole("combobox");
    const document = within(canvasElement.ownerDocument.body);
    const city = globals.locale === "en" ? "Tokyo" : "东京";
    await userEvent.click(input);
    await userEvent.type(input, "zzz");
    await expect(await document.findByText(/No matching cities|没有匹配的城市/)).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, city.slice(0, 1));
    await expect(await document.findByRole("option", { name: city })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue(city);
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

export const PCPreview: Story = {
  name: "PC", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
};
export const MobilePreview: Story = {
  name: "Mobile", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
