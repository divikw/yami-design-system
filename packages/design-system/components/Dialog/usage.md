<!-- locale:zh -->
# Dialog — 使用说明

基于 Base UI 的居中模态弹窗，用于短表单、编辑和一般信息。重要确认与不可撤销操作使用 `AlertDialog`；长篇移动端详情、筛选和子页面使用 `Drawer`。

## 接口与职责

从 `@yami/design-system` 导入 `Dialog`。保留受控 `open`、可见标题 `title`、关闭请求 `onClose`、正文 `children` 和固定操作区 `footer`；默认变体显示关闭图标时必填本地化 `closeLabel`。宿主负责保存、校验和异步状态，并设置 `open=false` 完成关闭。异步期间可暂不响应关闭请求。

关闭按钮、Escape 和点击遮罩请求关闭。Base UI 负责 Portal、焦点循环、背景隔离、页面滚动锁定与关闭后焦点归还；默认聚焦关闭按钮。弹窗在 body 中渲染为 `div`，原生 `showModal()`、`close()`、`method="dialog"` 不再适用。自定义事件目标类型为 HTMLDivElement；保留 `data-dialog`、`data-variant`、`data-slot` 钩子。跨 Portal 提交表单时，给表单设置 id，并在 Button 使用 `htmlType="submit"`、`htmlForm={formId}`。

## 组合用法

用 DialogTrigger 打开弹窗，DialogContent 承载内容，DialogTitle 和 DialogDescription 自动关联无障碍名称与说明。DialogBody 提供独立滚动，DialogFooter 放在其后以固定操作区。组合用法默认非受控，支持 defaultOpen，或使用 open 和 onOpenChange 管理状态。

DialogContent 的 showCloseButton 默认为 true。隐藏右上角图标时可在 DialogFooter 设置 showCloseButton 和 closeLabel，或通过 DialogClose 的 render 提供自定义按钮。隐藏图标后采用 Base UI 默认初始焦点，也可在 DialogContent 设置 initialFocus 或 finalFocus。

## 兼容变体

`variant="confirmation"` 保留居中标题、紧凑信息区域和无关闭按钮的旧布局。默认聚焦第一个可聚焦控件。`role="alertdialog"` 保留语义，但不会阻止遮罩关闭；新确认流程应直接使用 `AlertDialog`。

## 响应式与样式

- PC / Mobile 都居中，最大宽度 400px，移动端左右至少 16px。
- 上下至少 48px 并兼容安全区；内容超高后正文独立滚动，标题与 footer 固定。
- 默认弹窗顶部有关闭图标时，图标上方留 12px；隐藏该图标时，标题上方留 20px。左右留白在 PC（≥1024px）为 24px，Mobile 为 16px。关闭按钮独占标题上方一行。标题栏底部留 8px，正文上下各留 8px。操作栏顶部留 16px，底部留 PC 20px、Mobile 16px，并兼顾安全区。
- confirmation 信息左右 12px、底部 8px、footer 12px，保留旧布局。
- 关闭按钮与图标同为 24px，圆角 4px，使用 YAMI 关闭资源与 Button 44px 热区。
- footer 无分隔线。操作由宿主组合 Button / ButtonGroup，示例中 PC 使用 md（40px）全圆角按钮并靠右排列，Mobile 使用 md（40px）并按两列等宽排列；普通保存使用黑色 primary，取消使用 secondary。表单字段使用 Input fullWidth 撑满内容区。

示例见 `examples.tsx#DialogExample`；无独立 Figma 绑定。

<!-- locale:en -->
# Dialog — Usage

A centered Base UI modal for short forms, editing and general information. Use `AlertDialog` for important or irreversible confirmations and `Drawer` for lengthy mobile details, filters and child views.

## Contract and ownership

Import `Dialog` from `@yami/design-system`. The existing controlled `open`, visible `title`, close request `onClose`, body `children` and fixed `footer` remain. The visible default close icon requires a localized `closeLabel`. The host owns validation, submission and async state, closing with `open=false`; it may ignore premature close requests during async work.

Close, Escape and outside presses request dismissal. Base UI owns the portal, focus trap, modal isolation, scroll lock and focus restoration; default initial focus goes to Close. The popup is a `div` portalled to body, not a native dialog. `showModal()`, `close()` and `method="dialog"` no longer apply. Custom event targets are HTMLDivElement; data-dialog, data-variant and data-slot hooks remain. Use an explicit form id with Button `htmlType="submit"` and `htmlForm={formId}` when submitting across a portal.

## Composition

DialogTrigger opens DialogContent. DialogTitle and DialogDescription supply the accessible name and description. Put scrolling content in DialogBody and persistent actions in a sibling DialogFooter. Composition is uncontrolled by default and accepts defaultOpen or a controlled open and onOpenChange pair.

DialogContent shows its corner close icon by default. Set showCloseButton to false to hide it. Enable showCloseButton on DialogFooter for a localized close action, or supply a button through DialogClose's render prop. Without the icon, Base UI handles initial focus. Set initialFocus or finalFocus on DialogContent to override the focus targets.

## Compatibility

Legacy `variant="confirmation"` keeps its centered heading, compact spacing and no Close button, focusing the first control. `role="alertdialog"` preserves semantics but still allows outside dismissal. New confirmation flows should use `AlertDialog`.

## Layout

PC and Mobile stay centered with a 400px maximum width, at least 16px side margins and 48px vertical safe clearance. Overflowing body content scrolls between the fixed header and footer. Close occupies its own top row above the heading. In the default layout, leave 12px above the corner close icon, or 20px above the heading when the corner icon is hidden. Side insets are 24px from 1024px and 16px below. The header has 8px of bottom padding. The body has 8px of vertical padding. Footer actions have 16px above them. Bottom padding is 20px on desktop and 16px on mobile, with extra clearance for the safe area. Mobile headings are 20px and desktop headings are 24px. Surface radius remains 12px using YAMI tokens. Confirmation retains 12px side/footer padding and 8px body-bottom spacing. Close fits the 24px YAMI icon with a 4px radius and Button's 44px target. The footer has no divider. Hosts compose Button / ButtonGroup actions; examples use right-aligned md (40px) pills on PC and equal-width md (40px) pills on mobile, primary black for Save and secondary for Cancel. Input fullWidth fills the content area.

See `examples.tsx#DialogExample`. No standalone Figma binding is assigned.
