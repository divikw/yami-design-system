import { useId, useState } from "react";
import { Field, FieldDescription, FieldTitle, Slider } from "@yami/design-system";

export function PriceRange({ en = false }: { en?: boolean }) {
  const [prices, setPrices] = useState([200, 800]);
  const title = useId();
  const hint = useId();
  const labels = en ? ["Minimum price", "Maximum price"] : ["最低价格", "最高价格"];
  return <Field aria-labelledby={title}>
    <FieldTitle id={title}>{en ? "Price range" : "价格区间"}</FieldTitle>
    <FieldDescription id={hint}>{en ? "Set your budget" : "设置预算范围"} (${prices[0]} – ${prices[1]})</FieldDescription>
    <Slider value={prices} onValueChange={setPrices} max={1000} step={10}
      aria-labelledby={title} aria-describedby={hint} getAriaLabel={index => labels[index]}
      getAriaValueText={(_formatted, value) => `$${value}`} />
  </Field>;
}
