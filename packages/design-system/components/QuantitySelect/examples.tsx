import { useState } from "react";
import { QuantitySelect } from "./QuantitySelect";

export function QuantitySelectExample() {
  const [value, setValue] = useState(1);
  return <QuantitySelect value={value} max={25} onValueChange={setValue} label="面膜数量" />;
}
