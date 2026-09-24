# ButtonGroup — 按钮组

## 使用场景

组织作用于同一对象的相关操作，例如取消与保存、继续购物与结算。
按钮组只负责布局和分组语义，按钮外观、加载与禁用行为由 Button 负责。

```tsx
import { Button, ButtonGroup } from '@yami/design-system'

<ButtonGroup aria-label="设置操作">
  <Button variant="secondary" onClick={onCancel}>取消</Button>
  <Button loading={saving} onClick={onSave}>保存设置</Button>
</ButtonGroup>
```

## 两种布局

- 默认：按钮按内容宽度排列，间距 8px；空间不足时换行。
- `full`：按钮等宽，填满容器，整组最大 480px。配合 Button 的 `form="full"` 使用。

```tsx
<ButtonGroup full aria-label="购物车操作">
  <Button form="full" size="lg" variant="secondary">继续购物</Button>
  <Button form="full" size="lg" variant="emphasis">前往结算</Button>
</ButtonGroup>
```

## 内容与边界

推荐每组 2–3 个直接子 Button，使用相同尺寸。默认布局允许换行；等宽布局保持单行，长文案沿用 Button 的省略规则。保持操作名称简短；操作过多时拆分任务，避免压缩到无法理解。不要放置额外包装元素或嵌套按钮组。

`full` 不修改 Button 的形态或尺寸。移动端 LG 文字按钮高 48px，桌面端从 1024px 起为 56px；MD 高 40px。

## 交互与无障碍

必须通过 `aria-label` 命名整组操作。使用 Tab 按 DOM 顺序逐个聚焦，Enter / 空格触发 Button；按钮组不增加焦点，也不接管方向键。

加载和禁用由业务状态控制：保存时在保存按钮上设置 `loading`，在相关取消按钮上设置 `disabled`，防止操作冲突。ButtonGroup 不自动禁用其他按钮，不执行保存或结算。

每个业务区域只保留一个主要操作；红色强调层级用于购买或结算。互斥选项使用 RadioGroup，内容切换使用 Tabs。
