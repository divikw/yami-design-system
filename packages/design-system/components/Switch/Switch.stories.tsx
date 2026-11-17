import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Switch } from "./Switch";
import { translations } from "./story-translations";
const meta = { id: "yami-components-forms-switch", title: "YAMI/Components/Switch", component: Switch,
  parameters: { layout: "padded", controls: { localizeDescriptions: true }, docs: { translations } },
  argTypes: { name: { control: "text" }, onCheckedChange: { control: false }, checked: { control: "boolean" }, defaultChecked: { control: "boolean" }, disabled: { control: "boolean" }, readOnly: { control: "boolean" } },
  args: { "aria-label": "Notifications" },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = {
  render: (_, { globals }) => <div style={{ display: "grid", justifyItems: "start", gap: "var(--space-200)", fontFamily: "var(--font-family-ios)", color: "var(--text-primary)" }}>
    <Switch>{globals.locale === "en" ? "Notifications" : "接收通知"}</Switch>
    <Switch defaultChecked>{globals.locale === "en" ? "On" : "已开启"}</Switch>
    <Switch disabled>{globals.locale === "en" ? "Disabled" : "不可用"}</Switch>
    <Switch defaultChecked disabled>{globals.locale === "en" ? "Disabled on" : "已开启（禁用）"}</Switch>
    <Switch defaultChecked readOnly>{globals.locale === "en" ? "Read only" : "只读"}</Switch>
  </div>,
  play: async ({ canvasElement }) => { const control = within(canvasElement).getByRole("switch", { name: /Notifications|接收通知/ }); await userEvent.click(control); await expect(control).toHaveAttribute("aria-checked", "true"); await userEvent.keyboard(" "); await expect(control).toHaveAttribute("aria-checked", "false"); },
};
export const Playground: Story = {};

export const PCPreview: Story = {
  ...Showcase,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Showcase,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
