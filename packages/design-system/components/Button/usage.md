<!-- locale:zh -->

# Button — 使用说明

## 使用场景

使用 Button 执行操作：提交表单、加入购物车、保存设置、生成并下载收据，或打开 / 关闭弹窗。筛选使用 FilterChip，选择使用 Checkbox / RadioGroup。先判断行为，再选择外观。

## 不适用场景

- **页面导航**：需要按钮外观时使用 `ButtonLink href="…"`，文字导航使用普通 `<a href="…">`。Button 只渲染原生 `button`，没有 `href`、`as` 或 `asChild` API，不用点击回调重定向模拟链接。
- **已有文件的直接下载**：使用 `<a href="…" download>` 或 `ButtonLink href="…" download`；需要先生成文件时使用 Button。
- **句子内的文字链接**：使用普通链接，例如“已有账号？登录”。
- **选择状态**：独立或多项选择使用 Checkbox，互斥选择使用 RadioGroup。Button 不自动提供选中语义。

## 按钮外观的导航：ButtonLink

ButtonLink 渲染原生 `a`，共享 Button 的尺寸、层级、圆角和焦点样式。它保留链接行为：Enter 激活，支持修饰键点击、浏览器“在新标签页中打开”和复制链接地址。

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `href` | `string` | 必填 | 真实导航或文件地址 |
| `variant` | `emphasis / primary / secondary / tertiary` | `primary` | 与 Button 相同的视觉层级 |
| `size` | `sm / md / lg` | `md` | 与 Button 相同的响应式尺寸 |
| `form` | `inline / full` | `inline` | 内容宽度或填满父容器；不支持 icon 形态 |
| `inverse` | `boolean` | `false` | 使用相反明暗表面的令牌 |
| `leftIcon / rightIcon` | `ReactNode` | — | 标签前后的图标 |
| 原生链接属性 | `target / rel / download / ref` 等 | — | 透传给原生 `a`；ref 指向 `HTMLAnchorElement` |

```tsx
import { Button, ButtonLink, ButtonGroup } from '@yami/design-system'

<ButtonGroup aria-label="订单操作">
  <ButtonLink href="/orders/Y20261011-1234">查看订单</ButtonLink>
  <Button variant="secondary" onClick={generateAndDownloadReceipt}>下载收据</Button>
</ButtonGroup>
```

ButtonLink 没有 `loading` 或 `disabled` API。导航不可用时显示静态说明。普通文字链接仍使用 `a`；不要在业务页面导入私有 CSS 或复制 Button 样式。

## 相关操作与混合入口

两个或三个相关 Button / ButtonLink 优先使用 ButtonGroup，提供 `aria-label`，并保持相同尺寸。默认间距为 8px，空间不足时换行；`full` 等宽布局最大 480px，子项都使用 `form="full"`。

视觉层级取决于任务优先级；卡片不必总有黑色主按钮或红色强调按钮。链接与操作按钮可以保持统一外观，也可按场景采用不同外观。普通文字链接与按钮并列时使用普通布局容器。修复视觉时保留原有名称、目标地址和行为，不能把“查看订单”替换为“打印订单”。参见 [Card 示例](../Card/usage.md)。

## 视觉层级

| variant | 背景 / 文字 | 使用场景 |
|---|---|---|
| `emphasis` | 操作红色 / 白色 | 购买、加入购物车、提交订单等每屏唯一的最高优先级操作 |
| `primary` | 黑色 / 反色文字 | 通用主操作、提交表单 |
| `secondary` | 灰色 / 主要文字 | 与主操作配对的次要入口 |
| `tertiary` | 透明 / 主要文字 | 低强调的轻量操作 |

每个实际页面最多一个 `emphasis` 入口，ButtonLink 也计入限制。形态由 `form` 决定，不由视觉层级决定。Tertiary 默认无填充和描边，悬浮 / 按下添加背景反馈，键盘聚焦保留焦点框。

## 尺寸

| size | 移动端 | 桌面端（≥1024px） | 使用场景 |
|---|---|---|---|
| `sm` | 32px | 32px | 紧凑操作；文字形态为产品扩展 |
| `md` | 40px | 40px | 默认尺寸 |
| `lg` | 48px | 文字 56px；图标 48px | 主要行动入口、页面底部操作 |

SM / MD 标签为 14px，LG 标签在移动端为 16px、桌面端为 18px，行高均为 20px；1440px 不再次改变字号。ButtonLink 沿用文字按钮尺寸。

