<!-- locale:zh -->
# Dialog — 使用说明

基于 Base UI 的居中模态弹窗，用于短表单、编辑和一般信息。重要确认与不可撤销操作使用 `AlertDialog`；长篇移动端详情、筛选和子页面使用 `Sheet`。

## 接口与职责

从 `@yami/design-system` 导入 `Dialog`。保留受控 `open`、可见标题 `title`、关闭请求 `onClose`、正文 `children` 和固定操作区 `footer`；默认变体必填本地化 `closeLabel`。宿主负责保存、校验和异步状态，并设置 `open=false` 完成关闭。异步期间可暂不响应关闭请求。

关闭按钮、Escape 和点击遮罩请求关闭。Base UI 负责 Portal、焦点循环、背景隔离、页面滚动锁定与关闭后焦点归还；默认聚焦关闭按钮。弹窗在 body 中渲染为 `div`，原生 `showModal()`、`close()`、`method="dialog"` 不再适用。自定义事件目标类型为 HTMLDivElement；保留 `data-dialog`、`data-variant`、`data-slot` 钩子。跨 Portal 提交表单时，给表单设置 id，并在 Button 使用 `htmlType="submit"`、`htmlForm={formId}`。

## 兼容变体

`variant="confirmation"` 保留居中标题、紧凑信息区域和无关闭按钮的旧布局。默认聚焦第一个可聚焦控件。`role="alertdialog"` 保留语义，但不会阻止遮罩关闭；新确认流程应直接使用 `AlertDialog`。

## 响应式与样式

- PC / Mobile 都居中，最大宽度 400px，移动端左右至少 16px。
- 上下至少 48px 并兼容安全区；内容超高后正文独立滚动，标题与 footer 固定。
- 默认关闭按钮独占顶部一行，标题位于下一行。Mobile 使用 20px 标题、正文上内边距 4px，关闭图标距顶部和右侧均为 12px；PC ≥1024px 使用 24px 标题、16px 正文、顶部 16px、左右及底部 24px，关闭按钮与标题间隔 12px，标题与正文相隔 12px；surface 圆角为 12px。
- confirmation 信息左右 12px、底部 8px、footer 12px，保留旧布局。
- 关闭按钮视觉 32px、图标 24px，使用 YAMI 关闭资源与 Button 44px 热区。
- footer 无分隔线。操作由宿主组合 Button / ButtonGroup，示例使用 md（40px）全圆角按钮，PC 靠右、Mobile 两列等宽；普通保存使用黑色 primary，取消使用 secondary。表单字段使用 Input fullWidth 撑满内容区。

示例见 `examples.tsx#DialogExample`；无独立 Figma 绑定。

<!-- locale:en -->
# Dialog — Usage

A centered Base UI modal for short forms, editing and general information. Use `AlertDialog` for important or irreversible confirmations and `Sheet` for lengthy mobile details, filters and child views.

## Contract and ownership

Import `Dialog` from `@yami/design-system`. The existing controlled `open`, visible `title`, close request `onClose`, body `children` and fixed `footer` remain. The default variant requires a localized `closeLabel`. The host owns validation, submission and async state, closing with `open=false`; it may ignore premature close requests during async work.

Close, Escape and outside presses request dismissal. Base UI owns the portal, focus trap, modal isolation, scroll lock and focus restoration; default initial focus goes to Close. The popup is a `div` portalled to body, not a native dialog. `showModal()`, `close()` and `method="dialog"` no longer apply. Custom event targets are HTMLDivElement; data-dialog, data-variant and data-slot hooks remain. Use an explicit form id with Button `htmlType="submit"` and `htmlForm={formId}` when submitting across a portal.

## Compatibility

Legacy `variant="confirmation"` keeps its centered heading, compact spacing and no Close button, focusing the first control. `role="alertdialog"` preserves semantics but still allows outside dismissal. New confirmation flows should use `AlertDialog`.

## Layout

PC and Mobile stay centered with a 400px maximum width, at least 16px side margins and 48px vertical safe clearance. Overflowing body content scrolls between the fixed header and footer. Close occupies its own top row above the heading. Mobile uses a 20px heading, 4px content top padding and 12px top/right Close icon insets; PC (≥1024px) uses a 24px heading, 16px body, 16px top spacing, 24px side/footer spacing and 12px close-to-title and title-to-content gaps. Surface radius remains 12px using YAMI tokens. Confirmation retains 12px side/footer padding and 8px body-bottom spacing. Close is visually 32px with a 24px YAMI icon and Button's 44px target. The footer has no divider. Hosts compose Button / ButtonGroup actions; examples use md (40px) pills, right-aligned on PC and equal-width on Mobile, primary black for Save and secondary for Cancel. Input fullWidth fills the content area.

See `examples.tsx#DialogExample`. No standalone Figma binding is assigned.
