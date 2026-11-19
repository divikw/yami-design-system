import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { NavigationMenu } from "./NavigationMenu";
import { ShopNavigation } from "./examples";

const meta = {
  id: "yami-components-navigation-navigation-menu",
  title: "YAMI/Components/NavigationMenu",
  component: NavigationMenu,
  parameters: { layout: "centered" },
  render: (_, { globals }) => <ShopNavigation en={globals.locale === "en"} />,
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /商品分类|Departments/ });
    const indicator = trigger.closest("li")!.querySelector('[data-slot="navigation-menu-indicator"]');
    await expect(indicator).not.toBeVisible();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    const link = await within(canvasElement.ownerDocument.body).findByRole("link", { name: /美妆护肤|Beauty & skincare/ });
    await expect(link).toHaveAttribute("href", expect.stringMatching(/beauty\/2$/));
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(indicator).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(indicator).not.toBeVisible();
    await expect(trigger).toHaveFocus();
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
