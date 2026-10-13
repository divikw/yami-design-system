<!-- locale:zh -->

# Tabs — 使用说明

## 使用场景

- 使用 `variant="primary"` 切换页面内的主要内容分区。
- 使用 `variant="primary" styleVariant="b"` 在移动端进行紧凑的分段切换。
- 使用 `variant="secondary"` 切换主要页面或模块下的子分区。
- 使用 `variant="tertiary"` 展示较低层级的分类筛选或紧凑胶囊标签。

## 组件结构

```tsx
<Tabs defaultValue="snacks">
  <TabsList variant="primary" styleVariant="a" aria-label="商品分类">
    <TabsTrigger value="snacks">零食</TabsTrigger>
    <TabsTrigger value="beauty">美妆</TabsTrigger>
  </TabsList>
  <TabsContent value="snacks">零食内容</TabsContent>
  <TabsContent value="beauty">美妆内容</TabsContent>
</Tabs>
```

`Tabs` 管理选中状态。非受控模式使用 `defaultValue`；受控模式使用 `value` 和 `onValueChange`。

初始值应对应一个可用的标签页。未提供初始值时，所有面板保持隐藏，直到激活某个标签页；只有第一个可用标签页进入 Tab 键焦点顺序。同一组 Tabs 内的值必须唯一；中文、空格、标点及大小写差异都会保留为不同的面板 ID。移除或禁用当前选中项时，由使用方选择新的可用值。

每个 `TabsList` 都需要通过 `aria-label` 或 `aria-labelledby` 提供可访问名称。每个 Tabs 根组件内只放置一个列表。

## 样式变体

| 变体 | Figma 来源 | 用途 |
|---|---|---|
| `primary` + `styleVariant="a"` | 移动端 Primary Style A / WEB Primary | 带下划线标记的高层级内容导航 |
| `primary` + `styleVariant="b"` | 移动端 Primary Style B | 移动端分段导航 |
| `secondary` | 移动端 Secondary / WEB Secondary | 子分区导航，移动端与 PC 使用相同的下划线样式 |
| `tertiary` | 移动端 Tertiary | 紧凑的分类或筛选胶囊标签 |

Primary B 的选中底色在小于 1024px 时高 32px，桌面端高 36px，标签页点击区域的高度保持不变。横向分段底板在选中底色的四周外缘保留 2px 留白；底板在小于 1024px 时高 36px，桌面端高 40px。

| 尺寸 | 小于 1024px | 从 1024px 起 |
|---|---|---|
| 横向 Primary A 点击区域 | 56px，文字 16/20 | 56px，文字 16/20 |
| Primary B 点击区域 / 选中底色 | 44px / 32px | 44px / 36px |
| Secondary 点击区域 | 40px，文字 14/20 | 40px，文字 14/20 |
| Tertiary 点击区域 / 底色 | 32px | 36px |

以上为当前维护的 Web 尺寸。Secondary 和 Tertiary 保持紧凑布局，不通过不可见区域扩大点击范围，因此不满足原生 iOS 44pt / Android 48dp 的最小点击区域要求。

使用 `fullWidth` 可在标签文字放得下时均匀分配宽度；长标签仍保留原生溢出滚动。`orientation="vertical"` 会将所有变体（包括 Primary B 分段轨道）纵向排列，并改用上/下方向键导航。

纵向 Primary A 使用 44px 行高、16/20 文字，选中下划线距文字 4px；纵向 Secondary 保持 40px 行高。两者的标签项间距均为 4px，适用于所有断点。

Tertiary 胶囊标签的视觉、布局和点击区域高度保持一致：小于 1024px 时为 32px，PC 为 36px。透明点击区域不向相邻控件扩展；横向溢出时保留滚动。

## 反色背景

仅在 `--surface-inverse` 或其他明暗相反的 YAMI 表面上使用 `TabsList inverse`。反色表面在浅色主题中为深色，在深色主题中为浅色。

