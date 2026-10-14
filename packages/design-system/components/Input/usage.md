# Input — Usage

## What It Is

YAMI Input is the maintained code component for Figma `↪ 表单输入 Forms` / `Input Field`.
It is a single-line native `<input>` with an embedded label, responsive Mobile/PC sizing,
stateful borders, optional clear action, and supporting text.

The default field width is 320px and shrinks with `max-width: 100%` in narrower containers.
Use `fullWidth` when the field should fill its available layout column.
The field's inline-end padding is 8px in both densities at every breakpoint, including fields
with leading or trailing slots. In left-to-right layouts, the clear button's hit target ends
8px from the field's right edge.

## Storybook Examples

- **Docs**: component description, API, and usage guidance.
- **Showcase**: all visual states, icon slots, compact examples, and validation edges.
- **Playground**: one input driven by Controls, with a localized operation hint. Enable `clearable` to try clearing on the same input.
- **Compact**: focused inspection of compact density.

The browser regression suite covers Input behavior independently of these navigation entries.

## Figma Contract

| Platform | Field height | Error total | Value text | Label text |
|---|---:|---:|---|---|
| Mobile | 48px | 68px | body-md, 14/20 | default 14/20, floating caption-md 12/16 |
| PC | 56px | 77px | body-xl, 16/20 | body-md, 14/20 |

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
or is in an explicit visual state such as `error`.

## Compact Density

Use `density="compact"` for promo codes and short inputs in dense layouts. It is a code-defined
extension, not a verified Figma variant. The field is 48px below 1024px and 40px on PC, with
body-md text and a single value/placeholder row. The default density stays unchanged.

```tsx
<Input density="compact" label="Promo code" placeholder="SAVE10" clearable />
```

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
<Input placeholder="Search" />
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
