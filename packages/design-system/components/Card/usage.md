<!-- locale:zh -->

# Card — 使用说明

## 使用场景

- **呈现独立内容项**：一笔订单、一个商品摘要、一条已保存地址。每张卡片代表一个完整对象。
- **比较同类对象**：在列表或网格中展示可以独立查看、排序或移除的内容项。
- **提供单一操作入口**：整张卡片导航或触发一个操作时，使用 `as="a"` 或 `as="button"`。

选择前先判断：这是否是一个可独立理解和操作的内容项？如果只是把一段页面内容放在一起，标题、间距和对齐通常已经足够，不必添加 Card。是否可排序或移除是辅助判断，不是必须具备的功能。

## 不适用场景

- **页面最外层布局**：Card 应放在 `<main>` 内，不能包裹整个页面。
- **普通页面分区或表单分组**：通知偏好、通用设置等使用 `<section>`、标题与布局间距，不因内容相关就套上 Card。
- **小型徽标或标签**：使用 `<Badge>`，不要用缩小圆角的 Card 代替。
- **弹窗或对话框**：使用专用的 `<Dialog>`，不要用 Card 模拟弹窗层级。

## 默认行为（规则：`card-no-border`）

Card 默认使用：

- `--surface-primary` 背景（浅色主题下为白色，深色主题下随主题变化）。
- `--radius-surface-default` 圆角（12px）。
- `padding='md'` 内边距（16px）。
- **无边框**（规则 `card-no-border`）。
- **无阴影**（目前没有可用的层级阴影令牌来源）。

仅在卡片排列紧密、需要细线分隔以提升浏览效率的密集列表或网格中启用 `bordered`。

### 内边距选择

| 档位 | 当前值 | 选择依据 |
|---|---|---|
| `none` | 0 | 图片等媒体贴边，内部内容区由组合组件管理留白 |
| `sm` | 12px | 内容简短的紧凑条目 |
| `md` | 16px | 默认的独立内容卡片 |
| `lg` | 24px | 需要更宽松留白的内容项 |

16px 是当前默认值，不是所有业务卡片的固定要求。Card 不会根据屏幕宽度自动切换内边距；同一列表或网格中的同类卡片应保持一致。首页 ProductCard 显式使用 `padding="none"`，再按自身规范设置图片和文字区的间距。

### 圆角归属

基础 Card 使用 `--radius-surface-default`（12px）。ProductCard 的外容器和图片区域按其独立规范使用 `--radius-component-default`（8px）。组合组件可以使用已定义的语义令牌规定自身形态；不要在使用处填写任意圆角数值，也不需要为每张 Card 单独调圆角。

## 交互行为

`as="button"` 或 `as="a"` 且提供 `href` 时，自动启用交互反馈。`href=""` 仍是指向当前文档的原生链接，也会启用反馈；省略 `href` 的锚元素保持静态。业务导航应提供明确的目标地址。可用卡片在悬浮和按下时仅改变背景色，保持表面的明暗极性和文字颜色，不改变阴影或尺寸。

| 状态 | 行为 |
|---|---|
| 默认 | 使用所选的 `primary`、`secondary` 或 `inverse` 表面 |
| 悬浮 | 在背景中混入 8% 的表面文字颜色；仅适用于支持悬浮的精细指针设备 |
| 按下 | 在背景中混入 16% 的表面文字颜色；粗指针设备也可获得反馈 |
| 键盘焦点 | 2px 的 `--focus-ring` 轮廓，偏移 2px；跟随周围页面的主题，与卡片自身的明暗极性无关 |
| 禁用按钮 | 原生 `disabled` 阻止激活；保留表面，使用禁用文字颜色和 `not-allowed` 光标，不显示悬浮或按下反馈 |

交互卡片至少提供 44×44px 的点击区域，不向相邻内容扩展。开启减少动态效果偏好时，关闭背景过渡。`interactive={false}` 会关闭悬浮、按下反馈和最小点击尺寸；可聚焦元素仍会显示焦点轮廓，禁用状态的文字颜色和光标也会保留。

正确示例：

```tsx
<Card as="button" onClick={openSettings}>
  打开配送设置
</Card>
```

错误示例：

