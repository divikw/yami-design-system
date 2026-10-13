<!-- locale:zh -->
# Pagination — 使用说明

## 使用场景

PC 搜索或商品列表的数字分页。1024px 起显示，低于此宽度隐藏，且不进入键盘焦点顺序。移动端由页面选择加载更多或其他已实现的浏览方式；隐藏分页不会自动提供移动加载能力。

## 受控更新

```tsx
<Pagination page={page} pageCount={25} onPageChange={loadPage} locale="zh" />
```

`page` 从 1 开始，`pageCount` 是非负整数。回调只报告目标页；页面负责请求数据、更新页码、处理加载和错误。需要阻止重复操作时传入 `disabled`。总页数为 0 时不渲染。

## 链接导航

```tsx
<Pagination page={3} pageCount={25} getPageHref={(page) => `/search?page=${page}`} locale="zh" />
```

通过 URL 切换页面时使用 `getPageHref`，保留新标签页、复制链接等原生行为。它与 `onPageChange` 互斥；不要通过点击按钮模拟有真实地址的链接。

## 样式与焦点

页码高 32px、最小宽 32px，间距 4px，选中状态使用中性色填充。默认与反色背景分别使用 `--focus-ring` 和 `--focus-ring-inverse`，蓝色焦点框宽 2px、偏移 2px，列表保留 4px 空间防止裁切。主题与 `inverse` 独立。

禁用时，当前页保留选中填充和反色文字，其余页码使用禁用文字颜色；所有页码均不可操作。

默认不自动聚焦。Tab 按顺序访问可用控件；Enter 激活链接和按钮，空格激活按钮。当前页在展示范围内时标记 `aria-current="page"`；省略号不可点击且对辅助技术隐藏。仅包含数字页码和省略号。默认无障碍名称跟随 `locale`，多个分页区域可用 `aria-label` 提供不同名称。

## 责任边界

组件始终固定显示前 9 页、一个省略号和最后一页，不随当前页展开中间段。总页数不超过 10 时显示全部页码。当前页落在折叠区时不额外显示，也不将其他页码标记为当前页。组件不请求商品、不拥有路由、不自动滚动页面，也不更改结果区焦点。换页后的结果公告与焦点策略由页面负责。

<!-- locale:en -->
# Pagination — Usage

## When to use

Numbered pagination for PC search or product listings. Visible from 1024px; hidden and removed from keyboard navigation below that width. The host owns any mobile load-more or alternative browsing flow; hiding pagination does not add mobile loading.

## Controlled updates

```tsx
<Pagination page={page} pageCount={25} onPageChange={loadPage} locale="en" />
```

`page` starts at 1; `pageCount` is a non-negative integer. The callback reports the destination only. The host fetches data, updates the controlled page, and handles loading and errors. Pass `disabled` to prevent repeated actions. A zero page count renders nothing.

## Link navigation

```tsx
<Pagination page={3} pageCount={25} getPageHref={(page) => `/search?page=${page}`} />
```

Use `getPageHref` when each page has a URL, preserving native browser actions. It is mutually exclusive with `onPageChange`. Do not imitate a real link through a button click handler.

## Appearance and keyboard focus

Controls are 32px high with a 32px minimum width and 4px gaps. Current selection uses neutral colors. Default and inverse surfaces use `--focus-ring` and `--focus-ring-inverse`, respectively: a 2px blue outline with a 2px offset. A 4px list gutter prevents clipping. Theme and `inverse` are independent.

When disabled, the current page retains its selected fill and contrasting text; other pages use disabled text colors. All pages remain unavailable for interaction.

No automatic focus. Tab visits enabled controls in order. Enter activates links and buttons; Space activates buttons. The current page has `aria-current="page"` when it is visible. Ellipses are static and hidden from assistive technology. Only numbered pages and ellipses are rendered. Accessible names follow `locale`; use `aria-label` to distinguish multiple regions.

## Responsibility

The first nine pages, one ellipsis and the last page remain fixed. Up to ten pages are shown in full. The middle range does not expand around the current page. When the current page is in that collapsed range, it is not added and no other page is marked current. The component does not fetch results, own routing, scroll the page, or move result focus. The host owns result announcements and focus after loading.
