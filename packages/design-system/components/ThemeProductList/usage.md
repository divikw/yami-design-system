# ThemeProductList

主题商品列表，将主题图片、标题和说明与商品横向列表组合，复用 ProductList 的标题、标签、翻页和加购能力。

## 预览与配置

Storybook 提供 PC 和 Mobile 预览，通过 `mobileSurface` 切换 `card` / `plain`。属性名与选项保持英文。提供 `themes` 时，切换标签会同时更新主题内容与商品。

## 主题内容

为 `content.image.alt` 提供有意义的替代文本。`content.title` 使用简短标题，`content.description` 提供辅助说明；需要跳转时设置 `content.href`。商品使用 ProductList 的数据结构。

## 响应式布局

PC 内容最大宽度 1440px，商品位数量根据实际内容容器宽度调整：572px 起三个、768px 起四个、1104px 起五个、1344px 起六个，更窄时为两个。主题面板占两个商品卡片宽度加一个间距，并随同排内容等高伸展，保留完整圆角；图片保持比例并裁切填充面板。Mobile 将主题面板放在标签下方，商品列表在下一行横向滚动。

默认 `mobileSurface="card"` 为内缩圆角面板；`plain` 使用直角通栏布局、16px 内容内边距、全宽标签和商品滚动区域，并支持上下分割线。两种模式的主题面板均位于商品列表上方。

内部商品列表与商品卡片使用 `plain` 外观，商品卡片内边距为 0；`mobileSurface` 只影响外层模块。

## 无障碍

主题图片需要替代文本，叠加文案保留为可选择的 DOM 文本。提供 `content.href` 后主题面板使用原生链接和共用焦点样式，商品链接仍可独立访问。
