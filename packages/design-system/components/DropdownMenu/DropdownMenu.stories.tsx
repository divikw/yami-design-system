import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DropdownMenu } from "./DropdownMenu";
import { ShoppingListMenu } from "./examples";

const meta = {
  id: "yami-components-layout-dropdown-menu",
  title: "YAMI/Components/DropdownMenu",
  component: DropdownMenu,
  parameters: { layout: "centered" },
  render: (_, { globals }) => <ShoppingListMenu en={globals.locale === "en"} />,
} satisfies Meta<typeof DropdownMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole("button", { name: /清单选项|List options/ });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const check = await body.findByRole("menuitemcheckbox");
    await expect(check).toBeChecked();
    await userEvent.click(check);
    await expect(check).not.toBeChecked();
    const sub = body.getByRole("menuitem", { name: /排序方式|Sort by/ });
    sub.focus();
    await userEvent.keyboard("{ArrowRight}");
    const byName = await body.findByRole("menuitemradio", { name: /商品名称|Product name/ });
    await userEvent.click(byName);
    await expect(byName).toBeChecked();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(sub).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const PCPreview: Story = {
  name: "PC", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } }, play: undefined,
};
export const MobilePreview: Story = {
  name: "Mobile", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } }, play: undefined,
};
