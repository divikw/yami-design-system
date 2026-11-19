# Checkbox — Usage

Use `Checkbox` when people may select zero, one, or several independent options. Use `RadioGroup` when exactly one option must be chosen from a set.

## Anatomy

The control occupies a 20×20px square with an 18×18px visible box centered inside. Its transparent pointer target extends 6px beyond each edge from 1024px (32×32px total) and 10px below that breakpoint (40×40px total). Space adjacent controls so their targets do not overlap. Compose its accessible label with a native `<label htmlFor>` or an equivalent field primitive.

```tsx
<label htmlFor="save-payment" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" }}>
  <Checkbox id="save-payment" name="preferences" value="save-payment" />
  Save payment method · 保存付款方式
</label>
```

## States

- Unselected uses the current theme's primary background and subtle `--border-default` outline (8% black in Light theme).
- Hover uses `--surface-secondary`.
- Selected uses `--text-primary`; it is deliberately neutral, not YAMI red.
- Disabled uses `--fill-disabled` and never CSS opacity.
- `indeterminate` is a code-side accessibility extension for parent/group selection; it is not a separate Figma variant.

Dark theme is automatic through semantic aliases. Checkbox has no `dark` prop and no `inverse` prop because the current Figma component does not define an inverse surface variant.

## Accessibility

- Base UI supplies the checkbox role, `aria-checked`, hidden native form input, and Space-key behavior.
- A visible `<label>` is preferred. If no visible label is rendered, pass `aria-label`.
- Use native `disabled`, `required`, `name`, `value`, and `form` props.
- Mouse and touch clicks do not show the blue focus outline, including clicks on an associated label or after keyboard interaction. Tab and Space retain the keyboard focus outline.
- Both `default` and `compact` center the 18×18px square with a 4px radius and draw the keyboard focus outline around it. In option lists, wrap it with a native `<label>` so the full row can remain clickable.


### State changes

`checked`, `defaultChecked` and the first argument to `onCheckedChange` are boolean. Use the separate `indeterminate` prop for the mixed state. Call `details.cancel()` to cancel a requested change.
