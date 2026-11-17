import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";
import { Button } from "../Button";

export function ProductDetailsAccordion() {
  return (
    <Accordion multiple defaultValue={["specifications"]} keepMounted>
      <AccordionItem value="specifications">
        <AccordionTrigger>商品规格</AccordionTrigger>
        <AccordionContent><p>单盒 200 毫升，每组 6 盒。</p></AccordionContent>
      </AccordionItem>
      <AccordionItem value="nutrition">
        <AccordionTrigger>营养成分表</AccordionTrigger>
        <AccordionContent><p>热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。</p></AccordionContent>
      </AccordionItem>
      <AccordionItem value="ingredients">
        <AccordionTrigger>配料</AccordionTrigger>
        <AccordionContent><p>完整配料及过敏原信息见包装标签，选购前请仔细核对。</p></AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function ControlledAccordion({ locale = "zh" }: { locale?: "zh" | "en" }) {
  const [value, setValue] = useState<string[]>([]);
  const zh = locale === "zh";
  return (
    <div>
      <Button variant="secondary" onClick={() => setValue([])}>
        {zh ? "收起内容" : "Collapse content"}
      </Button>
      <Accordion value={value} onValueChange={setValue}>
        <AccordionItem value="nutrition">
          <AccordionTrigger>{zh ? "营养成分表" : "Nutrition facts"}</AccordionTrigger>
          <AccordionContent><p>{zh ? "热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。" : "Check the nutrition label for calories, protein, fat and sugar content."}</p></AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
