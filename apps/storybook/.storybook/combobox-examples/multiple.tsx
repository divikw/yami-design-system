import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor } from "@yami/design-system";

export function MultipleCities({ en = false }: { en?: boolean }) {
  const anchor = useComboboxAnchor();
  const cities = en ? ["Tokyo", "Seoul", "Shanghai", "Taipei"] : ["东京", "首尔", "上海", "台北"];
  const label = en ? "Delivery cities" : "配送城市";
  return <Combobox multiple items={cities} defaultValue={[cities[0]]}>
    <ComboboxChips ref={anchor} density="default" label={label} aria-label={label}>
      <ComboboxValue>{(selected: string[]) => selected.map(city =>
        <ComboboxChip key={city} removeLabel={en ? `Remove ${city}` : `移除${city}`}>{city}</ComboboxChip>
      )}</ComboboxValue>
      <ComboboxChipsInput placeholder={en ? "Add a city" : "添加城市"} />
    </ComboboxChips>
    <ComboboxContent anchor={anchor}>
      <ComboboxEmpty>{en ? "No matching cities" : "没有匹配的城市"}</ComboboxEmpty>
      <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
