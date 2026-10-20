---
name: yami-create-component
description: "Create new shared YAMI design-system components in this repository, including implementation, Storybook, usage docs, public exports, Catalog/Registry registration, and verification. Use for 新建组件、创建组件、将新组件加入组件库. For page-only composition or changes to existing components, use yami-design-system."
---

# YAMI 新建组件

把一个新组件交付为可被项目使用、可在 Storybook 查看、契约与文档齐全的组件包。这个技能负责新增组件的完整流程；品牌、视觉与交互规范以项目现有设计系统为准。

本文路径以仓库根目录为基准；Markdown 链接相对本文件。执行命令前定位仓库根目录，保留已有未提交改动。仅创建技能或解释流程时，不执行下列组件创建操作。

## 1. 确定组件边界和参照

- 阅读 [设计系统技能](../../../packages/design-system/SKILL.md)、[精简规范](../../../packages/design-system/DESIGN.compact.md) 和 [完整规范](../../../packages/design-system/DESIGN.md)。实际实现前，以完整规范中的当前 token、组件职责和规则为准。
- 查阅 [Catalog](../../../packages/design-system/generated/catalog.json) 和 [组件目录](../../../packages/design-system/components)，确认需求不能通过已有组件或组合直接解决。页面级业务编排放在 `packages/prototypes/pages/`，不要塞入共享组件。
- 选择最接近的已维护组件，阅读其实现、CSS、`meta.json`、`usage.md`、`examples.tsx`、Story 和导出。布局组件可参考 [AspectRatio](../../../packages/design-system/components/AspectRatio)；受控交互可参考 [QuantitySelect](../../../packages/design-system/components/QuantitySelect)；成熟组合组件可参考 [ButtonGroup](../../../packages/design-system/components/ButtonGroup)。复制约定，不复制无关能力。
- 简要说明组件职责、名称、必要 props、受控状态/回调、响应式行为和验收条件。只在缺失信息会改变行为或公共 API 时询问；能由现有规范决定的实现细节直接处理。
- 有设计稿时使用真实的设计证据；缺少 Figma 绑定时记录未绑定，不编造 nodeId、componentKey 或已核验结论。

## 2. 创建组件包并实现

使用 PascalCase 的组件目录和公共符号，按相邻组件风格创建：

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

- 使用 React、TypeScript 和项目已有基础组件；共享包不得依赖 Next.js、应用路由、Design Labs 或其他应用运行时。优先使用已安装的 Base UI 原语处理复杂键盘/焦点行为。
- 公开 props 只覆盖已确定的使用场景；业务请求、商品数据获取、页面导航和异步业务状态由宿主负责。支持真实需要的 HTML 属性、ref、可访问名称与状态传递。
- 优先消费现有语义 token；需要新增 token 时修改 `tokens/**/*.tokens.json` 的源文件，再生成产物，不手改 `generated/tokens.css`。
- 遵循完整规范的语义颜色、字号、圆角、触达尺寸、键盘焦点和禁用状态。导航使用真实链接，操作使用按钮。移动端保留按下/焦点反馈，不引入桌面鼠标 hover 效果。
- 覆盖必要的长文本、窄容器、禁用、加载、空状态等边界；仅实现该组件实际拥有的状态，不替宿主增加业务流程。

## 3. 写真实契约、示例和文档

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

## 4. 接入 Storybook

- `apps/storybook/.storybook/main.ts` 已自动发现 `components/**/*.stories.tsx`，新增常规组件无需修改扫描配置。
- canonical Story 文件绑定 `component`，使用 `Meta<typeof Component>` 和 `StoryObj<typeof meta>`。至少导出真实的 `Showcase`；需要操作 props 时提供 `Playground` 和合适的 Controls。
- 按职责加入相邻组件所在的现有分组；基础组件通常在 `YAMI/Components/...`，商业组合模块按现有约定在 `YAMI/Modules/Commerce/...`。元数据 `category` 与 Storybook 分组不是同一套枚举。
- 保留 PascalCase 的源文件名、组件名和 TypeScript 导出。侧栏与搜索的显示大小写由 [共享格式化函数](../../../apps/storybook/.storybook/sidebar-label.ts)、[索引配置](../../../apps/storybook/.storybook/main.ts) 和 [manager 配置](../../../apps/storybook/.storybook/manager.ts) 统一处理：普通文字及 `pc` 小写，YAMI、SKU 等缩写保留大写。不要通过批量重命名源码、改文档正文或 CSS 强制小写实现该规则。
- Story 的 `name` 是展示文案，导出名参与 Story ID；不要为改显示名称随意重命名已有导出或 `meta.id`。文档页主标题应保留源定义，不跟随导航格式化改正文。
- 使用全局 `locale`/`theme`；涉及响应式时复用 `preview.tsx` 的现有 viewport 值，并按相邻 Story 的 `globals.viewport` 方式设置。展示真实需要的 PC/mobile、Light/Dark、中文/英文和边界状态。
- 交互 Story 的 `play` 验证可观察结果，如回调、选中状态、键盘操作、关闭及焦点恢复。Portal 浮层按实际挂载位置查询；隐藏测试用例可沿用 `!dev`，不要把主 Showcase/Docs 一并隐藏。
- 草稿展示沿用现有 Draft/version/tag 约定，明确标识未完成部分；稳定的公开组件必须有可查看的 Showcase 和文档，不以草稿豁免代替交付。

