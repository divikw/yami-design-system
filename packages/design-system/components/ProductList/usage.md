# ProductList — 使用说明

## 使用场景

用于带标题的商品集合，包括首页推荐、活动横向列表，以及支持加载更多的商品网格。购物车、订单或商品比较应使用对应的专用组件。

## Storybook 预览

侧栏仅保留 Docs、PC、Mobile。通过 Controls 切换 `appearance`、`layout`、`headingAlign`、`mobileSurface` 和 `loading` 等配置。属性名和选项值使用英文，说明使用中文。

切换活动外观时，预览会提供默认素材，也可通过属性覆盖。细分示例和交互测试保留，但不显示在侧栏。`Horizontal Scroll List` 是独立的滚动容器，与 Product List 位于同一级。

## 布局与商品

| layout | 卡片形式 | 行为 |
|---|---|---|
| rail | rich | Mobile 原生滑动；PC 分页展示 4–8 张卡片 |
| waterfall | rich | Mobile 两列，PC 响应式网格 |

```tsx
<ProductList
  title="精选商品"
  products={products}
  layout="rail"
  onAddToCart={(productId) => addToCart(productId)}
/>
```

普通 rail 按主体容器的实际宽度（含左右留白）决定每屏数量，不按浏览器视口判断：

| 主体容器宽度 W | 每屏数量 |
|---|---|
| W < 1024px | 单卡固定 152px，横向滑动 |
| 1024px ≤ W < 1200px | 4 件 |
| 1200px ≤ W ≤ 1280px | 5 件 |
| 1280px < W ≤ 1440px | 6 件 |
| 1440px < W ≤ 1680px | 7 件 |
| W > 1680px | 8 件 |

桌面卡片间距保持 12px。下载页主体最大 1440px，因此最多 6 件。带 `leadingContent` 的主题列表保留其独立的布局规则。

每件商品需要稳定的 `id`，其他字段使用 ProductCard 数据。加购回调接收商品 id，商品链接与加购按钮保持独立。同一列表的卡片展示形式保持一致。

标准列表使用 plain 商品卡片；活动卡片外观使用 card 商品卡片及 2px 外边内衬，与背景区分。
`introContent` 在标题下方、商品集合上方渲染一次，不占商品位置；`leadingContent` 用于参与横向列表布局的引导内容，Mobile 上显示在列表之前。

## 标题与对齐

小于 1024px 时，`mobileTitleSize={20}` 默认使用 28px 行高、400 字重；16px 使用 20px 行高，中文 600、英文 500 字重，由继承的 `lang` 决定。此配置不影响 PC 排版与标题间距。

`headingAlign="center"` 支持 standard、background 和 themed-background 通栏布局。标题与未溢出的标签居中，溢出的标签左对齐并横向滚动；隐藏查看全部链接。PC 横向列表按钮放在内容区两侧，与商品图片垂直居中。Mobile 保留手势滚动，不显示箭头。

Mobile 的 card 外观始终保持标题左对齐，plain 外观支持居中。默认对齐方式为 start。

## 分割线与移动端外观

默认顶部灰色分割线。`dividerPosition` 支持 top、bottom、none；gray 为 1px，black 为随主题变化的 2px 强调线。PC 始终支持，Mobile 仅 plain 外观支持。

`mobileSurface="card"` 保留内缩圆角背景。plain 去除外部 8px 留白和圆角，内容内边距由 8px 增至 16px。网格布局中，card 间距 8px，plain 间距 16px。

活动卡片式 PC 列表由页面组合层提供上下 32px、左右 48px 的外部留白，组件自身保留内部间距。

## 标签

标签使用 YAMI 胶囊样式。组件只报告选择结果，不自行筛选商品。

```tsx
<ProductList
  title="新品推荐"
  products={visibleProducts}
  tabs={[
    { value: "all", label: "全部" },
    { value: "beauty", label: "美妆" },
    { value: "sold-out", label: "已售罄", disabled: true },
  ]}
  value={category}
  onValueChange={setCategory}
/>
```

非受控模式省略 value，使用 defaultValue。

## 外观

- `standard`：标准页面背景。
- `themed`：带活动横幅的卡片式模块，必须提供 `banner`。`mobileSrc` 用于小于 1024px 的素材，未提供时回退到 src。可分别指定 backgroundColor 和 mobileBackgroundColor；未提供移动端颜色时回退到 PC 颜色，都未提供时使用 `--surface-secondary`。
- `themed-background`：保留横幅和响应式背景色，采用通栏直角外层及白底商品卡片；PC 水平留白 48px，Mobile plain 为 16px。
- `background`：标准列表底层增加背景色和背景图，商品使用完整白底卡片；保留 PC 标准间距，Mobile 默认通栏 plain 布局。
- `atmospheric`：氛围背景卡片式模块，backgroundColor 用于背景及图片过渡，backgroundImage 为 PC 素材，backgroundImageMobile 为 Mobile 素材，未提供时回退到 PC 素材。装饰背景不重复提供无障碍图片内容。

```tsx
<ProductList
  title="夏日焕新"
  products={products}
  appearance="themed"
  banner={{
    src: campaignBanner,
    mobileSrc: campaignBannerMobile,
    alt: "夏日美妆焕新活动",
    backgroundColor: "#E4E5F0",
    mobileBackgroundColor: "#F9EAF3",
  }}
/>
```

在素材上传或构建阶段提取底部背景色，避免运行时取色带来的跨域、加载延迟或水合问题。横幅与背景图通过渐变融入指定颜色。氛围素材保持低对比度，确保文字和商品可读。

## 加载与分页

`loading` 隐藏商品并显示与布局匹配的骨架，同时暴露 aria-busy。`loadingLabel` 提供无障碍提示，骨架本身不被辅助技术朗读。减少动态效果模式下关闭闪光动画。

```tsx
<ProductList title="精选商品" products={[]} layout="waterfall" loading loadingLabel="正在加载商品" skeletonCount={4} />
```

横向列表在 Mobile 使用原生滚动和吸附；PC 从 1024px 起通过按钮分页，可见数量随视口增加，从四张递增至 1920px 时八张。按钮每次切换一整页，到边界后禁用。

仅 `layout="waterfall"` 且 `hasMore` 为 true 时显示加载更多按钮，点击调用 onLoadMore。

## 无障碍与相关资源

模块通过可见标题命名；商品使用 list/listitem 语义。活动横幅必须提供 alt。viewAllLabel、loadMoreLabel、loadingLabel 应与页面语言一致。

- 组合组件：ProductCard、Tabs、Button。
- 商品结构与徽标规则：`../ProductCard/usage.md`。
- 规则：red-usage、tap-target、focus-style、no-custom-radii。
