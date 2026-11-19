<!-- locale:zh -->
# Progress — 进度条

传入任务的实际 value，范围默认 0–100，也可以设置 min 和 max。总量未知时传 null，开启减少动态效果后使用静态指示。组件只读，数据、更新频率和完成后的操作由宿主管理。

使用 ProgressLabel 或 aria-label 命名进度条。ProgressValue 显示本地化数值，轨道与填充条由 Progress 自动提供。使用 format、locale 或 getAriaValueText 表达单位。PC 和移动端使用相同语义并适应容器宽度。

<!-- locale:en -->
# Progress — Task completion

Pass the current task value and optionally set min and max (defaults: 0 and 100). Pass null for an unknown total. The indeterminate indicator stays still when reduced motion is enabled. The bar is read-only; the host supplies updates and owns completion behavior.

Name the bar with ProgressLabel or aria-label. Add ProgressValue for a localized visible value. The track and fill are included automatically. Use format, locale or getAriaValueText for task-specific units. The bar fits its container on desktop and mobile.
