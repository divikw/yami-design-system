<!-- locale:zh -->
# FilterChip — 使用说明

## 单个筛选项

筛选芯片使用 Base UI Toggle。受控场景可传 `pressed` 和 `onPressedChange`，或沿用已有的 `selected` 和 `onClick`。同时传入 `selected` 和 `pressed` 时，以 `selected` 为准。用 `defaultPressed` 设置非受控初始值。没有配置按下状态时，芯片作为普通按钮工作。

```tsx
import { FilterChip } from "@yami/design-system"

<FilterChip defaultPressed variant="filled">有货</FilterChip>
```

## 菜单与成组布局

`FilterChipGroup` 提供 8px 间距、横向滚动和键盘焦点留白。`FilterChipMenu` 的单选立即提交，多选需要确认后提交。分层分类使用 `FilterChipCategoryMenu`，展开分类和确认选择是独立操作。三种菜单都在 PC 上使用 Popover，低于 1024px 时使用 Drawer。用 `popupAriaLabel` 补充弹层的无障碍名称。

多选菜单底部的「清除」和「显示结果」均使用 YAMI Button 的 `size="sm"`（32px）。

<!-- locale:en -->
# FilterChip

FilterChip uses Base UI Toggle. Use `pressed` and `onPressedChange` for controlled use or `defaultPressed` for an uncontrolled initial value. When both are supplied, `selected` takes precedence over `pressed`. Chips without pressed-state props act as ordinary buttons.

Use `FilterChip` for compact, interactive filters in horizontal toolbars.
Use `filled` for suggested filters and `outlined` for filter controls. Both
selected variants use a white surface and a 1px inset focus-color stroke. The
stroke increases to 2px on hover without changing the outer geometry or content
position.

`FilterChipGroup` owns the 8px horizontal gap and overflow scrolling for a row
of chips. It also reserves 4px above and below its contents for the 2px focus
outline and 2px offset, without changing the surrounding layout height.

Use `FilterChipMenu` when the filter needs an anchored popup. Its 290px popup
matches the Search Results specification:

- `selectionMode="single"` uses `RadioGroup`, commits immediately, then closes.
- `selectionMode="multiple"` uses `Checkbox`, keeps draft selections open, and
  commits with the primary footer action. Both Clear and Apply use the 32px `sm` Button size.
  Clear resets the draft values.

The popup is portalled and collision-aware, so it is not clipped by a
horizontally scrolling `FilterChipGroup`. Provide `popupAriaLabel` when the
visible chip label does not fully describe the choices. Single- and
multiple-select menus share a 14px option label and 8px list inset.

Use `FilterChipCategoryMenu` for the 360px hierarchical category filter. It
uses a single RadioGroup across the tree, 36px option rows, 24px indentation
per expanded level, and a fixed Clear / Apply footer. Expand and collapse
controls do not commit a category; Apply commits the current draft selection.
Selecting a parent row reveals its immediate children. The separate 28px
trailing control only expands or collapses that branch and never changes the
selected category.

Below 1024px, all three menus use the shared `Drawer` component instead of an
anchored Popover. The modal header, close action, backdrop, focus trap, scroll
lock and safe-area footer come from Drawer. Selection and draft behavior are
unchanged; desktop keeps the anchored popup and its existing dimensions.

Do not use the static `Tag` component for filtering.


## Keyboard focus geometry

Scrollable chip groups reserve 4px focus gutters on every edge; selected strokes remain unchanged. Focus uses the dedicated blue `--focus-ring` aliases; existing borders and selected states keep their original styling.
