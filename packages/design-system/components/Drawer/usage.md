<!-- locale:zh -->

# Drawer — 使用说明

在当前页面展示补充内容或临时任务。PC（≥1024px）从右侧贴边展示，宽 480px、高 100dvh，四角为直角；Mobile 从底部打开，默认 full，顶部保留至少 48px 安全区及 16px 顶部圆角。

从 `@yami/design-system` 导入 Drawer。open、title、closeLabel、onClose 为必填；内容通过 children 传入，footer 始终位于滚动正文外。移动端使用 `size="half"`，以半屏打开。上下拖动顶部手柄可在半屏与全屏之间切换，也可聚焦手柄并使用方向键。全屏仍保留顶部安全区。短内容可使用 `size="content"`。桌面端需要居中展示详情时使用 Dialog。

组件提供 `[data-drawer]`、`[data-drawer-backdrop]`、`[data-drawer-viewport]` 和 `[data-drawer-content]` 选择器。标题栏、说明和底部操作区对应的 `data-slot` 值分别是 `drawer-header`、`drawer-description` 和 `drawer-footer`。

通过 `swipeDirection` 指定 up、right、down 或 left。侧栏可通过 style 设置宽度，垂直面板可设置高度。垂直方向支持按从小到大排列的 `snapPoints`，如 `[0.5, 0.75, 1]`。用 `defaultSnapPoint` 设置起始档位，或用 `snapPoint` 和 `onSnapPointChange` 受控切换。停靠点默认显示手柄，也可单独启用 `showSwipeHandle`。底部抽屉的可见拖拽条水平居中，宽 100px、高 6px，距面板顶部 6px，拖动热区高 44px。

嵌套 Drawer 分别管理打开状态，关闭子抽屉会回到父抽屉。传 `modal={false}` 可与背景交互，配合 `disablePointerDismissal` 可在操作背景时保持打开。`modal="trap-focus"` 仅限制键盘焦点。

标题栏和默认正文的四边内边距一致。视口宽度达到 1024px 时用 24px，更窄时用 16px。四个打开方向均遵循此规则。关闭图标按 24px 图标框对齐标题栏内边缘，按钮圆角 4px，透明热区 44 × 44px。正文字号为 16px，移动端底部兼顾安全区。

可选 `description` 显示在固定标题区内的分隔线上方，并关联弹层的 `aria-describedby`。不传此属性时保持原来的头部。

Drawer 使用 [shadcn 的 Base UI Drawer](https://ui.shadcn.com/docs/components/base/drawer) 结构，支持 Tab 循环、Esc、遮罩关闭、关闭后的焦点归还和背景滚动锁定。子页面用 back，Esc 返回上层。业务方维护 loading、error、empty 和选中内容；关闭会卸载正文。Storybook 示例跟随工具栏选择的浅色或深色主题。

打开和关闭均为 200ms：PC 从右侧滑入/滑出，Mobile 从底部滑入/滑出；遮罩同时进行 150ms 淡入/淡出。使用原生 CSS 动画与现有 enter/exit 曲线，不依赖 Motion 运行时。退场期间保留最后一次打开的内容、模态锁和焦点，动画完成后才卸载并归还焦点；重新打开会取消待完成的关闭。`prefers-reduced-motion: reduce` 下取消动画并立即关闭。

可选 `onAfterClose` 在退场完成且模态已释放后调用。当原入口已被删除，需要聚焦其他稳定元素时使用；不要在 `onClose` 请求阶段把焦点移到仍处于 inert 状态的背景。

Storybook 的 PC / Mobile / States 覆盖默认、空内容、加载、错误、长内容、固定操作栏和子页面。来源为 2026-10-13 购物车观察；未绑定独立 Figma 节点。

<!-- locale:en -->

# Drawer — Usage

Show additional content or a contextual task on the current page. At 1024px and above, the panel is flush right, 480px wide and 100dvh tall with square corners. Below that breakpoint the bottom panel opens at full available height by default. Use `size="half"` to start at half height. Drag the handle or focus it and press the arrow keys to switch between half and full height. Expanded panels leave at least 48px of top clearance.

Required props: open, title, closeLabel and onClose. Children own business content; footer stays outside scrolling content. Use `size="content"` for short content. Use Dialog for centered desktop details.

For every drawer direction, the header and default body use 24px of padding on each side at viewport widths of at least 1024px, and 16px below. The 24px Close icon aligns to the header inset with a 4px radius and a 44px hit area. Body text is 16px, with mobile bottom safe-area clearance.

Target the panel, backdrop, viewport, and scrolling body with `[data-drawer]`, `[data-drawer-backdrop]`, `[data-drawer-viewport]`, and `[data-drawer-content]`. The header, description, and footer use the `data-slot` values `drawer-header`, `drawer-description`, and `drawer-footer`.

Use `swipeDirection` to select up, right, down or left. Override the side panel width or vertical panel height with style. Vertical drawers accept ascending `snapPoints` such as `[0.5, 0.75, 1]`. Set `defaultSnapPoint` or control the stop via `snapPoint` and `onSnapPointChange`. Snap points enable the handle by default. Use `showSwipeHandle` to display a grip independently. The bottom drawer centers a 100 × 6px grip 6px below its top edge, with a 44px-high drag target.

Nested drawers own their open state separately. Close the child to resume the parent. Use `modal={false}` for background interaction, with `disablePointerDismissal` to keep the panel open. Use `modal="trap-focus"` to confine only keyboard focus.

Adapted from the [shadcn Base UI Drawer](https://ui.shadcn.com/docs/components/base/drawer), Drawer supports focus confinement and restoration, Escape, backdrop dismissal and scroll locking. A child view uses back and Escape returns to its parent. The host owns loading, errors, empty content and selection. Closing unmounts content. Storybook examples follow the light or dark theme selected in the toolbar. No independent Figma binding is assigned.

Entry and exit take 200ms, from the right on desktop and from the bottom on mobile, with a simultaneous 150ms scrim fade. Native CSS uses the documented enter/exit curves without a Motion runtime dependency. Content, modal lock and focus remain until exit completes; reopening cancels a pending close. Reduced-motion users get no animation and immediate dismissal. Optional `onAfterClose` runs after the modal is released, allowing a stable focus fallback when its original opener was removed.
