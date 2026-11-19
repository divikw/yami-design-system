<!-- locale:zh -->
# Slider — 使用说明

在给定范围内选择一个值或一组值。

- `value / defaultValue` — 受控值或初始值。数组中每个数字对应一个滑块。
- `min / max / step` — 默认 0、100 和 1。支持小数步长。
- `orientation / disabled` — 默认水平。纵向高度可用 style 或 className 调整。disabled 会禁用所有滑块。
- `getAriaLabel / getAriaValueText` — 按索引提供滑块名称，按值提供带单位的朗读文本。
- `name / onValueChange / onValueCommitted` — name 用于表单提交。两个回调分别报告实时变化和已提交的值。

```tsx
import { Slider } from "@yami/design-system";

<Slider aria-label="音量" defaultValue={50} />
```

<!-- locale:en -->
# Slider — Usage

Select a value or a range on a scale.

- `value / defaultValue` — A controlled or initial value. Each number in an array creates one thumb.
- `min / max / step` — Defaults to 0, 100 and 1. Decimal steps are supported.
- `orientation / disabled` — Horizontal by default. Set the vertical height with style or className. Disabling the slider disables every thumb.
- `getAriaLabel / getAriaValueText` — Name thumbs by index and format their spoken values with units.
- `name / onValueChange / onValueCommitted` — Supply a form name. Listen for live changes or committed values.

```tsx
import { Slider } from "@yami/design-system";

<Slider aria-label="Volume" defaultValue={50} />
```