## 5. 导出、登记和生成

1. 在组件的 `index.ts` 导出组件与公共类型，并加入 [components/index.ts](../../../packages/design-system/components/index.ts) 的 barrel。`package.json` 已提供 `./components/*` 子路径；常规新增组件无需再添加一条 package exports。
2. 在 [DESIGN.md](../../../packages/design-system/DESIGN.md) 的 Components 区添加精确格式的登记标题：

   ```markdown
   ### ComponentName — `components/ComponentName/`
   ```

   替换为实际名称，补充职责、API/状态、token 和文档链接。`check:components-in-doc` 会检查目录与此标题的双向一致性。
3. 从根目录运行 `pnpm generate`，生成 token、Catalog、Registry v2 和迁移索引。Catalog 从 `components/*/meta.json` 发现组件；Registry 自动读取组件包、契约、Story 和示例并计算内容摘要。不要手写 generated JSON 或摘要，也不要宣称这是 shadcn registry。
4. 留意 stable 首次注册的顺序：`generate:registry` 的前置契约检查要求 stable 组件已存在 registry item。新组件先以 experimental 生成条目；满足 stable 的公开导出、Showcase、交互证据和 registry 要求后，再按需要提升成熟度并重新生成，不能绕过检查伪造条目。
5. 检查生成 diff 仅包含这次组件及其必要索引变化。不要为新增组件扩大到无关分类重组、现有组件改名、全局视觉调整或发布操作。

## 6. 记录 Changeset 和兼容性

按 [版本维护指南](../../../docs/maintainers/zh/maintain-releases.md) 为实际共享包改动记录 Changeset；组件 `meta.json.version` 不能替代包级变更记录。

本仓库共享包保持 `private: true`，通过 Changesets 配置的 `privatePackages.version: true` 纳入版本记录，`privatePackages.tag: false` 关闭私有包打标签。若 CLI 提示 `No versionable packages found`，检查私有包配置与 ignore，不通过删除包的 private 标记绕过。

1. 在根目录运行 `pnpm changeset`，将生成的 `.changeset/*.md` 纳入本次交付。新增公共组件涉及 `@yami/design-system`；只有实际修改了其他共享包时才一并选择。遵循 [Changesets 配置](../../../.changeset/config.json)，不为已忽略的 `@yami/canvas`、`@yami/storybook` 应用包添加发布记录。仅修改技能说明时不创建组件或共享包 Changeset。
2. 按实际 API 和兼容性影响选择 `patch`、`minor` 或 `major`，遵循已确认的版本决策；级别不明确时与维护者确认。记录新增能力、受影响组件与调用方、参数/默认值是否保持，以及视觉、交互、数据形状的变化。存在破坏性影响时补充迁移步骤、验证范围和已知限制；交付说明记录真实的代码基线与回退基线，尚未形成的 commit 不编造。
3. 运行 `pnpm changeset:status`，检查记录可被解析，待处理状态包含本次实际受影响的包及预期变更级别；同时核对新增 Markdown 的包名和说明。状态命令通过不代表变更描述完整，`pnpm validate` 也不包含此检查。

当前配置关闭自动 Changelog 和自动提交，Changeset 不代表已发布或已部署；版本发布与部署按单独获授权的流程处理。

## 7. 验证可用性和交付

按风险写能够发现实际错误的测试：组件逻辑/语义用 `packages/design-system/tests/` 的单元测试，键盘、浮层、真实布局和响应式用 Story `play` 或 `apps/storybook/tests/` 的浏览器测试。不用实现细节断言代替用户可观察行为。

从根目录执行当前项目检查，并按实际修改选择定向用例：

```sh
pnpm check:design-system-contracts
pnpm check:generated
pnpm validate
pnpm --filter @yami/storybook build
pnpm check:docgen
pnpm changeset:status
```

定向测试可通过 `pnpm --filter @yami/design-system exec vitest run` 或 `pnpm --filter @yami/storybook exec vitest run --project=browser` 追加实际测试文件路径；Story 的行为用 `--project=storybook` 追加实际 Story 文件路径。需要完整 Storybook/浏览器回归时运行 `pnpm test:storybook`，使用项目脚本已有的隔离安排。

在浏览器验证新组件能从侧栏和搜索打开、Docs 使用说明及 Controls 能显示、公共包导入可用；检查相关尺寸、语言、主题、键盘和焦点行为。确认正文、旧页面和已有链接没有被改名或丢失。构建成功不等于这些行为已验证。

完成时简要报告：组件 API 与状态、Storybook 入口、文档与公开导出、生成/注册结果、Changeset 路径与受影响包/变更级别、兼容性和迁移要求、已运行且通过的检查，以及仍未验证或未定稿的部分。测试失败时先确认是否由本次新增引起；不掩盖失败、不修改无关功能，也不把未验证内容标为已完成。