SM / MD 文字按钮最小宽度为 44px，通过伪元素将纵向点击区域扩展至 44px；图标按钮扩展到 44×44px。扩展区域不占布局空间，需避免祖先裁切或相邻目标重叠。需要可见的 48px 移动端按钮时使用 LG。Web 扩展区域与原生 iOS / Android 的平台要求分别处理。

## 形态

| form | 布局与圆角 | 使用场景 |
|---|---|---|
| `inline` | 内容宽度，胶囊圆角 | 默认形态 |
| `full` | 填满父容器，8px 圆角 | 结算、弹窗底部等操作区 |
| `icon` | 正方形，仅图标 | 仅 Button 支持，必须提供 `aria-label` |

```tsx
<Button form="full" variant="emphasis">前往结算</Button>
<Button form="icon" variant="secondary" aria-label="收藏"><HeartIcon /></Button>
```

常规操作区可使用 `width: 100%`、`max-width: 480px` 的容器；Button / ButtonLink 自身不限制最大宽度。`fullWidth` 和 `iconOnly` 是兼容旧代码的废弃属性，新代码使用 `form`。

## 反色与图标

`inverse` 表示当前主题内相反明暗的表面，用于 `--surface-inverse`；它与深色主题独立。背景、文字和焦点框分别使用对应反色令牌。所有层级均支持反色。

图标优先使用 `assets/icons/` 中继承 `currentColor` 的 SVG，通过 `leftIcon` / `rightIcon` 添加。图标专用形态必须命名，缺少 `aria-label` 时开发环境会警告。产品界面不使用 emoji 代替图标。

## 加载状态

设置 `loading` 后，按钮显示居中的加载图标，提供 `aria-busy="true"` 和不可激活状态，仍保留焦点与可访问名称。`loadingDelay={150}` 只延迟加载图标出现，忙碌状态及点击拦截立即生效；默认延迟为 0。

```tsx
const [saving, setSaving] = useState(false)
const savingRef = useRef(false)

<Button loading={saving} loadingDelay={150} onClick={async () => {
  if (savingRef.current) return
  savingRef.current = true
  setSaving(true)
  try {
    await save()
  } finally {
    savingRef.current = false
    setSaving(false)
  }
}}>保存设置</Button>
<p role="status">{saving ? '正在保存…' : message}</p>
```

同步 ref 防止状态重新渲染前重复发起请求。Button 不会自动等待回调或管理请求，业务层负责成功 / 失败反馈。加载时无需再同时设置 `disabled`。减少动态效果偏好下，加载图标旋转变慢。

Card 的收据示例演示生成中与完成反馈，并拦截重复激活；它不下载文件，真实业务应连接生成与下载逻辑。

### 长文案与容器边界

文字按钮超出可用宽度时省略，图标保持尺寸，完整文字保留在可访问名称中。优先使用简短名称，必要时提供 `title` 或提示。弹性 / 网格布局可能需要 `min-width: 0`。

Card 不裁切子项焦点框和扩展点击区域；贴边图片由媒体区域单独裁切。其他祖先若设置 `overflow: hidden` 或滚动裁切，仍需检查按钮的 2px 焦点框、2px 偏移和至少 44px 点击区域。

## 禁用状态

禁用使用语义背景和文字颜色，不能用透明度表现。Button 通过 `aria-disabled` 保持键盘可聚焦，并拦截点击；ButtonLink 不支持禁用操作。

```tsx
<Button disabled={!canSubmit}>提交</Button>
```

## 常见组合

### 结算操作区

```tsx
<ButtonGroup full aria-label="购物车操作">
  <Button variant="secondary" size="lg" form="full" onClick={closeSheet}>继续购物</Button>
  <Button variant="emphasis" size="lg" form="full" onClick={placeOrder}>提交订单</Button>
</ButtonGroup>
```

此处“继续购物”表示关闭购物面板。实际为导航时使用 ButtonLink，保留真实 `href`。

### 表单与外部表单提交

```tsx
<ButtonGroup aria-label="个人资料操作">
  <Button variant="secondary" onClick={closeDialog}>取消</Button>
  <Button htmlType="submit">保存</Button>
</ButtonGroup>

<form id="profile-form">...</form>
<Button htmlType="submit" htmlForm="profile-form">保存资料</Button>
```

`htmlType` 默认 `button`，提交或重置需显式设置。由于 `form` 用于形态，关联外部原生表单使用 `htmlForm`，它透传为 HTML 的 `form` 属性。

## 避免的用法

- 不在使用处填写任意圆角数值，使用已有形态和语义令牌。
- 不在同屏堆叠多个红色强调入口。
- 不用 emoji 代替 SVG 图标。
- 不嵌套交互元素：Button / ButtonLink 内不能再放按钮或链接。
- 不让 Card 或其他容器裁掉焦点框和扩展点击区域。

