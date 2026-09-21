import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button";
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
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <div className={styles.screen}>
      <Button onClick={() => setOpen(true)}>打开居中弹窗</Button>
      <Dialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <div className={styles.footerActions}>
            <Button variant="secondary" form="full" onClick={() => setOpen(false)}>取消</Button>
            <Button variant={confirmVariant} form="full" onClick={() => setOpen(false)}>{confirmLabel}</Button>
          </div>
        )}
      >
        <p className={styles.copy}>{message}</p>
      </Dialog>
    </div>
  );
}

function LongTitleDialogDemo(args: DialogProps) {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <div className={styles.screen}>
      <Button onClick={() => setOpen(true)}>打开多操作弹窗</Button>
      <Dialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <div className={`${styles.footerActions} ${styles.footerActionsVertical}`}>
            <Button variant="primary" form="full" onClick={() => setOpen(false)}>使用当前地址</Button>
            <Button variant="secondary" form="full" onClick={() => setOpen(false)}>选择其他地址</Button>
            <Button variant="secondary" form="full" onClick={() => setOpen(false)}>取消</Button>
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
  title: "YAMI/Components/Layout/Dialog/Draft/V1",
  component: Dialog,
  tags: ["!autodocs", "draft"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "**Draft · 草稿**：当前弹窗及全部预览内容尚未定稿或完成 review。" } },
  },
  globals: { locale: "zh", viewport: { value: "yamiMobile", isRotated: false } },
  args: { open: false, title: "确认操作", onClose: () => {}, role: "dialog", variant: "confirmation" },
  argTypes: {
    role: { control: "select", options: ["dialog", "alertdialog"] },
    variant: { control: "select", options: ["default", "confirmation"] },
  },
  render: (args) => <DialogDemo {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = { name: "Mobile — Confirmation" };

export const Destructive: Story = {
  name: "Mobile — Destructive confirmation",
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
  name: "Mobile — Long title + three actions",
  args: { title: "是否继续使用当前地址完成配送设置并保存本次修改？" },
  render: (args) => <LongTitleDialogDemo {...args} />,
};

export const Desktop: Story = {
  name: "PC — Confirmation",
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};
