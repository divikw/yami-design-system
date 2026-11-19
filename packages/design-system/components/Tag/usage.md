<!-- locale:zh -->
# Tag — 使用说明

## 用法

Tag 用于短描述词。默认渲染静态 `span`，也可通过 Base UI 的 `render` 选择语义等效的文本元素，例如 `strong`。

```tsx
import { Tag } from "@yami/design-system"

<Tag variant="outline" render={<strong />}>抹茶</Tag>
```

## 样式

- `context` 选择普通内容或图片背景。用 `mode` 匹配背景的明暗。
- `variant` 选择 `filled` 或 `outline`。标签在移动端高 32px，在 PC（≥1024px）高 36px。
- 纯文字标签左右内距均为 12px。
- PC 端鼠标悬停时，填充和描边标签都通过底色提供反馈，描边颜色保持原样。移开鼠标后恢复默认样式。
- `image` 可提供前置图像。图像与文字重复时用空 `alt`。需要筛选交互时使用 FilterChip。

<!-- locale:en -->
# Tag

Base UI's `useRender` renders the static label. Supply `render={<strong />}` to use an equivalent text element while keeping the YAMI styling.

`Tag` is a static, full-pill label for short keywords that explain nearby
content. It is deliberately larger and more editorial than the 20px `Badge`.

## Configuration

The three configuration axes describe different concerns:

- `context="content" | "overlay"` describes whether the Tag sits in ordinary
  content or over imagery, gradients, or other visual backgrounds.
- `mode="light" | "dark"` describes the light or dark surface behind the Tag.
- `variant="filled" | "outline"` selects a filled or outlined container.

Presentation options:

- `size="m" | "l"` is accepted for compatibility. Both values use the same responsive height.
- `image={{ src, alt }}` adds optional leading artwork.

Filled variants use transparent color tokens: black at 4% in light mode and
white at 8% in dark mode. Outline variants remain transparent and use an 8%
black or white stroke. On desktop, hovering with a mouse applies the same background to filled and outlined Tags.

## When to use

- Summarize a campaign, brand, ingredient, benefit, or content theme.
- Use `context="content"` in ordinary page or card content.
- Use `context="overlay"` over photography, gradients, or colored visuals.
- Use light mode on light backgrounds and dark mode on dark backgrounds.

## When not to use

- Product status, promotion, price, or counts → use `Badge`.
- Filters, navigation, dismissal, or any other action → use the corresponding
  interactive component such as `Button` or `Tabs`.
- Sentences or wrapping copy → use regular body text.

## Size and content

- Tags are 32px tall on mobile and 36px on PC.
- PC starts at 1024px. Text-only tags use 12px inline padding at every viewport width.
- With an image, the leading inset is 2px and the label gap is 4px. The image
  slot is 4px smaller than the Tag and the artwork is 8px smaller, matching the
  Search tag treatment.
- Keep labels on one line and preferably to three words or fewer.
- Use a consistent context, mode, and variant within one tag group.

```tsx
<Tag context="content" mode="light" variant="filled">
  Heartleaf Botanical
</Tag>
<Tag context="content" mode="light" variant="outline">
  Gentle Daily Formulas
</Tag>

<Tag
  context="content"
  mode="light"
  size="l"
  variant="filled"
  image={{ src: matchaImage, alt: "" }}
>
  Matcha
</Tag>

<Tag context="overlay" mode="dark" variant="filled">
  Targeted Active Care
</Tag>
<Tag context="overlay" mode="dark" variant="outline">
  Barrier Support
</Tag>
```

## Accessibility

`Tag` renders a native `span` with no focus or click behavior. Select the mode
that keeps the label legible against its actual background. Outline variants
have no fill, so their text and stroke rely directly on the surface behind them
for contrast.
