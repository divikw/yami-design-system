# 组件说明模板

Accordion、AspectRatio、Avatar、Badge 共用当前 Accordion Docs 的展示规范。
此模板仅用于 Storybook 文档，不修改 `@yami/design-system` 的真实组件。

## 文件职责

- `component-docs-template.tsx` / `.module.css`：页头、复制页面、上一 / 下一组件导航、示例卡片、代码展开/收起、复制代码、安装说明、API 表格与主题同步。
- `component-guide.tsx`：常规说明页面的章节顺序（安装、用法、组合结构、示例、API），并生成“复制页面”的 Markdown。
- `*-docs.tsx`：各组件的双语文案、真实组件示例、对应代码和公开 API。Accordion 保留原有章节内容，使用相同的模板基础组件。
- `component-docs.tsx`：按组件名称选择模板页面；未接入的组件继续使用现有 Storybook Docs。

## 接入另一个组件

1. 参考 `aspect-ratio-docs.tsx`，提供名称、简介、相邻组件链接、组合结构、示例和 API。`previous` / `next` 均可选，按侧栏顺序配置；首页省略 `previous`，末页省略 `next`。
2. 示例使用公开导出的 YAMI 组件；代码片段应与预览中的属性及布局一致。
3. 提供中文、英文文案，使用传入的 `locale`；不要另建语言或主题状态。
4. 在 `component-docs.tsx` 的页面映射中注册，保持原 Storybook ID 与 PC / Mobile Stories。
5. 验证中英文、深色、窄屏，以及代码折叠、复制和安装方式切换。

## 保持的交互与样式

- 不增加框架切换栏、RTL 章节或 Storybook Controls。
- 折叠代码最大高度 120px；折叠时隐藏复制按钮。
- 代码上下内边距 12px，行号固定；支持横向滚动但不显示滚动条。
- 文档图标统一 Lucide 16px / 2px 线宽，导航按钮全圆角。
- 复制代码按钮使用代码背景的 80% 半透明底色，hover 叠加现有交互色。
- 沿用模板的 600px 文档布局断点；这是文档排版断点，不改变组件本身的 PC / Mobile 规则。
