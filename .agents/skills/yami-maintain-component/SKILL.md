---
name: yami-maintain-component
description: "Create, edit, fix, or migrate shared YAMI components in this repository. Use for 新增组件、编辑组件、接入或迁移 Base UI、调整组件样式/API、维护组件 Docs 和 PC/Mobile Storybook. Covers YAMI tokens, shared Docs templates, compatibility, consumer regression, contracts and registration. For page-only composition or global token design, use yami-design-system."
---

# YAMI 组件维护

完成共享组件的新增、编辑、修复和底层迁移，并同步必要的文档与验证。品牌、视觉和交互规范以项目设计系统为准；按实际任务选择步骤，不因局部修改重做整个组件。

本文路径以仓库根目录为基准；Markdown 链接相对本文件。执行命令前定位仓库根目录，保留已有未提交改动。仅维护技能或分析方案时，不执行组件改动、依赖升级或发布。

## 1. 确认范围、基线和影响

- 阅读 [设计系统技能](../../../packages/design-system/SKILL.md)、[精简规范](../../../packages/design-system/DESIGN.compact.md) 和 [完整规范](../../../packages/design-system/DESIGN.md)。实际实现前，以完整规范中的当前 token、组件职责和规则为准。
- 查阅 [Catalog](../../../packages/design-system/generated/catalog.json) 和 [组件目录](../../../packages/design-system/components)，确认需求不能通过已有组件或组合直接解决。页面级业务编排放在 `packages/prototypes/pages/`，不要塞入共享组件。
- 选择最接近的已维护组件，阅读其实现、CSS、`meta.json`、`usage.md`、`examples.tsx`、Story 和导出。布局组件可参考 [AspectRatio](../../../packages/design-system/components/AspectRatio)；受控交互可参考 [QuantitySelect](../../../packages/design-system/components/QuantitySelect)；成熟组合组件可参考 [ButtonGroup](../../../packages/design-system/components/ButtonGroup)。复制约定，不复制无关能力。
- 检查工作区状态；编辑前用 `rg` 查找组件的公开导出、调用方、样式覆盖、Story、文档和测试，记录现有行为及可复核的 PC/Mobile 基线。迁移尤其关注组合模块、表单、弹层内使用和页面消费者。
- 新增：确认现有组件不能满足需求；编辑：限定到请求的样式、行为或文档；迁移：核对新旧 props、默认值、事件、DOM/ref、受控状态和样式钩子的差异。默认保持既有契约；用户明确要求对齐新 API 时同步调用方和迁移说明，不机械保留旧接口。
- 简要说明本次改动范围、兼容性影响及可验证的完成条件。只在缺失信息会改变行为或公共 API 时询问；能由现有规范决定的实现细节直接处理。
- 有设计稿时使用真实的设计证据；缺少 Figma 绑定时记录未绑定，不编造 nodeId、componentKey 或已核验结论。

## 2. 使用 Base UI 实现 YAMI 组件

新增时使用 PascalCase 目录和公共符号，按相邻组件风格创建；编辑时只更新受影响的文件：

```text
packages/design-system/components/<Name>/
  <Name>.tsx
  <Name>.module.css
  index.ts
  meta.json
  usage.md
  examples.tsx
  <Name>.stories.tsx
```

CSS 文件只在有组件样式时创建；只有真实设计绑定需要维护时才添加 `<Name>.figma.tsx`。有必要的测试按现有位置放在 `packages/design-system/tests/` 或 `apps/storybook/tests/`，不创建空测试、占位文件或无依据的变体。

