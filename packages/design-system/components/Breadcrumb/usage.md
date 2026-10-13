<!-- locale:zh -->
# Breadcrumb — 使用说明

## 使用场景

展示当前内容在站点层级中的位置。沿用商品详情页和文档站的斜杠分隔及原生链接交互；页面决定是否显示，不承担路由、结果加载或页面级导航。

```tsx
<Breadcrumb locale="zh" items={[
  { label: "文档", href: "/zh/docs/getting-started" },
  { label: "查看组件与页面", current: true },
]} />
```

## 路径与语义

`items` 按从上级到下级排列。`href` 存在时渲染原生链接，否则渲染静态文字。仅当某项确实代表当前页面时设置 `current: true`，每条路径最多一个，通常放在末尾。当前页可为静态文字或真实链接。

PDP 的末项可能只是商品所属分类，博客路径也可能止于文章分类：这种情况下不要设置 `current`。组件不会把末项或无链接文字自动视为当前页面，也不会自动附加商品或文章标题。

使用命名的 `nav` 和有序列表 `ol`；当前页标记 `aria-current="page"`，斜杠通过 `aria-hidden` 排除。空数组不渲染导航，单层路径不显示分隔符。

## 样式与响应式

- `size="sm"`（默认）沿用 PDP 的 caption-md 文字；`size="md"` 沿用文档站的 body-md 文字。
- `underline` 默认开启，保持 PDP 链接下划线；文档站使用 `underline={false}`。
- PC 链接至少 24×24px；小于 1024px 时至少 44×44px，沿用博客移动端交互。文字过长时换行，不裁切或折叠层级。
- 链接间距为 8px；导航四周保留 4px 焦点空间，并以负外边距保持现有页面内容对齐。外层不要裁切这部分空间。
- PDP 和文档页在移动端隐藏面包屑，博客保持显示；这些显示规则继续由页面布局控制，组件自身不会按断点隐藏。
- `inverse` 表示当前主题中的反色表面，浅色主题为深色表面，深色主题为浅色表面；组件使用已有语义 token。

## 键盘焦点

默认不自动聚焦。Tab / Shift+Tab 按 DOM 顺序访问链接，Enter 激活；保留新标签页、复制链接等浏览器行为。静态项和斜杠不进入焦点顺序，不添加 Tabs 的方向键行为。

焦点框使用 2px 蓝色 `--focus-ring`、2px 偏移；反色背景使用 `--focus-ring-inverse`。焦点不改变当前页或路径。

## 中英文与框架链接

`locale="zh" | "en"` 切换导航的默认无障碍名称和 `lang`，路径文字与地址由页面提供；不自动翻译内容。多个面包屑区域可使用 `aria-label` 区分；Storybook 的描述、用法及示例跟随语言工具栏切换。

默认渲染原生 `a`。已有路由框架可通过 `renderLink` 保留框架链接，必须将传入的 `href`、`className`、`children` 和 ARIA 属性传给实际链接。组件自身不依赖框架，并支持服务端渲染。

```tsx
<Breadcrumb items={items} locale="zh" size="md" underline={false}
  renderLink={(props) => <Link {...props} />} />
```

`Link` 由应用导入；不要用按钮或点击处理器模拟有真实地址的导航，也不要在路径标签中嵌套交互控件。

<!-- locale:en -->
# Breadcrumb — Usage

## When to use

Show the content's location within a site hierarchy. Reuses product-page and docsite slash separators and native links. The host controls visibility, routing and content loading.

```tsx
<Breadcrumb items={[
  { label: "Documentation", href: "/en/docs/getting-started" },
  { label: "Explore components and pages", current: true },
]} />
```

## Path and semantics

Provide `items` from parent to child. Items with `href` render native links; other items render static text. Set `current: true` only for the actual current page, at most once per path, normally at the end. The current page may be static or a real link.

A PDP path may end at a product category; a blog path may end at an article category. Neither is the current page. The component does not infer current status from position or a missing URL, and does not append product or article titles.

A named `nav` contains an ordered list. Current items use `aria-current="page"`; slash separators are hidden from assistive technology. An empty array renders nothing; a single item has no separator.

## Appearance and responsiveness

- `size="sm"` (default) uses PDP caption-md typography; `size="md"` uses docsite body-md typography.
- `underline` defaults to true for PDP links; use false for the docsite treatment.
- PC links are at least 24×24px. Below 1024px, links are at least 44×44px, preserving the mobile blog targets. Long labels wrap without truncating or collapsing the hierarchy.
- An 8px gap separates items. A 4px navigation gutter protects focus outlines; negative outer margins preserve content alignment. Avoid clipping this gutter in a parent.
- PDP and documentation pages hide breadcrumbs on mobile; blog articles keep them visible. The page owns these rules; the component does not hide itself at a breakpoint.
- `inverse` means the active theme's opposite surface polarity: dark in Light, light in Dark. Existing semantic tokens handle both axes.

## Keyboard focus

No automatic focus. Tab / Shift+Tab visit links in DOM order; Enter activates them. Native browser actions remain available. Static items and separators are not focusable; there is no Tabs-style arrow-key navigation.

Focus uses a 2px blue `--focus-ring` outline with a 2px offset, or `--focus-ring-inverse` on inverse surfaces. Focus does not change the current page or path.

## Localization and framework links

`locale="zh" | "en"` selects the default accessible navigation name and `lang`. The host supplies translated labels and URLs. Use `aria-label` to distinguish multiple breadcrumb regions. Storybook descriptions, usage and examples follow the language toolbar.

Native anchors are the default. Use `renderLink` to retain a framework link, passing through `href`, `className`, `children` and ARIA attributes. The component has no framework dependency and supports server rendering.

```tsx
<Breadcrumb items={items} size="md" underline={false}
  renderLink={(props) => <Link {...props} />} />
```

Import `Link` in the application. Do not imitate real navigation with buttons or click handlers, or nest interactive controls inside labels.
