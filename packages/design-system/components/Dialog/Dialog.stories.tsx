import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DialogExample } from "./examples";
import { Button } from "../Button";
import { useDesktopViewport } from "../Drawer/useDesktopViewport";
import { Dialog, type DialogProps } from "./Dialog";
import styles from "./Dialog.stories.module.css";

type DialogDemoProps = DialogProps & {
  confirmLabel?: string;
  confirmVariant?: "primary" | "emphasis";
  message?: string;
};

function DialogDemo({
  confirmLabel = "确认",
  confirmVariant = "primary",
  message = "应用后，当前设置将立即生效。",
  ...args
}: DialogDemoProps) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <div className={styles.screen}>
      <Button size={actionSize} onClick={() => setOpen(true)}>打开居中弹窗</Button>
      <Dialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <div className={styles.footerActions}>
            <Button size="md" variant="secondary" form="full" onClick={() => setOpen(false)}>取消</Button>
            <Button size="md" variant={confirmVariant} form="full" onClick={() => setOpen(false)}>{confirmLabel}</Button>
          </div>
        )}
      >
        <p className={styles.copy}>{message}</p>
      </Dialog>
    </div>
  );
}

function LongTitleDialogDemo(args: DialogProps) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <div className={styles.screen}>
      <Button size={actionSize} onClick={() => setOpen(true)}>打开多操作弹窗</Button>
      <Dialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <div className={`${styles.footerActions} ${styles.footerActionsVertical}`}>
            <Button size="md" variant="primary" form="full" onClick={() => setOpen(false)}>使用当前地址</Button>
            <Button size="md" variant="secondary" form="full" onClick={() => setOpen(false)}>选择其他地址</Button>
            <Button size="md" variant="secondary" form="full" onClick={() => setOpen(false)}>取消</Button>
          </div>
        )}
      >
        <p className={styles.copy}>你也可以选择其他地址，或暂时取消操作。</p>
      </Dialog>
    </div>
  );
}

const meta = {
  id: "yami-components-layout-dialog",
  title: "YAMI/Components/Dialog",
  component: Dialog,
  tags: ["!autodocs", "draft"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "Base UI Dialog with YAMI styling and a controlled API." } },
  },
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  args: { open: false, title: "确认操作", onClose: () => {}, role: "dialog", variant: "confirmation" },
  argTypes: {
    role: { control: "select", options: ["dialog", "alertdialog"] },
    variant: { control: "select", options: ["default", "confirmation"] },
  },
  render: (args) => <DialogDemo {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: (_args, { globals }) => <div className={styles.screen}><DialogExample locale={globals.locale === "en" ? "en" : "zh"} /></div>,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /编辑昵称|Edit nickname/ });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog");
    await expect(dialog).toHaveAccessibleName(/编辑昵称|Edit nickname/);
    const close = within(dialog).getByRole("button", { name: /关闭|Close/ });
    await waitFor(() => expect(close).toHaveFocus());
    await userEvent.click(within(dialog).getByRole("button", { name: /保存|Save/ }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Destructive: Story = {
  name: "Mobile — Destructive Confirmation",
  args: { title: "删除该记录？", role: "alertdialog" },
  render: (args) => (
    <DialogDemo
      {...args}
      confirmLabel="删除"
      confirmVariant="emphasis"
      message="删除后无法恢复。"
    />
  ),
};

export const LongTitleThreeActions: Story = {
  name: "Mobile — Long Title + Three Actions",
  args: { title: "是否继续使用当前地址完成配送设置并保存本次修改？" },
  render: (args) => <LongTitleDialogDemo {...args} />,
};

export const Desktop: Story = {
  name: "PC — Confirmation",
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};

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

export const Playground: Story = { tags: ["!dev", "!test"] };
