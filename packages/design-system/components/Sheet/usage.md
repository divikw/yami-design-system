<!-- locale:zh -->
# Sheet — 使用说明

统一的模态容器：移动端底部弹窗，桌面端右侧面板。商品详情说明、搜索全部筛选、快捷筛选共用此组件。

## 基本使用

从 `@yami/design-system` 导入 `Sheet`。传入 `open`、`title`、本地化的 `closeLabel` 和 `onClose`；在 `onClose` 中将 `open` 设为 `false`。正文通过 `children` 传入，固定底部操作通过 `footer` 传入。组件不管理业务数据或应用/取消逻辑。

- `size="content"`：移动端至少占动态可见视口的一半，内容可增长到顶部安全区域下方；顶部至少保留 48px，超出后正文内部滚动。
- `size="full"`：移动端填满同一高度上限，顶部保留 48px 或更大的安全区。适用于商品规格、配料、营养成分表和免责声明。
- `contentPadding="compact"`：正文四周使用 8px 内边距，适合内部行也保留 8px 的紧凑列表。
- `contentPadding="none"`：正文由列表自行提供内边距；默认正文有 16px 水平内边距。
- `description`：可选标题说明，位于固定头部内、标题下方及分隔线上方，通过 `aria-describedby` 与弹层关联。正文滚动时说明保持可见；省略时沿用原来的头部。Drawer 也支持此属性。移动端优惠券用此能力，桌面优惠券保持原布局。
- 桌面端默认贴右满高，宽 480px，四角为直角。PDP 由业务适配层在进入桌面断点时关闭弹窗，恢复页内说明。
- `desktopPlacement="right"` 为默认值，与公共 Drawer 共用侧边布局。显式 `center` 保留兼容旧调用；新的居中任务使用 Dialog。移动端形态保持一致。

## 圆角与断点

| 视口宽度 | 左上、右上 | 左下、右下 | 令牌 |
|---|---|---|---|
| 小于 1024px：底部弹层 | 16px | 0 | `--radius-surface-sheet`，引用原子令牌 `radius.xl` |
| 从 1024px：默认右侧面板 | 0 | 0 | 贴边面板使用直角 |
| 从 1024px：显式 center | 12px | 12px | `--radius-surface-default` |

此规则同时适用于 `size="content"`、`size="full"` 和子页面，在浅色、深色主题下保持一致。底部弹层贴合屏幕底边，因此底部两角保持直角。组件直接使用语义令牌，不在业务页面手写 16px，也不通过 Card 设置圆角。基础 Card 与居中 Dialog 继续使用 12px 的默认表面圆角。

标题与描述通过容器的 `gap: 4px` 控制间距，底部留白由 Header 的 padding 控制：Mobile 为 12px，PC 有描述时为 16px、无描述时为 12px；内层标题容器与文字元素不设置底部 padding。

## 子弹窗

子弹窗是同一个 Sheet 的子页面，不新增遮罩。更新 `title` 和正文并传入 `back={{ label, onClick }}`，关闭按钮会替换为返回按钮。进入子页面时聚焦返回按钮并将正文滚动到顶部；返回按钮与 Escape 都回到父页面，点击遮罩关闭整个弹层。

筛选草稿、返回后的入口焦点和父页面滚动位置由业务页面维护；保持父页面内容挂载但隐藏，可以保留其控件状态。搜索全部筛选已提供这套接入示例。

## 交互与边界

Base UI Dialog 管理背景隔离、Tab 循环、Escape、遮罩关闭、焦点归还与滚动锁定；YAMI 管理独立正文滚动与安全区。弹层通过 Portal 挂到 body，根节点变为 div；原生 `showModal()`、`close()` 与 `method="dialog"` 不再适用。事件目标类型为 HTMLDivElement；查询使用角色或 `data-sheet`。标题和按钮使用 YAMI tokens；关闭/返回按钮的可见尺寸为 32 × 32px；关闭图标为 24 × 24px，Mobile 按钮边界距顶部和右侧 8px（图标边界 12px），PC 保持 16px（图标边界 20px），返回箭头保持 20 × 20px 和左侧位置，并由 Button 的透明扩展层保留 44 × 44px 点击热区。

主题由语义 tokens 继承，不传 `dark`。传入实际内容语言的 `lang` 或放在有 `lang` 的父节点内。搜索快捷筛选在桌面仍用锚点 Popover，在移动端使用 Sheet。图片预览使用独立组件，并遵循相同关闭按钮尺寸。

Standalone Figma mapping is not assigned; do not publish a placeholder Code Connect node.


<!-- locale:en -->
# Sheet — Usage

A responsive Base UI modal for product details, filters and child views: bottom-aligned on mobile and right-aligned on desktop. Use Dialog for centered short tasks and AlertDialog for critical confirmations. Drawer reuses the same edge-panel layout.

## Controlled interface

Import Sheet from `@yami/design-system`. Required props are `open`, `title`, localized `closeLabel` and `onClose`. The host completes dismissal by setting `open=false`; it owns business state, drafts and submission. Close, Escape and outside presses request dismissal. The `children` scroll independently; the optional `footer` stays fixed and owns its button layout and padding.

`description` is fixed below the title and linked through aria-describedby. An additional aria-describedby is preserved. Omit description to retain the compact header.

## Layout

Below 1024px, `size="content"` starts at 50dvh and grows to the viewport minus the top safe area (at least 48px). `size="full"` fills that maximum. Top corners are 16px; bottom corners are square. Desktop defaults to a 480px full-height right-edge panel with square corners. Explicit `desktopPlacement="center"` retains the previous centered 560px layout for existing callers; use Dialog for new centered tasks. All geometry follows existing YAMI tokens.

Default content has 16px horizontal insets; `contentPadding="compact"` uses 8px and `none` lets content own padding. The close/back control is 32px with Button's 44px hit area; Close has a 24px icon and Back a 20px icon. Close button boundaries are 8px from the top/right edges on mobile (12px for the icon), and 16px on desktop (20px for the icon). Title and description spacing uses a 4px container gap; bottom padding belongs to Header: 12px on mobile; 16px with a description or 12px without one on desktop. The inner heading container has no bottom padding.

## Child views

Pass `back={{ label, onClick }}` to replace Close with Back. The same sheet and backdrop remain mounted. Entering the child view focuses Back and resets body scroll. Back and Escape return to the parent; outside presses close the whole sheet. The host preserves selection, restores the parent's entry focus and manages parent scroll position.

## Accessibility and migration

Base UI Dialog manages modal isolation, Tab confinement, Escape, outside dismissal, scroll locking and focus restoration. A controlled host can ignore a premature close request. The popup is a div portalled to body, so native showModal/close/method=dialog no longer apply; event targets are HTMLDivElement. Query by role or data-sheet, and use explicit form IDs for forms submitted from the footer. Drawer inherits this behavior. Nested Base UI controls dismiss before their parent sheet.

Theme comes from global semantic tokens; pass the actual content language through lang. Examples are in examples.tsx; no independent Figma binding is assigned.
