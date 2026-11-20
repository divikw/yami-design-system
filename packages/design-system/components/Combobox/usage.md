<!-- locale:zh -->
# Combobox — 使用说明

输入关键词筛选城市、商品或其他候选项。选择后由 `name` 提交已选值。仅需浏览少量固定选项时可使用 Select。

```tsx
import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@yami/design-system";

const cities = ["上海", "东京", "首尔"];
<Combobox items={cities} name="city">
  <ComboboxInput aria-label="配送城市" placeholder="搜索城市" triggerLabel="显示城市" showClear clearLabel="清除城市" />
  <ComboboxContent>
    <ComboboxEmpty>没有匹配的城市</ComboboxEmpty>
    <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>
```

在 ComboboxInput 或 ComboboxChips 上传入 `density` 和 `label`。`default` 最低 56px，`compact` 最低 40px，PC 与移动端同高。单选 default 的标题在框内，compact 在框外。多选两档的标题都在框外，已选标签换行时控件会增高。控件可继承 Field 的规格，独立使用时省略 density 会采用 compact。

单选搜索框和多选标签容器在 PC 和移动端的左右内边距均为 12px，聚焦描边为 2px。下拉箭头尺寸与 Select 一致。下拉面板圆角为 8px，选项圆角为 4px。

使用方向键移动高亮，Enter 选择，Escape 收起。搜索提示使用 ComboboxInput 的 placeholder。用 FieldLabel 标识字段，并将 FieldError 放在 Combobox 后方显示校验错误。通过根组件的 disabled 或 required 控制整个字段。用 value 和 onValueChange 管理已选值，用 inputValue 和 onInputValueChange 管理搜索文本。

多选时设置 multiple，通过 ComboboxChips、ComboboxChip 和 ComboboxChipsInput 显示、移除或继续添加选项。传入对象时可通过 itemToStringLabel 和 itemToStringValue 分别指定显示文本与提交值。

<!-- locale:en -->
# Combobox — Usage

Type to filter a list of cities, products or other options. Set name to submit the selection. Use Select for a short, fixed list that people can browse directly.

```tsx
import { Combobox, ComboboxInput, ComboboxContent, ComboboxEmpty, ComboboxList, ComboboxItem } from "@yami/design-system";

const cities = ["Shanghai", "Tokyo", "Seoul"];
<Combobox items={cities} name="city">
  <ComboboxInput aria-label="Delivery city" placeholder="Search cities" showClear />
  <ComboboxContent>
    <ComboboxEmpty>No matching cities</ComboboxEmpty>
    <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
  </ComboboxContent>
</Combobox>
```

Set `density` and `label` on ComboboxInput or ComboboxChips. The minimum height is 56px for `default` and 40px for `compact` on PC and Mobile. Single-select embeds its label at default density and places it above the control at compact density. Both multi-select densities place the label above the control and grow as chips wrap. Controls can inherit Field density and otherwise fall back to compact.

Single-select inputs and multi-select chip containers use 12px horizontal padding and a 2px focus border on desktop and mobile. The dropdown chevron matches the Select chevron in size. The popup has an 8px radius and each option has a 4px radius.

Use arrow keys to navigate, Enter to select and Escape to close. Put search hints in the ComboboxInput placeholder. Inside a Field, use FieldLabel to name the control and place FieldError after Combobox to display validation feedback. Set disabled or required on the root. Manage selection with value and onValueChange, and search text with inputValue and onInputValueChange.

For multiple selection, set multiple and compose ComboboxChips, ComboboxChip and ComboboxChipsInput. For objects, itemToStringLabel supplies the visible text and itemToStringValue supplies the submitted value.
