# SectionBanner — 使用说明

用于页面中部的主题推荐和活动推荐。整组 Banner 上方展示一个模块标题，卡片内容、图片取色、轮播和响应式行为复用 HeroBanner。

```tsx
import { SectionBanner } from "@yami/design-system";

<SectionBanner
  title="精选主题"
  headingAlign="start"
  items={items}
  previousLabel="上一组活动"
  nextLabel="下一组活动"
/>
```

## 尺寸布局

- 标题复用 SectionHeading：PC 为 24px，Mobile 为 20px，与卡片左边缘对齐。
- description 可选，用于补充模块描述；居中时显示在标题下方。
- headingAlign 支持 start（默认左对齐）和 center（居中），PC、Mobile 均生效。
- PC 上下留白 32px，标题与卡片间距 24px；Mobile 上下留白及标题间距为 16px。
- 卡片保持 HeroBanner 的 8:9 比例；Mobile 固定 320×360，支持横向滑动。
- PC 默认每屏 3 张；HeroBanner 内容容器宽度大于 1440px 时每屏 4 张（不含左右内边距），等于 1440px 时仍为 3 张。此断点仅用于 SectionBanner。
- 内容模型为 SectionBannerItem，仅支持「图片＋文字＋商品」和「标题＋商品」两种形态。纯商品卡沿用 HeroBanner 的行为，仅在 PC 展示。

## 预览

Docs 提供独立的 PC、Mobile 视口，PC 按 1440px 等比预览，Mobile 为 375px。PC、Mobile 标签页可单独查看和操作组件。

## 交互与无障碍

模块标题使用 h2 并作为 Banner 区域的无障碍名称。PC 切换按钮位于卡片区域左右两侧、垂直居中，不显示底部进度条和计数；Mobile 使用横向滑动。轮播沿用 HeroBanner 的键盘、减少动态效果和离开视口暂停行为，可通过 autoAdvance 关闭自动轮播。
