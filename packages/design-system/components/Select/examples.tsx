import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./Select";
export const BasicSelect = () => <Select defaultValue="standard" items={[{ value: "standard", label: "Standard" }, { value: "express", label: "Express" }]}>
  <SelectTrigger aria-label="Delivery"><SelectValue /></SelectTrigger>
  <SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="express">Express</SelectItem></SelectContent>
</Select>;
