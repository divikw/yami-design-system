# Coupon — 使用说明

优惠券选择卡片，包含标题、使用范围和可选有效期。复用 Checkbox 的语义与键盘行为，使用圆形选择标记；整张卡片可点击，虚线与透明缺口构成票券轮廓。不默认添加阴影。

从 `@yami/design-system` 导入 `Coupon`。`title`、`description`、`selected`、`onSelectedChange` 必填；`validity` 是由业务方本地化的完整有效期文案。`disabled` 用于不可选择状态，业务方应在 description 中说明原因。

组件只报告选择变更，不兑换、保存或计算优惠。业务方决定能否多选，购物车限定至多一张，并在保存后提交；关闭、Esc 或遮罩关闭应放弃草稿。优惠券是否可用、到期判断和金额计算由业务方维护。

基于 2026-10-16 原网页购物车观察，无独立 Figma 绑定。支持中英文文案和主题语义色；宽度跟随容器，长文案自然换行。

<!-- locale:en -->

# Coupon — Usage

A controlled coupon selection card with a title, scope and optional localized validity text. It composes Checkbox with a circular marker, a clickable label, dashed divider and transparent ticket cutouts. It has no default shadow.

Import `Coupon` from `@yami/design-system`. Required props are `title`, `description`, `selected` and `onSelectedChange`. Supply a complete localized `validity` string. Explain disabled conditions in the description.

The host owns eligibility, expiry, redemption, totals and saving. The cart allows zero or one selected coupon and commits only on Save; dismissal discards the draft. No production integration or independent Figma binding is implied. Text wraps within the host width and semantic colors follow the theme.