```tsx
<div style={{ background: "var(--surface-inverse)" }}>
  <Tabs defaultValue="all">
    <TabsList variant="tertiary" inverse aria-label="商品分类">
      <TabsTrigger value="all">全部</TabsTrigger>
      <TabsTrigger value="popular">热门</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

## 键盘与 ARIA

- 根组件组合呈现 WAI-ARIA 标签页模式：`tablist`、`tab`、`tabpanel`。
- 键盘焦点使用独立的 2px 蓝色 `--focus-ring` 外框；反色背景使用 `--focus-ring-inverse`。选中下划线和底色保持原样。无留白的滚动列表使用 2px 内偏移，避免焦点框被裁切；Primary B 沿可见胶囊绘制焦点框，保留 2px 外偏移，不沿 44px 点击区域绘制。
- 方向键移动焦点。默认的 `activationMode="automatic"` 模式下，也会选中获得焦点的标签页。
- 横向列表使用左/右方向键，纵向列表使用上/下方向键；到达两端后循环导航。
- 使用 `activationMode="manual"` 时，方向键只移动焦点，按 Enter/空格或点击才会激活标签页。面板加载有延迟时使用手动激活。
- `Home` 和 `End` 分别跳到第一个和最后一个可用标签页。
- 禁用项设置 `aria-disabled="true"`，不进入 Tab 键焦点顺序，方向键导航也会跳过。
- 列表只有一个可用标签页进入 Tab 键焦点顺序。Tab/Shift+Tab 会离开列表；可见的 `TabsContent` 本身可以获得焦点。隐藏面板仍保持挂载，保留其内部状态。

键盘行为遵循 [WAI-ARIA 标签页模式](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)。

## 受控选中状态

```tsx
const [value, setValue] = useState("snacks")

<Tabs value={value} onValueChange={setValue}>
  <TabsList variant="primary" styleVariant="b" fullWidth aria-label="商品分类">
    <TabsTrigger value="snacks">零食</TabsTrigger>
    <TabsTrigger value="beauty">美妆</TabsTrigger>
  </TabsList>
  <TabsContent value="snacks">零食内容</TabsContent>
  <TabsContent value="beauty">美妆内容</TabsContent>
</Tabs>
```

使用方必须在 `onValueChange` 后更新 `value`，受控 Tabs 不会自行更改选中状态。多个标签页更新同一商品列表时，可通过标签页的 `controls` 引用已有外部内容区域的 ID。该区域的名称和内容更新由使用方管理。

## 图标

Figma 的 WEB 标签按钮提供可选图标属性，但参考示例默认不显示图标。业务需要图标标签页时，通过 `TabsTrigger` 的 `leftIcon` 或 `rightIcon` 传入图标，并使用 `packages/design-system/assets/icons` 中继承 currentColor 的 SVG 资源。

```tsx
<TabsTrigger value="search" leftIcon={<SearchIcon />}>
  搜索
</TabsTrigger>
```

## 骨架加载

标签数据加载期间使用 `TabsList skeleton`。骨架列表设置 `aria-hidden`，不接受交互。

```tsx
<Tabs defaultValue="loading">
  <TabsList variant="primary" styleVariant="a" skeleton />
