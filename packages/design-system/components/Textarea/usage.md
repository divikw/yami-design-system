<!-- locale:zh -->
# Textarea — 使用说明

用于订单备注等多行文本。提供可见的原生 `label`，或与 `Field`、`FieldLabel` 组合。

```tsx
import { Textarea } from "@yami/design-system";

<label htmlFor="notes">订单备注</label>
<Textarea id="notes" name="notes" rows={3} maxLength={120} placeholder="填写订单备注" />;
```

- 组合结构为原生 `<textarea>`。保留换行、表单提交、原生事件和 `HTMLTextAreaElement` ref。
- 省略 `rows` 时支持的浏览器会随内容自动增高，其他浏览器回退到 3 行。显式设置行数时使用原生尺寸。控件填满容器宽度，支持竖向拖拽调整高度。
- 左右内边距均为 12px。聚焦时描边从 1px 加粗到 2px，文字位置保持稳定。通过 Tab 或 Shift+Tab 进入时，额外显示蓝色焦点框。
- 非受控用 `defaultValue`，受控用 `value` 和 `onChange`。
- `disabled` 禁止编辑且不提交值。只读用 `readOnly`，允许聚焦和复制。
- 与 Field 组合时，标签、说明和校验状态自动关联。单独使用时可用 `aria-invalid` 标记错误，并用 `aria-describedby` 连接错误文案。

<!-- locale:en -->
# Textarea — Usage

Use for multiline text such as order notes. Provide a visible native label or compose with Field and FieldLabel.

```tsx
import { Textarea } from "@yami/design-system";

<label htmlFor="notes">Order notes</label>
<Textarea id="notes" name="notes" rows={3} maxLength={120} placeholder="Add a note for your order" />;
```

- Renders a native `<textarea>` with multiline editing, native events, form submission and an `HTMLTextAreaElement` ref.
- Omit `rows` to grow with content in supporting browsers, with a three-row fallback. Explicit rows use native sizing. The control fills its container and resizes vertically.
- Horizontal padding is 12px on both sides. On focus, the border thickens from 1px to 2px while the text stays in place. Tab and Shift+Tab navigation also show the blue focus ring.
- Use `defaultValue` for an uncontrolled value or `value` with `onChange` for a controlled value.
- A disabled control is excluded from submission. A read-only control remains focusable and allows copying.
- Field automatically associates labels, descriptions and validation state. For standalone validation, use `aria-invalid` and link the error message with `aria-describedby`.
