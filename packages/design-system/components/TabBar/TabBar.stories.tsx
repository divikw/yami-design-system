import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TabBar } from "./TabBar";
import { tabBarExampleItems } from "./examples";

const meta = {
  id: "yami-components-navigation-tab-bar",
  title: "YAMI/Components/Tab Bar",
  component: TabBar,
  parameters: { layout: "fullscreen", docs: { playground: "Playground", showStories: false,
    translations: {
      zh: { description: "从购物车抽取的 App 底部导航，保留图标、标签、当前项和数量角标。页面负责路由、底部固定位置及响应式显示。",
        argDescriptions: { items: "导航项目：唯一值、标签、装饰图标、可选数量，以及链接或操作回调。", value: "由页面控制的当前目的地。", "aria-label": "导航区域的可访问名称。" } },
      en: { description: "App destination navigation extracted from the cart. Preserves icons, labels, current destination and count badges. The host owns routing, fixed positioning and responsive visibility.",
        argDescriptions: { items: "Destinations with unique values, labels, decorative icons, optional counts and links or callbacks.", value: "Current destination controlled by the host.", "aria-label": "Accessible name for the navigation region." } },
    },
  } },
  args: { items: tabBarExampleItems(), value: "cart", "aria-label": "App navigation" },
  argTypes: { items: { control: false }, value: { control: "select", options: ["home", "shop", "community", "cart", "account"] }, "aria-label": { control: "text" } },
} satisfies Meta<typeof TabBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return <div style={{ maxWidth: 402, margin: "var(--space-200) auto" }}>
      <TabBar lang={locale} aria-label={locale === "zh" ? "App 导航" : "App navigation"} value="cart" items={tabBarExampleItems(locale)} />
    </div>;
  },
};

export const Playground: Story = {
  render: (args, { globals }) => <TabBar {...args} lang={globals.locale === "en" ? "en" : "zh"} items={tabBarExampleItems(globals.locale === "en" ? "en" : "zh")} />,
};

export const Mobile: Story = { ...Showcase, globals: { viewport: { value: "yamiMobile", isRotated: false } } };
export const CountOverflow: Story = {
  render: (args, { globals }) => <TabBar {...args} items={tabBarExampleItems(globals.locale === "en" ? "en" : "zh", 123)} />,
};

function ActionExample() {
  const [value, setValue] = useState("shop");
  const items = tabBarExampleItems().map(({ href: _href, ...item }) => ({ ...item, onClick: () => setValue(item.value) }));
  return <TabBar aria-label="App navigation" value={value} items={items} />;
}

export const Interaction: Story = {
  render: () => <ActionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Shop", exact: true })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("button", { name: "Cart 6", exact: true }));
    await expect(canvas.getByRole("button", { name: "Cart 6", exact: true })).toHaveAttribute("aria-current", "page");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Account", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Account", exact: true })).toHaveAttribute("aria-current", "page");
  },
};

export const PCPreview: Story = {
  ...Showcase,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Mobile,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