</Tabs>
```

## 避免的用法

- 不要用 Tabs 代替页面级全局导航；应使用站点导航组件。
- 不要在同一个 `TabsList` 中混用 Primary、Secondary 和 Tertiary 标签页。
- 不要使用长句作为标签。标签应简短，便于浏览，并在移动端保留横向滚动。
- 不要使用装饰性图标或 emoji。图标插槽必须使用 YAMI SVG 资源，并帮助说明标签含义。

## 可滚动分区导航

使用 `<TabsList fullWidth centerActiveTab align="center" edgePadding>` 构建占满宽度的导航条。`align="center"` 在内容放得下时居中排列，溢出时从起点排列。`edgePadding` 在首尾各添加 16px 留白。`centerActiveTab` 还会将外部受控更新后的选中项滚入视野（例如页面滚动跟踪），同时遵循减少动态效果偏好和滚动边界。这些能力需要显式启用，现有布局保留默认行为。

横向滚动由 TabsList 本身承载。点击或键盘激活会将当前标签页滚入视野；`centerActiveTab` 还会响应外部受控状态更新。滚动遵循减少动态效果偏好，不会导致页面纵向移动。页面负责纵向分区跳转和当前分区跟踪；不要在 TabsList 外再包一层横向滚动容器。

<!-- locale:en -->

# Tabs — Usage

## When to use

- Use `variant="primary"` for major content sections within a page.
- Use `variant="primary" styleVariant="b"` for compact segmented switching on mobile surfaces.
- Use `variant="secondary"` for sub-sections under a primary page or module.
- Use `variant="tertiary"` for low-level category filters or compact chips.

## Anatomy

```tsx
<Tabs defaultValue="snacks">
  <TabsList variant="primary" styleVariant="a" aria-label="Product categories">
    <TabsTrigger value="snacks">Snacks</TabsTrigger>
    <TabsTrigger value="beauty">Beauty</TabsTrigger>
  </TabsList>
  <TabsContent value="snacks">Snacks content</TabsContent>
  <TabsContent value="beauty">Beauty content</TabsContent>
</Tabs>
```

`Tabs` owns selected state. Use `defaultValue` for uncontrolled state or `value` + `onValueChange` for controlled state.

Provide an initial value matching an enabled trigger. Without an initial value, all panels remain hidden until activation and only the first enabled trigger is a Tab stop. Values must be unique within one Tabs root; localized values, whitespace, punctuation, and case differences retain distinct panel IDs. When removing or disabling the selected option, the owner must choose a new enabled value.

Name every `TabsList` with `aria-label` or `aria-labelledby`. Use one list per Tabs root.

## Variants

| Variant | Figma source | Use |
|---|---|---|
| `primary` + `styleVariant="a"` | Mobile Primary Style A / WEB Primary | High-level content navigation with underline marker |
| `primary` + `styleVariant="b"` | Mobile Primary Style B | Segmented mobile navigation |
| `secondary` | Mobile Secondary / WEB Secondary | Sub-section navigation with the same underline treatment on mobile and PC |
| `tertiary` | Mobile Tertiary | Compact category or filter pills |

Primary Style B keeps its 32px selected surface below 1024px and 36px desktop surface without changing its trigger height. The horizontal segmented background leaves 2px around the selected surface on every outer edge (36px background below 1024px, 40px on desktop).

| Geometry | Below 1024px | From 1024px |
|---|---|---|
| Horizontal Primary A trigger | 56px, 16/20 text | 56px, 16/20 text |
| Primary B trigger / selected fill | 44px / 32px | 44px / 36px |
| Secondary trigger | 40px, 14/20 text | 40px, 14/20 text |
| Tertiary trigger / fill | 32px | 36px |

These are the maintained web dimensions. Secondary and Tertiary preserve compact geometry without invisible hit-area extensions; they do not provide the native iOS 44pt / Android 48dp target minimum.

Use `fullWidth` to distribute triggers evenly while their labels fit; long labels retain native overflow. `orientation="vertical"` stacks every variant, including the segmented Primary B track, and changes navigation to Up/Down.

Vertical Primary A uses 44px rows with 16/20 text and a selected underline 4px below the label; vertical Secondary keeps 40px rows. Both use 4px gaps between items at every breakpoint.

Tertiary pills keep their visual, layout, and hit-area heights aligned: 32px below 1024px and 36px on desktop. Transparent hit areas do not extend into adjacent controls; horizontal overflow remains scrollable.

## Inverse

Use `TabsList inverse` only on `--surface-inverse` or another opposite-polarity YAMI surface. It is dark in Light and light in Dark.

```tsx
<div style={{ background: "var(--surface-inverse)" }}>
  <Tabs defaultValue="all">
    <TabsList variant="tertiary" inverse aria-label="Product categories">
      <TabsTrigger value="all">All</TabsTrigger>
      <TabsTrigger value="popular">Popular</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

