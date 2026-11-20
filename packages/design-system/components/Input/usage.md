<!-- locale:zh -->
# Input — 使用说明

Input 用 Base UI Input 渲染原生输入控件。内嵌标签默认 14px，上浮时为 12px。`density="compact"` 使用外置标签，适合折扣码等短输入。PC 和移动端统一为宽松版 56px、紧凑版 40px，左右内边距均为 12px，编辑时使用 2px 内描边。

## 用法

```tsx
import { Input } from "@yami/design-system"

<Input density="compact" label="邮箱" type="email" name="email" placeholder="name@example.com" required />
```

## 值与状态

- `defaultValue` 设置非受控的起始值。用 `value` 受控时，可用原生 `onChange` 或接收值和事件详情的 `onValueChange`。
- 只有填写或搜索提示时，使用 `density="compact"` 和 `placeholder`，并用外部标签或 `aria-label` 提供可访问名称。持续可见的补充说明使用 `helperText`。
- `error` 在输入框下方显示关联的错误说明。已有外部说明时，可设置 `aria-invalid` 和 `aria-describedby`。两种方式都使用 YAMI 错误边框。
- 支持原生 `disabled`、`readOnly`、`required` 和表单重置。通过 `clearable` 提供清空操作。可选的 `action` 或尾部内容会占用清空操作的位置。
- 标签、辅助文字和交互状态沿用 YAMI token。键盘焦点和字段状态边框分别显示。

<!-- locale:en -->
# Input — Usage

The control uses Base UI Input. It accepts native `onChange` and the value-oriented `onValueChange` callback. Set `aria-invalid` to apply the YAMI error border when the error message is supplied externally.

## What It Is

YAMI Input is the maintained code component for Figma `↪ 表单输入 Forms` / `Input Field`.
It is a single-line native `<input>` with an embedded label, responsive Mobile/PC sizing,
stateful borders, optional clear action, and supporting text.

The default field width is 320px and shrinks with `max-width: 100%` in narrower containers.
Use `fullWidth` when the field should fill its available layout column.
Both densities use 12px horizontal padding and a 2px inset editing border at every breakpoint, including fields
with icons, a clear button or an inline action. In left-to-right layouts, the clear button's hit target ends
12px from the field's right edge.

## Storybook Examples

- **Docs**: component description, API, and usage guidance.
- **Showcase**: all visual states, icon slots, compact examples, and validation edges.
- **Playground**: one input driven by Controls, with a localized operation hint. Enable `clearable` to try clearing on the same input.
- **Compact**: focused inspection of compact density.
- **With inline action**: a shared field border containing a text input and a submit action; validation stays with the consumer.

## Inline text action

Use `action={{ label: "兑换", htmlType: "submit" }}` inside a native form for redeem/search/verify actions. Outside a form, omit `htmlType` (defaults to `button`) and provide `onClick`. This opt-in field uses 14px value and action text, an underlined shared Button, and the existing density heights and 8px component radius. The action inherits input disabled state and can additionally be disabled with `action.disabled`. It replaces `trailingIcon`/`suffix` and clear; do not combine these slots.

Keep an accessible label (`label`, external label, or `aria-label`). Errors remain below the whole field and retain `aria-invalid`/`aria-describedby`. Input owns appearance and native semantics; its host owns validation, submitted values, and business feedback. Existing fields without `action` retain their styling. Cart enables this option only below 1024px; its desktop redeem button remains outside the input.

The browser regression suite covers Input behavior independently of these navigation entries.

## Figma Contract

The current implementation uses body-md for value text on both platforms.

| Platform | Field height | Error total | Value text | Label text |
|---|---:|---:|---|---|
| Mobile | 56px | 76px | body-md, 14/20 | default 14/20, floating 12/20 |
| PC | 56px | 77px | body-md, 14/20 | default 14/20, floating 12/20 |

States:

- `default`
- `focused`
- `typing`
- `complete`
- `error`
- `disabled-filled`
- `disabled-empty`

## Basic

```tsx
<Input label="Phone" type="tel" />
```

The label is embedded inside the field. It floats when the input is focused, has a value,
or is in an explicit visual state such as `error`. During focus and typing, the floating label
uses `--text-secondary`. The floating label and value row are separated by 2 px.

## Compact Density

Use `density="compact"` for promo codes and short inputs in dense layouts. It is a code-defined
extension, not a verified Figma variant. The field is 40px on PC and Mobile, with body-md text and a single value/placeholder row.

```tsx
<Input density="compact" label="Promo code" placeholder="SAVE10" clearable />
```

For a field with only an entry or search hint, use `density="compact"` with a placeholder and an external label or `aria-label`. Use helperText for information that should stay visible while typing, and error for validation feedback below the field.

The label stays above the field with a 4px gap and remains associated with the native input.
It does not float or disappear when the value changes. A separately authored label may instead
target the Input's `id`; in that case omit `label`. Keep any adjacent action aligned with the field,
and render errors below it. Compact is independent of the deprecated `size` compatibility prop.

Clear uses a 20px icon in a 24×24px hit target, centered vertically inside the field on Mobile
and PC. Its hit area does not extend beyond the button. Keyboard focus outlines the button.

