import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AlertDialog } from "./AlertDialog";
import { AlertDialogExample } from "./examples";

const meta = {
  id: "yami-components-layout-alert-dialog",
  title: "YAMI/Components/AlertDialog",
  component: AlertDialog,
  parameters: { layout: "centered" },
  render: (_args, { globals }) => <AlertDialogExample locale={globals.locale === "en" ? "en" : "zh"} />,
} satisfies Meta<typeof AlertDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /确认更改|Confirm changes/ });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("alertdialog");
    await expect(dialog).toHaveAccessibleName(/应用配送设置|Apply delivery settings/);
    const cancel = within(dialog).getByRole("button", { name: /取消|Cancel/ });
    await waitFor(() => expect(cancel).toHaveFocus());
    await userEvent.click(cancel);
    await waitFor(() => expect(body.queryByRole("alertdialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Destructive: Story = {
  render: (_args, { globals }) => <AlertDialogExample destructive locale={globals.locale === "en" ? "en" : "zh"} />,
};
export const PCPreview: Story = {
  ...Showcase, name: "PC", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } }, play: undefined,
};
export const MobilePreview: Story = {
  ...Showcase, name: "Mobile", tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } }, play: undefined,
};
