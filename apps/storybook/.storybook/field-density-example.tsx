import {
  Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, Field, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, type FieldDensity,
} from "@yami/design-system";

export function DeliveryFields({ density, en = false }: { density: FieldDensity; en?: boolean }) {
  const cities = en ? ["Tokyo", "Seoul", "Shanghai"] : ["东京", "首尔", "上海"];
  const methods = [
    { value: "standard", label: en ? "Standard shipping" : "标准配送" },
    { value: "express", label: en ? "Express shipping" : "加急配送" },
  ];

  return <div style={{ display: "grid", gap: "var(--space-200)", width: "100%" }}>
    <Field density={density} name="recipient">
      <Input fullWidth label={en ? "Recipient" : "收件人"} placeholder={en ? "Enter a name" : "输入姓名"} />
    </Field>
    <Field density={density} name="city">
      <Combobox items={cities}>
        <ComboboxInput label={en ? "City" : "城市"} placeholder={en ? "Search cities" : "搜索城市"} />
        <ComboboxContent>
          <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
    <Field density={density} name="shipping">
      <Select items={methods}>
        <SelectTrigger label={en ? "Shipping method" : "配送方式"}>
          <SelectValue placeholder={en ? "Choose a shipping method" : "选择配送方式"} />
        </SelectTrigger>
        <SelectContent>
          {methods.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  </div>;
}
