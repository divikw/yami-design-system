# 跨项目消费契约：组件与设计知识候选包

状态：本地候选验证。包名为 `@yami/design-system`，版本由 `distribution.json`
管理，与当前 workspace 包及各组件的版本分别记录。尚未发布到 npm 或内部 Registry。

## 范围

- 公开组件入口：Button（含 ButtonLink）、Input、Card、ProductCard、ProductList。
- 组件的传递依赖随包提供，未列出的组件没有候选包公开入口。
- 默认采用组件现有行为和语义 Token，不复制样式到消费项目。
- React/React DOM 为宿主提供的 peer dependencies；首版范围为 `~19.3.1`。
- 首轮验证 Node 24.18.0、Next.js 16.4.3 App Router、Vite 8.3.5、TypeScript 6.0.2。
  其他版本和原生端尚未验证。
- 同一版本内分发中英文消费方 Skill、设计规范、内容与动效规范、Token、组件契约和可复制示例。
- 这是 React Web 组件候选包。MCP、shadcn 适配、页面模板和模型运行时尚未提供。

## 构建与安装

从 YAMI 仓库根目录执行：

```bash
pnpm pack:design-system-candidate
```

输出位于根目录 `dist/`：候选目录、带版本号的 `.tgz` 及打包回执。
在独立项目安装该 `.tgz`，不要使用指向 YAMI 源码的软链接或路径别名：

```bash
npm install /absolute/path/to/yami-design-system-0.1.0-candidate.3.tgz
```

候选包保留 `private: true`，避免被误发布；本地打包和安装仍然可用。
现有仓库内的 workspace 源码入口及开发方式保持不变。

## 公开导出

```tsx
import { Button, ButtonLink, Input, Card, ProductCard, ProductList } from '@yami/design-system';
// 也可以按组件导入，避免加载不需要的组件入口。
import { Button } from '@yami/design-system/components/Button';
import type { ProductListItem } from '@yami/design-system/components/ProductList';
```

包内提供 ESM JavaScript、`.d.ts` 和 CSS Modules。消费方需要支持 CSS Modules
及 CSS 资源加载；不需要为候选包配置 TypeScript 源码转译。
公开组件入口标记为 React 客户端边界。Next.js Server Component 可以组合组件；
事件回调、受控状态等仍须放在消费方自己的 Client Component 中。

Token 数据与构建身份可以单独读取：

```ts
import tokens from '@yami/design-system/tokens.json';
import candidate from '@yami/design-system/candidate-manifest.json';
```

## 随版本分发的设计知识

消费项目无需读取 YAMI 源码 checkout，也不依赖本地 Storybook 服务。
三个稳定的文件入口可用 Node 的模块解析器定位；Markdown 入口供工具读取，不作为 JS 执行：

```js
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const resolve = createRequire(import.meta.url).resolve;
const indexFile = resolve('@yami/design-system/knowledge/index.json');
const index = JSON.parse(readFileSync(indexFile, 'utf8'));
console.log(index.packageVersion, indexFile);
console.log(resolve('@yami/design-system/skill'));    // English
console.log(resolve('@yami/design-system/skill/zh')); // 简体中文
```

`index.json` 的 `skills`、`references`、组件契约和示例路径均相对于索引所在目录；
`sourceSkill.path` 与 `documents[].source` 是相对于源码仓库根目录的溯源记录。
其 `components` 只列出上述五个公开组件，
包含具名导出、成熟度、组件版本、契约、用法和示例路径；其中导出清单由实际 TypeScript
入口生成。元数据保留原有属性、Token 绑定和无障碍契约，`exports` 与 `examples` 分别
投影为候选包真实导出和经过验证的消费示例。组合依赖不等于独立公开入口。

完整设计规范描述的范围更大，文件顶部会说明可用范围；未收录的组件、仓库脚本等链接
标为 `upstream reference`，固定到快照的源码提交，仅作补充参考。包内已有设计概览、
完整规范、内容与动效规范及组件用法，不要求联网才能读取这些知识。
参考目录中的 Token 与运行时文件逐字节一致。

