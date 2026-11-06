---
slug: consume-package
title: 在现有项目使用 YAMI
description: "在现有 React Web 项目安装本地候选包，接入随版本 Skill 与只读 MCP，并检查升级和回退。"
group: start
order: 25
keywords: ["安装", "组件包", "消费", "Skill", "MCP", "Codex", "升级", "回退"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/yami-design-cli/README.md
  - docs/adr/009-agent-ready-contracts-and-distribution.md
  - packages/design-system/DISTRIBUTION.md
  - packages/design-system/distribution.json
  - packages/design-system/distribution/MCP.md
  - packages/design-system/UPGRADING.md
  - tooling/distribution/upgrade.mjs
---

适合已经有 React Web 项目、希望复用 YAMI 组件与设计规范的团队。按本页完成安装、样式、Skill、MCP 和验证，无需 Fork 整个 YAMI 仓库或运行上游 Storybook。

## 确认支持范围

当前是获授权环境中的本地候选包，尚未发布到 npm 或内部包仓库。

| 项目 | 当前范围 |
| --- | --- |
| 组件包 | `@yami/design-system@0.2.0-candidate.4` |
| 配套 MCP | `@yami/design-system-mcp@0.1.0-candidate.8`，精确绑定上述组件版本 |
| 接入 CLI（可选） | `yami-design-cli@0.1.0-candidate.1` |
| 稳定组件 | Button（含 ButtonLink）、Input、Card、ProductCard、ProductList、HeroBanner、ShortcutRail、Billboard |
| Beta 预览 | `@yami/design-system/components/Header`（含商城首页吸顶页头） |
| 运行环境 | Node 24；React / React DOM `~19.3.1` |
| 已验证宿主 | Next.js 16.4.3 App Router、Vite 8.3.5、TypeScript 6.0.2 |

完整源码、Storybook 与旧 Registry 包含更多组件，它们不等于当前候选包的公开入口。React Native 和其他宿主版本不在本轮验证范围。

YAMI 通过自有版本包、随包 Skill 和只读 MCP 接入消费项目，内部 Registry 维护源码分发契约。shadcn 仅作为结构化分发与 AI 发现、读取契约和示例的思路参考，其 CLI/Registry 兼容层不列入后续计划，也不作为使用 YAMI 的前置条件。

## 获取并校验候选包

向维护者取得同一批组件包和 MCP 原始 tarball，以及按文件名列出的 SHA-512 校验值（`sha512-...` 格式）。使用 CLI 时，一并取得 CLI 原包及其校验值。以下示例将收到的包放在消费项目的 `./.artifacts/` 下，并从项目根目录计算校验值。

```bash
node -e '
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
for (const file of process.argv.slice(1)) {
  const digest = createHash("sha512").update(readFileSync(file)).digest("base64");
  console.log(file, "sha512-" + digest);
}
' ./.artifacts/*.tgz
```

先确认所需文件齐全，再按文件名逐项与维护者提供的值比对。全部一致后再安装。文件缺失或校验不符时，向维护者重新取得对应的原始文件。

## 使用 yami-design-cli 初始化

首版 CLI 是单独的 private 本地候选包，名称与命令均为 `yami-design-cli`。支持 Node 24、npm/pnpm 和独立 Next.js/Vite 应用，目标平台为 macOS/Linux。本次本地验证在 macOS 执行，Linux 验证已配置到独立 CI 作业；workspace 与 Windows 尚不在验证范围。

在消费项目根目录使用已校验的三个 tarball：

```bash
npm install --save-dev ./.artifacts/yami-design-cli-0.1.0-candidate.1.tgz
./node_modules/.bin/yami-design-cli init \
  --design-package ./.artifacts/yami-design-system-0.2.0-candidate.4.tgz \
  --mcp-package ./.artifacts/yami-design-system-mcp-0.1.0-candidate.8.tgz \
  --locale zh --dry-run
```

去掉 `--dry-run` 执行实际初始化。CLI 将组件包装入 dependencies、MCP 包装入 devDependencies，并连接下文相同的项目 Skill 和 MCP 配置。相同内容重复运行不追加；同名内容冲突、产物不匹配或不支持的环境会在安装前停止。安装后失败可能留下已完成的依赖或配置变更，按报错阶段检查并恢复已审查的产物与 lockfile。

```bash
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` 只读检查安装内容、版本、Skill、MCP 配置，并实际查询规范、组件契约和示例；成功退出码为 0，阻塞时非零。它不调用模型，也不代表页面视觉与行为验收通过。

CLI 不修改页面入口、全局 reset、AGENTS.md、客户端信任或全局配置。按下文加载样式，重连受信任的客户端，再执行消费应用检查。可用 `--cwd` 指定应用，`--package-manager npm|pnpm` 明确包管理器；tarball 相对路径按命令执行目录解析。以下手动流程仍可单独使用。

## 安装并锁定产物

手动接入时，在消费项目根目录先安装组件包，再将同批 MCP 包加入开发依赖：

```bash
npm install ./.artifacts/yami-design-system-0.2.0-candidate.4.tgz
npm install --save-dev ./.artifacts/yami-design-system-mcp-0.1.0-candidate.8.tgz
```

将消费项目的 `package.json` 和 lockfile 一起提交，原始 tarball 保存在团队授权的产物位置。新机器或 CI 先取回并校验同一批文件，将它们放到 `file:` 引用记录的路径。使用项目内的相对路径便于在不同机器恢复。

在需要验证 CLI 和 MCP 的环境中保留开发依赖，使用 `npm ci` 或 `pnpm install --frozen-lockfile` 按锁文件还原安装。

如果已有的 MCP 配置来自旧环境，安装后按[配置项目只读 MCP](#configure-project-read-only-mcp)更新本机的 Node 路径、MCP 入口和工作目录，再运行 `doctor` 或在 Codex 中查询。

GT Walsheim 字体仍受原有许可限制。确认目标环境可使用后再加载字体入口；不要把缺失字体的预览当作品牌视觉验收通过。

## 加载样式并使用组件

Next.js 在 `app/layout.tsx`，Vite 在 `src/main.tsx` 加载一次：

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

`base.css` 会影响全局排版、标题和链接。既有项目应先检查宿主 reset；局部接入可以省略它，但必须自行维护宿主基线并验证所用组件。不要复制 Token 数值或私有组件样式。

```tsx
'use client';
import { Button } from '@yami/design-system/components/Button';

export function SaveButton() {
  return <Button htmlType="button" onClick={() => window.alert('Saved')}>Save</Button>;
}
```

示例中的反馈需替换为真实业务行为。事件回调和受控状态放在消费方 Client Component 中。在 `html` 声明 `lang="en"` 或 `lang="zh"`，深色主题添加 `dark` class。省略字体入口时，宿主需提供已获授权的字体加载方式。

## 让 Codex 发现随包 Skill

以下以包安装在项目根目录为例。monorepo 应按实际安装应用调整路径，不能指向另一 checkout 的知识文件。

新建 `.agents/skills/yami-consumer/SKILL.md`：

```markdown
---
name: yami-consumer
description: 在当前项目制作或检查 YAMI 品牌的 React 界面时使用，读取实际安装版本的规范、契约和示例。
---

先读取 ../../../node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.zh-CN.md。
按相邻 index.json 确认安装版本，仅使用索引中的公开组件。
通过 yami_design_system MCP 读取所用组件的契约与示例，每次核对 snapshot。
缺少组件时说明缺口，不编造 API，不回退到其他版本的全局 Skill。
遵守当前项目的修改范围和验证要求；本 Skill 不授权发布。
```

也可在项目根目录的 `AGENTS.md` 中写入读取约定，使用根目录下的 `node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.zh-CN.md` 路径。不要照抄上述相对于 Skill 目录的 `../../../` 前缀。查找实际安装入口：

```bash
node -p "require.resolve('@yami/design-system/skill/zh')"
node -p "require.resolve('@yami/design-system/knowledge/index.json')"
```

本页配置引导现有 AI 工具读取包内知识，不会安装独立 Agent，也不证明模型生成结果已通过验收。

## 配置项目只读 MCP

在消费项目根目录运行以下命令，依次取得本机的 Node 路径、MCP 入口和项目目录。

```bash
node -p "process.execPath"
node -p "require.resolve('@yami/design-system-mcp/cli')"
pwd -P
```

将三个结果分别填入项目 `.codex/config.toml` 的 `command`、`args` 和 `cwd`。如果已有 `[mcp_servers.yami_design_system]`，更新该表的路径并保留项目的其他配置。

```toml
[mcp_servers.yami_design_system]
command = "/absolute/path/to/node"
args = ["/absolute/path/returned/by/require.resolve/cli.mjs"]
cwd = "/absolute/path/to/consumer"
enabled_tools = ["list_design_documents", "search_design_documents", "read_design_document", "list_components", "get_component_contract", "get_component_example"]
startup_timeout_sec = 20
tool_timeout_sec = 30
```

项目配置遵循 Codex 的受信任项目规则，参见[官方 MCP 文档](https://developers.openai.com/codex/mcp)。如果使用 `command = "node"`，Codex 和 `doctor` 的 PATH 都应解析到同一个 Node 24。

```bash
codex mcp get yami_design_system --json
```

上面的命令用来检查配置。在 Codex 打开并信任消费项目，重启或重连后发起一次实际查询，例如「请直接调用项目的 `yami_design_system` MCP 工具 `list_components`，显示工具返回的 `snapshot`。」

确认 `list_components` 调用成功，并读取实际工具回执里的 `snapshot`。使用 CLI 时，确认 `doctor --json` 的 `status` 为 `pass`，并逐项比对两份 `snapshot`，包括 `packageVersion`、`sourceCommit` 和 `contentDigest`。手动接入时，将快照字段与已安装组件包的 `candidate-manifest.json` 核对。通过后再读取所用组件的契约、示例与规范。服务只对已索引的包内文件提供只读知识查询。

## 验证首次使用

让 AI 完成一个边界明确的小任务，并要求报告：

- 读取的包版本、Skill 路径及 MCP 快照；实际使用的组件契约和示例。
- 修改文件及其业务行为，未提供组件的能力缺口。
- 当前项目的类型检查、生产构建和浏览器验证结果。
- 所用语言、浅深色主题、桌面和移动端、键盘焦点与主要交互。

MCP 查询成功只证明知识可读。页面仍需使用真实组件并通过消费项目自己的检查；不要要求消费项目运行只存在于 YAMI 源码仓库的 `pnpm validate`。

## 升级与回退

1. 保留旧版的两个原始 tarball 及其校验值、消费项目的 `package.json`、lockfile、已验证的快照和页面验收记录。先读新版组件包的 `UPGRADE.json`，确认配对版本、迁移步骤和页面验收要求。
2. 同时更新 `package.json` 中组件包和 MCP 的两个 `file:` 引用，再用当前包管理器运行 `npm install` 或 `pnpm install` 来更新 lockfile。若安装路径变了，按上文更新 MCP 配置。重连 Codex，按相同方法核对新快照，再重新验证页面。
3. 回退时，恢复旧 `package.json`、lockfile 和它们引用的两个原始 tarball，按锁文件重装。检查 MCP 路径并重新连接，确认实际查询返回旧快照，再重跑消费项目的构建和关键浏览器检查。

包内 `UPGRADING.md` 说明版本门禁及其自动检查边界。回退始终使用原始文件。

## 排查常见问题

| 现象 | 处理 |
| --- | --- |
| 找不到包或 CLI | 在实际消费项目中核对依赖与 tarball 路径。使用 CLI 时确认它也已安装 |
| MCP 无法启动 | 检查 Node 24、绝对 CLI 路径、项目目录；协议 stdout 不应混入脚本日志 |
| Codex 看不到 `list_components` | 确认打开的是受信任的消费项目，检查 `codex mcp get yami_design_system --json` 的结果，再重连 |
| 快照版本不符 | 核对精确配对版本、lockfile 与真实安装位置，重启 MCP |
| 样式或字体异常 | 检查 CSS 导入顺序、宿主 reset、字体网络请求和许可范围 |
| 组件或属性不存在 | 查询当前索引与契约，说明缺口，不借用源码库中未开放的入口 |
| 新机器或 CI 无法安装本地路径 | 取回并校验原始 tarball，放到 `file:` 引用记录的路径，再按 lockfile 重装 |
