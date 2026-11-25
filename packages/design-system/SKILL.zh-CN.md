---
name: yami-design-system
version: 0.6.0-alpha.1
updated: 2026-10-11
audience: ai-agent
purpose: 为使用 YAMI 品牌制作界面的 AI 提供规范入口。
---

# YAMI 设计系统 — AI Skill 规范

本文件指导 AI 助手（Claude Code、Cursor、OpenAI Codex 等）**按照 YAMI 规范制作可用于生产环境的界面**，遵守品牌和系统规则。它是规范入口的中文版本：先阅读本文件，再按链接继续阅读相关内容。

---

## 适用场景

用户提出以下需求时，使用本 Skill：

- 为 YAMI、亚米或这个亚洲食品品牌生成页面、组件、HTML 原型、JSX 等界面内容，或要求采用 YAMI 风格。
- 实现具体 YAMI 页面，例如商品列表（PLP）、商品详情（PDP）、购物车、主视觉或促销横幅、账户、搜索结果等。
- 创建或更新 YAMI 目录中的组件，例如 Button、Card、Badge、Input、Checkbox、RadioGroup、Divider、AspectRatio、ProductCard、ProductList、HeroBanner、Tabs。
- 检查现有界面是否符合 YAMI 规则。

如果任务属于其他品牌、不依赖设计系统的原型，或不涉及界面的内容写作，**不要使用**本 Skill。

---

## 首先阅读：品牌概览（不超过 30 秒）

打开 [`DESIGN.compact.md`](./DESIGN.compact.md)（约 120 行）。

其中简要说明：

- 两种红色：品牌红 `#FF0000` 与操作红 `#E00000`，以及各自的使用范围。
- 6 个语义圆角槽位（含移动端 Drawer 的 16px 顶部圆角）和 8px 间距网格。
- 字体规则：数字使用 GT Walsheim，中文正文使用 PingFang SC。
- 当前维护的组件类别及其用途。
- 15 条必须遵守的规则。

如果用户只需要项目介绍或入门说明，读到这里即可。

---

## 开始实现前：完整规范与规则

打开 [`DESIGN.md`](./DESIGN.md)（约 860 行）。它是集中维护的**完整设计规范与规则来源**；v0.2.0-alpha.2 将原来的 `DESIGN.extended.md` 与仅包含规则的 `DESIGN.md` 合并到此文件。内容包括：

- **完整 Token 表：** 颜色、字体、间距、圆角、断点和语义别名，每个值都对应 `generated/tokens.css` 中实际存在的 CSS 变量。
- **组件结构：** 当前维护组件的组成，以及 `tokenBindings` 摘要。
- **按主题编排的规则：** 每个 `<!-- rule-id: X -->` 标记位于对应的颜色、字体、间距、组件或图像章节；文末另有中英文规则汇总表。
- **页面原型：** [`../prototypes/pages/`](../prototypes/pages/) 中维护的页面组合。**生成新页面前，先查看最接近的现有页面。**
- **AI 提示词指南：** 颜色速查和 5 份可直接使用的组件提示词，覆盖主视觉、商品卡片、促销横幅、表单字段和弹窗。
- **常见 AI 错误案例：** 5 类反复出现的生成问题，以及规范中的修正方式。
- **错误做法清单：** 中英文列出的禁用实现，例如用 `opacity` 表示禁用状态、悬浮时增加 `box-shadow`、在加购按钮中使用 🛒 表情、编造 Token。
- **快速开始：** 可复制的 `:root {}` CSS 自定义属性和 Tailwind v4 `@theme {}` 代码。

---

## 必须遵守的规则与自动检查范围

规则标记位于 `DESIGN.md` 的对应章节，中英文完整说明见规则汇总表。每个 `<!-- rule-id: X -->` 标记关联 [`principles/principles.ts`](./principles/principles.ts) 及 `principles/validators/X.ts` 中的静态校验器。规则标识如下：

`red-usage`、`semantic-color-only`、`numerals-font`、`type-hierarchy`、`no-custom-radii`、`elevation-on-press`、`no-opacity-disabled`、`focus-style`、`border-strength`、`emphasis-limit`、`card-no-border`、`tap-target`、`no-emoji`、`no-decorative-media`、`token-exists`。

**AI 最容易违反的三条规则：**

- `emphasis-limit`：每屏只允许 1 个强调型 Button，出现 2 个即不符合要求。
- `no-opacity-disabled`：禁用按钮使用 `--button-disabled` 和 `--text-disabled`，不得使用 CSS `opacity`。
- `token-exists`：不得编造尺寸 Token，例如使用不存在的 `heading-lg`，而规范列出的是 `-md`、`-xl`、`-2xl`。文档由 `check:tokens-in-docs` 检查；`validateDesign` 检查已支持的代码模式，不能覆盖所有运行时结果。

