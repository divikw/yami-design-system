# QuantitySelect — 使用说明

用于购物车的整数数量选择。原生 select 提供 1–9，max ≥10 时提供 10+；选择 10+ 后展开数量输入，确认后才调用 onValueChange。已确认的 10+ 数量显示当前值，旁边的“修改”重新打开输入。取消和 Esc 保留已确认值并回到下拉框；输入内的 Esc 不关闭外层抽屉。

value、max、onValueChange、label 必填。value 为 1–max 的整数，max 为业务提供的正整数库存／限购上限；组件不自行定义业务限购。label 应包含商品名称，locale 控制中英文操作和验证文案。调用方维护受控值，以及 loading、disabled、error 和提交结果；组件不请求 API，也不更改价格。

原生下拉最小 44px 高。输入拒绝空值、0、负数、小数、指数写法和超上限；错误通过 alert 播报。loading 锁定编辑并显示状态文案；禁用使用语义颜色。本次 Storybook 示例与验收仅覆盖浅色模式。Storybook 包含默认、限购、10+、编辑、禁用、更新中和服务端错误；PC/Mobile 可操作。

<!-- locale:en -->

# QuantitySelect — Usage

Controlled cart quantity selection. The native select offers 1–9, plus 10+ when max allows it. The custom editor commits only on Apply; Cancel or Escape preserves the last confirmed value and restores select focus. Escape inside the editor does not dismiss a surrounding drawer. Confirmed quantities above nine show their value and an Edit action.

Provide value, max, onValueChange and a product-specific label. value is a whole number from 1 to max; max is the host's positive stock/purchase limit. locale controls built-in copy. The host owns asynchronous updates, loading, disabled, errors and prices; this component does not call an API.

The native select has a 44px minimum target. Empty, zero, negative, decimal, exponential and over-limit inputs are rejected and announced. Loading prevents changes and announces progress; disabled uses semantic colors. This delivery targets light mode. No independent Figma mapping is assigned.
