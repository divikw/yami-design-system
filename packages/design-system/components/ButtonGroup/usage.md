<!-- locale:zh -->

# ButtonGroup — 按钮组

## 使用场景

组织作用于同一对象的相关操作，例如取消与保存、继续购物与结算。
按钮组只负责布局和分组语义，Button 和 ButtonLink 负责外观及各自的交互行为。

```tsx
import { Button, ButtonLink, ButtonGroup } from '@yami/design-system'

<ButtonGroup aria-label="设置操作">
  <Button variant="secondary" onClick={onCancel}>取消</Button>
  <Button loading={saving} onClick={onSave}>保存设置</Button>
</ButtonGroup>
```

## 两种布局

- 默认：按钮按内容宽度排列，间距 8px；空间不足时换行。
- `full`：按钮等宽，填满容器，整组最大 480px。配合 Button / ButtonLink 的 `form="full"` 使用。

```tsx
<ButtonGroup full aria-label="购物车操作">
  <Button form="full" size="lg" variant="secondary" onClick={closeSheet}>继续购物</Button>
  <Button form="full" size="lg" variant="emphasis" onClick={checkout}>前往结算</Button>
</ButtonGroup>
```

## 内容与边界

推荐每组 2–3 个直接子 Button 或 ButtonLink，使用相同尺寸。默认布局允许换行；等宽布局保持单行，长文案沿用按钮标签的省略规则。保持操作名称简短；操作过多时拆分任务，避免压缩到无法理解。不要放置额外包装元素或嵌套按钮组。

先判断行为：保存、取消、生成收据等操作使用 Button；跳转详情页或购物页使用带真实 `href` 的链接。“继续购物”在上例中表示关闭当前购物面板；如果实际行为是页面跳转，应改用链接。需要统一按钮外观时，使用原生链接组件 ButtonLink；可与 Button 一起放入 ButtonGroup，保持相同尺寸。普通文字链接与按钮并列时使用普通布局容器。不要为统一外观而改变业务含义。

```tsx
<ButtonGroup aria-label="订单操作">
  <ButtonLink href="/orders/Y20261011-1234">查看订单</ButtonLink>
  <Button variant="secondary" onClick={generateAndDownloadReceipt}>下载收据</Button>
</ButtonGroup>
```

`full` 不修改 Button / ButtonLink 的形态或尺寸。移动端 LG 文字按钮高 48px，桌面端从 1024px 起为 56px；MD 高 40px。

## 交互与无障碍

必须通过 `aria-label` 命名整组操作。使用 Tab 按 DOM 顺序逐个聚焦，Enter / 空格触发 Button，Enter 激活 ButtonLink（保留链接的原生行为）；按钮组不增加焦点，也不接管方向键。

加载和禁用由业务状态控制：保存时在保存按钮上设置 `loading`，在相关取消按钮上设置 `disabled`，防止操作冲突。ButtonGroup 不自动禁用其他按钮，不执行保存或结算。ButtonLink 没有 loading / disabled API。使用 `role="status"` 提供进度和完成反馈，参见 Card 的收据示例。

每个业务区域只保留一个主要操作；红色强调层级用于购买或结算。互斥选项使用 RadioGroup，内容切换使用 Tabs。

## 容器与焦点边界

Card 不裁切按钮组的焦点框和扩展点击区域。SM / MD 点击区域高至少 44px，但不额外占据布局空间；特别是 SM 换行时，应检查相邻行的扩展区域是否重叠，必要时增加行间距或改用更大尺寸。媒体裁切只放在独立媒体区域，不包住整组交互入口。

<!-- locale:en -->

# ButtonGroup — Usage

## When to use

Group related entries acting on the same object, such as Cancel and Save, or Continue shopping and Checkout. ButtonGroup owns layout and grouping semantics; Button and ButtonLink own appearance and interaction.

```tsx
import { Button, ButtonLink, ButtonGroup } from '@yami/design-system'

<ButtonGroup aria-label="Settings actions">
  <Button variant="secondary" onClick={onCancel}>Cancel</Button>
  <Button loading={saving} onClick={onSave}>Save settings</Button>
</ButtonGroup>
```

## Two layouts

- Default: content-width entries, an 8px gap, and wrapping when space runs out.
- `full`: equal-width entries in one row, filling the container up to 480px. Set `form="full"` on each Button / ButtonLink.

```tsx
<ButtonGroup full aria-label="Cart actions">
  <Button form="full" size="lg" variant="secondary" onClick={closeSheet}>Continue shopping</Button>
  <Button form="full" size="lg" variant="emphasis" onClick={checkout}>Checkout</Button>
</ButtonGroup>
```

## Content and boundaries

Prefer two or three direct Button / ButtonLink children with matching sizes. Default layout wraps; equal-width layout stays on one line and truncates long labels. Keep names short, split tasks when there are too many actions, and avoid extra wrappers or nested groups.

Choose by behavior: saving, cancelling, and generating a receipt use Button; navigation uses a real href. Continue shopping above closes the sheet; if it navigates, use ButtonLink. ButtonLink provides button appearance while retaining native link semantics and can share ButtonGroup with Button. Use a normal layout container when mixing plain text links with buttons. Preserve business labels and behavior when changing appearance.

```tsx
<ButtonGroup aria-label="Order actions">
  <ButtonLink href="/orders/Y20261011-1234">View order</ButtonLink>
  <Button variant="secondary" onClick={generateAndDownloadReceipt}>Download receipt</Button>
</ButtonGroup>
```

`full` does not change Button / ButtonLink form or size. LG text entries are 48px on mobile and 56px from 1024px; MD is 40px.

## Interaction and accessibility

Provide an `aria-label` naming the group. Tab follows DOM order; Button activates with Enter or Space, while ButtonLink keeps native Enter activation. The group itself does not receive focus or implement arrow-key navigation.

Business state controls loading and availability. For saving, apply `loading` to Save and, when necessary, `disabled` to a conflicting Cancel action. ButtonGroup does not disable other entries or perform the action itself. ButtonLink has no loading or disabled API. Use a `role="status"` message for progress and completion feedback, as shown in the Card receipt demo.

Keep one primary entry per business region; red emphasis is reserved for purchase or checkout. Use RadioGroup for exclusive selection and Tabs for content switching.

## Container and focus boundaries

Card does not clip the group's focus outlines or extended hit areas. SM / MD targets extend to at least 44px high without reserving extra layout space. Check adjacent rows for overlapping targets, especially wrapped SM entries; add row spacing or use a larger size when necessary. Crop media within its own region, without wrapping the action group in a clipping container.
