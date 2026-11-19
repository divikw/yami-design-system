import { Combobox, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup,
  ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator } from "@yami/design-system";

export function GroupedCities({ en = false }: { en?: boolean }) {
  const regions = [
    { name: en ? "Japan" : "日本", items: en ? ["Tokyo", "Osaka"] : ["东京", "大阪"] },
    { name: en ? "South Korea" : "韩国", items: en ? ["Seoul", "Busan"] : ["首尔", "釜山"] },
  ];
  const label = en ? "Search cities" : "搜索城市";
  return <Combobox items={regions}>
    <ComboboxInput aria-label={label} placeholder={label} triggerLabel={en ? "Show cities" : "显示城市"} />
    <ComboboxContent>
      <ComboboxEmpty>{en ? "No matching cities" : "没有匹配的城市"}</ComboboxEmpty>
      <ComboboxList>{(region: typeof regions[number], index) =>
        <ComboboxGroup key={region.name} items={region.items}>
          {index > 0 && <ComboboxSeparator />}
          <ComboboxLabel>{region.name}</ComboboxLabel>
          <ComboboxCollection>{(city: string) => <ComboboxItem value={city} key={city}>{city}</ComboboxItem>}</ComboboxCollection>
        </ComboboxGroup>
      }</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
