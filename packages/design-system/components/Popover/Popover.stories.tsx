import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "./Popover";
import { Button } from "../Button";
import { useDesktopViewport } from "../Drawer/useDesktopViewport";
import styles from "./examples.module.css";
import { translations } from "./story-translations";

const meta = { id: "yami-components-layout-popover", title: "YAMI/Components/Popover", component: Popover,
  parameters: { layout: "centered", controls: { localizeDescriptions: true }, docs: { translations } },
  argTypes: { onOpenChange: { control: false }, children: { control: false }, open: { control: "boolean" }, defaultOpen: { control: "boolean" } },
  render: function PopoverExample(args, { globals }) {
    const actionSize = useDesktopViewport() ? "md" : "sm";
    const title = globals.locale === "en" ? "Delivery details" : "配送说明";
    return <Popover {...args}>
      <PopoverTrigger render={<Button size={actionSize} variant="secondary" />}>{title}</PopoverTrigger>
      <PopoverContent>
        <div className={styles.body}>
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{globals.locale === "en" ? "Shipping options appear at checkout." : "配送方式及费用将在结算时显示。"}</PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>;
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /Delivery details|配送说明/ });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
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
