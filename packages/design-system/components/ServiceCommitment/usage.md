<!-- locale:zh -->

# ServiceCommitment — 使用说明

用于展示服务承诺，中文版五项，英文版四项。默认显示中文，通过 `locale="en"` 切换为英文。`className` 用于页面布局。

模块顶部有一条细分隔线，内容区最小高度为 80px。内容区可用宽度达到 928px（中文）或 1120px（英文）时，承诺项居中单行排列并以细线分隔。更窄时逐行居中，项目横向间距为 16px，行间距为 8px。页面可通过 `service-commitment-container` 插槽设置内容区最大宽度。

设置 `mobileCarousel` 后，视口宽度低于 1024px 时每次居中展示一项，每 3 秒向上切换。支持手动上下滑动，开启减少动态效果时仅手动切换。

```tsx
import { ServiceCommitment } from "@yami/design-system";

<ServiceCommitment locale="zh" />
```

<!-- locale:en -->

# ServiceCommitment — Usage

Use this strip to show four service benefits in English or five in Chinese. It defaults to Chinese. Set `locale="en"` for English. Use `className` for page layout.

With `mobileCarousel`, viewports below 1024px show one centered benefit at a time. Benefits advance upward every three seconds and can be scrolled manually. Reduced motion uses manual scrolling.

A thin divider sits above the centered content area, which has an 80px minimum height. Benefits sit in a row with vertical dividers from 928px of usable width in Chinese and 1120px in English. In narrower containers, each wrapped row is centered, with 16px between items and 8px between rows. Use the `service-commitment-container` slot to match the content width to the host page.

```tsx
import { ServiceCommitment } from "@yami/design-system";

<ServiceCommitment locale="en" />
```