- 先查看 [共享包依赖](../../../packages/design-system/package.json)、锁文件和已安装 `@base-ui/react` 的 exports/类型/实现。需要查阅上游时使用 Base UI 官方文档及源码，并核对版本；“同步最新规则”不意味着自动升级依赖。
- 交互和无障碍行为优先由 Base UI 原语管理；YAMI 管理视觉、token、尺寸和业务所需的公共接口。组合方式可参考 shadcn/ui 的 Base UI 版本，但不能把它的封装名称当作 Base UI 导出，也不照搬其视觉样式。
- 没有对应原语时，按实际需要使用原生 HTML/CSS 或 Base UI 的 `useRender`/属性合并工具；参考现有 AspectRatio、Badge，不能虚构 `@base-ui/react/badge` 等入口。不要为静态展示强加状态层，不重新引入 UI SDK。
- 使用 React、TypeScript 和项目已有基础组件；共享包不得依赖 Next.js、应用路由、Design Labs 或其他应用运行时。保留 Base UI 所需的事件、ref、ARIA 和 data 属性，避免二次维护同一套键盘、焦点或开关状态。
- 公开 props 只覆盖已确定的使用场景；业务请求、商品数据获取、页面导航和异步业务状态由宿主负责。支持真实需要的 HTML 属性、ref、可访问名称与状态传递。
- 优先消费现有语义 token；需要新增 token 时修改 `tokens/**/*.tokens.json` 的源文件，再生成产物，不手改 `generated/tokens.css`。
- 遵循完整规范的语义颜色、字号、圆角、触达尺寸、键盘焦点和禁用状态。导航使用真实链接，操作使用按钮。移动端保留按下/焦点反馈，不引入桌面鼠标 hover 效果。
- 覆盖必要的长文本、窄容器、禁用、加载、空状态等边界；仅实现该组件实际拥有的状态，不替宿主增加业务流程。

## 3. 同步真实契约、示例和文档

以 [component schema](../../../packages/design-system/schema/component.json) 和 [契约检查器](../../../tooling/design-system/check-contracts.mjs) 为准填写 `meta.json`，不要从邻居复制未实现的声明。

| 字段 | 当前项目约定 |
| --- | --- |
| `$schema`、`name` | `$schema` 为 `../../schema/component.json`；`name` 必须等于 PascalCase 目录名 |
| `category` | 只能使用 `action`、`composite`、`display`、`form`、`layout`、`navigation` |
| `status`、`version` | 状态只允许 `experimental`、`beta`、`stable`；版本遵循语义化版本，不能把 `draft` 写进 status |
| `description`、`figma` | 描述实际职责；未绑定设计时使用真实的 null/说明 |
| `props`、`variants` | 与实现的类型、必要性和默认行为一致 |
| `exports`、`composes` | 写实际公开符号、类型及真正组合使用的组件 |
| `tokens`、`tokenBindings`、`rules` | 引用存在的 token/ruleId；绑定对应真实 CSS 属性、选择器和必要媒体条件，绑定 token 也必须列入 tokens |
| `accessibility` | 记录实际语义、键盘行为、焦点、名称及触达尺寸，不把声明当成已通过的测试 |
| `dependencies` | 显式列出 `runtime`、`peer`、`devOnly`，与真实依赖匹配 |
| `usageRef`、`examples` | `usageRef` 为 `./usage.md`；示例为可解析的 `./examples.tsx#NamedExport` 等真实文件与命名导出 |
| `testing` | 交互组件用有意义的 `play` 验证行为；纯布局组件可以声明 `interaction: not-applicable` 并说明理由 |

新组件在证据尚不完整时先用 `experimental`；已有明确成熟度要求时按真实证据处理。不要仅为通过检查而标记 stable、声称测试已覆盖或把交互标为不适用。

`examples.tsx` 提供可直接运行的公共 API 用法。`usage.md` 解释何时使用、何时不使用、组件与宿主职责、props/默认值、状态、响应式、无障碍及使用示例。中英文分段可使用文档加载器支持的格式：

```markdown
<!-- locale:zh -->
# ComponentName — 使用说明

<!-- locale:en -->
# ComponentName — Usage
```

将示例中的 ComponentName 替换为实际名称，并写入完整说明。每个语言段从一级标题开始；不要新增与已有 Docs 模板重复的说明页面。

## 4. 复用 Docs 模板并维护 Storybook

### Docs

先读 [模板接入说明](../../../apps/storybook/.storybook/component-docs-template.md)，以当前模板源码为准，避免在技能中维护第二份尺寸和颜色规范。

