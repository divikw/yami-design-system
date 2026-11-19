<!-- locale:zh -->
# Field — 使用说明

每个 Field 管理一个兼容的表单控件。用 `FieldLabel` 标识控件，用 `placeholder` 显示空白时的填写提示。需要持续可见的说明用 `FieldDescription`，校验错误用控件下方的 `FieldError`。Base UI 自动关联标签和反馈。

```tsx
import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";

<Field name="notes" validationMode="onBlur">
  <FieldLabel>配送备注（必填）</FieldLabel>
  <Textarea required maxLength={120} placeholder="填写送达说明，最多 120 字。" />
  <FieldError match="valueMissing">请输入配送备注。</FieldError>
</Field>;
```

- 将标签及说明放在各自的 Field 中，FieldContent 可将两者排在控件旁。选项卡片可在 FieldLabel 内组合 Checkbox 和 FieldTitle。用 FieldSeparator 分隔不同的字段组。
- Field 的 `orientation="responsive"` 在 FieldGroup 达到 24rem 时将标签与控件并排。FieldError 的 `errors` 接受带 message 的对象数组并去重，提供 `children` 可替换错误文案。
- 用 FieldSet 和 FieldLegend 为相关字段分组。FieldGroup 默认堆叠，layout="responsive" 按容器宽度分列。复选框可以使用 Field 的 orientation="horizontal" 将控件与标签并排。
- `name` 优先于控件的名称。将 `disabled` 设在 Field 上可禁用关联控件。设置必填时，将 `required` 传给控件，并在标签中提供可见说明。
- `validate` 可返回自定义错误文案。`validationMode` 支持 `onBlur`、`onChange` 和 `onSubmit`。使用 Base UI Form 可将自定义提交校验与整个表单协调。
- 接收外部错误时，在 Field 上设置 `invalid`，并用 `FieldError match={true}` 展示当前错误文案。

<!-- locale:en -->
# Field — Usage

Use one Field per compatible form control. Give the control a FieldLabel and put entry hints in its placeholder. Use FieldDescription for persistent guidance and show validation errors below the control with FieldError. Base UI associates the label and feedback automatically.

```tsx
import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";

<Field name="notes" validationMode="onBlur">
  <FieldLabel>Delivery notes (required)</FieldLabel>
  <Textarea required maxLength={120} placeholder="Add any drop-off instructions, up to 120 characters." />
  <FieldError match="valueMissing">Enter your delivery notes.</FieldError>
</Field>;
```

- Keep the label and description inside their Field. FieldContent groups supporting text beside a control. For a choice card, put Checkbox and FieldTitle inside FieldLabel. Use FieldSeparator between sections.
- Field’s `orientation="responsive"` places the label beside the control in FieldGroup containers at least 24rem wide. FieldError accepts external `errors` as message objects and deduplicates them. Children override the generated text.
- Group related fields with FieldSet and FieldLegend. FieldGroup stacks fields by default. Use layout="responsive" for fluid columns or orientation="horizontal" on Field to place a checkbox beside its label.
- Field's `name` takes precedence over the control name. Set `disabled` on Field to disable the associated control. Pass `required` to the control and indicate it in the visible label.
- `validate` can return custom error messages. Set `validationMode` to `onBlur`, `onChange` or `onSubmit`. Use Base UI Form to coordinate custom submission validation across fields.
- For an external error, set `invalid` on Field and use `FieldError match={true}` to show the current message.
