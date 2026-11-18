import { useState } from "react";
import { Button, Dialog, Drawer, useDesktopViewport } from "@yami/design-system";

export function ResponsivePanel({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const [open, setOpen] = useState(false);
  const desktop = useDesktopViewport();
  const zh = lang === "zh";
  const props = { open, lang, title: zh ? "详情" : "Details", closeLabel: zh ? "关闭" : "Close", onClose: () => setOpen(false) };
  const body = <p>{zh ? "按 Escape 或点击关闭按钮返回页面。" : "Press Escape or use the close button to return to the page."}</p>;
  return <>
    <Button onClick={() => setOpen(true)}>{zh ? "打开" : "Open"}</Button>
    {desktop ? <Dialog {...props}>{body}</Dialog> : <Drawer {...props} size="half">{body}</Drawer>}
  </>;
}