- 常规页面复用 [ComponentGuide](../../../apps/storybook/.storybook/component-guide.tsx)，参考 [AspectRatio Docs](../../../apps/storybook/.storybook/aspect-ratio-docs.tsx)。特殊组合内容参考 [Accordion Docs](../../../apps/storybook/.storybook/accordion-docs.tsx)，仍使用 [ComponentDocsTemplate](../../../apps/storybook/.storybook/component-docs-template.tsx) 及其 `DocsExample`、`CodeBlock`、`Installation`、`DocsApiTable`。
- 新增或明确重做 Docs 时接入共享模板，并在 [Docs 路由](../../../apps/storybook/.storybook/component-docs.tsx) 注册。局部组件修复不顺带迁移其他文档。章节采用简介与主示例、安装、用法、组合结构、必要示例、API；只展示真实支持的能力。
- 使用公开导出的 YAMI 组件，确保示例代码与预览、API 表格、复制页面内容一致。文案提供中英文并复用全局 locale/theme；需要更新属性说明时同步 [属性说明字典](../../../apps/storybook/.storybook/arg-descriptions.ts)。
- 按侧栏顺序配置上一/下一组件和真实 Story ID；首尾仅省略不存在的方向。保留已有 URL、锚点及入口。
- 沿用模板的代码折叠、复制、固定行号、隐藏横向滚动条、圆角、表格描边、按钮反馈和响应式样式，不另写一套。文档图标沿用 Lucide 16px / 2px 线宽，不改变真实组件图标。文档布局断点不能替代组件设备断点。
- 不增加 Overview/Properties 页签、框架切换栏、RTL 章节或 Storybook Controls；需要演示属性时使用真实组件示例。不要把 Storybook Source 再套进模板代码块形成嵌套。

### Stories

- [main.ts](../../../apps/storybook/.storybook/main.ts) 自动发现 `components/**/*.stories.tsx`；基础组件使用平铺 `YAMI/Components/<Name>`，商业组合模块沿用 `YAMI/Modules/Commerce/...`。`meta.json.category` 与侧栏分组分开维护。
- canonical Story 绑定 `component`，使用 `Meta<typeof Component>`、`StoryObj<typeof meta>`，保留真实 `Showcase` 供契约、Registry 和交互测试使用。现有 Playground/测试 Story 按需要保留，不作为额外可见入口。
- 可见入口为 **Docs、PC、Mobile**；参考 [Select Stories](../../../packages/design-system/components/Select/Select.stories.tsx) 的设备预览：`component-device`、`dev`、`autodocs`、`!test` tags，`globals.viewport` 使用现有 `yamiDesktop`/`yamiMobile`，`play: undefined`。隐藏的行为 Story 继续参与测试。不要让预览一打开就自动执行交互。
- 保留组件名的大小写以及现有 `meta.id`、Story 导出和 URL；不要为调整显示名称批量改名。草稿组件按现有 Draft/version 约定处理，不能借草稿豁免公开组件的文档与验收。
- `play` 验证可观察行为，Portal 按实际挂载位置查询。PC/Mobile 页面复用全局语言、主题和 viewport，不另建平行状态。

## 5. 导出、登记和生成

新增时完成全部登记；编辑时核对并更新实际受影响的契约、导出和产物。

1. 在组件的 `index.ts` 导出组件与公共类型，并加入 [components/index.ts](../../../packages/design-system/components/index.ts) 的 barrel。`package.json` 已提供 `./components/*` 子路径；常规新增组件无需再添加一条 package exports。
2. 在 [DESIGN.md](../../../packages/design-system/DESIGN.md) 的 Components 区添加精确格式的登记标题：

   ```markdown
   ### ComponentName — `components/ComponentName/`
   ```

   替换为实际名称，补充职责、API/状态、token 和文档链接。`check:components-in-doc` 会检查目录与此标题的双向一致性。
3. 从根目录运行 `pnpm generate`，生成 token、Catalog、Registry v2 和迁移索引。Catalog 从 `components/*/meta.json` 发现组件；Registry 自动读取组件包、契约、Story 和示例并计算内容摘要。不要手写 generated JSON 或摘要，也不要宣称这是 shadcn registry。
4. 留意 stable 首次注册的顺序：`generate:registry` 的前置契约检查要求 stable 组件已存在 registry item。新组件先以 experimental 生成条目；满足 stable 的公开导出、Showcase、交互证据和 registry 要求后，再按需要提升成熟度并重新生成，不能绕过检查伪造条目。
5. 检查生成 diff 仅包含这次组件及其必要索引变化。不要扩大到无关分类重组、组件改名、全局视觉调整或发布操作。

## 6. 记录 Changeset 和兼容性

按 [版本维护指南](../../../docs/maintainers/zh/maintain-releases.md) 为实际共享包改动记录 Changeset；组件 `meta.json.version` 不能替代包级变更记录。

本仓库共享包保持 `private: true`，通过 Changesets 配置的 `privatePackages.version: true` 纳入版本记录，`privatePackages.tag: false` 关闭私有包打标签。若 CLI 提示 `No versionable packages found`，检查私有包配置与 ignore，不通过删除包的 private 标记绕过。