```tsx
<Card className="hover:shadow-lg">   {/* ✗ 使用额外阴影制造悬浮反馈 */}
```

## 使用 `as` 指定元素

选择合适的元素以保留语义：

```tsx
<Card as="div">             {/* 静态信息 */}
<Card as="a" href="/...">   {/* 页面导航，整张卡片可点击 */}
<Card as="button" onClick={...}>  {/* 按钮操作；通常优先在静态卡片内放置按钮 */}
```

`href` 不会自动将 Card 转为链接，必须同时设置 `as="a"`。链接和按钮卡片继承排版样式，移除原生链接装饰，以完整的块级容器呈现。

按钮卡片默认使用 `type="button"`，避免意外提交外层表单。需要提交或重置时，显式传入 `type="submit"` 或 `type="reset"`。按钮支持 Enter 和空格键，链接支持 Enter。静态 `div` 不带隐式分组角色，也不会进入键盘焦点顺序。

`interactive` 仅控制视觉反馈，不会为 `div` 或自定义组件添加角色、焦点顺序或键盘事件。自定义元素需自行实现这些语义和行为。

提供清晰可见的标签或 `aria-label`。可点击 Card 内不能嵌套链接、按钮或表单控件。按钮卡片的子内容必须是文本、`span`、图片等短语内容，不能使用标题或其他块级元素。内部 `data-slot="card-content"` 容器在按钮卡片中使用 `span`，其他情况使用 `div`。

需要多个操作入口时，使用静态 Card，并在内部放置独立的链接或按钮。

选择状态不由 `interactive` 表达。需要选择地址、配送方式等选项时，使用 Checkbox、Radio 或对应业务组合组件。

### 禁用操作

```tsx
<Card as="button" disabled>配送设置暂不可用</Card>
```

按钮操作使用原生 `disabled`。链接没有原生禁用状态；导航不可用时，改用静态 Card。自定义组件使用 `aria-disabled="true"` 可获得禁用样式，但仍需自行阻止激活；ARIA 本身不会禁用行为。禁用内容使用语义文字颜色，不使用透明度。

## 常见组合

### 商品卡片容器

实际商品列表优先使用已有 `<ProductCard>`，它统一管理 8px 圆角、图片、价格与加购操作。下面仅说明贴边媒体的容器组合方式：

```tsx
<Card padding="none">
  <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-surface-default) var(--radius-surface-default) 0 0' }}>
    <img src={product.image} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
  </div>
  <div style={{ padding: 'var(--space-200)' }}>
    {/* 品牌、标题、价格、按钮 */}
  </div>
</Card>
```

使用 `padding="none"` 让图片贴合卡片边缘，媒体区域单独裁切顶部圆角，再为文字和操作区域添加内边距。Card 自身不裁切子内容。

### 静态卡片内的多个操作

```tsx
<Card as="article">
  <h3>订单 Y20261011-1234</h3>
  <p>预计周二送达</p>
  <ButtonGroup aria-label="订单操作">
    <ButtonLink href="/orders/Y20261011-1234" size="md">查看订单</ButtonLink>
    <Button variant="secondary" size="md" onClick={generateAndDownloadReceipt}>下载收据</Button>
  </ButtonGroup>
</Card>
```

外容器保持静态，查看订单保留链接导航，下载收据由按钮生成文件并下载。ButtonLink 与 Button 使用统一的按钮外观，ButtonGroup 管理 8px 间距、对齐和换行；组内使用相同尺寸。保留原业务标签和行为，不为统一外观而更换操作。示例订单路径由应用提供，Storybook 模拟生成过程，显示生成中与完成反馈，忙碌时拦截重复激活，不下载文件；真实业务应连接生成与下载逻辑。

已有收据文件的直接下载应使用 `<a href="…" download>`。两个或三个相关 Button / ButtonLink 优先使用 ButtonGroup，并提供 `aria-label`。普通文字链接与按钮并列时使用普通布局容器。

### 列表条目卡片（密集网格，带边框）

```tsx
<Card bordered padding="sm">
  <OrderSummary order={order} />
</Card>
```

### 链接卡片：整张卡片可点击

```tsx
<Card as="a" href={`/product/${product.id}`} padding="none">
  {/* ... */}
</Card>
```

### 反色表面：与当前主题相反的明暗极性

