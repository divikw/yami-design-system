# Badge — Usage

## When to use

- **Product status** — NEW, BESTSELLER, OUT OF STOCK
- **Promotion/sale** — SALE, –30%, FLASH DEAL, 限时 Limited
- **Counts** — notification counts on icons, cart quantity

## When NOT to use

- **Interactive elements** → use `<Button size="sm">` instead. Badge is a display primitive with no click affordance.
- **Descriptive keywords** — campaigns, brands, ingredients, or content themes → use `Tag`.
- **Selectable filters** → use `FilterChip`; navigation → use a link or `Tabs`.
- **Long sentences** → if content is > 15 chars, it's probably not a badge. Use `<Alert>` or inline text.
- **Emoji-only content** → breaks `no-emoji` rule.

## Colors

Map to semantic meaning, not decoration. **Red is reserved for promotion/urgency** (rule: `red-usage`).

| Color | Primary use | Example |
|---|---|---|
| `red` | Promotion, sale, urgency | `SALE`, `–30%`, `限时 Limited` |
| `blue` | Information, neutral tag | `NEW`, `BESTSELLER`, `Official` |
| `green` | Success, positive state | `IN STOCK`, `AUTHENTIC`, `FAST SHIP` |
| `purple` | Premium, featured | `PREMIUM`, `EDITOR'S PICK` |
| `yellow` | Warning, attention; use `emphasis="secondary"` | `LOW STOCK`, `ENDING SOON` |
| `neutral` | Default tag, category | `Snacks`, `Beauty`, category pills |

### ⚠️ `red-usage` rule

```tsx
<Badge color="red">–30%</Badge>             ✓ promotion
<Badge color="red">NEW</Badge>              ✗ use blue or neutral for "new"
<Badge color="red">categories</Badge>       ✗ use neutral
```

Red is a scarce visual resource. Using it for non-promotional state dilutes its meaning at the places where it matters (checkout CTA, final price).

## Emphasis

| Emphasis | When to use |
|---|---|
| `primary` | Attention-grabbing, sparse use, solid background |
| `secondary` | Supporting product status and promotion, softer tinted look |

Primary badges use theme-aware foreground tokens. Green uses white text on
`--color-emerald-700` in the light theme to meet 4.5:1 text contrast.
Secondary colors retain their own foregrounds; the plain semantic shortcuts
listed below use neutral ink.

Yellow only supports the tinted secondary treatment, including
`type="best-sellers"`. Passing `color="yellow"` always resolves to
`emphasis="secondary"`, even if primary is requested. There is no solid Yellow
style or primary Yellow token.

## Size

| `size` | Height | Type / line height | Use |
|---|---:|---:|---|
| `sm` (default) | 20px | 12px / 16px | Product metadata and dense layouts |
| `md` | 24px | 14px / 20px | More prominent labels with additional space |

Both sizes use 4px horizontal padding (`--space-050`) at every breakpoint.
Flag-prefixed `exclusive` and `choice` retain their intentional flush-left
artwork while keeping 4px right padding.

```tsx
<Badge size="sm">Compact</Badge>
<Badge size="md">Prominent</Badge>
```

## Surface tone

Use `tone` when a neutral Badge needs to sit directly on light, dark, or mixed
backgrounds. It takes visual priority over `color`, `emphasis`, and `type`, but
keeps the selected Badge size and 4px radius unchanged.

| `tone` | Treatment | Recommended background |
|---|---|---|
| `dark` | `--color-black-700` (68% black) fill with white text | Light or mixed |
| `light` | Translucent white fill with black text | Dark |
| `dark-outline` | Transparent fill with 1px black inset stroke | Light |
| `light-outline` | Transparent fill with 1px white inset stroke | Dark |

```tsx
<Badge tone="dark">Heartleaf</Badge>
<Badge tone="light">New</Badge>
<Badge tone="dark-outline">Low stock</Badge>
<Badge tone="light-outline">Exclusive</Badge>
```

## Type — Figma semantic shortcut

`type` is a shortcut that mirrors Figma's named Badge variants. Each value resolves to a (color, emphasis) preset matching the Figma design.

