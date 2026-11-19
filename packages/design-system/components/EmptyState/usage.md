<!-- locale:zh -->
# EmptyState — 使用说明

在列表或搜索没有结果时，说明当前状态并提供下一步操作。

- `EmptyState / EmptyStateHeader` — 根容器和居中的说明区，可传入 className 与 style。
- `EmptyStateMedia.variant` — 默认 default。icon 为小图标添加底色与圆角。
- `EmptyStateTitle / EmptyStateDescription` — 分别渲染二级标题和说明段落。
- `EmptyStateContent` — 放置操作按钮、链接或输入控件。数据和事件由宿主管理。

```tsx
import { EmptyState, EmptyStateDescription, EmptyStateHeader, EmptyStateTitle } from "@yami/design-system";

<EmptyState>
  <EmptyStateHeader>
    <EmptyStateTitle>暂无商品</EmptyStateTitle>
    <EmptyStateDescription>试试其他筛选条件。</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>
```

<!-- locale:en -->
# EmptyState — Usage

Explain an empty collection or search result and offer a next step.

- `EmptyState / EmptyStateHeader` — The root and centered header accept className and style.
- `EmptyStateMedia.variant` — Defaults to default. Use icon for a small icon with a tinted background.
- `EmptyStateTitle / EmptyStateDescription` — Render a level-two heading and a descriptive paragraph.
- `EmptyStateContent` — Place actions, links or inputs here. The host owns the data and events.

```tsx
import { EmptyState, EmptyStateDescription, EmptyStateHeader, EmptyStateTitle } from "@yami/design-system";

<EmptyState>
  <EmptyStateHeader>
    <EmptyStateTitle>No products</EmptyStateTitle>
    <EmptyStateDescription>Try different filters.</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>
```
