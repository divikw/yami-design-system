<!-- locale:zh -->
# TabBar — 使用说明

用于 App 的主要目的地导航，抽取自购物车底部导航。页内内容切换使用 Tabs。

传入 `items`、受控的当前项 `value` 和导航名称 `aria-label`。每项包含唯一 `value`、短文字 `label`、24px 装饰图标 `icon`，以及导航链接 `href` 或操作回调 `onClick`。组件不自动更改当前项，也不处理路由、数据请求或页面滚动。

`badgeCount` 不传时隐藏角标，0 仍显示，超过 99 显示 99+；读屏名称保留完整数量。当前项使用 `aria-current="page"`。图标与角标不重复朗读，Tab 键依次访问项目，链接支持 Enter，按钮支持 Enter 和空格。

沿用购物车的 49px 导航高度（含 1px 上边线）、48px 点击区域、24px 图标和 10/14 标签，底部另加设备安全区。建议 3–5 个目的地；长标签省略显示但保留完整可访问名称。样式跟随全局主题，图标素材由使用方提供并适配相应主题和当前项。

组件默认随文档流显示，不自动隐藏桌面端。宿主通过 `className` 控制底部固定、断点及内容避让；不要把系统 Home Indicator 放进组件。`hidden` 可隐藏整条导航，支持 nav 的标准属性和 ref。PROTOTYPE 的模拟安全区由预览外壳负责。

```tsx
import { TabBar } from "@yami/design-system";

<TabBar aria-label="App 导航" value="cart" items={[
  { value: "home", label: "首页", icon: homeIcon, href: "/" },
  { value: "cart", label: "购物车", icon: cartIcon, badgeCount: 6, href: "/cart" },
]} />
```

<!-- locale:en -->
# TabBar — Usage

App destination navigation extracted from the cart footer. Use Tabs for switching content panels within a page.

Supply `items`, the controlled current destination `value`, and an `aria-label`. Each item has a unique `value`, short `label`, decorative 24px `icon`, and either a navigation `href` or an action `onClick`. The host owns state updates, routing, data and scrolling.

Omit `badgeCount` to hide the badge. Zero is displayed; counts above 99 display 99+ while the accessible name retains the full number. The current item has `aria-current="page"`. Tab visits each item; links activate with Enter and buttons with Enter or Space.

The bar preserves the cart's 49px height including a 1px top border, 48px targets, 24px icons and 10/14 labels, plus the device bottom safe area. Prefer 3–5 destinations. Long labels truncate visually but retain their accessible names. Surfaces follow the global theme; supply appropriate icon assets for the theme and current destination.

Positioning and breakpoint visibility belong to the host via `className`; the component renders in normal flow on every viewport. Support includes standard nav attributes, ref and `hidden`. Reserve space when fixing it to the bottom. System indicators and PROTOTYPE safe-area simulation belong to the preview shell.

See `examples.tsx#CartTabBar` for a runnable example.
