import { Search } from "lucide-react";
import { BasicCombobox } from "../../../packages/design-system/components/Combobox/examples";
import { CityPopup } from "./combobox-examples/popup";
import popupSource from "./combobox-examples/popup.tsx?raw";
import { MultipleCities } from "./combobox-examples/multiple";
import multipleSource from "./combobox-examples/multiple.tsx?raw";
import { AirportPicker } from "./combobox-examples/custom";
import customSource from "./combobox-examples/custom.tsx?raw";
import { RequiredCity } from "./combobox-examples/invalid";
import invalidSource from "./combobox-examples/invalid.tsx?raw";
import { GroupedCities } from "./combobox-examples/groups";
import groupsSource from "./combobox-examples/groups.tsx?raw";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function ComboboxDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const t = (zh: string, english: string) => en ? english : zh;
  const label = t("搜索城市", "Search cities");
  const items = en ? ["Tokyo", "Seoul", "Shanghai", "Taipei"] : ["东京", "首尔", "上海", "台北"];
  function source(rootProps = "", inputProps = "", icon = false) {
    const search = icon ? 'import { Search } from "lucide-react";\n' : "";
    return `${search}import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@yami/design-system";

const cities = ${JSON.stringify(items)};

<Combobox items={cities}${rootProps}>
  <ComboboxInput aria-label="${label}" placeholder="${label}" triggerLabel="${t("显示城市", "Show cities")}"${inputProps}${icon ? '><Search size={16} aria-hidden="true" /></ComboboxInput>' : ' />'}
  <ComboboxContent>
    <ComboboxEmpty>${t("没有匹配的城市", "No matching cities")}</ComboboxEmpty>
    <ComboboxList>{(city: string) => (
      <ComboboxItem key={city} value={city}>{city}</ComboboxItem>
    )}</ComboboxList>
  </ComboboxContent>
</Combobox>`;
  }
  const examples: GuideExample[] = [
    { id: "multiple", title: t("多选", "Multiple"), description: t("选择多个城市，点击标签上的移除按钮可取消选择。", "Select several cities and remove individual chips."), preview: <MultipleCities en={en} />, code: multipleSource },
    { id: "clear", title: t("清除选择", "Clear button"), description: t("选择城市后，使用清除按钮重新开始搜索。", "Use the clear button after choosing a city to start another search."), preview: <BasicCombobox en={en} showClear />, code: source("", ` showClear clearLabel="${t("清除城市", "Clear city")}"`) },
    { id: "groups", title: t("分组", "Groups"), description: t("按国家组织城市，输入关键词后保留匹配的分组。", "Group cities by country. Filtering keeps groups with matching cities."), preview: <GroupedCities en={en} />, code: groupsSource },
    { id: "custom", title: t("自定义选项", "Custom items"), description: t("选项展示机场名称和代码，输入框显示名称，表单提交机场代码。", "Each option shows an airport name and code. Selecting it displays the name and submits the code."), preview: <AirportPicker en={en} />, code: customSource },
    { id: "invalid", title: t("校验错误", "Invalid"), description: t("选择配送城市后，输入框下方的必填错误会清除。", "Select a delivery city to clear the required-field error below the input."), preview: <RequiredCity en={en} />, code: invalidSource },
    { id: "disabled", title: t("禁用", "Disabled"), description: t("在根组件上设置 disabled 可一并禁用输入与展开按钮。", "Disable the root to disable both typing and the trigger."), preview: <BasicCombobox en={en} disabled />, code: source(" disabled") },
    { id: "auto-highlight", title: t("自动高亮", "Auto highlight"), description: t("输入搜索词后，按 Enter 即可选择首个匹配项。", "Type to filter and press Enter to select the first match."), preview: <BasicCombobox en={en} autoHighlight />, code: source(" autoHighlight") },
    { id: "popup", title: t("弹层内搜索", "Popup"), description: t("点击按钮打开弹层，在选项上方输入关键词。", "Open the button and search above the list of options."), preview: <div style={{ display: "grid", justifyItems: "center" }}><CityPopup en={en} /></div>, code: popupSource },
    { id: "input-group", title: t("输入框图标", "Input group"), description: t("把搜索图标放在输入框前方，保留输入框的可访问名称。", "Place a search icon before the text and give the input an accessible name."), preview: <BasicCombobox en={en}><Search size={16} aria-hidden="true" /></BasicCombobox>, code: source("", "", true) },
  ];
  return <ComponentGuide name="Combobox" slug="combobox" locale={locale} previewMode="document"
    previous={{ name: "Checkbox", path: "yami-components-forms-checkbox" }} next={{ name: "Dialog", path: "yami-components-layout-dialog" }}
    intro={t("输入关键词筛选候选项，再选择一个或多个值。", "Type to filter the available options and select one or more values.")}
    leadExample={{ preview: <BasicCombobox en={en} />, code: source() }}
    usageCode={source()} examples={examples}
    composition={"Combobox\n├── ComboboxInput\n└── ComboboxContent → ComboboxEmpty + ComboboxList → ComboboxItem\n\nCombobox multiple\n├── ComboboxChips → ComboboxValue → ComboboxChip\n│                └→ ComboboxChipsInput\n└── ComboboxContent → ComboboxList → ComboboxItem\n\nCombobox\n├── ComboboxTrigger → ComboboxValue\n└── ComboboxContent → ComboboxInput + ComboboxList → ComboboxItem"}
    apiNote={t("方向键移动高亮，Enter 选择，Escape 收起。为输入框和图标按钮提供可访问名称。", "Use the arrow keys to navigate, Enter to select and Escape to dismiss. Name the input and icon buttons.")}
    api={[
      ["items / multiple", t("传入可筛选的选项；多选模式返回数组。", "Supply the searchable options. Multiple selection returns an array.")],
      ["value / defaultValue / onValueChange", t("管理已选值。name 指定表单提交字段。", "Manage the selected value. Set name for form submission.")],
      ["inputValue / onInputValueChange", t("读写当前搜索词。", "Read or control the current search text.")],
      ["itemToStringLabel / itemToStringValue", t("定义对象的显示文本与提交值。支持 { label, value }。", "Set the display label and submitted value for custom objects. The { label, value } shape is supported.")],
      ["ComboboxInput", t("showClear、showTrigger 控制按钮，clearLabel、triggerLabel 指定其名称。", "Toggle the buttons with showClear and showTrigger. Set their names with clearLabel and triggerLabel.")],
      ["ComboboxContent", t("anchor、side、align 和 sideOffset 控制弹层位置。", "Position the popup with anchor, side, align and sideOffset.")],
      ["autoHighlight / disabled / required", t("自动高亮首个匹配项、禁用和必填。", "Highlight the first match, disable selection or require a selection.")],
    ]} reference={{ label: "shadcn/ui Combobox", href: "https://ui.shadcn.com/docs/components/base/combobox" }} />;
}
