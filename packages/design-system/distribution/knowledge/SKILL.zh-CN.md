---
name: yami-design-system
description: 在消费项目中使用已安装的 @yami/design-system 候选包制作或检查 YAMI React Web 界面，读取对应版本的设计规则、组件契约和示例。适用于 YAMI 界面任务，不适用于其他品牌或设计系统仓库维护。
---

# 使用已安装的 YAMI 设计系统

先读取 [index.json](./index.json)，通过 `packageVersion`、`sourceCommit` 和
`sourceDirty` 确认知识快照身份。与目标项目实际安装的
`@yami/design-system/package.json` 比对版本；两者都从消费项目解析，不使用全局
Skill 或其他源码 checkout 的版本。版本不一致时停止使用该快照并说明问题。

索引中的 `components` 是本候选包完整的可导入组件清单。每项给出公开导入路径、
具名导出、成熟度、契约、用法和可复制示例。契约中的 `composes` 和相对依赖只描述
内部组合关系，不代表新增公开入口。缺少所需能力时说明缺口，不编造组件或属性。
默认使用 `status: stable` 的组件；仅在消费项目明确接入页头预览时使用
`components/Header` 的 Beta 入口。

先读[品牌概览](./references/DESIGN.compact.md)，再按任务读取
[完整设计规则](./references/DESIGN.md)的相关章节。它们由维护中的上游文档生成，
描述的范围大于当前候选包；其中提到的其他组件、页面模板、脚本和校验器不会因此
变成已安装能力。标为“upstream reference”的链接只提供固定源码版本的补充参考，
使用本地知识快照不依赖这些链接。

实现前阅读索引指向的组件契约和用法，优先采用随包示例。这些示例只使用当前候选包
的公开导入，不请求外部图片。将示例复制到应用源码中，再连接真实业务回调；不要把
示例 TSX 当作可直接导入的组件库入口，也不要把演示状态当作生产服务。规范和用法
原文中的上游示例可能需要按当前可用清单调整。

使用索引中 Token JSON/CSS 已声明的语义变量；参考副本与运行时 Token 逐字节一致。
不编造 Token，也不把数值另存为应用样式。在宿主全局入口加载实际运行时样式一次；
版本、字体、主题和客户端边界见[消费契约](./references/DISTRIBUTION.md)：

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

区分操作与导航：Button 执行操作，ButtonLink 或原生链接通过真实 href 导航。
保留用户的文案、目标地址和操作含义。强调层级、焦点、禁用状态、语言、主题和响应式
行为以设计规则和组件用法为依据。

商城首页按用途组合 `HeroBanner`、`ShortcutRail`、`Billboard` 和 `ProductList`。
路由、素材及搜索行为由宿主提供。为活动与快捷入口分别接上实际目的地，使用整张
`8:9` 画布的活动图，并为纯图片链接提供可访问名称。滚动后也要确认搜索仍可操作。

执行消费项目自己的类型检查、生产构建、测试和相关浏览器检查，核对实际状态及目标
屏幕尺寸、主题。`pnpm validate`、上游 Storybook 和 Registry 脚本属于 YAMI 源码仓库，
本包不会安装它们。可选配套 MCP 候选包对相同快照提供只读查询，见
[MCP 接入说明](./references/MCP.md)。YAMI 自行维护包与 AI 接入契约，借鉴 shadcn 的结构化分发与发现思路；shadcn CLI/Registry 兼容不列入后续计划。模型运行时和独立设计校验 CLI 尚未提供。