## Keyboard and ARIA

- Root renders a compound WAI-ARIA tabs pattern: `tablist`, `tab`, `tabpanel`.
- Keyboard focus uses a separate 2px blue `--focus-ring` outline, or `--focus-ring-inverse` on inverse backgrounds. Selected underlines and fills retain their original colors. Scrolling lists without gutters use a 2px inset to avoid clipping; Primary B outlines its visible capsule with a 2px outer offset, independently of the 44px hit area.
- Arrow keys move focus. With the default `activationMode="automatic"`, arrow keys also select the focused tab.
- Horizontal lists use Left/Right; vertical lists use Up/Down. Navigation wraps at either end.
- With `activationMode="manual"`, arrows only move focus; Enter/Space or a click activates the focused tab. Use manual activation when panel loading is delayed.
- `Home` and `End` jump to the first/last enabled tab.
- Disabled tabs set `aria-disabled="true"`, are not tabbable, and are skipped by arrow navigation.
- The list has one enabled Tab stop. Tab/Shift+Tab leave the list; a visible `TabsContent` is itself focusable. Hidden panels stay mounted, preserving their local state.

Keyboard behavior follows the [WAI-ARIA Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

## Controlled selection

```tsx
const [value, setValue] = useState("snacks")

<Tabs value={value} onValueChange={setValue}>
  <TabsList variant="primary" styleVariant="b" fullWidth aria-label="Product categories">
    <TabsTrigger value="snacks">Snacks</TabsTrigger>
    <TabsTrigger value="beauty">Beauty</TabsTrigger>
  </TabsList>
  <TabsContent value="snacks">Snacks content</TabsContent>
  <TabsContent value="beauty">Beauty content</TabsContent>
</Tabs>
```

The owner must update `value` after `onValueChange`; controlled Tabs never change selection by themselves. `controls` on a trigger can reference an existing external content ID when several options update a shared product list. The consumer owns that external region's label and content updates.

## Icons

Figma's WEB tab buttons include optional icon properties, but the reference Tabs examples keep icons off. If product needs an icon tab, pass `leftIcon` or `rightIcon` to `TabsTrigger` and use currentColor SVG assets from `packages/design-system/assets/icons`.

```tsx
<TabsTrigger value="search" leftIcon={<SearchIcon />}>
  Search
</TabsTrigger>
```

## Skeleton

Use `TabsList skeleton` while the tab model is loading. Skeleton lists are `aria-hidden` and non-interactive.

```tsx
<Tabs defaultValue="loading">
  <TabsList variant="primary" styleVariant="a" skeleton />
</Tabs>
```

## Anti-patterns

- Do not use Tabs as page-level global navigation; use the site navigation component instead.
- Do not mix Primary, Secondary, and Tertiary tabs inside the same `TabsList`.
- Do not place long sentence labels in tabs. Keep labels short enough to scan and scroll horizontally on mobile.
- Do not use decorative icons or emoji. Icon slots must use YAMI SVG assets and should clarify the label.

## Scrollable section navigation

Use `<TabsList fullWidth centerActiveTab align="center" edgePadding>` for a full-width navigation strip. `align="center"` centers items when they fit and falls back to start alignment on overflow. `edgePadding` adds 16px leading/trailing gutters. `centerActiveTab` also reveals controlled selection changes (for example, page scroll tracking), respecting reduced motion and scroll boundaries. These options are opt-in; existing layouts retain their defaults.

Keep horizontal scrolling on TabsList itself. Click/keyboard activation reveals the active tab; `centerActiveTab` additionally reveals external controlled updates. Scrolling respects reduced motion and does not move the page vertically. Pages own vertical section navigation and active-section tracking; avoid a second horizontal scroll container around TabsList.