## Controlled

```tsx
const [phone, setPhone] = useState("")

<Input
  label="Phone"
  type="tel"
  value={phone}
  onChange={(event) => setPhone(event.currentTarget.value)}
/>
```

The component keeps only visual state for floating-label behavior. The actual value remains
native input state, controlled by the caller when `value` is provided.

## Clear Action

```tsx
const [value, setValue] = useState("Input")

<Input
  label="Label"
  value={value}
  clearable
  onChange={(event) => setValue(event.currentTarget.value)}
  onClear={() => setValue("")}
/>
```

`clearable` uses the YAMI `action/clear-fill.svg` shape as a currentColor SVG. It appears while
focus remains inside the field and the input has a value, so keyboard focus can move from the input
to the clear action without unmounting it. Activating it sets the native value to empty, dispatches
a bubbling `input` event so `onChange`/form observers can see the update, then calls `onClear`.
Controlled callers may still use `onClear` for secondary cleanup.

For `type="search"`, the native search cancel button is hidden while the YAMI clear action
is rendered, so only one clear control appears. Otherwise the native cancel button is preserved.

The clear action stays available when an error is present. Read-only and disabled fields never
show it or accept clear mutations. Its hit target is 24×24px while the icon remains 20×20px.
The active icon uses `--text-secondary` for at least 3:1 contrast against the field in both themes.

Uncontrolled usage also listens to native `input`/`change` and form `reset` events so the floating
label and visual state stay aligned with the actual DOM value.
Reset follows the current native form owner even after changing `form` or mounting the associated
form later. Resets of other forms are ignored, and canceled resets preserve the current value.

## Error

```tsx
<Input label="Email" value="bob@" error="Enter a valid email address." />
```

`error`:

- Sets `aria-invalid`
- Uses the Figma attention border (`--border-attention`)
- Renders supporting text with `role="alert"`
- Links the message via `aria-describedby`
- Overrides `helperText`

An explicit `aria-invalid` value is preserved when no component error is present. A component
error takes precedence and sets it to `true`.
Helper and error text wrap long links and unbroken strings within the available width.

## Disabled

```tsx
<Input label="Label" disabled />
<Input label="Label" defaultValue="Input" disabled />
```

Disabled empty and disabled filled map to separate Figma states on mobile. Both use tokenized
fill/text styles and never CSS opacity.
When `disabled` and `error` coexist, the field keeps its disabled fill, text and not-allowed
cursor while retaining the error border, message and `aria-invalid`. It remains non-editable,
cannot receive focus, and does not show a clear action.

## Icon Slots

Use YAMI SVG assets from `packages/design-system/assets/icons` and keep them currentColor.

```tsx
<Input
  density="compact"
  aria-label="Search"
  type="search"
  placeholder="Search YAMI"
  leadingIcon={<SearchIcon />}
  fullWidth
/>
```

`prefix` and `suffix` remain as backward-compatible aliases for `leadingIcon` and `trailingIcon`.
If a trailing slot contains an interactive action, keep the input value controlled and read it from
state rather than walking the DOM from inside the slot.

## A11y Contract

- Visible label is a real `<label htmlFor={id}>`.
- `id` is generated with `useId()` when omitted.
- If no visible `label` is rendered, pass `aria-label`.
- `required` is native `required`; the visual marker is `aria-hidden`.
- Helper/error messages are linked with `aria-describedby`.
- Error message uses `role="alert"`.
- Disabled uses native `disabled`.
- Keyboard behavior is native input behavior.
- The field keeps its neutral `--border-focus` state border (or red error border). Tab/Shift+Tab focus adds a separate blue `--focus-ring` outline. Pointer clicks on the field, label, or clear action suppress the outline even if the text input matches `:focus-visible`. Typing after a pointer click does not enable it. Keyboard clearing returns focus with the ring; pointer clearing returns focus without it. The clear action uses the same modality rule and focus token.
- A visible clear action remains mounted and keyboard-focusable while focus is inside the field.

## Baseline Boundary

Baseline Input is used only for engineering behavior reference:

- Native input pass-through
- Ref forwarding
- Controlled/uncontrolled support
- Disabled and invalid ARIA behavior
- Keyboard focus contract

YAMI visual structure, variants, spacing, typography, iconography, and responsive behavior come
from the YAMI Figma file and YAMI tokens, not from Baseline styles.

## Anti-Patterns

### Missing Accessible Name

```tsx
<Input density="compact" placeholder="Search" />
```

If no visible label is used, provide `aria-label`.

### Styling State Manually

```tsx
<Input style={{ borderColor: "red" }} />
```

Use `error`, `disabled`, value/focus, or `state` for catalog previews.

### Reading Input DOM From A Slot Action

```tsx
<Input suffix={<Button onClick={(event) => event.currentTarget.closest("label")?.querySelector("input")} />} />
```

The Input root is not a `<label>`. Use controlled state for trailing actions instead.

### Treating `state` as Business State

`state` is a visual override for docs and visual QA. Product code should usually derive the visual
state from `value`, focus, `error`, and `disabled`.
