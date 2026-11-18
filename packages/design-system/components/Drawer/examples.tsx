import { useState } from "react";
import { Button } from "../Button";
import { Drawer, type DrawerProps } from "./Drawer";

type ExampleProps = Pick<DrawerProps, "swipeDirection" | "size" | "snapPoints" | "modal" |
  "disablePointerDismissal" | "showSwipeHandle" | "style"> & {
  locale?: "zh" | "en";
  trigger?: string;
};

export function DrawerExample({ locale = "zh", trigger, size = "full", ...props }: ExampleProps) {
  const [open, setOpen] = useState(false);
  const zh = locale === "zh";
  return <>
    <Button onClick={() => setOpen(true)}>{trigger ?? (zh ? "打开" : "Open")}</Button>
    <Drawer {...props} size={size} lang={locale} open={open} title={zh ? "抽屉" : "Drawer"}
      closeLabel={zh ? "关闭" : "Close"} onClose={() => setOpen(false)}>
      <p>{zh ? "按 Escape 或点击关闭按钮返回页面。" : "Press Escape or use the close button to return to the page."}</p>
    </Drawer>
  </>;
}
