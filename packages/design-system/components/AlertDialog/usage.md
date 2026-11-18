<!-- locale:zh -->
# AlertDialog — 使用说明

重要更改和不可撤销操作的确认弹窗。使用 Base UI Alert Dialog 管理模态、焦点、滚动锁定与关闭行为，YAMI 提供居中表面、文字和按钮样式。长任务、筛选和复杂表单优先使用 Dialog / Drawer；不要把普通提示都做成阻断弹窗。此组件尚无独立核验的 Figma 绑定，状态为 experimental。

## 用法

```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button } from "@yami/design-system";

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="secondary" />}>删除地址</AlertDialogTrigger>
  <AlertDialogContent lang="zh">
    <AlertDialogHeader>
      <AlertDialogTitle>删除这个地址？</AlertDialogTitle>
      <AlertDialogDescription>删除后无法恢复，你需要重新添加这个配送地址。</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction variant="emphasis">删除</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## API 和状态

- AlertDialog：沿用 Base UI Root；`defaultOpen` 默认 false，也可使用 `open` / `onOpenChange` 受控。提供 `onOpenChangeComplete`。
- Trigger：沿用 Base UI Trigger，使用 `render={<Button />}` 组合 YAMI 按钮；支持 disabled。
- Content：包装 Portal、Backdrop、Viewport 和 Popup。支持 `initialFocus`、`finalFocus`、`container`、`keepMounted`、`lang`、`className`、`style` 和 Popup 其他属性。
- Title / Description：关联无障碍名称和说明。Header / Footer 是布局容器。
- Cancel / Action：Base UI Close 与 YAMI Button 组合，默认 secondary / primary，默认 size="md"（40px），点击热区与按钮边界一致。支持 disabled、onClick、ref、render 和按钮 variant/size。自定义 render 时调用方负责其视觉样式。
- 确认操作默认同步关闭。真实删除、请求、加载/失败文案由宿主实现；异步操作使用受控 open，在 onOpenChange 中调用事件详情的 cancel() 阻止过早关闭，成功后更新 open。不要把异步请求简单放进自动关闭的 Action 后声称已处理成功。

## 布局与无障碍

PC 和 Mobile 都居中，侧边至少保留 16px。1024px 起 PC 最大宽度 480px，标题左对齐、24px 字号，描述 16px，四周留白 24px；不显示右上角关闭按钮，底部操作区四边内边距 24px、操作靠右，使用 ButtonGroup，灰底取消与黑色确认按钮均为胶囊形。Mobile 最大宽度仍为 400px，标题居中、双列等宽、40px 高的全圆角按钮，不显示右上角关闭按钮。长标题/说明在 Header 内滚动，Footer 始终可操作。颜色、圆角和字体消费 YAMI token，深色主题自动跟随；Portal 内容显式传入 lang。

点击外部不会关闭。Escape、取消和确认可关闭；Tab 焦点限制在弹窗内，关闭后恢复触发器。把 Cancel 放在第一个可聚焦位置，避免默认聚焦危险操作。Base UI 触摸打开默认聚焦 Popup，可用 initialFocus 显式覆盖。确认不可用时禁用 Action；不可撤销操作使用一个 emphasis 按钮，普通确认保持 primary。

<!-- locale:en -->
# AlertDialog — Usage

A modal confirmation for important or irreversible changes. Base UI owns modal behavior, focus, scroll locking and dismissal; YAMI owns the centered surface, typography and buttons. Prefer Dialog / Drawer for longer tasks, filters and complex forms. Experimental, with no independently verified Figma binding.

## Composition

Compose AlertDialog → Trigger and Content. Content contains Header (Title, Description) and Footer (Cancel, Action). Use `render={<Button />}` on Trigger, and place Cancel before Action. All parts are exported from `@yami/design-system`.

## API and state

Root supports Base UI props including `open`, `defaultOpen` (false), `onOpenChange` and `onOpenChangeComplete`. Content includes Portal / Backdrop / Viewport / Popup and exposes `container`, `keepMounted`, `initialFocus`, `finalFocus`, `lang`, `className`, `style` and Popup props. Title and Description provide the accessible name and description.

Cancel and Action compose Base UI Close with YAMI Button. They default to secondary / primary, with size md (40px) by default and no extra hit-area extension, and support disabled, onClick, ref, render, variant and size. Custom render elements own their visual styles. Action closes synchronously. Hosts own actual requests, progress and errors; for asynchronous confirmation control open and cancel premature close requests via the event details cancel() method, then close after success.

## Layout and accessibility

Both PC and Mobile stay centered with at least 16px side margins. From 1024px, PC uses a 480px maximum width, left-aligned 24px title, 16px description, 24px outer padding, no corner close control, and 24px footer padding and a right-aligned ButtonGroup with pill-shaped secondary Cancel and primary confirmation buttons. Mobile retains the 400px maximum width, centered title and equal-width 40px pill actions without the corner close control. Long messages scroll in Header; Footer remains accessible. Semantic tokens support light/dark themes. Declare lang on portal content.

Outside presses never dismiss. Escape and explicit actions close and restore trigger focus. Tab stays within the modal. Put Cancel first to avoid focusing a destructive action by default; touch opening follows Base UI's Popup-focus behavior. Override initialFocus only when needed. Disable unavailable actions. Use one emphasis action for irreversible changes; ordinary confirmation uses primary.