## 相关内容

- 设计规则：`../../DESIGN.md`（emphasis-limit、tap-target、no-opacity-disabled、focus-style、no-custom-radii、no-emoji）。
- 属性、令牌与公开导出：`meta.json`；按钮组用法：`../ButtonGroup/usage.md`。
- 规范图标：`../../assets/icons/icons.meta.json`。

<!-- locale:en -->

# Button — Usage

## When to use

Use `<Button>` to perform an action: submit a form, add to cart, save, download generated data, or open/close a dialog. Use FilterChip for filters, and Checkbox / RadioGroup for selection. Choose the element by its behavior before choosing its appearance.

## When NOT to use

- **Navigation** → use `ButtonLink href="…"` for button appearance, or a semantic `<a href="…">` for text navigation. Button currently renders only `<button>`; it has no `href`, `as`, or `asChild` API. Do not simulate navigation with an `onClick` redirect. A direct file download also uses `<a href="…" download>`; use Button when an action first generates the download.
- **Text navigation, including links inside a sentence** → use a semantic `<a>` with the Link text treatment. (`Have an account? <a href="/sign-in">Sign in</a>.`)
- **Boolean selection** → use Checkbox; use RadioGroup for exclusive choices. Button does not automatically convey a selected state.

## Navigation with button appearance

`ButtonLink` renders a native `<a>` and shares Button's styles. It requires `href` and supports `variant`, `size`, `inverse`, `leftIcon`, `rightIcon`, and `form="inline" | "full"`. Defaults are `primary`, `md`, and `inline`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | Required | Real navigation or file destination |
| `variant` | `emphasis / primary / secondary / tertiary` | `primary` | Same hierarchy as Button |
| `size` | `sm / md / lg` | `md` | Same responsive text-button sizes |
| `form` | `inline / full` | `inline` | Content-width or full-width; no icon form |
| `inverse` | `boolean` | `false` | Opposite-polarity surface tokens |
| `leftIcon / rightIcon` | `ReactNode` | — | Icons before or after the label |
| Native anchor props | `target / rel / download / ref`, etc. | — | Forwarded to the anchor; ref points to `HTMLAnchorElement` |

Native anchor props such as `target`, `rel`, `download`, and `ref` are preserved. It keeps link semantics: Enter activates it; modifier-click and the browser's open-in-new-tab menu remain available.

```tsx
import { Button, ButtonLink, ButtonGroup } from '@yami/design-system'

<ButtonGroup aria-label="Order actions">
  <ButtonLink href="/orders/Y20261011-1234">View order</ButtonLink>
  <Button variant="secondary" onClick={generateAndDownloadReceipt}>Download receipt</Button>
</ButtonGroup>
```

ButtonLink has no `loading` or `disabled` API. If a destination is unavailable, render explanatory static content instead. Use a plain anchor for a text link. Do not import private CSS or copy Button styles into individual pages.

## Related actions and mixed navigation

For two or three related Button or ButtonLink entries, prefer `ButtonGroup` with an accessible name and consistent sizes. Its default gap is 8px and it wraps when needed; `full` uses equal widths up to 480px and requires child `form="full"` on Button and ButtonLink. Choose hierarchy from the task's priority; a card does not automatically require a black or red primary button. `form` controls geometry, not emphasis.

Links and buttons may appear together. Keep navigation as a real link and the action as a Button, with deliberate alignment, spacing, and focus order. They do not have to share a filled appearance or equal widths. Use ButtonGroup for Button and ButtonLink children with matching sizes; use a normal layout container when mixing plain text links with buttons. Preserve labels, destinations, and behavior when fixing presentation; do not replace “View order” with “Print order” just to obtain two buttons. See the bilingual [Card example](../Card/usage.md).

## Variants

| Variant | Background | Shape | When to use |
|---|---|---|---|
| `emphasis` | `--button-emphasis` (operational red) + `--text-on-emphasis` (white) | Depends on `form` | Buy Now / Add to Cart / Place Order — the **one** high-priority CTA on the screen |
| `primary` | `--button-primary` (black) | Depends on `form` | Generic primary actions, form submits, non-emphasis CTAs |
| `secondary` | `--button-secondary` (grey) | Depends on `form` | Secondary actions paired with a primary (Cancel / Back / Skip) |
| `tertiary` | `--button-tertiary` (transparent) | Depends on `form` | Low-emphasis actions; lightweight card-level actions |

### ⚠️ `emphasis-limit` rule (design.md)

