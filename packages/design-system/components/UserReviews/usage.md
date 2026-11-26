<!-- locale:zh -->

# UserReviews — 使用说明

用于首页的亚米 App 下载区，以 App Store、Google Play、下载二维码和用户评价组成同一模块。通过 `@yami/design-system` 导入 `UserReviews`。

- `download` 提供两个应用商店的链接和图标，以及二维码图片和等效的可点击链接。可用 `mobileIconSrc` 设置移动端的 App 图标。移动按钮使用 `mobileHref`，默认使用二维码链接。
- `reviewColumns` 接收按顺序排好的评价组。每条评价包含唯一的 `id`、`quote` 和 `author`。空组会跳过，所有组为空时仅显示下载区。
- `locale` 控制模块文案，支持 `zh`（默认）和 `en`。评价内容和下载素材由调用方提供。
- `titleStyle` 使用 `display`（默认）或 `section`（跟随共享模块标题字号）。`titleFontFamily` 支持 `sans`（默认）和 `serif`。
- `dividerPosition` 支持 `top`（默认）、`bottom` 和 `none`。`dividerVariant` 支持 `gray`（默认的 1px 结构分隔线）和 `black`（2px 强调分隔线）。
- `className` 应用在外层区块。页面可通过 `user-reviews-container` 插槽对齐内容宽度和边距。

手机布局（容器宽度小于 640px）显示单个 App 下载按钮。提供图标时，按钮上方居中显示 80 × 80px 的 App 图标。面板内边距为 16px。容器宽度从 640px 起，左侧显示二维码和商店链接，右侧显示一列评价，面板内边距为 24px。右侧从 928px 容器宽度起最多显示两列，1184px 起最多显示三列。评价区域为静态预览，超出展示高度的部分在底部渐隐。桌面评价卡片使用 12px 内边距。

<!-- locale:en -->

# UserReviews — Usage

Use the module to place Yami app download links, a QR code, and curated app reviews together on the homepage. Import `UserReviews` from `@yami/design-system`.

- `download` supplies each store URL and icon, the QR image, and an equivalent clickable download URL. Set `mobileIconSrc` for the mobile app icon. The mobile button uses `mobileHref` or falls back to the QR link.
- `reviewColumns` supplies ordered groups of reviews. Each review has a unique `id`, `quote`, and `author`. Empty groups are skipped. With no reviews, only the download panel is shown.
- `locale` sets the built-in copy to `zh` (default) or `en`. The caller supplies localized reviews and download assets.
- `titleStyle` accepts `display` (default) or `section` (shared section heading scale). `titleFontFamily` accepts `sans` (default) or `serif`.
- `dividerPosition` accepts `top` (default), `bottom`, and `none`. `dividerVariant` accepts `gray` (the default 1px structural divider) and `black` (the 2px emphasis divider).
- `className` applies to the section. Page layouts can align the content width and margins through the `user-reviews-container` slot.

The mobile layout (containers under 640px) shows a single app download button with 16px panel padding. When provided, the 80 × 80px app icon is centered above the button. From 640px, the QR code and store links sit on the left and one review column sits on the right, with 24px panel padding. The right side shows up to two review columns from 928px and three from 1184px of container width. Reviews appear in a static preview with a bottom fade for clipped content. Desktop review cards use 12px padding.
