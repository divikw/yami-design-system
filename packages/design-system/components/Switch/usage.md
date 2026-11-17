<!-- locale:zh -->
# Switch — 使用说明

YAMI 开关，沿用搜索筛选的 32×20px 轨道与 32px 最小控件高度。支持受控、非受控、只读、禁用和表单提交。

用于立即生效的二元设置；多选列表使用 Checkbox。可将静态文字放入 children，让整行可点击。不要嵌套按钮或链接。保持 checked/onCheckedChange 同步；未传 checked 时使用 defaultChecked。轨道固定 32×20px，外层最小尺寸为 32×32px、圆角 8px，所有视口一致。页面可为重要触控场景提供更大的标签行。支持 Space、Enter、Tab；禁用项不参与表单提交，只读项保留提交。

实现基于 Base UI 1.9.0，状态与事件详情遵循该版本契约。

<!-- locale:en -->
# Switch — Usage

YAMI switch with the search filter’s 32×20px track and a 32px minimum control height. Supports controlled/uncontrolled state, read-only, disabled and native forms.

Use for binary settings; use Checkbox for multi-selection. Static children make the whole row clickable; do not nest buttons or links. Pair checked with onCheckedChange, or use defaultChecked. The 32×20px track sits in a minimum 32×32px control with an 8px outer radius at every viewport. Hosts may provide a larger label row for important touch actions. Supports Space, Enter and Tab. Disabled values are excluded from forms; read-only values remain submitted.

Built on Base UI 1.9.0; state and change details follow that version’s contract.
