<!-- locale:zh -->
# RadioGroup — 使用说明

当用户需要从多个互斥选项中选择一个时，使用 RadioGroup。独立选项和多选列表使用 Checkbox。

```tsx
<RadioGroup aria-label="付款方式" name="payment-method" defaultValue="card">
  <label><RadioGroupItem value="card" />银行卡</label>
  <label><RadioGroupItem value="apple-pay" />Apple Pay</label>
</RadioGroup>
```

## 外观与状态

每个选项占 20×20px，可见外圈直径为 18px。选中时外圈描边为 2px，与居中的 10px 圆点之间每侧留白 2px。透明点击区域在 PC（≥1024px）为 32×32px，在 Mobile 为 40×40px。未选中时使用当前主题的主背景和 `--border-default` 描边。悬停使用 `--surface-secondary`，选中描边与圆点使用 `--text-primary`，禁用填充使用 `--fill-disabled`。语义 token 随明暗主题切换。

## 键盘与无障碍

用可见标题或 `aria-label` 命名整组。用原生 `label` 包住每个选项和文字，让整行都可点击。Tab 进入或离开整组，方向键移动焦点并选中对应项。焦点轮廓沿可见圆圈绘制。

## 值与表单

在 RadioGroup 上设置 `name`、`required` 和整组的 `disabled`。选项值使用字符串。非受控模式用 `defaultValue` 指定初始项，受控模式使用 `value` 和 `onValueChange`。传入 `null` 表示尚未选择。回调接收选中值和 Base UI 事件详情。

<!-- locale:en -->
# RadioGroup — Usage

Use `RadioGroup` when a person must choose one value from two or more mutually exclusive options. Use `Checkbox` for independent or multi-select choices.

```tsx
<RadioGroup aria-label="Payment method" name="payment-method" defaultValue="card">
  <label>
    <RadioGroupItem value="card" />
    Card
  </label>
  <label>
    <RadioGroupItem value="apple-pay" />
    Apple Pay
  </label>
</RadioGroup>
```

## Anatomy and states

The individual Radio Button is a 20px layout with a centered 18px outer circle with a 2px selected stroke and a 2px gap around the centered 10px dot. Code adds `RadioGroup` because exclusive selection and roving keyboard focus are group behavior.

- Unselected uses the current theme's primary background and subtle `--border-default` outline (8% black in Light theme).
- Hover uses `--surface-secondary`.
- Selected outline and dot use `--text-primary`; selection is deliberately neutral, not YAMI red.
- Disabled uses `--fill-disabled`, not CSS opacity.

Dark theme is automatic through semantic aliases. RadioGroup has no `dark` prop and no `inverse` prop because the current Figma component does not define an inverse variant.

## Accessibility

- Base UI supplies `radiogroup`/`radio` roles, exclusive state, native form inputs, and roving focus.
- Arrow keys move focus and selection; Tab enters/leaves the group.
- Give the group an accessible name with a visible field legend or `aria-label`.
- Wrap each default `RadioGroupItem` in a visible `<label>`, or pass `aria-label` when no visible label is rendered. Use Base UI's native-button pattern for sibling labels.
- Put `name`, `required`, `value`, `defaultValue`, `onValueChange`, and group-level `disabled` on `RadioGroup`.
- The transparent pointer target extends to 32×32px on desktop (≥1024px) and 40×40px on mobile. Space adjacent rows so their targets do not overlap. The focus outline follows the visible circle. In option lists, the enclosing native `<label>` keeps the full row clickable.


### State changes

Use string values for radio options. `onValueChange` reports the selected value and Base UI change details. Use `null` for an empty controlled group.
