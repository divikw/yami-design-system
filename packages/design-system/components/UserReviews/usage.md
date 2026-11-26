<!-- locale:zh -->

# 下载 App — 使用说明

用于首页的亚米 App 下载区，以 App Store、Google Play、下载二维码和用户评价组成同一模块。通过 `@yami/design-system` 导入 `UserReviews`。

- `download` 提供两个应用商店的链接和图标，以及二维码图片和等效的可点击链接。可用 `mobileIconSrc` 设置移动端的 App 图标。移动按钮使用 `mobileHref`，默认使用二维码链接。
- `padding` 默认开启。白底模块与卡片之间上下留白 16px，视口宽度从 1024px 起为 32px，左右使用页面边距。`padding={false}` 可移除此层留白。
- V2 的 `imageLayout` 支持 `balanced`（默认，居中双栏）、`image-first`（商品图优先）和 `compact`（紧凑横幅）。视口小于 1024px 或内容宽度小于 640px 时，三种方案共用居中单列布局，商品箱图位于下载按钮下方。
- `version` 默认为 `v1`，展示下载区和评价。设置为 `v2` 时，配图在桌面下载区右侧、手机按钮下方展示。
- `reviewColumns` 接收按顺序排好的评价组。每条评价包含唯一的 `id`、`quote` 和 `author`。空组会跳过，所有组为空时仅显示下载区。
- `locale` 控制模块文案，支持 `zh`（默认）和 `en`。评价内容和下载素材由调用方提供。
- `titleStyle` 使用 `display`（默认）或 `section`（跟随共享模块标题字号）。`titleFontFamily` 支持 `sans`（默认）和 `serif`。
- `dividerPosition` 支持 `top`（默认）、`bottom` 和 `none`。`dividerVariant` 支持 `gray`（默认的 1px 结构分隔线）和 `black`（2px 强调分隔线）。
- `className` 应用在外层区块。页面可通过 `user-reviews-container` 插槽对齐内容宽度和边距。

手机布局（视口小于 1024px 或容器小于 640px）显示单个 App 下载按钮。提供图标时，按钮上方居中显示 80 × 80px 的 App 图标。面板内边距为 16px。在桌面视口且容器达到 640px 时，左侧显示二维码和商店链接，右侧显示一列评价，面板内边距为 24px。右侧从 928px 容器宽度起最多显示两列，1184px 起最多显示三列。评价区域为静态预览，超出展示高度的部分在底部渐隐。桌面评价卡片使用 12px 内边距。

<!-- locale:en -->

# App Download — Usage

Use the module to place Yami app download links, a QR code, and curated app reviews together on the homepage. Import `UserReviews` from `@yami/design-system`.

- `download` supplies each store URL and icon, the QR image, and an equivalent clickable download URL. Set `mobileIconSrc` for the mobile app icon. The mobile button uses `mobileHref` or falls back to the QR link.
- `padding` defaults to true. The module uses the primary surface with page gutters and 16px vertical padding, increasing to 32px from a viewport width of 1024px. Set `padding={false}` to remove this spacing.
- In V2, `imageLayout` supports `balanced` (default), `image-first` (leading artwork), and `compact` (a shorter banner). When the viewport is under 1024px or the content width is under 640px, all three use one centered column with the product box below the download button.
- `version` defaults to `v1` for reviews. Set `v2` for the Yami product box image beside the download area on desktop and below the button on mobile.
- `reviewColumns` supplies ordered groups of reviews. Each review has a unique `id`, `quote`, and `author`. Empty groups are skipped. With no reviews, only the download panel is shown.
- `locale` sets the built-in copy to `zh` (default) or `en`. The caller supplies localized reviews and download assets.
- `titleStyle` accepts `display` (default) or `section` (shared section heading scale). `titleFontFamily` accepts `sans` (default) or `serif`.
- `dividerPosition` accepts `top` (default), `bottom`, and `none`. `dividerVariant` accepts `gray` (the default 1px structural divider) and `black` (the 2px emphasis divider).
- `className` applies to the section. Page layouts can align the content width and margins through the `user-reviews-container` slot.

The mobile layout (viewports under 1024px or containers under 640px) shows a single app download button with 16px panel padding. When provided, the 80 × 80px app icon is centered above the button. On desktop, containers at least 640px wide show the QR code and store links on the left and a review column on the right, with 24px panel padding. The right side shows up to two review columns from 928px and three from 1184px of container width. Reviews appear in a static preview with a bottom fade for clipped content. Desktop review cards use 12px padding.
