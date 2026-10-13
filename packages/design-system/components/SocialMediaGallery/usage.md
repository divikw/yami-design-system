# SocialMediaGallery

响应式社交内容列表，支持图片帖和视频帖混排。每项复用 SocialVideoCard 展示媒体、账号信息和关联内容。Storybook 提供 PC、Mobile 混排预览及 Image Posts 图片列表示例。

`Single Image`、`Multiple Images`、`Without Products` 分别演示单图、多图帖子封面与无商品状态，均只做列表展示，不提供详情入口。单图和无商品是基于官网素材构造的场景示例；多图示例使用已核实的星星人餐具帖子封面。多图示例使用帖子中观察到的三张图片，可见时循环切换，底部 `+N` 统计商品。

Storybook's `Single Image`, `Multiple Images`, and `Without Products` demonstrate list-only states without detail actions. Single-image and no-product examples are illustrative scenarios using public assets; the multi-image example uses the verified Starman post cover. The multi-image example cycles through three observed post images while visible; `+N` counts products.

## 图片帖与视频帖 / Image and video posts

不传 `videoSrc` 时展示图片帖，`images` 提供有序图片数组，未提供或为空时使用 `posterSrc`。单图保持静态，多图在可见范围内每 5 秒循环切换，离开可见范围时停止并回到第一张；开启减少动态效果时保持静态。传入 `videoSrc` 时显示视频并忽略 `images`。两种媒体共用 3:4 裁切、账号叠加层和商品底栏；`platformIconSrc` 可省略，此时只显示账号。

Image posts use the ordered `images` array, falling back to `posterSrc` when omitted or empty. One image stays still; multiple images cycle every five seconds while visible, stop and reset to the first image offscreen, and stay still under reduced motion. Providing `videoSrc` displays a video and ignores `images`. Both share the same 3:4 crop, creator overlay, and product footer. The platform icon is optional.

本组件不内置帖子查看器。不传 `href` 时媒体仅展示，不生成详情按钮或链接。`+N` 只表示当前未展示的关联商品数量，不是图片张数，也不是详情入口。保留 `SocialVideoCard` 名称与现有接口以兼容既有页面。

There is no built-in post viewer. Without `href`, media has no detail action or link. `+N` counts undisplayed associated products, not images, and has no action. The existing `SocialVideoCard` name and API remain compatible.

## 底部内容

- 无商品：显示帖子文案。
- 单商品：显示 56px 正方形商品图片和标题。
- 多商品：卡片宽度小于 228px 时显示两张缩略图，否则显示三张；其余商品合并为数量提示。商品图片为白底，底部区域使用灰底。

## 响应式规则

1024px 起使用 PC 布局，模块上下内边距 32px，左右 48px。列数按实际列表容器宽度决定：376px 起两列、572px 起三列、768px 起四列、1184px 起五列、1344px 起六列；更窄时为一列。完整 PC 页面保持原有四至六列节奏，嵌入 Docs 等较窄容器时自动减少列数，避免挤压商品区。

低于 1024px 使用移动端圆角面板，卡片宽 240px，媒体区域为 240×320px，支持原生横向滚动。两端媒体比例均为 3:4，底部高度为 72px。

## 标题与导航

标题默认左对齐。PC 设置 `headingAlign="center"` 后标题居中，翻页按钮位于内容两侧；移动端卡片标题始终左对齐。`description` 提供辅助说明，`viewAllHref` 提供查看全部入口。内容未溢出时隐藏翻页按钮，移动端使用触摸滚动。

## 分割线

PC 的 `dividerPosition` 支持 `top`、`bottom`、`none`，`dividerVariant` 支持 `gray`（1px）与 `black`（2px），默认 top/gray。移动端圆角面板不显示分割线。

## 媒体与无障碍

提供有意义的 `posterAlt`、稳定的 ID 及本地化标签。设置 `videoSrc` 后在媒体区域静音循环自动播放；仅在存在真实媒体目的地时设置 `href`。来源未提供作者时传入 `username={null}`，隐藏账号叠加层。

所有可见视频同时播放，没有单个播放限制。视频地址仅在进入可见范围后挂载，使用 `preload="none"`；移出可见范围或卸载时暂停、移除地址并重置，返回后从头播放。Storybook 的 `Concurrent Videos` 可核对多个视频同时播放及横向滚动后的停止／重播行为。

All visible videos play concurrently without an exclusive active player. Sources attach only on visibility, with `preload="none"`. Offscreen or unmounted videos pause, detach their source, and reset; returning videos restart. `Concurrent Videos` demonstrates simultaneous playback and horizontal-scroll stop/restart behavior.


## Keyboard focus geometry

The video media link matches the visible card top corners so its inset focus outline is not cut off. Focus uses the dedicated blue `--focus-ring` aliases; existing borders and selected states keep their original styling.
