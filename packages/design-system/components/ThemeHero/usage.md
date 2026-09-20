# ThemeHero

主题展示模块，组合标题、可展开说明、关键词标签和主题图片。Storybook 只提供 PC、Mobile 预览，默认不显示操作按钮。

## 内容

标题建议控制在 PC 两行以内。说明默认在 PC 显示三行、Mobile 显示两行，超出后可通过展开和收起操作查看完整内容；使用 `descriptionExpandLabel` 和 `descriptionCollapseLabel` 提供本地化文案。

`tags` 建议提供不超过三个关键词，以不可交互的 Badge 展示。`tagSize` 支持 sm、md，移动端统一使用 sm；`tagTone` 设置标签明暗样式。

图片需提供原始宽高与有意义的替代文本。通过 `image.objectPosition` 设置焦点，保证不同尺寸下裁切合理。兼容性接口 `cta`、`secondaryCta` 仍可按需传入，默认示例不配置按钮。

## 响应式布局

1024px 起采用双栏布局，内容最大宽度 1440px，模块高 448px，左右内边距 48px。说明文字为 16px/20px。

低于 1024px 使用通栏图片，文字位于图片底部，通过自适应遮罩保证可读性；说明文字为 14px/20px，关键词标签为 20px 高、12px 字号。

## 无障碍

标题使用 h2，应放在页面 h1 下方。主题图片提供替代文本，装饰性模糊背景对辅助技术隐藏。说明展开控件使用原生按钮及 aria-expanded、aria-controls；溢出的关键词列表可通过键盘访问。
