import { useRef, useState } from "react";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Sheet } from "./Sheet";
import styles from "./Sheet.stories.module.css";

export function SheetExample({ locale = "zh", full = false }: { locale?: "zh" | "en"; full?: boolean }) {
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  return (
    <div lang={locale}>
      <Button variant="secondary" onClick={() => setOpen(true)}>{zh ? "查看说明" : "View details"}</Button>
      <Sheet open={open} title={zh ? "配送说明" : "Delivery details"} closeLabel={zh ? "关闭" : "Close"}
        description={zh ? "下单前请核对以下信息。" : "Review these details before ordering."}
        size={full ? "full" : "content"} lang={locale} onClose={() => setOpen(false)}
        footer={<div className={styles.footer}><Button form="full" size="md" onClick={() => setOpen(false)}>{zh ? "知道了" : "Got it"}</Button></div>}>
        {Array.from({ length: full ? 24 : 1 }, (_, index) => <p key={index} style={{ margin: 0 }}>
          {zh ? "请核对配送地址和联系电话。配送进度可在订单详情中查看。" : "Check your delivery address and phone number. Track delivery in your order details."}
        </p>)}
      </Sheet>
    </div>
  );
}

export function SheetFilterExample({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const zh = locale === "zh";
  const [open, setOpen] = useState(false);
  const [child, setChild] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const entry = useRef<HTMLButtonElement>(null);
  const goBack = () => {
    setChild(false);
    requestAnimationFrame(() => entry.current?.focus());
  };
  return <div lang={locale}>
    <Button variant="secondary" onClick={() => { setChild(false); setOpen(true); }}>{zh ? "全部筛选" : "All filters"}</Button>
    <Sheet open={open} title={child ? (zh ? "品牌" : "Brand") : (zh ? "全部筛选" : "All filters")}
      closeLabel={zh ? "关闭筛选" : "Close filters"} onClose={() => setOpen(false)} lang={locale} contentPadding="compact"
      back={child ? { label: zh ? "返回全部筛选" : "Back to filters", onClick: goBack } : undefined}
      footer={<div className={styles.footer}><Button form="full" size="md" onClick={() => setOpen(false)}>{zh ? "查看结果" : "View results"}</Button></div>}>
      <div hidden={child}>
        <Button ref={entry} variant="tertiary" form="full" onClick={() => setChild(true)}>{zh ? "品牌" : "Brand"} ({brands.length})</Button>
      </div>
      {child && <div className={styles.optionList} role="group" aria-label={zh ? "品牌选项" : "Brand options"}>
        {["SKIN1004", "COSRX", "Anua"].map(brand => <label className={styles.optionRow} key={brand}>
          <Checkbox checked={brands.includes(brand)} onCheckedChange={checked => setBrands(current => checked ? [...current, brand] : current.filter(item => item !== brand))} />{brand}
        </label>)}
      </div>}
    </Sheet>
  </div>;
}