**Max one emphasis entry per rendered screen, including ButtonLink.** Multiple emphasis buttons compete for attention and destroy the CTA hierarchy. If you need two prominent actions, make the primary action `emphasis` and the secondary action `primary` or `secondary`.

Right:
```tsx
<Button variant="emphasis">Place Order</Button>
<Button variant="secondary" onClick={openOrderSummary}>Review order summary</Button>
```

Wrong — two red emphasis buttons on the same screen:
```tsx
<Button variant="emphasis">Buy Now</Button>
<Button variant="emphasis">Apply Coupon</Button>  {/* ✗ breaks emphasis-limit */}
```

Tertiary is a low-emphasis button with a transparent background and no outline at rest, on both default and inverse surfaces. Hover and press add a subtle theme-aware fill; keyboard focus retains the focus ring. Disabled and loading states retain the shared disabled treatment.

## Sizes

| Size | Mobile | Desktop (≥1024px) | Use when |
|---|---|---|---|
| `sm` | 32px | 32px | Inline table actions, filter chips, compact contexts. **Icon form only** in Figma; YAMI product extends it to text buttons. |
| `md` | 40px | 40px | **Default.** Most buttons in the product |
| `lg` | 48px | **56px** (text) · 48px (icon) | Hero CTAs, mobile primary action at the bottom of the screen, full-width sheet actions. Text-bearing `lg` bumps to 56 at ≥1024px to match PC Figma; icon-only `lg` stays 48×48. |

Text-bearing `lg` uses 16px labels on mobile and 18px labels at ≥1024px
(`--font-size-button-lg-desktop`), including ≥1440px. Line-height stays 20px.
This applies to all four hierarchies and both surfaces. Icon-only `lg` and
`sm`/`md` typography are unchanged.

Web buttons with `sm` / `md` sizes reserve at least 44px of width for text labels and extend their pointer target to 44px vertically using a pseudo-element; icon buttons extend to 44×44px. This does not reserve layout space: leave enough room around compact buttons to avoid overlapping targets. For a visible 48px mobile target, use `size="lg"`. Native iOS / Android targets are separate platform requirements, not a guarantee of this Web component.

## Form

The `form` prop mirrors the Figma Form axis (Mobile v2 + PC v2). It controls layout, not visual weight.

| Form | Layout | When to use |
|---|---|---|
| `full` | Stretches to container width; uses `--radius-component-default` (8px) | Page-level CTAs (checkout, sheet footer, mobile bottom-fixed action) |
| `inline` | Content-width; uses `--radius-button-primary` (pill) for every hierarchy | **Default.** Most buttons |
| `icon` | Square (1:1), no label; keeps the hierarchy-specific radius | Compact actions where the icon alone communicates the verb. **Requires `aria-label`.** |

```tsx
<Button form="full" variant="emphasis">Checkout</Button>
<Button form="icon" variant="secondary" aria-label="Favorite"><HeartIcon /></Button>
```

For the standard action-area example, use a container with `width: 100%` and `max-width: 480px`: it fills the available mobile width and caps the desktop width. Dialogs and sidebars may use narrower containers. This is a layout convention; `Button form="full"` itself fills its parent and does not impose a maximum width.

The legacy booleans `fullWidth` and `iconOnly` are `@deprecated` but still work — they map to `form="full"` / `form="icon"`. New code should use `form`.

## Inverse

`inverse={true}` swaps every variant to its `*-inverse` token alias for placement on the active theme's opposite-polarity surface (`--surface-inverse`). In Light this surface is dark; in Dark it is light. The focus ring follows `--border-focus-inverse`.

```tsx
<div style={{ background: 'var(--surface-inverse)', padding: 'var(--space-300)' }}>
  <Button variant="emphasis" inverse>Place Order</Button>
  <Button variant="secondary" inverse>Cancel</Button>
</div>
```

Inverse mirrors Figma's `<Form> - Inverse` component sets — every Form × Hierarchy has a matching dark-surface variant.

## Icons

Prefer SVGs from `@ds/icons/` (under `assets/icons/`). They're normalized to use `fill="currentColor"` so they inherit the button's text color automatically. See `../../assets/icons/icons.meta.json`.

```tsx
import CartAdd from '@ds/icons/action/cart-add.svg?component'
// …
<Button variant="emphasis" leftIcon={<CartAdd />}>Add to Cart</Button>
```

Icon-only buttons (`form="icon"`) **require** `aria-label`:

```tsx
<Button form="icon" aria-label="Close dialog">
  <Close />
</Button>
```

Without `aria-label`, screen readers announce "button" with no context. The component warns in dev mode.

## Loading state

