import { useState } from "react";
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList,
  Field, FieldError, FieldLabel,
} from "@yami/design-system";

export function RequiredCity({ en = false }: { en?: boolean }) {
  const [city, setCity] = useState<string | null>(null);
  const cities = en ? ["Tokyo", "Seoul", "Shanghai", "Taipei"] : ["东京", "首尔", "上海", "台北"];
  return <Field name="city" invalid={city === null} style={{ width: "100%" }}>
    <FieldLabel>{en ? "Delivery city (required)" : "配送城市（必填）"}</FieldLabel>
    <Combobox items={cities} value={city} onValueChange={setCity} required>
      <ComboboxInput placeholder={en ? "Search cities" : "搜索城市"} showClear
        triggerLabel={en ? "Show cities" : "显示城市"} clearLabel={en ? "Clear city" : "清除城市"} />
      <ComboboxContent>
        <ComboboxEmpty>{en ? "No matching cities" : "没有匹配的城市"}</ComboboxEmpty>
        <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
      </ComboboxContent>
    </Combobox>
    {city === null && <FieldError match>{en ? "Select a delivery city." : "请选择配送城市。"}</FieldError>}
  </Field>;
}
