<!-- locale:zh -->
# Spinner — 使用说明

表示正在处理、完成时间未知的操作。

- `aria-label / aria-labelledby` — 独立使用时提供本地化名称以启用 status 语义。旁边已有加载文案时，Spinner 默认对读屏隐藏。
- `className / style` — 尺寸为 1em，线条使用 currentColor。通过字号或 CSS 类设置尺寸与颜色。减少动态效果时降低转速。

```tsx
import { Spinner } from "@yami/design-system";

<Spinner aria-label="正在加载" />
```

<!-- locale:en -->
# Spinner — Usage

Indicate that work is in progress when its duration is unknown.

- `aria-label / aria-labelledby` — Give a standalone spinner a localized name to expose a status. Beside loading text, the unnamed spinner is decorative.
- `className / style` — The ring is 1em and inherits currentColor. Set font size or a CSS class for size and color. Reduced motion slows the rotation.

```tsx
import { Spinner } from "@yami/design-system";

<Spinner aria-label="Loading" />
```
