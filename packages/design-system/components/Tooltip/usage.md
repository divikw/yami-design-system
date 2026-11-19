<!-- locale:zh -->
# Tooltip — 使用说明

用于可聚焦控件的简短补充说明。通过 `TooltipProvider` 管理提示延迟，`TooltipTrigger` 提供锚点，`TooltipContent` 显示文本。

```tsx
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="tertiary" size="sm" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>
      悬停
    </TooltipTrigger>
    <TooltipContent>添加到资料库</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- 默认显示在触发器上方、居中、间距 4px，箭头指向触发器。可通过 `side`、`align`、`alignOffset` 和 `sideOffset` 调整，空间不足时由 Base UI 自动避让。
- 鼠标悬停和键盘聚焦可以打开提示，Escape 可以关闭。触发器需要自己的可访问名称，内容保持简短。
- 可在 TooltipContent 中用 `<kbd>` 展示快捷键。由宿主处理快捷键操作。禁用按钮可用可聚焦的外层触发器说明原因。
- 普通和可关闭提示的浮层都使用 `--radius-component-default`（8 px）。
- 触屏上请通过可见标签提供必要信息。需要可点击操作或可展开详细内容时，使用 Popover。

默认显示并允许关闭时，使用 `DismissibleTooltip`。通过 `trigger` 传入按钮，使用 `closeLabel` 命名关闭按钮。提示首次显示时保留当前焦点，关闭后可点击触发器重新打开。

<!-- locale:en -->
# Tooltip — Usage

Use for a short hint on a focusable control. TooltipProvider coordinates delay, TooltipTrigger anchors the hint, and TooltipContent displays it.

```tsx
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="tertiary" size="sm" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>
      Hover
    </TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

- Defaults to the top, centered, with a 4px offset and an arrow pointing to the trigger. Use `side`, `align`, `alignOffset` and `sideOffset` to adjust the preferred placement. Base UI handles viewport collisions.
- Hover or keyboard focus opens the hint. Escape dismisses it. Give the trigger its own accessible name and keep the hint brief.
- Put keyboard shortcuts in `<kbd>` inside TooltipContent and bind the action in the host. For a disabled button, use a focusable wrapper to explain why the action is unavailable.
- Both tooltip forms use `--radius-component-default` (8 px) for the popup.
- Keep essential information visible on touch devices. Use Popover for actions or details that people need to open on demand.

Use `DismissibleTooltip` for an initially visible hint with a close button. Supply a button via `trigger` and name the close button with `closeLabel`. Initial display preserves focus. Press the trigger to reopen the hint.