```tsx
<Card surface="inverse" padding="lg">
  <h2>反色内容区</h2>
</Card>
```

文字默认使用 `--text-primary-inverse`。未单独设置颜色的子元素会继承此颜色；自行设置颜色的子元素需要显式使用反色令牌。反色表面在浅色主题中为深色，在深色主题中为浅色。悬浮和按下时保持此极性；启用边框时也使用反色边框令牌。

## 窄屏与内容溢出

- Card 可以缩小到父级网格或弹性布局分配的宽度；多列网格使用 `minmax(0, 1fr)`，不要让长内容撑宽列。
- 长标题和连续字符串默认换行。需要省略时由内容组件处理，并提供查看完整内容的方式。
- Card 保留可见溢出，避免裁切子控件的焦点框和扩展点击区域。媒体区域单独使用圆角和裁切；不要给整个 Card 或操作区设置 `overflow: hidden`。
- SM / MD 按钮的点击区域至少高 44px，但扩展部分不占布局空间。操作区应保留合理留白，并检查相邻目标是否重叠。其他祖先容器仍可能裁切，需检查实际布局。
- 表格或代码等需要保留宽度的内容应放入独立滚动区域，不能用裁切隐藏溢出内容。
- 滚动区域应有可访问名称，并允许键盘用户聚焦和滚动。

```tsx
<Card>
  <h3>订单记录</h3>
  <div role="region" aria-label="订单记录代码" tabIndex={0}
    style={{ maxWidth: '100%', overflowX: 'auto' }}>
    <pre>{record}</pre>
  </div>
</Card>
```

## 避免的用法

### ✗ 自定义圆角

```tsx
<Card style={{ borderRadius: 8 }}>    {/* 违反 no-custom-radii */}
```

使用系统的表面圆角。其他组件形态所需的几何规则应由对应组合组件定义。

### ✗ 普通商品网格默认带边框

```tsx
<Card bordered>    {/* 非密集网格中违反 card-no-border */}
```

### ✗ 卡片阴影或悬浮阴影

```tsx
<Card style={{ boxShadow: '0 8px 16px rgba(0,0,0,.16)' }}>  {/* 未使用系统令牌 */}
```

### ✗ 用多层 Card 搭建整页布局

```tsx
<Card>       {/* 整个页面 */}
  <Card>     {/* 内容区块 */}
    <Card>   {/* 列表条目 */}
    </Card>
  </Card>
</Card>
```

嵌套卡片会让布局显得杂乱。结构分组使用 `<section>` 或 `<div>`，Card 用于实际的内容卡片。

## 相关内容

- 规则 `card-no-border`、`no-custom-radii`、`elevation-on-press`、`focus-style`：参见 `../../DESIGN.md`。
- 常与 `<Badge>`、`<Button>`、`<Divider>` 搭配。
- 可组合为 `<ProductCard>`，参见该组件的 `meta.json`。

<!-- locale:en -->

# Card — Usage

## When to use

- **Representing a self-contained item** — one order, product summary, or saved address. Each card represents one complete object.
- **Comparing peers** — lists or grids of items that can be viewed, reordered, or removed independently.
- **Offering one primary interaction** — use `as="a"` for full-card navigation or `as="button"` for a single action.

First ask whether this is an independently understandable, actionable item. For ordinary content grouping, headings, spacing, and alignment are usually enough. Reordering or removal is a useful heuristic, not a required feature.

## When NOT to use

- **Page-level containers** — no Card on the outermost layout. Cards go inside `<main>`, not around it.
- **Ordinary page sections or form groups** — notification preferences and general settings use a `<section>`, heading, and layout spacing. Related content alone does not justify a Card.
- **Small badges / chips** — use `<Badge>`, not a Card with tiny radius.
- **Modal / dialog** — use the dedicated `<Dialog>` component. Don't simulate modal depth with Card.

## Default behavior (rule: `card-no-border`)

Cards ship with:
- `--surface-primary` background (white in Light; theme-aware in Dark)
- `--radius-surface-default` (12px)
- `padding='md'` (16px interior)
- **No border** (rule `card-no-border`)
- **No shadow** (Figma currently provides no elevation token source)

Opt into `bordered` only in dense listing grids where cards are tightly packed and hairline separation improves scanability.