1. 在根目录运行 `pnpm changeset`，将生成的 `.changeset/*.md` 纳入本次交付。新增公共组件涉及 `@yami/design-system`；只有实际修改了其他共享包时才一并选择。遵循 [Changesets 配置](../../../.changeset/config.json)，不为已忽略的 `@yami/canvas`、`@yami/storybook` 应用包添加发布记录。仅修改技能说明时不创建组件或共享包 Changeset。
2. 依据实际 API、兼容性影响和当前发布规范选择 `patch`、`minor` 或 `major`，遵循已确认的版本决策；仅在无法从任务与规范确定且会影响交付时澄清。记录新增能力、受影响组件与调用方、参数/默认值是否保持，以及视觉、交互、数据形状的变化。存在破坏性影响时补充迁移步骤、验证范围和已知限制；交付说明记录真实的代码基线与回退基线，尚未形成的 commit 不编造。
3. 运行 `pnpm changeset:status`，检查记录可被解析，待处理状态包含本次实际受影响的包及预期变更级别；同时核对新增 Markdown 的包名和说明。状态命令通过不代表变更描述完整，`pnpm validate` 也不包含此检查。

当前配置关闭自动 Changelog 和自动提交，Changeset 不代表已发布或已部署；版本发布与部署按单独获授权的流程处理。

## 7. 按风险验证并交付

先运行能发现本次回归的定向检查，再完成相应交付检查。不要用只匹配实现文字的断言代替行为验证，也不要为可逆的低影响样式调整新增冗余测试。

| 改动 | 验收重点 |
| --- | --- |
| 新增组件 | 公共包导入、契约/注册、Docs/PC/Mobile 入口、核心状态与边界 |
| 样式/尺寸 | PC/Mobile 实际页面、长文本与窄容器、明暗主题、受影响消费者；对比原基线 |
| 行为/API/底层迁移 | 受控与非受控、默认值/事件、禁用与只读、键盘和焦点；表单组件检查提交值、校验及 reset；浮层检查 Portal、碰撞、滚动锁定、Escape 层级与焦点恢复；只检查组件实际支持的行为 |
| Docs/模板 | 中英文、明暗主题和窄屏；代码展开/收起、复制代码/页面、安装切换、上一/下一导航、API 表格；共享模板修改检查所有已接入页面 |
| 仅技能说明 | 技能格式、入口引用和本地链接、规则与当前源码的一致性；不要求组件构建、生成或 Changeset |

组件逻辑/语义使用 `packages/design-system/tests/`；真实布局、键盘、浮层和响应式使用 Story `play` 或 `apps/storybook/tests/`。底层迁移和 API 改动还要验证实际调用模块/页面；单个组件 Story 通过不能代替消费者回归。行为预期以已安装 Base UI 的实际契约为准，不把焦点与选择等不同状态混为一谈。

定向测试通过现有命令追加真实文件路径：

```sh
pnpm --filter @yami/design-system exec vitest run <test-file>
pnpm --filter @yami/storybook exec vitest run --project=browser <test-file>
pnpm --filter @yami/storybook exec vitest run --project=storybook <story-file>
```

共享组件新增、API 或底层迁移交付执行以下检查；局部样式/Docs 编辑运行定向测试及受影响的契约、生成、构建检查。若任务明确要求完整 review/发布，执行完整检查流程，不能用局部通过替代。

```sh
pnpm check:design-system-contracts
pnpm check:generated
pnpm validate
pnpm --filter @yami/storybook build
pnpm check:docgen
pnpm changeset:status
```

`check:docgen` 必须在本次 Storybook 构建后执行；完整 Storybook/浏览器回归用 `pnpm test:storybook`，沿用脚本的隔离安排。先查当前 package scripts，避免使用已失效的命令。

有 UI 改动时实际打开受影响的 Docs、PC 和 Mobile 页面，确认运行服务来自当前工作区及当前代码。检查点击、键盘、禁用、展开/关闭和响应式等相关状态，以及共享改动影响的页面；只需覆盖本次相关行为。构建通过不等于视觉或交互验收通过；没有变更前证据时，不声称“与原版完全一致”。

交付报告包含实际改动、兼容性/消费者影响、可打开的 Storybook 入口、必要的生成与 Changeset 结果、已通过和未完成的验证。失败先定位原因，不掩盖问题或顺带修改无关功能。提交、推送、合并和部署遵循用户本次授权范围，不由维护技能自动触发。