索引与 `candidate-manifest.json` 记录相同包版本、源码提交及工作树状态；索引还记录
来源 Skill 版本及每份源文档的 SHA-256，外层清单覆盖最终知识文件。不要混用其他版本
的全局 Skill。可在目标项目的 `AGENTS.md` 中添加以下约定，不需要更改全局配置：

```text
制作或检查 YAMI 界面时，先读取
node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.zh-CN.md，
按相邻 index.json 确认安装版本、查阅契约和示例。仅使用索引列出的公开组件。
```

示例是应用源码参考，需复制到消费项目后连接真实业务；不要直接导入包内示例 TSX。
示例只依赖 React 与候选包公开入口，使用中性占位内容，不请求外部商品图片。
随包 Skill 用于引导现有 AI 工具读取规范，不包含 MCP 或 shadcn 安装机制。

## 样式、主题与语言

在应用的全局入口按顺序加载一次：

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

Next.js 使用 `app/layout.tsx`；Vite 使用 `src/main.tsx`。
`tokens.css` 提供 Token 和语言/主题覆盖；`base.css` 提供全局排版及元素基线，
会影响宿主的 `html`、`body`、标题和链接。既有应用应先检查自己的 reset 和全局样式顺序。

在 `html` 上声明 `lang="en"` 或 `lang="zh"`；深色主题在 `html` 上添加 `dark`
class。颜色模式与组件 `inverse` 属性分别使用。不要把 Token 值另存为应用样式副本。

## 字体及其他资产

候选包仅供当前获授权环境中的本地安装与验证。GT Walsheim 字体保留在可选的
`styles/fonts.css` 入口及其关联资源中，受原有许可限制；该入口也加载依赖包提供的
Source Serif 4 Variable 和 Noto Serif SC。候选包不额外打包业务商品摄影或独立 Logo 文件；
组件自身已有的内联图形随实现保留。

本地验证不建立新的分发授权。跨设备交付、上传包仓库或扩大使用范围前，需按
`docs/migration/asset-rights.csv` 和字体许可核实目标范围；字体未经确认时由目标项目
提供已获授权的字体加载方式，不能把缺失字体的预览称为品牌视觉验收通过。

## 身份、兼容与回退

`candidate-manifest.json` 记录包版本、源码提交、工作树是否有改动、组件版本和
成熟度，以及实际打包文件的 SHA-256。`contentDigest` 覆盖回执之外的全部文件；
它表示候选内容，不把带本地改动的构建误标为某个干净提交。

- 已交付的版本不能替换成不同内容；修改候选内容时提升 candidate 序号。
- 兼容修复使用 patch，新增公开能力使用 minor；删除或重命名公开 API/Token、
  不兼容的默认行为使用 major，并附迁移说明。组件版本与候选包版本分别记录。
- API、Token、默认视觉和交互的变化均须说明，不能只依赖类型兼容判断。
- 消费项目锁定 `.tgz` 和 lockfile，保留此前验证过的候选包用于回退。
- 当前只验证明确列出的组件及宿主版本，不把候选包当作全量组件库发布。

## 验证入口

```bash
pnpm test:distribution
pnpm verify:design-system-candidate
```

第二个命令先打包，再在系统临时目录创建两个独立项目，分别安装同一 `.tgz`、
逐文件验证安装内容与构建指纹，通过公开文件入口定位 Skill 和索引，复制包内五个示例，
再执行类型检查和生产构建、启动生产服务并验证原有场景及包内示例的交互。
字体检查要求真实的字体面加载，不能仅凭字体名称可用就通过。它需要网络安装宿主依赖及
本机 Playwright Chromium。命令使用 `tar` 和 POSIX 进程组；Windows 尚未验证。
回执和截图写入仓库根目录 `dist/candidate-verification/`，
保留临时项目路径供复查；该命令不发布包或站点。
