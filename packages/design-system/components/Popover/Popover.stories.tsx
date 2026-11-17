import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose } from "./Popover";
import { Button } from "../Button";
import styles from "./examples.module.css";
import { translations } from "./story-translations";

const closeIcon = new URL("../../assets/icons/action/close.svg", import.meta.url).href;
const meta = { id: "yami-components-layout-popover", title: "YAMI/Components/Popover", component: Popover,
  parameters: { layout: "centered", controls: { localizeDescriptions: true }, docs: { translations } },
  argTypes: { onOpenChange: { control: false }, children: { control: false }, open: { control: "boolean" }, defaultOpen: { control: "boolean" } },
  render: (args, { globals }) => <Popover {...args}><PopoverTrigger render={<Button variant="secondary" />}>{globals.locale === "en" ? "Delivery details" : "配送说明"}</PopoverTrigger><PopoverContent><div className={styles.body}><header className={styles.header}><PopoverTitle>{globals.locale === "en" ? "Delivery details" : "配送说明"}</PopoverTitle><PopoverClose render={<Button variant="tertiary" form="icon" className={styles.close} aria-label={globals.locale === "en" ? "Close" : "关闭"} />}><span className={styles.closeIcon} style={{ maskImage: `url("${closeIcon}")` }} aria-hidden="true" /></PopoverClose></header><PopoverDescription>{globals.locale === "en" ? "Shipping options appear at checkout." : "配送方式及费用将在结算时显示。"}</PopoverDescription></div></PopoverContent></Popover>,
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /Delivery details|配送说明/ });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole("dialog")).toBeVisible());
    await userEvent.click(body.getByRole("button", { name: /Close|关闭/, exact: true }));
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
