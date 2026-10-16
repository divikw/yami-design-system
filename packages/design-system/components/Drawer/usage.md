# Drawer — 使用说明

用于优惠券、失效商品等需要保留页面上下文的长内容。PC（≥1024px）从右侧贴边展示，宽 480px、高 100dvh，四角为直角；Mobile 复用 Sheet 的底部弹层，默认 full，顶部保留至少 48px 安全区及 16px 顶部圆角。

从 `@yami/design-system` 导入 Drawer。open、title、closeLabel、onClose 为必填；内容通过 children 传入，footer 始终位于滚动正文外。contentPadding、size、back 的含义与 Sheet 相同。简短确认使用 Dialog，居中详情使用 Sheet。

可选 `description` 复用 Sheet 的固定标题说明区和分隔线，并关联弹层的 `aria-describedby`。不传此属性时保持原来的头部。

Drawer 组合 Sheet，共用原生 modal dialog、Tab 循环、Esc、遮罩关闭、关闭后的焦点归还和背景滚动锁定。子页面用 back，Esc 返回上层。业务方维护 loading、error、empty 和选中内容；关闭会卸载正文。本次 Storybook 示例与验收仅覆盖浅色模式。

打开和关闭均为 200ms：PC 从右侧滑入/滑出，Mobile 从底部滑入/滑出；遮罩同时进行 150ms 淡入/淡出。使用原生 CSS 动画与现有 enter/exit 曲线，不依赖 Motion 运行时。退场期间保留最后一次打开的内容、模态锁和焦点，动画完成后才卸载并归还焦点；重新打开会取消待完成的关闭。`prefers-reduced-motion: reduce` 下取消动画并立即关闭。

可选 `onAfterClose` 在退场完成且模态已释放后调用。当原入口已被删除，需要聚焦其他稳定元素时使用；不要在 `onClose` 请求阶段把焦点移到仍处于 inert 状态的背景。

Storybook 的 PC / Mobile / States 覆盖默认、空内容、加载、错误、长内容、固定操作栏和子页面。来源为 2026-10-13 购物车观察；未绑定独立 Figma 节点。

<!-- locale:en -->

# Drawer — Usage

Use for contextual long tasks such as coupons or unavailable items. At 1024px and above, the panel is flush right, 480px wide and 100dvh tall with square corners. Below that breakpoint it uses Sheet's bottom presentation, defaulting to full height with the same safe area and top corner tokens.

Required props: open, title, closeLabel and onClose. Children own business content; footer stays outside scrolling content. size, contentPadding and back follow Sheet. Use Dialog for short confirmations and Sheet for centered desktop details.

Drawer composes Sheet's native modal, focus confinement/restoration, Escape, backdrop dismissal and scroll locking. A child view uses back and Escape returns to its parent. The host owns loading, errors, empty content and selection. Closing unmounts content. This delivery targets light mode. No independent Figma binding is assigned.

Entry and exit take 200ms, from the right on desktop and from the bottom on mobile, with a simultaneous 150ms scrim fade. Native CSS uses the documented enter/exit curves without a Motion runtime dependency. Content, modal lock and focus remain until exit completes; reopening cancels a pending close. Reduced-motion users get no animation and immediate dismissal. Optional `onAfterClose` runs after the modal is released, allowing a stable focus fallback when its original opener was removed.
