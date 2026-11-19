import { useState } from "react";
import { useDesktopViewport, Button, Drawer, Input } from "@yami/design-system";

export function NestedDrawers({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const zh = lang === "zh";
  const close = zh ? "关闭" : "Close";
  return <>
    <Button size={actionSize} onClick={() => setOpen(true)}>{zh ? "打开" : "Open"}</Button>
    <Drawer open={open} title={zh ? "抽屉" : "Drawer"} closeLabel={close} lang={lang}
      onClose={() => setOpen(false)}>
      <Input fullWidth label={zh ? "备注" : "Note"} />
      <Button size={actionSize} onClick={() => setDetails(true)}>{zh ? "打开详情" : "Open details"}</Button>
      <Drawer open={details} title={zh ? "详情" : "Details"} closeLabel={close}
        lang={lang} swipeDirection="down" size="content" onClose={() => setDetails(false)}>
        <p>{zh ? "关闭详情后可以继续编辑备注。" : "Close the details to continue editing your note."}</p>
      </Drawer>
    </Drawer>
  </>;
}
