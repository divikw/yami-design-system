# ProductCard — 使用说明

## 使用场景

用于首页、分类、搜索结果的商品网格，横向推荐列表，以及详情页的关联推荐。不用于购物车、订单记录、文章卡片或详情页主图区域。

## Storybook 预览

保留 Docs、PC、Mobile。PC 与 Mobile 使用同一组件，通过 Controls 切换 presentation、surface 和 addButtonDisabled，并编辑商品字段。属性和选项使用英文，说明使用中文。

长内容、销量自适应、形态矩阵等边界场景保留为隐藏测试。

## 结构与形态

内部由 ProductCardMedia（图片和徽标）、ProductCardSummary（商品信息）、ProductCardOffer（价格和优惠）组成。公开接口为 ProductCard 和可独立使用的 ProductCardAddButton。

| presentation | 用途 |
|---|---|
| rich | 默认完整卡片，展示品牌、标题、排行、评分、销量、价格及优惠 |
| minimal | 图片为主，带价格徽标和可选加购按钮 |
| compact | 横向商品行，图片 132×132，右侧信息自适应，加购位于价格旁 |

没有图片时显示中性的斜线占位图，作为装饰隐藏于辅助技术，商品身份由标题提供。标题最多两行，超出省略。

## 背景与属性

surface 默认 plain，去除外部内边距。card 适合背景上的商品卡片，保留 2px 内边距。

- 必填：href、title、priceCurrent。
- image 与 imageAlt 配套；提供图片时必须提供替代文本。
- imageLoading 默认 lazy，imageFetchPriority 默认 auto；仅首屏关键图片使用 eager/high。
- brand 与 brandHref 配套；品牌行在 PC、Mobile 均为 12px 字号、14px 行高。
- priceOriginal 用于划线原价，unitPrice 用于单位或组合价格。
- ranking、rating、ratingCount、soldCount 用于排行、评分及销量；空间不足时隐藏无法完整显示的销量。
- promotions 和 countdown 用于优惠及活动倒计时。
- onAddToCart 省略时隐藏加购按钮；addButtonDisabled 禁用按钮，addButtonAriaLabel 提供无障碍名称。

```tsx
<ProductCard
  href="/product/example"
  image={product.image}
  imageAlt="保湿面霜 100ml"
  title="保湿面霜 100ml"
  priceCurrent="$12.99"
  priceOriginal="$19.99"
  presentation="rich"
  surface="plain"
  addButtonDisabled={false}
  onAddToCart={() => addToCart(product.id)}
/>
```

## 加购按钮

rich、minimal 的按钮位于图片右下角，compact 位于价格旁。独立按钮 ProductCardAddButton 使用 disabled 属性禁用；卡片内按钮使用 addButtonDisabled。

Mobile 按钮视觉尺寸 40×40、图标 22px；PC 为 42×42、图标 24px；指针目标至少 44×44。PC 悬停及按下时使用强调红与白色图标。图片上的按钮背景不随页面明暗主题变化。

## 徽标与价格

图片最多展示两个徽标，优先促销信息（sale、low-price、discount），其次商品状态（new、hot、exclusive、choice）。best-sellers 和 price 不属于此图片徽标接口。超过两个的徽标会被截断，调用方应选择最相关的信息。

priceCurrent、priceOriginal 接收 ReactNode，货币与数字格式由调用方根据地区格式化。有原价时当前价格使用强调色。

## 链接与无障碍

图片和标题跳转到同一个商品地址；评分、价格、优惠和倒计时位于链接之外。品牌链接与加购按钮独立，加购不触发商品跳转。不要在 ProductCard 外再包一层链接。

商品图片应提供准确的 imageAlt；仅在相邻文本已充分表达且确属冗余图片时使用空替代文本。加购按钮名称应与页面语言一致。

## 相关资源

- 组合组件：Card、AspectRatio、Badge、ProductCardAddButton。
- 规则：red-usage、numerals-font、card-no-border、type-hierarchy。
- 文案规范：`../../content/copy-patterns.md#product-card-pattern`。
