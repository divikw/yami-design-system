<!-- locale:zh -->
# Select — 使用说明

YAMI 单选选择器。组合 SelectTrigger、SelectValue、SelectContent 和 SelectItem，支持键盘导航、禁用项和原生表单。

仅覆盖字符串单选。将 items 放在根组件，并渲染同一组 SelectItem，确保关闭时也能显示标签和支持键盘检索。通过 SelectLabel 或 Trigger 的 aria-label 命名。支持方向键、Enter、Escape 与 Tab；非受控表单重置回到 defaultValue。SelectContent 自动定位、滚动和避让；窄视口内约束宽度。Trigger、Content、Item 的 className 是完整样式覆盖入口，QuantitySelect 用它保留原有紧凑外观；普通使用无需传入。数量上限、10+ 输入等业务规则不属于通用 Select。

默认触发器最小高度 40px，选项行最小高度 32px；长内容可自然增高，PC 与 Mobile 一致。下拉面板圆角为 12px，选项圆角为 8px。

默认菜单贴近触发器边缘。传入 `alignItemWithTrigger` 可让选中项与触发器重合。使用 `SelectGroup`、`SelectGroupLabel` 和 `SelectSeparator` 组织分组；`SelectLabel` 为触发器命名。在触发器上设置 `aria-invalid` 和 `aria-describedby` 可显示错误描边并关联错误提示。

实现基于 Base UI 1.9.0，状态与事件详情遵循该版本契约。

<!-- locale:en -->
# Select — Usage

YAMI single-value select. Compose SelectTrigger, SelectValue, SelectContent and SelectItem for keyboard navigation, disabled options and native forms.

Supports string single-selection. Supply items on the root and render matching SelectItem children so labels and typeahead work before opening. Name it with SelectLabel or aria-label on the trigger. Supports arrows, Enter, Escape and Tab; uncontrolled forms reset to defaultValue. Content positions, scrolls and avoids viewport edges. Trigger, Content and Item className replace default part styles, allowing QuantitySelect to retain its compact appearance. Quantity limits and custom 10+ entry remain business concerns.

The default trigger has a 40px minimum height and options a 32px minimum height on both desktop and mobile; longer content can grow naturally. The popup has a 12px corner radius and each option has an 8px radius.

By default the menu opens at the trigger edge. Set `alignItemWithTrigger` to position the selected item over the trigger. Use `SelectGroup`, `SelectGroupLabel`, and `SelectSeparator` for named groups. `SelectLabel` labels the trigger. Set `aria-invalid` and `aria-describedby` on the trigger to show an error border and associate its error message.

Built on Base UI 1.9.0; state and change details follow that version’s contract.
