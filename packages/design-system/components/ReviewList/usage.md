# ReviewList

用户评论横向列表，复用 ProductList 的标题结构。每项由 ReviewCard 展示评分、评论、匿名昵称及可选关联商品。

## 预览与配置

Storybook 提供 PC 和 Mobile 预览。通过 `showProduct` 预览带商品或纯评论样式；此项仅用于 Storybook，实际使用时省略每条评论的 `product`。通过 `mobileSurface` 切换 `card` / `plain`，通过 `headingAlign` 和分割线属性调整展示。属性名与选项保持英文。

同一列表的评论卡片自动等高，由最高的内容决定高度，不设置固定高度。PC、Mobile 及带商品、纯评论样式均采用此规则；移动端卡片宽度保持 344px。

## 响应式布局

桌面常规显示三张卡片，1920px 起显示四张；移动端采用原生横向滚动。翻页按钮仅在桌面内容溢出时显示，标题居中时位于列表两侧。

移动端 `card` 外观的标题始终左对齐；`headingAlign="center"` 仅对 PC 和移动端 `plain` 生效。

移动端默认 `mobileSurface="card"`，采用内缩圆角面板和灰色画布。`plain` 为直角通栏布局，内容内边距 16px。提供 `viewAllHref` 时显示查看全部入口。

## 分割线

默认顶部 1px 灰线。`dividerPosition` 支持 `top`、`bottom`、`none`；`dividerVariant` 支持 `gray`（1px）和 `black`（2px）。移动端仅 `plain` 支持分割线。

## 内容与无障碍

按展示顺序传入 `reviews`，由调用方提供对应语言的评论。无关联商品时省略 `product`；辅助说明使用 `description`。评分提供五星制无障碍标签，图片需要有意义的替代文本，商品 `href` 使用可通过键盘访问的原生链接。
