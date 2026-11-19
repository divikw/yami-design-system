<!-- locale:zh -->
# Skeleton — 使用说明

在内容加载时按实际布局预留空间。

- `style / className` — 设置宽、高、比例和圆角，使占位块匹配最终内容。
- `aria-hidden / aria-busy` — 每个骨架块均对读屏隐藏。在等待数据的容器上声明 aria-busy。减少动态效果时骨架静止。

```tsx
import { Skeleton } from "@yami/design-system";

<Skeleton style={{ width: "65%", height: "var(--space-200)" }} />
```

<!-- locale:en -->
# Skeleton — Usage

Reserve space in the shape of the content being loaded.

- `style / className` — Set dimensions, aspect ratio and radius to match the loaded content.
- `aria-hidden / aria-busy` — Each block is decorative. Mark the loading region aria-busy. Reduced motion shows static blocks.

```tsx
import { Skeleton } from "@yami/design-system";

<Skeleton style={{ width: "65%", height: "var(--space-200)" }} />
```
