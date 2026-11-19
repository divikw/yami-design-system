# 组件说明模板

组件的 `meta.json` 在 `dependencies.runtime` 中声明 `@base-ui/react` 时，Docs 使用共享模板的新版排版。
此模板仅用于 Storybook 文档，不修改 `@yami/design-system` 的真实组件。

## 文件职责

- `component-docs-template.tsx` / `.module.css`：页头、复制页面、上一 / 下一组件导航、示例卡片、代码展开/收起、复制代码、安装说明、API 表格与主题同步。
- `component-docs-preview.tsx` 提供跟随 Docs 视口的示例预览和文档级弹层预览。
- `component-guide.tsx`：常规说明页面的章节顺序（安装、用法、组合结构、示例、API），并生成“复制页面”的 Markdown。
- `*-docs.tsx`：各组件的双语文案、真实组件示例、对应代码和公开 API。Accordion 保留原有章节内容，使用相同的模板基础组件。
- `component-docs.tsx`：优先选择组件自定义页。其余 Base UI 组件复用 Story、使用指南和共享模板。

## 接入另一个组件

1. 参考 `aspect-ratio-docs.tsx`，提供名称、简介、相邻组件链接、组合结构、示例和 API。`previous` / `next` 均可选，按侧栏顺序配置；首页省略 `previous`，末页省略 `next`。
2. 示例使用公开导出的 YAMI 组件；示例卡片的代码与预览一致。「用法」展示公开导入和一次完整调用，保留必要的状态与无障碍属性。若首个示例包含展示样式、多个变体或业务流程，单独提供 `usageCode`，页面与复制的 Markdown 共用这段代码。
3. 提供中文、英文文案，使用传入的 `locale`；不要另建语言或主题状态。
4. 在 `component-docs.tsx` 的页面映射中注册，保持原 Storybook ID 与 PC / Mobile Stories。
5. 验证中英文、深色、窄屏，以及代码折叠、复制和安装方式切换。

## 保持的交互与样式

- 不增加框架切换栏、RTL 章节或 Storybook Controls。
- 折叠代码高度 120px；折叠时隐藏复制按钮。
- 代码上下内边距 12px，行号固定；支持横向滚动但不显示滚动条。
- 文档图标统一 Lucide 16px / 2px 线宽，导航按钮全圆角。
- 复制代码按钮使用代码背景的 80% 半透明底色，hover 叠加现有交互色。
- 沿用模板的 600px 文档布局断点；这是文档排版断点，不改变组件本身的 PC / Mobile 规则。
- 主示例和章节示例直接展示内容，不设置 PC / Mobile 切换栏。指定设备的预览通过侧栏独立 Story 打开。

需要演示承载背景时，在对应示例上设置 `previewBackground`，让背景覆盖整个展示区。代码片段中也应展示调用方使用的背景。

## 预览模式

根据组件的展示和交互范围选择 `previewMode`。侧栏的 PC / Mobile Story 提供独立的设备预览。

| 模式 | 适用场景 | 行为 |
| --- | --- | --- |
| `viewport`（默认） | 可在卡片内完整演示的组件 | 独立 iframe 跟随 Docs 视口宽度，示例内容限制在卡片可见区域内。 |
| `document` | 示例如 AlertDialog、Dialog、Drawer，跟随 Docs 窗口宽度的全局模态 | 弹层挂载在 Docs 文档，遮罩覆盖整个 Docs 视口。通过侧栏 Story 查看指定设备。 |

## 模态示例验收

- 实际打开组件的 Docs 页面并触发弹窗，确认遮罩覆盖卡片外的正文和目录，弹层定位以 Docs 视口为准。分别在桌面和移动视口验证组件的响应式布局。
- 通过取消或 Escape 关闭，检查焦点回到原触发器。修改预览布局或 Portal 时复用 [Docs 浏览器回归测试](../tests/ComponentDocsTemplate.browser.test.tsx)，同时断言布局、遮罩边界和焦点。