### Choosing padding

| Tier | Current value | Use |
|---|---|---|
| `none` | 0 | Edge-to-edge media; the composite owns internal content spacing |
| `sm` | 12px | Compact items with brief content |
| `md` | 16px | Default self-contained content cards |
| `lg` | 24px | Items that need more generous spacing |

16px is the current default, not a requirement for every business card. Card does not change padding automatically at breakpoints. Keep peer cards consistent within a list or grid. Homepage ProductCard explicitly uses `padding="none"` and owns its media and text spacing.

### Radius ownership

Base Card uses `--radius-surface-default` (12px). ProductCard specifies `--radius-component-default` (8px) for its outer surface and media. A composite may define its geometry with existing semantic tokens; avoid arbitrary numeric overrides and per-instance radius adjustments.

## Interaction

Interaction is inferred for `as="button"` and `as="a"` with `href`. An empty `href=""` is still a native link to the current document and receives interaction styling; an anchor without `href` stays static. Supply an explicit destination for business navigation. Enabled cards change only background color on hover and press, keeping their surface polarity and text color. No shadow or geometry changes.

| State | Behavior |
|---|---|
| Rest | Selected `primary`, `secondary`, or `inverse` surface |
| Hover | Mix 8% of the surface's reading color into its background; fine pointers with hover support only |
| Press | Mix 16% of the reading color into the background; also available with coarse pointers |
| Keyboard focus | 2px `--focus-ring` outline with 2px offset, following the surrounding theme's canvas rather than the card's own surface polarity |
| Disabled button | Native `disabled` prevents activation; preserve surface, use disabled text color and `not-allowed` cursor, suppress hover/press |

Interactive cards reserve at least 44×44px without extending the hit area over adjacent content. Reduced motion disables the background transition. `interactive={false}` suppresses hover/press styling and the minimum target; a focusable host still receives a focus outline, and disabled text color and cursor remain available.

Right:
```tsx
<Card as="button" onClick={openSettings}>
  Open delivery settings
</Card>
```

Wrong (manually attempted):
```tsx
<Card className="hover:shadow-lg">   {/* ✗ tailwind-ism, bumps shadow */}
```

## Polymorphic `as`

Preserve semantics by choosing the right element:

```tsx
<Card as="div">             {/* static info */}
<Card as="a" href="/...">   {/* navigation; full card clickable */}
<Card as="button" onClick={...}>  {/* button action (rare; prefer button inside card) */}
```

`href` does not automatically select an anchor: always use `as="a"` with `href`. Link and button hosts inherit typography, remove native link decoration, and render as complete block surfaces.

Button cards default to `type="button"` to avoid submitting an enclosing form. Pass `type="submit"` or `type="reset"` explicitly when needed. Buttons activate with Enter or Space; links navigate with Enter. The static `div` has no implicit group role and is not keyboard-focusable.

The `interactive` prop controls visual feedback only. It does not add a role, tab stop, or keyboard handlers to a `div` or custom component. Custom hosts must provide those semantics themselves.

Use an accessible visible label or `aria-label`. Do not nest links, buttons, or form controls inside a clickable Card. Button-card children must be phrasing content (text, spans, images), not headings or other block elements. The internal `data-slot="card-content"` wrapper is a `span` for button hosts and a `div` otherwise.

For mixed actions, use a static Card with separate links/buttons inside.

`interactive` does not represent selection. Use Checkbox, Radio, or a business composite for choices such as addresses or delivery methods.

### Disabled actions

```tsx
<Card as="button" disabled>Delivery settings unavailable</Card>
```

Use native `disabled` for button actions. Links have no native disabled state; render a static Card when navigation is unavailable. Custom wrappers using `aria-disabled="true"` receive disabled styling but must prevent their own activation; ARIA alone does not disable behavior. Disabled content uses semantic text colors, never opacity.

## Common patterns

### Product card container

Prefer the existing `<ProductCard>` for real product lists: it owns the 8px geometry, media, price, and add-to-cart action. The following only illustrates edge-to-edge media composition:

```tsx
<Card padding="none">
  <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-surface-default) var(--radius-surface-default) 0 0' }}>
    <img src={product.image} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
  </div>
  <div style={{ padding: 'var(--space-200)' }}>
    {/* brand / title / price / button */}
  </div>
</Card>
```

