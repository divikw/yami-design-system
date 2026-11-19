<!-- locale:zh -->
# Divider — 使用说明

## 用法

用分隔线区分内容区域。默认横向分隔线用 Base UI Separator 渲染为语义化的 `hr`。纵向分隔线适合行内元信息或同一组控件，通过 `aria-hidden` 标记为装饰。

```tsx
import { Divider } from "@yami/design-system"

<Divider />
<Divider orientation="vertical" />
```

## 强度与表面

- `strength="default"` 为 1px，用于同一区域内的常规分隔。
- `strength="emphasis"` 为 2px，用于明显的章节边界。
- `inverse` 在当前主题的反色表面选用对应 token。分隔线无交互，分组结构由父容器提供。

<!-- locale:en -->
# Divider — Usage

Base UI Separator supplies the separator primitive. The horizontal root remains an `hr`. The vertical root is a decorative `span`.

## When to use

- **Between list items** when a card wrapper is overkill
- **Between sections** of a form or settings page
- **Vertical separation** inside dense toolbar rows or inline info strings

## When NOT to use

- **Between cards** — spacing alone (e.g. `gap: var(--space-300)`) reads cleaner
- **Visual texture** — use dividers to separate related content, not to decorate a page.
- **Arbitrary thickness** — use the two supported strengths. Do not add custom line widths.

## Strength selection (rule: `border-strength`)

Two strengths control both thickness and color. Colors follow the active theme's semantic tokens.

| Strength | Thickness | Color token | Use when |
|---|---|---|---|
| `default` | 1px (`--stroke-default`) | `--divider-default` | Between list items and form field groups |
| `emphasis` | 2px (`--stroke-thick`) | `--divider-emphasis` | Major section boundaries and dense table headers |

### Inverse variants

On the active theme's opposite-polarity surface (`surface="inverse"` Card), set `inverse`. This surface is dark in Light and light in Dark. Thickness stays the same; colors use `--divider-default-inverse` or `--divider-emphasis-inverse`.

```tsx
<Card surface="inverse">
  <Divider inverse />
  <Divider strength="emphasis" inverse />
</Card>
```

`strength="subtle"` and strength values with an `-inverse` suffix are unsupported. Use `strength="default"` or `strength="emphasis"` with the separate `inverse` boolean.

## Orientation

```tsx
<Divider orientation="horizontal" />    {/* renders <hr> */}
<Divider orientation="vertical" />      {/* renders <span aria-hidden="true"> */}
```

Horizontal dividers expose the native separator semantics of `<hr>`; use `aria-label` when the boundary needs a name. Vertical dividers are decorative and hidden from assistive technology. The parent content must provide its own list or group semantics.

Vertical dividers stretch in a flex / grid row and keep a minimum height of `1em`. To fill a taller area, give the parent a height or minimum height and use a row layout:

```tsx
<div style={{ display: 'flex', height: 48 }}>
  <span>Left</span>
  <Divider orientation="vertical" strength="emphasis" />
  <span>Right</span>
</div>
```

## Common patterns

### List items with inline dividers

```tsx
<ul>
  {orders.map((o, i) => (
    <li key={o.id}>
      {i > 0 && <Divider />}
      <OrderRow {...o} />
    </li>
  ))}
</ul>
```

### Vertical divider in inline meta strip

```tsx
<div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-100)' }}>
  <span>4.8 ★</span>
  <Divider orientation="vertical" />
  <span>1.2k reviews</span>
  <Divider orientation="vertical" />
  <span>Ships free</span>
</div>
```

### Settings page sections

```tsx
<section>
  <h2>Profile</h2>
  {/* fields */}
</section>
<Divider strength="emphasis" />
<section>
  <h2>Notifications</h2>
  {/* fields */}
</section>
```

## Anti-patterns

### ✗ Arbitrary opacity

```tsx
<div style={{ borderTop: '1px solid rgba(0,0,0,0.15)' }} />   {/* breaks border-strength */}
```

Use `<Divider />` for ordinary structure or `<Divider strength="emphasis" />` for stronger separation. Let semantic tokens supply the color.

### ✗ Custom thickness

```css
.my-divider { height: 3px; }   /* unsupported thickness */
```

### ✗ Decorative dashed / dotted lines

No dashed / dotted divider styling. Use solid only — matches elsewhere in the system.

## Related

- Rule `border-strength` — `../../DESIGN.md`
- Token reference — `--divider-*` family in `../../tokens/semantic/colors.tokens.json`
