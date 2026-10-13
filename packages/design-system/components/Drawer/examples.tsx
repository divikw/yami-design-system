import { useState } from "react";
import { Button } from "../Button";
import { Drawer } from "./Drawer";

export function DrawerExample() {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>优惠券</Button>
    <Drawer open={open} title="优惠券" closeLabel="关闭优惠券" onClose={() => setOpen(false)}>
      <p>暂无可用优惠券</p>
    </Drawer>
  </>;
}
