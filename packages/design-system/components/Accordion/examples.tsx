import { useState } from "react";
import { Accordion } from "./Accordion";
import { Button } from "../Button";

export function ProductDetailsAccordion() {
  return (
    <div>
      <Accordion label="商品规格" defaultExpanded>
        <p>单盒 200 毫升，每组 6 盒。</p>
      </Accordion>
      <Accordion label="营养成分表">
        <p>热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。</p>
      </Accordion>
      <Accordion label="配料">
        <p>完整配料及过敏原信息见包装标签，选购前请仔细核对。</p>
      </Accordion>
    </div>
  );
}

export function ControlledAccordion({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const [expanded, setExpanded] = useState(false);
  const zh = locale === "zh";
  return (
    <div>
      <Button variant="secondary" onClick={() => setExpanded(false)}>
        {zh ? "收起内容" : "Collapse content"}
      </Button>
      <Accordion
        label={zh ? "营养成分表" : "Nutrition facts"}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        <p>{zh ? "热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。" : "Check the nutrition label for calories, protein, fat and sugar content."}</p>
      </Accordion>
    </div>
  );
}
