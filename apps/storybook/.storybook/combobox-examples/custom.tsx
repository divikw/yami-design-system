import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@yami/design-system";

export function AirportPicker({ en = false }: { en?: boolean }) {
  const airports = [
    { value: "NRT", label: en ? "Tokyo Narita" : "东京成田" },
    { value: "ICN", label: en ? "Seoul Incheon" : "首尔仁川" },
    { value: "PVG", label: en ? "Shanghai Pudong" : "上海浦东" },
  ];
  const label = en ? "Search airports" : "搜索机场";
  return <Combobox name="airport" items={airports}>
    <ComboboxInput aria-label={label} placeholder={label} triggerLabel={en ? "Show airports" : "显示机场"} />
    <ComboboxContent>
      <ComboboxEmpty>{en ? "No matching airports" : "没有匹配的机场"}</ComboboxEmpty>
      <ComboboxList>{(airport: typeof airports[number]) =>
        <ComboboxItem key={airport.value} value={airport}>{airport.label} · {airport.value}</ComboboxItem>
      }</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
