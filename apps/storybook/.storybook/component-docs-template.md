# 组件说明模板

组件和模块的说明页共用章节、排版和代码示例模板。交互示例使用组件本身的公开 API。
此模板仅用于 Storybook 文档，不修改 `@yami/design-system` 的真实组件。

## 文件职责

- `component-docs-template.tsx` / `.module.css`：页头、上一 / 下一组件导航、示例卡片、代码展开/收起、复制代码、API 表格与主题同步。
- `component-docs-preview.tsx` 提供跟随 Docs 视口的示例预览和文档级弹层预览。
- `component-guide.tsx`：常规说明页依次展示主预览、用法、组合结构、使用建议、示例、API 参考和无障碍。
- `*-docs.tsx`：各组件的双语文案、真实组件示例、对应代码和公开 API。
- `component-docs.tsx`：优先选择组件自定义页。其余 Base UI 组件复用 Story、使用指南和共享模板。
- `component-properties.tsx` / `.module.css`：Properties 页的设备切换、实时预览、属性控件和 JSX 复制。
- `*-properties.tsx` 提供各组件可试用的公开属性、双语说明、预览和对应 JSX。
- `component-guide-notes.ts` 提供组件专属的用法、使用建议和无障碍说明。说明页可根据自身示例补充这些章节。

## 接入另一个组件