---

## 组件目录

生成的 [`catalog.json`](./generated/catalog.json) 是当前组件清单。组件源码及其配套文件位于 [`components/`](./components/)；使用时以各组件的 `meta.json`、`usage.md`、Story 和公开导出为依据。

| 名称 | 类别 | 使用场景 |
| --- | --- | --- |
| [`Button`](./components/Button/meta.json) | 操作 | 执行操作；按钮外观的导航使用 ButtonLink。**每屏最多 1 个强调型按钮。** |
| [`ButtonGroup`](./components/ButtonGroup/meta.json) | 操作 | 相关 Button / ButtonLink 入口，提供分组名称、统一尺寸和 8px 间距。 |
| [`Card`](./components/Card/meta.json) | 布局 | 基础容器，默认不显示边框。 |
| [`Badge`](./components/Badge/meta.json) | 展示 | 状态或促销标签，是允许使用蓝、绿、紫、黄的组件。 |
| [`Input`](./components/Input/meta.json) | 表单 | 文本输入，保留状态边框；键盘焦点使用独立的 2px 蓝色 --focus-ring 外框。 |
| [`Checkbox`](./components/Checkbox/meta.json) | 表单 | 独立选择或多选，选中状态使用中性色。 |
| [`RadioGroup`](./components/RadioGroup/meta.json) | 表单 | 支持方向键导航的单选。 |
| [`Divider`](./components/Divider/meta.json) | 布局 | default（1px）/ emphasis（2px）；独立 inverse 布尔属性；支持横向、纵向。 |
| [`AspectRatio`](./components/AspectRatio/meta.json) | 布局 | 为响应式媒体限制比例，不附加视觉样式。 |
| [`ProductCard`](./components/ProductCard/meta.json) | 组合 | 标准商品卡片，由 Card、AspectRatio、Badge 和 ProductCardAddButton 组成。 |
| [`ProductList`](./components/ProductList/meta.json) | 组合 | 响应式商品集合，支持横向列表和瀑布流布局。 |
| [`HeroBanner`](./components/HeroBanner/meta.json) | 组合 | PC 与移动端共用的响应式首页活动横幅。 |
| [`Tabs`](./components/Tabs/meta.json) | 导航 | 组合式标签导航，触发项必须放在 `TabsList` 内。 |
| [`Pagination`](./components/Pagination/meta.json) | 导航 | 仅 PC 使用的数字分页，1024px 起显示；受控结果更新或原生链接，移动端隐藏。 |
| [`Breadcrumb`](./components/Breadcrumb/meta.json) | 导航 | 层级链接与显式当前页语义；复用 PDP 和文档站样式，由页面控制显示。 |

每个 `meta.json` 声明属性、变体、`tokenBindings`（哪个选择器的哪个属性读取哪个 Token）、使用的规则和无障碍要求。

## 语言与方向

YAMI 页面、组件和 Storybook 的中文与英文默认使用从左到右布局。对齐 shadcn/ui 或 Base UI 时，仅在用户明确要求的情况下加入 RTL 专属 API、配置、Story、示例、Docs 章节或验收测试。保留底层原语的原生行为。

## 模块间距

模块标题与内容上下排列时，由两者共用的 Flex 或 Grid 容器通过 `row-gap` 或 `gap` 控制垂直间距。按布局选用现有间距 Token，将相邻边上的子元素外边距设为零，由 gap 决定实际距离。内容与模块边缘的留白由容器的 `padding` 控制。

## 按行为选择操作入口

- 保存、提交、打开弹窗或生成收据使用 Button；导航和已有文件的直接下载需要按钮外观时，使用带真实 `href` 的 ButtonLink；文字导航使用普通链接。Button 没有 `href`、`as` 或 `asChild` API，不使用点击回调重定向来模拟链接。
- 链接和按钮允许并列，明确对齐、间距、焦点顺序与换行，不要求相同填充。相关 Button 和 ButtonLink 优先使用 ButtonGroup，保持同一尺寸并提供分组名称；普通文字链接与按钮并列时使用普通布局容器。
- 修正视觉时保留用户的标签、目标地址和操作含义，不能为统一外观把“查看订单”替换成“打印订单”。视觉层级按业务优先级选择，并非每张卡片都需要主按钮或红色强调按钮。
- ButtonLink 共享 Button 样式并渲染原生链接，保留链接的激活方式和浏览器操作。支持 inline/full 形态，没有 loading/disabled API；导航不可用时显示静态说明。不在页面中复制 Button 的私有 CSS。具体示例见上述组件用法文档。

## 原型中的 Storybook 与 Registry

