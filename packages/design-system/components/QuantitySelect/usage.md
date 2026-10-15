# QuantitySelect — 使用说明

用于购物车的受控整数数量选择。Base UI Select 下拉列表提供 1–9，max ≥10 时提供 10+；选择 10+ 后在原位切换为居中的内联输入，失焦或按 Enter 提交。已提交的 10+ 数量保持输入外观，可直接再次编辑；没有确认、取消或修改按钮。输入过滤非数字，空值或 0 归为 1，超过 max 归为上限，并通过不占布局空间的居中 toast 播报；toast 采用线上白底深色边框及警告图标，2.5 秒后自动消失，重复超限重新计时。相同数量不重复调用 onValueChange，Enter 只通过失焦提交一次。Esc 放弃未提交的修改；输入内的 Esc 不关闭外层抽屉。

value、max、onValueChange、label 必填。value 为 1–max 的整数，max 为业务提供的正整数库存／限购上限；组件不自行定义业务限购。label 应包含商品名称，locale 控制中英文操作和提示文案。调用方维护受控值，以及 loading、disabled、error 和提交结果；组件不请求 API，也不更改价格。

默认可见外观对齐原购物车：60×24px 胶囊、14px 数字及 16px 箭头；外层触发按钮和内联输入的关联标签保留至少 44px 高的点击区域。数字在 24px 区域内居中；打开时箭头朝上、边框加深，下拉列表与胶囊同宽，选中项显示勾号。桌面选项高 28px；手机保留 44px 选项点击区域，空间不足时滚动或翻转方向。弹层无阴影，悬浮和键盘高亮使用语义浅灰背景。内联输入保持胶囊的宽高、圆角和居中位置，焦点时加深状态边框，鼠标或触屏点击不显示蓝色焦点框，包括切换到 10+ 输入时；键盘操作保留独立蓝色焦点框。loading 和 disabled 锁定编辑并保留语义颜色；更新中通过状态文案播报。本次 Storybook 示例与验收仅覆盖浅色模式。

<!-- locale:en -->

# QuantitySelect — Usage

Controlled cart quantity selection. The accessible Base UI Select popup offers 1–9, plus 10+ when max allows it. Choosing 10+ replaces the pill in place with a centered inline input. Blur or Enter commits; confirmed quantities above nine remain directly editable. There are no Apply, Cancel or Edit buttons. Non-digits are filtered; empty/zero normalizes to 1 and over-limit values clamp to max with a centered, non-layout toast (source-style white surface, dark border and warning icon). It disappears after 2.5 seconds; repeated over-limit submissions restart the timer. Unchanged values do not trigger updates; Enter submits only through blur. Escape discards the draft without dismissing a surrounding drawer.

Provide value, max, onValueChange and a product-specific label. value is a whole number from 1 to max; max is the host's positive stock/purchase limit. locale controls built-in copy. The host owns asynchronous updates, loading, disabled, errors and prices; this component does not call an API.

The visible control matches the source cart: a 60×24px pill, a centered 14px value and a 16px arrow. The arrow points up and the border strengthens while open. The same-width popup has selected checkmarks, neutral highlighted rows and no shadow; options are 28px on desktop and 44px on mobile, with scrolling/flipping near viewport edges. The trigger and inline input's associated label retain minimum 44px targets. The inline input preserves pill size and position, with a neutral focus border and a separate blue keyboard outline. Pointer interaction shows no blue outline, including when switching to the 10+ input; keyboard interaction retains it. Loading and disabled prevent changes using semantic colors; progress is announced. This delivery targets light mode. No independent Figma mapping is assigned.
