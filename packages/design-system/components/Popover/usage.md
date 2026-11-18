<!-- locale:zh -->
# Popover — 使用说明

YAMI 非模态浮层，采用现有筛选菜单的表面样式。支持锚点定位、边界避让、Escape 关闭和焦点恢复。移动端 Drawer 由调用方选择。

用于与触发器相关的轻量交互内容，不承担确认对话框或页面导航。组合 PopoverTrigger 和 PopoverContent；通过 PopoverTitle 或 aria-label 命名内容。默认非模态，底部起始对齐、4px 间距、16px 边界留白；空间不足时自动换侧。内容默认 290px，采用 12px 语义表面圆角，无内部留白，由调用方安排内容。PopoverTitle 为 16px/20px，PopoverDescription 为 14px/20px，均移除默认外边距。说明型示例使用 8px 行间距，并在标题行右上角提供带可访问名称的关闭图标按钮；按钮与图标同为 24px，圆角 4px，距面板顶部和右侧为 Mobile 16px、PC 24px，保留共享 Button 的 44px 透明扩展点击区域。Escape、外部点击关闭后恢复焦点；不要阻止必要的关闭事件。嵌套在原生 dialog 中时可传 container。Popover 不自动变成 Drawer；FilterChip 在小于 1024px 时继续使用现有 Drawer。

实现基于 Base UI 1.9.0，状态与事件详情遵循该版本契约。

<!-- locale:en -->
# Popover — Usage

YAMI non-modal popover using the existing filter menu surface. Supports anchored positioning, collision handling, Escape dismissal and focus restoration. The caller chooses a Drawer on mobile.

Use for lightweight content tied to a trigger, not confirmation dialogs or page navigation. Compose PopoverTrigger and PopoverContent; name content with PopoverTitle or aria-label. Defaults to non-modal, bottom/start placement, 4px offset and 16px edge clearance; flips when space is limited. Content is 290px wide with a 12px semantic surface radius and no inner padding. PopoverTitle uses 16px/20px and PopoverDescription uses 14px/20px, both without default margins. Informational examples use an 8px row gap and a named close icon button at the top right of the title row with a 24px button and icon, a 4px radius, and 16px mobile or 24px desktop edge insets; the shared Button retains its transparent 44px expanded hit area. Escape and outside clicks dismiss it with focus restoration. Supply container when needed inside native dialogs. Popover does not automatically become a Drawer; FilterChip retains its Drawer below 1024px.

Built on Base UI 1.9.0; state and change details follow that version’s contract.
