# HeroBanner — 使用说明

## 使用场景

用于首页主导航下方的活动横幅。同一个组件负责 PC 和 Mobile 的响应式展示：

- 小于 `1024px`：卡片固定为 `320 × 360`，卡片间距 `8px`，页面边距 `8px`，支持原生横向滑动。
- 从 `1024px` 起：卡片保持 `8:9` 比例，默认每屏三张；内容容器宽度大于 `1280px`（不含左右内边距）时每屏四张，等于 `1280px` 时仍为三张；桌面按钮每次切换一张卡片。

```tsx
<HeroBanner
  items={promotions}
  ariaLabel="精选活动"
  previousLabel="上一组活动"
  nextLabel="下一组活动"
/>
```

无需拆分 PC 和 Mobile 组件。响应式样式负责调整卡片数量和交互，内容模型和 DOM 顺序保持一致。

## Storybook 预览

- `PC`：完整模块的桌面预览。
- `Mobile`：完整模块的移动端预览。
- `Card`：单张卡片预览，通过 `cardVariant` 切换四种内容形态。该选项仅用于 Storybook，不是组件属性。

分割线和其他细分场景保留为隐藏测试示例。

## 模块分割线

默认不显示分割线。`dividerPosition` 可设置为 `top`、`bottom` 或 `none`。
`dividerVariant="gray"` 使用 1px 结构分割线，`dividerVariant="black"` 使用随主题变化的 2px 强调分割线。
分割线仅 PC 生效，小于 `1024px` 时忽略此配置。

```tsx
<HeroBanner
  items={promotions}
  dividerPosition="bottom"
  dividerVariant="black"
/>
```

## 卡片子组件

`HeroBanner` 根据传入内容选择以下四种公开卡片子组件：

- `HeroBannerImageOnlyCard`：纯活动图片。
- `HeroBannerImageTextCard`：图片、标题和可选描述。
- `HeroBannerImageTextProductsCard`：图片、文字和最多四个商品。
- `HeroBannerProductsOnlyCard`：标题和商品，不包含活动图片或描述。

每个活动需要稳定的 `id` 和跳转地址 `href`。图片需要有意义的替代文本；纯商品卡片需要标题和至少一个商品。

```tsx
{
  id: "street-food",
  href: "/campaigns/street-food",
  image: { src: streetFoodArtwork, alt: "亚洲街头美食与饮品活动" },
  title: "深夜街头美食",
  description: "探索亚洲夜市美味",
  backgroundColor: "#FFD4B4",
  products: [
    { src: bottledTea, alt: "瓶装绿茶" },
    { src: spicySnack, alt: "辣味零食" },
    { src: cornChips, alt: "玉米脆片" },
  ],
}
```

一至三个商品使用横排布局，四个商品使用 `2 × 2` 网格。超过四个的商品不会展示，应拆分为其他活动卡片。

纯图片卡片仍然是活动链接，图片 `alt` 会成为链接的无障碍名称，应描述跳转内容。
纯商品卡片不会预留空白图片区域，背景和商品区域填满整张卡片；完整模块在移动端隐藏此形态，Card 预览仍可单独查看。

## 交互

移动端使用原生触摸滚动和滚动吸附。桌面箭头使用与 ProductList 一致的 `36px` 导航按钮，在首尾页禁用对应方向。
用户启用减少动态效果时，程序翻页改为即时切换。

桌面进度表示当前视口已展示到的横幅数量与总数。例如四列布局从 `4 / 12` 开始，最后一屏为 `12 / 12`。
请提供与页面语言一致的 `ariaLabel`、`previousLabel` 和 `nextLabel`。

自动切换每次前进一张，到末尾后循环。组件离开视口、页面隐藏、鼠标悬停或内部持有焦点时暂停；减少动态效果模式下关闭。

## 活动背景色

图文卡片在图片加载后提取图片底部的主色，用作文字区背景及 `24px` 图片渐变过渡。
`backgroundColor` 是加载期间或跨域取色失败时的回退值，属于活动内容，不是可复用的设计 token。

文字颜色根据活动背景决定，不随页面明暗主题变化：浅色背景使用黑色文字，深色背景使用白色文字。
必要时会加深背景，保证正文至少 `4.5:1` 的对比度。

纯商品卡片未指定背景色时，借用相邻卡片的图片取色结果。独立预览没有相邻卡片，因此提供固定背景色。

## 相关资源

- 组合组件：`<Button>`
- PC Figma：`3053:7724`
- Mobile Figma：`3056:37111`
- 移动端页面位置：`6962:102970`