Set `loading` when the action is in-flight. The button:
1. Hides its visual content (icons + label) behind a centered spinner
2. Announces `aria-busy="true"` to screen readers
3. Stays focusable but click-disabled

For asynchronous saves, `loadingDelay={150}` avoids flashing a spinner for fast responses. It delays only the spinner and visual content swap; `aria-busy`, unavailable colors, and click blocking take effect immediately. The default is `0` for immediate loading previews. Finishing or unmounting cancels the pending spinner.

```tsx
const [saving, setSaving] = useState(false)
const savingRef = useRef(false)
// …
<Button loading={saving} loadingDelay={150} onClick={async () => {
  if (savingRef.current) return
  savingRef.current = true
  setSaving(true)
  try {
    await save()
  } finally {
    savingRef.current = false
    setSaving(false)
  }
}}>Save</Button>
```

Don't layer `loading={true} disabled={true}` — loading is enough, and makes the intent clearer.

The synchronous ref guard prevents two calls before React renders the loading state. Button remains controlled: it does not await `onClick` or manage the request for you. Handle request errors in your application.

The Card receipt example demonstrates generating and completion feedback and prevents repeated activation. It does not download a file; real applications must connect generation and download logic.

### Long labels

Text buttons fit their container and truncate overflowing labels with an ellipsis. Icons keep their size; the full text remains in the accessible name. Prefer short action labels, and use `title` or a tooltip when the full wording needs to be available to sighted users. Flex/grid containers may also need `min-width: 0` to allow shrinking.

Card does not clip child focus outlines or extended hit areas. Crop edge-to-edge images within their media region. If another ancestor clips or scrolls content, check that the 2px outline with 2px offset and the 44px target remain available.

## Disabled state

Uses `--button-disabled` background + `--text-disabled` foreground. **Never** use CSS `opacity` to imply disabled (rule: `no-opacity-disabled`) — it wrecks contrast unpredictably and may fail WCAG AA with dark backgrounds.

```tsx
<Button disabled={!canSubmit}>Submit</Button>
```

## Common patterns

### Checkout CTA row (mobile bottom sheet)

```tsx
<ButtonGroup full aria-label="Checkout actions">
  <Button variant="secondary" size="lg" form="full" onClick={closeSheet}>Continue Shopping</Button>
  <Button variant="emphasis" size="lg" form="full" onClick={placeOrder}>Place Order</Button>
</ButtonGroup>
```

Here “Continue Shopping” closes the sheet. If it navigates to another page, use ButtonLink with a real href in the same group.

### Form actions (modal / sheet footer)

```tsx
<ButtonGroup aria-label="Profile actions">
  <Button variant="secondary" onClick={closeDialog}>Cancel</Button>
  <Button variant="primary" htmlType="submit">Save</Button>
</ButtonGroup>
```

### Submit an external form

Because `form` names the Button layout mode, use `htmlForm` for the native HTML
form-owner attribute when the action is rendered outside its form.

```tsx
<form id="profile-form">...</form>
<Button htmlType="submit" htmlForm="profile-form">Save profile</Button>
```

`htmlForm` is forwarded as the button's native `form` attribute. Set
`htmlType="submit"` or `htmlType="reset"` when the button should submit or
reset that external form.

### Product card "+" button

Small icon-only pill for compact product cards:

```tsx
<Button variant="primary" size="sm" form="icon" aria-label="Add to cart">
  <Add />
</Button>
```

## Anti-patterns

### ✗ Custom radii

```tsx
<Button style={{ borderRadius: 16 }}>...</Button>   {/* breaks no-custom-radii */}
```

Use variants. If none fit, that's an ADR + design conversation, not an inline override.

### ✗ Full-width `emphasis` buttons stacked vertically

```tsx
<Button variant="emphasis" form="full">Apply</Button>
<Button variant="emphasis" form="full">Continue</Button>   {/* two emphasis CTAs */}
```

### ✗ Emoji inside buttons

```tsx
<Button>🛒 Add to Cart</Button>   {/* breaks no-emoji rule */}
```

Use an icon component from `@ds/icons/action/cart-add.svg` as `leftIcon`.

### ✗ Button inside Button

Nested interactive elements — confuses focus order and screen readers. Split into sibling buttons, or rethink the layout.

## Related

- Design rules: `design.md` (emphasis-limit, tap-target, no-opacity-disabled, focus-style, no-custom-radii, no-emoji)
- Tokens referenced: `meta.json` → `tokens[]`
- Icons: `../../assets/icons/icons.meta.json`
- Copy: `../../../copy-library/ui/buttons.i18n.json` (canonical button labels in CN + EN)
