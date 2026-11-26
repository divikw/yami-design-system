<!-- locale:zh -->

# ServiceCommitment — 使用说明

用于页尾展示五项服务承诺。默认显示中文，通过 `locale="en"` 切换为英文。`className` 用于页面布局。

模块顶部有一条细分隔线，内容区最小高度为 80px。内容区可用宽度达到 928px（中文）或 1120px（英文）时，承诺项居中单行排列并以细线分隔。更窄时逐行居中，项目横向间距为 16px，行间距为 8px。页面可通过 `service-commitment-container` 插槽设置内容区最大宽度。

```tsx
import { ServiceCommitment } from "@yami/design-system";

<ServiceCommitment locale="zh" />
```

<!-- locale:en -->

# ServiceCommitment — Usage

Use this strip at the bottom of a page to summarize five service benefits. It defaults to Chinese. Set `locale="en"` for English. Use `className` for page layout.

A thin divider sits above the centered content area, which has an 80px minimum height. Benefits sit in a row with vertical dividers from 928px of usable width in Chinese and 1120px in English. In narrower containers, each wrapped row is centered, with 16px between items and 8px between rows. Use the `service-commitment-container` slot to match the content width to the host page.

```tsx
import { ServiceCommitment } from "@yami/design-system";

<ServiceCommitment locale="en" />
```
