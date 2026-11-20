import type { ReactNode } from "react";
import type { FieldDensity } from "../Field/density";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./Combobox";

export function BasicCombobox({ en = false, showClear, autoHighlight, disabled, density, children }: {
  en?: boolean; showClear?: boolean; autoHighlight?: boolean; disabled?: boolean; density?: FieldDensity; children?: ReactNode;
}) {
  const items = en ? ["Tokyo", "Seoul", "Shanghai", "Taipei"] : ["东京", "首尔", "上海", "台北"];
  const label = en ? "Search cities" : "搜索城市";
  return <Combobox items={items} disabled={disabled} autoHighlight={autoHighlight}>
    <ComboboxInput aria-label={density ? undefined : label} label={density ? (en ? "City" : "城市") : undefined} density={density} placeholder={label}
      triggerLabel={en ? "Show cities" : "显示城市"} clearLabel={en ? "Clear city" : "清除城市"}
      showClear={showClear}>{children}</ComboboxInput>
    <ComboboxContent>
      <ComboboxEmpty>{en ? "No matching cities" : "没有匹配的城市"}</ComboboxEmpty>
      <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