- 在生成的 [Catalog](./generated/catalog.json) 中找组件，核对[公开导出](./components/index.ts)，以维护中的 Storybook Story 为视觉和交互依据。
- 只有依赖的组件同时有目录契约和维护中的 Story，才把原型描述为基于组件目录。仅在规范中列出的组件可作设计参考，交付时说明原型中自行实现的部分。
- 内部源码分发使用 [Registry v2](./generated/registry.json) 及其[条目](./generated/registry-items/)核对文件映射、依赖、设计约束和内容摘要。分发范围见 [ADR 009](../../docs/adr/009-agent-ready-contracts-and-distribution.md)。

---

## 验证产物

按改动范围选择检查，从仓库根目录执行。

- **页面或局部 UI 改动。** 在实际 Storybook 或页面预览验证受影响的行为，并运行相关定向检查。核对受影响宽度下的布局、焦点和裁切。
- **共享组件交互改动。** 运行相关 Storybook 或浏览器测试，并在实际调用模块或页面复验。焦点、键盘、Portal 和滚动等行为改动均适用，包括公开 API 保持原样的情况。
- **文档或技能改动。** 检查链接、可运行示例及依赖改动文件的生成产物。
- **新增共享组件、公共 API 变更、底层迁移或跨包改动。** 运行 `pnpm validate`，并验收受影响的消费者。用户要求完整实现验证时也使用该命令。同时运行适用的浏览器检查，Storybook 产物受影响时还需构建 Storybook。

---

## 包边界与隔离

`packages/design-system/` 是供 Canvas、Storybook 和页面原型使用的工作区源码包，必须独立于应用运行环境：

- 不引入 Next.js、Motion、Zod、Design Labs 或 Astryx 运行时模块。
- 不把 Token 数值复制到应用专属样式表中。
- 保持 `tokens/**/*.tokens.json` 为 Token 的唯一来源。

Canvas 和 Storybook 通过公开导出使用该包；页面原型负责页面组合和可序列化的方向解析。

---

## 代码生成流程

用户要求制作 YAMI 页面或组件时：

1. **先匹配现有页面。** 对于商品列表、详情、搜索、首页或活动页，先查看 [`../prototypes/pages/`](../prototypes/pages/)，优先复用最接近的维护页面组合。
2. **先读取使用组件的契约。** 修改或组合组件前，阅读 `meta.json`、`usage.md`、相关 Story 和公开导出，不能只看属性表。操作类组件须阅读 [Button 用法](./components/Button/usage.md) 和 [ButtonGroup 用法](./components/ButtonGroup/usage.md)。不要重新定义 `tokenBindings`。
   实现横向列表前，先确定滚动区域的边界。移动端贴屏幕边缘的列表把内容留白放进滚动容器。卡片或弹层内的列表沿用宿主边界。参考[横向列表布局示例](./components/HorizontalScrollList/usage.md#scroll-boundaries)。
3. **使用语义别名。** 使用 `--text-emphasis`，而不是 `--color-red-500`；使用 `--button-primary`，而不是 `--color-black-900`。组件侧别名位于 `generated/tokens.css` 的 `/* Semantic Aliases */` 部分。
4. **需要独立使用时，复制快速开始代码。** 从 [`DESIGN.md → 快速开始`](./DESIGN.md) 将 CSS 或 Tailwind v4 代码复制到新项目中。
5. **拒绝错误做法。** 对照 [`DESIGN.md → AI 常见错误做法`](./DESIGN.md)；有疑问时，拒绝该做法并说明原因。
6. **最后验证。** 按[改动范围选择检查](#验证产物)。涉及横向列表时，在实际页面预览中执行[窄屏验收](./components/HorizontalScrollList/usage.md#verification)。

---

## 相关文件

| 文件 | 用途 |
| --- | --- |
| [`README.md`](./README.md) | 包概览、目录结构和文案风格速查 |
| [`DESIGN.md`](./DESIGN.md) | AI、研发和 CI 校验共同使用的完整规范与规则 |
| [`DESIGN.compact.md`](./DESIGN.compact.md) | 面向设计师、产品经理和相关成员的 30 秒品牌概览 |
| [`decisions.md`](./decisions.md) | 各项规则与决策的原因 |
| [`CHANGELOG.md`](./CHANGELOG.md) | Token、组件和文档的版本记录 |
| [`content/`](./content/) | 文案风格、中英文规则和文案模式 |
| [`motion/`](./motion/) | 动效模式、时长和缓动 |
| [`generated/tokens.css`](./generated/tokens.css) | 自动生成的 CSS 自定义属性，来源为 DTCG JSON 格式的 `tokens/*.tokens.json` |
| [`principles/`](./principles/) | AST 校验器和同步检查 |
| [`generated/catalog.json`](./generated/catalog.json) | 维护中的 Storybook 组件清单 |
| [`generated/registry.json`](./generated/registry.json) | 确定性的内部源码 Registry |
| [`../prototypes/pages/`](../prototypes/pages/) | 维护中的页面组合和 Storybook Story |