1. 参考 `aspect-ratio-docs.tsx`，提供名称、简介、相邻组件链接、组合结构、示例和 API。`previous` / `next` 均可选，按侧栏顺序配置；首页省略 `previous`，末页省略 `next`。
2. 主预览展示有代表性的形态或交互。「用法」说明适用场景，并展示公开导入和一次完整调用。可用 `leadExample` 和 `usageCode` 分别提供预览与最小用法，确保代码与对应示例一致。
3. 提供中文、英文文案，使用传入的 `locale`。中文显示名称集中维护在 `component-docs-names.ts`，用于页标题和相邻组件导航。
4. 在 `component-docs.tsx` 的页面映射中注册，保持原 Storybook ID 与 PC / Mobile Stories。
5. 按 [Docs 验收](#docs-验收)检查接入结果。

组合结构可用部件表或代码树。使用建议通过表格区分「推荐」和「避免」。使用建议与无障碍章节在有具体指引时展示。示例集中在「示例」章节下，原有示例锚点继续可用。Button Docs 展示完整结构。

工作区依赖与全局样式集中说明于 [快速开始](../docs/QuickStart.mdx)。

## 接入 Properties

1. 按照 `PropertiesDefinition` 定义可调的公开属性。使用同一份当前属性值生成预览与 JSX，示例导入从 `@yami/design-system` 获取。
2. 参考 `docs/ButtonProperties.mdx`，通过 `<Meta of={Stories} name="Properties" />` 把页面挂到组件下，接入共享的 `ComponentPropertiesPage`。
3. 卡片内的组件预览沿用侧栏的设备定义。检查 PC / Mobile 或 PC / App / H5 的切换、属性保留和 JSX 复制。全局模态设置 `previewMode: "document"`，遮罩覆盖整个文档预览区，组件随文档视口响应。指定设备的预览通过侧栏 Story 打开。

## 保持的交互与样式

- 不增加框架切换栏或 Storybook Controls。RTL 章节遵循[语言与方向规则](../../../packages/design-system/SKILL.zh-CN.md#语言与方向)。
- 通过 `DocsExample` 或 `CodeBlock` 的 `code` 属性传入代码字符串。不要在模板代码块内再嵌套 Storybook `Source`。
- 折叠代码高度 120px。查看代码按钮在底部居中，底部留 12px，按钮底色使用 `--surface-primary`。折叠时隐藏复制按钮。
- 代码上下内边距 12px，行号固定；支持横向滚动但不显示滚动条。
- 文档图标统一 Lucide 16px / 2px 线宽。页头的上一 / 下一组件使用小号 Secondary ButtonLink（`form="icon"`），始终位于标题行右侧。
- 页面标题使用 `heading-3xl`。代码块使用 `caption-md` 字阶、等宽字体及基于 YAMI 色阶的明暗语法配色。目录沿用 Storybook 的定位，字阶、正文颜色和选中标记使用 YAMI token。
- 复制代码按钮使用代码背景的 80% 半透明底色，hover 叠加现有交互色。
- 主示例和章节示例直接展示内容，不设置 PC / Mobile 切换栏。指定设备的预览通过侧栏独立 Story 打开。
- 主预览与各章节示例都居中展示。成组控件由示例管理组内排列，需要填满预览列的示例应显式设置宽度。
- 文档正文使用 4px 链接下划线偏移。Docs 和 Properties 的示例保留组件自己的下划线样式。

## 文档宽度

- Components、Modules 和组件资产的 Docs 共用一列正文，最大宽度 880px。页头、示例卡片、用法和 API 表格按同一列对齐。示例内组件遵循各自的尺寸规则。
- 页头简介使用正文列的可用宽度，随预览区缩窄自然换行。
- 按 Docs 预览区的宽度布局。1280px 起显示右侧 160px 目录，目录与正文相隔 32px，整体居中。较窄时隐藏目录，正文单独居中。
- 两侧至少留 24px，600px 及以下改为 16px。超宽的代码和表格在各自区域内横向滚动。
- 手机 Docs 骨架和正文共用按组件、语言和视口宽度测得的标题行数、简介行数与首个示例高度。改动这些内容后，启动本地 Storybook，从仓库根目录运行 `node apps/storybook/scripts/measure-docs-loading.mjs` 更新 `docs-loading-heights.json`。

Docs 和 Properties 默认共用 `--yami-docs-preview-background`。浅色主题的示例区略浅于代码区，深色主题使用 `--surface-secondary`。需要演示特定承载背景时，在对应示例上设置 `previewBackground`，让背景覆盖整个展示区。代码片段中也应展示调用方使用的背景。

## 预览模式

根据组件的展示和交互范围选择 `previewMode`。侧栏的 PC / Mobile Story 提供独立的设备预览。

| 模式 | 适用场景 | 行为 |
| --- | --- | --- |
| `viewport`（默认） | 可在卡片内完整演示的组件 | 随整个 Storybook 窗口响应，示例内容限制在卡片可见区域内。独立打开 Docs 时使用当前视口。Properties 的设备标签可指定宽度。 |
| `document` | 示例如 AlertDialog、Dialog、Drawer，跟随 Docs 窗口宽度的全局模态 | 弹层挂载在 Docs 文档，遮罩覆盖整个 Docs 视口。通过侧栏 Story 查看指定设备。 |

## Docs 验收

- 单组件 Docs 改动覆盖该组件受影响的页面。共享模板改动覆盖所有接入受改模板的页面，可用自动化批量核对入口及渲染，并按受影响的功能回归交互。
- 在中英文、浅色和深色、桌面和窄屏下检查受影响的布局。按改动核对示例及复制代码、代码展开和收起、上一页和下一页导航、API 表格的属性与公开契约是否一致。页面提供安装说明或安装方式切换时，核对链接、命令和切换后的可复制内容。
- 涉及 Properties 时，核对侧栏入口排列在 Docs 与设备 Story 之间，并按[接入 Properties](#接入-properties)检查设备切换、属性保留和可复制 JSX。
- 涉及全局模态时，执行[模态示例验收](#模态示例验收)。

## 模态示例验收

- 实际打开组件的 Docs 和 Properties 页面（如有）并触发弹窗，确认遮罩覆盖卡片外的正文和目录，弹层定位以文档视口为准。分别在桌面和移动视口验证组件的响应式布局。
- 通过取消或 Escape 关闭，检查焦点回到原触发器。修改预览布局或 Portal 时复用 [Docs 浏览器回归测试](../tests/ComponentDocsTemplate.browser.test.tsx)，同时断言布局、遮罩边界和焦点。
