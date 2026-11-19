import { useDesktopViewport, Button, Combobox, ComboboxTrigger, ComboboxValue, ComboboxInput, ComboboxContent,
  ComboboxEmpty, ComboboxList, ComboboxItem } from "@yami/design-system";

export function CityPopup({ en = false }: { en?: boolean }) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const items = en ? ["Tokyo", "Seoul", "Shanghai", "Taipei"] : ["东京", "首尔", "上海", "台北"];
  const label = en ? "Choose a city" : "选择城市";
  return <Combobox items={items}>
    <ComboboxTrigger aria-label={label} render={<Button size={actionSize} variant="secondary" />}>
      <ComboboxValue placeholder={label} />
    </ComboboxTrigger>
    <ComboboxContent align="center" style={{ width: "min(18rem, var(--available-width))" }}>
      <ComboboxInput aria-label={label} placeholder={en ? "Search cities" : "搜索城市"} showTrigger={false} />
      <ComboboxEmpty>{en ? "No matching cities" : "没有匹配的城市"}</ComboboxEmpty>
      <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
    </ComboboxContent>
  </Combobox>;
}