The plain tinted shortcuts `sale`, `low-price`, `discount`, `new`, and `hot` use `--text-primary` neutral ink. `exclusive`, `choice`, and `best-sellers` retain their color-specific foregrounds.

| `type` | Resolves to | Figma Type | Typical text |
|---|---|---|---|
| `price` | neutral · primary | `Type=Price` | $9.99 |
| `sale` | red · secondary | `Type=Sale` | SALE |
| `low-price` | red · secondary | `Type=Low price` | Low Price |
| `discount` | red · secondary | `Type=Discount` | –30% OFF |
| `new` | purple · secondary | `Type=New` | NEW |
| `hot` | purple · secondary | `Type=Hot` | HOT |
| `exclusive` | purple · secondary | `Type=Exclusive` | Exclusive · auto-renders purple flag prefix from [`assets/badges/flag-cap-purple.svg`](../../assets/badges/flag-cap-purple.svg) |
| `choice` | blue · secondary | `Type=Choice` | Choice · auto-renders blue flag prefix from [`assets/badges/flag-cap-blue.svg`](../../assets/badges/flag-cap-blue.svg) |
| `best-sellers` | yellow · secondary | `Type=Best Sellers` | Best Sellers |

```tsx
<Badge type="sale">SALE</Badge>                  {/* same as color="red" emphasis="secondary" */}
<Badge type="low-price">Low Price</Badge>
```

Explicit `color` / `emphasis` override the `type` preset, except Yellow always uses secondary. Pass both for a one-off override without changing your type vocabulary.
This overrides the preset axes; type-specific neutral ink, the price outline,
and the `exclusive` / `choice` flag remain. `tone` overrides the text and
container colors, but does not recolor the flag artwork.

## Common patterns

### Product card — single primary badge

```tsx
<div className="product-card">
  <Badge color="red">SALE</Badge>
  {/* …rest of card… */}
</div>
```

### Multi-state product badge stack

Max 2 badges per card. If there are more signals, rotate — don't stack all at once.

```tsx
<div className="badge-stack">
  <Badge color="red">–30%</Badge>
  <Badge color="blue" emphasis="secondary">NEW</Badge>
</div>
```

### Supporting product status

```tsx
<Badge color="green" emphasis="secondary">IN STOCK</Badge>
```

### Cart quantity on icon

```tsx
<button aria-label={`Cart, ${count} items`}>
  <CartIcon />
  {count > 0 && <Badge color="neutral" aria-hidden="true">{count}</Badge>}
</button>
```

## Anti-patterns

### ✗ Emoji in badge text

```tsx
<Badge>🔥 HOT</Badge>              {/* breaks no-emoji */}
```

Use the badge text alone; do not create ad-hoc icon-bearing badge types.

### ✗ Decorative red

```tsx
<Badge color="red">Drinks</Badge>   {/* breaks red-usage */}
```

### ✗ Too many badges on one card

```tsx
<Badge color="red">SALE</Badge>
<Badge color="blue">NEW</Badge>
<Badge color="yellow">LIMITED</Badge>
<Badge color="purple">PREMIUM</Badge>
<Badge color="green">AUTHENTIC</Badge>
```

Maximum 2 badges per card. Every badge claims visual attention; overuse flattens hierarchy.

### ✗ Interactive badges

```tsx
<Badge onClick={...}>Remove</Badge>   {/* not interactive — use Button */}
```

## Accessibility

Badge renders a static `span`. It has no keyboard or focus behavior and does not
announce count changes automatically. Include essential status or counts in the
parent control's accessible name. Hide a visual count from assistive technology
when that name already includes the same information.

Outline tones rely on the actual background for text contrast. Use dark outlines
on light surfaces and light outlines on dark surfaces. Check image overlays on
the final artwork rather than assuming every background is readable.

## Related

- `Tag` — descriptive keywords; `FilterChip` — interactive filters.
- Rule `red-usage` / `semantic-color-only` / `no-emoji` / `numerals-font` — `../../DESIGN.md`
- Token reference — `meta.json` → `tokens[]`
- Copy reference — `labels.meta` / `labels.sale` in `../../../copy-library/ui/labels.i18n.json`