Use `padding="none"` for edge-to-edge media. Crop top corners only within the media region; pad text and actions separately. Card itself does not clip child content.

### Multiple actions inside a static card

```tsx
<Card as="article">
  <h3>Order Y20261011-1234</h3>
  <p>Expected Tuesday</p>
  <ButtonGroup aria-label="Order actions">
    <ButtonLink href="/orders/Y20261011-1234" size="md">View order</ButtonLink>
    <Button variant="secondary" size="md" onClick={generateAndDownloadReceipt}>Download receipt</Button>
  </ButtonGroup>
</Card>
```

Keep the container static: View order remains navigation, while Download receipt generates a file and downloads it. ButtonLink and Button share button appearance; ButtonGroup manages alignment, wrapping, and an 8px gap. Use matching sizes. Preserve the original labels and behavior when fixing presentation. The application provides the example order route; Storybook simulates generation, shows progress and completion, and prevents repeated activation while busy. It does not download a file; real applications must connect generation and download logic.

For an existing receipt file, use `<a href="…" download>` instead. Prefer ButtonGroup for two or three related Button / ButtonLink entries with an accessible name. Use a normal layout container when combining plain text links with buttons.

### List item card (dense grid, bordered)

```tsx
<Card bordered padding="sm">
  <OrderSummary order={order} />
</Card>
```

### Link card — full-card clickable

```tsx
<Card as="a" href={`/product/${product.id}`} padding="none">
  {/* ... */}
</Card>
```

### Inverse surface — opposite polarity within either theme

```tsx
<Card surface="inverse" padding="lg">
  <h2>On-dark hero</h2>
</Card>
```

Text defaults to `--text-primary-inverse`. Plain children inherit it; children that set their own colors must use inverse tokens explicitly. Inverse is a dark surface in Light and a light surface in Dark. Hover and press preserve that polarity. Opt-in borders also use the inverse border token.

## Narrow layouts and overflow

- Card can shrink to its grid track or flex allocation. Use `minmax(0, 1fr)` for multi-column grids so long content cannot widen tracks.
- Long titles and unbroken strings wrap by default. If truncation is needed, handle it in the content component and provide access to the full value.
- Card keeps overflow visible so child focus outlines and extended hit areas are not clipped. Apply radius and cropping only to the media region; do not set `overflow: hidden` on the whole Card or action area.
- SM / MD buttons extend their target to at least 44px high without reserving extra layout space. Leave appropriate action-area spacing and check for overlapping targets. Other ancestors can still clip, so verify the actual layout.
- Give tables or code that must retain their width a separate scroll region rather than clipping content.
- Give scroll regions an accessible name and make them keyboard-focusable and scrollable.

```tsx
<Card>
  <h3>Order record</h3>
  <div role="region" aria-label="Order record code" tabIndex={0}
    style={{ maxWidth: '100%', overflowX: 'auto' }}>
    <pre>{record}</pre>
  </div>
</Card>
```

## Anti-patterns

### ✗ Custom radius

```tsx
<Card style={{ borderRadius: 8 }}>    {/* breaks no-custom-radii */}
```

Use the system's surface radius; a different component geometry belongs to the consuming composite's contract.

### ✗ Default border on product cards

```tsx
<Card bordered>                        {/* breaks card-no-border on non-dense grids */}
```

### ✗ Card shadow + interactive hover shadow

```tsx
<Card style={{ boxShadow: '0 8px 16px rgba(0,0,0,.16)' }}>  {/* not from Figma tokens */}
```

### ✗ Stacking Cards as full-page layout

```tsx
<Card>       {/* outer page */}
  <Card>     {/* section */}
    <Card>   {/* list item */}
    </Card>
  </Card>
</Card>
```

Nested cards make the layout visually noisy. Use `<section>` / `<div>` for structural grouping; reserve Card for real content cards.

## Related

- Rules `card-no-border`, `no-custom-radii`, `elevation-on-press`, `focus-style` — `../../DESIGN.md`
- Pairs frequently with `<Badge>`, `<Button>`, `<Divider>`
- Composes into `<ProductCard>` (see that component's meta.json)
