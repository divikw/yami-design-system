import { useId, useState } from "react";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import { Input } from "../Input";
import { Dialog } from "./Dialog";

export function DialogExample({ locale = "zh", long = false }: { locale?: "zh" | "en"; long?: boolean }) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const zh = locale === "zh";
  return (
    <div lang={locale}>
      <Button variant="secondary" onClick={() => setOpen(true)}>{long ? (zh ? "查看说明" : "View details") : (zh ? "编辑昵称" : "Edit nickname")}</Button>
      <Dialog open={open} title={long ? (zh ? "配送说明" : "Delivery details") : (zh ? "编辑昵称" : "Edit nickname")} closeLabel={zh ? "关闭" : "Close"} lang={locale} onClose={() => setOpen(false)}
        footer={<ButtonGroup full aria-label={zh ? "编辑操作" : "Editing actions"}>
          <Button variant="secondary" size="md" onClick={() => setOpen(false)}>{zh ? "取消" : "Cancel"}</Button>
          <Button size="md" htmlType="submit" htmlForm={formId}>{zh ? "保存" : "Save"}</Button>
        </ButtonGroup>}>
        <form id={formId} onSubmit={(event) => { event.preventDefault(); setOpen(false); }}>
          {long ? Array.from({ length: 24 }, (_, index) => <p key={index}>{zh ? "请在下单前核对配送地址和联系电话。配送进度可在订单详情中查看。" : "Check your delivery address and phone number before ordering. Track delivery in your order details."}</p>) : <Input fullWidth label={zh ? "昵称" : "Nickname"} name="nickname" defaultValue="YAMI" required />}
        </form>
      </Dialog>
    </div>
  );
}
