import { useState } from "react";
import { Slider } from "@yami/design-system";

export function BudgetSlider({ en = false }: { en?: boolean }) {
  const [range, setRange] = useState([20, 80]);
  const label = en ? "Budget" : "预算";
  const labels = en ? ["Minimum price", "Maximum price"] : ["最低价格", "最高价格"];
  return (
    <div style={{ width: "min(100%, 22rem)", marginInline: "auto" }}>
      <span>{label} · ${range[0]} – ${range[1]}</span>
      <Slider value={range} onValueChange={setRange} name="budget" step={5}
        aria-label={label} getAriaLabel={index => labels[index]}
        getAriaValueText={(_formatted, value) => `$${value}`} />
    </div>
  );
}
