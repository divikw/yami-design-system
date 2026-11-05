---
slug: consume-package
title: 在现有项目使用 YAMI
description: "在现有 React Web 项目安装本地候选包，接入随版本 Skill 与只读 MCP，并检查升级和回退。"
group: start
order: 25
keywords: ["安装", "组件包", "消费", "Skill", "MCP", "Codex", "升级", "回退"]
updatedAt: "2026-11-05"
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

当前是获授权环境中的本地候选包，尚未发布到 npm 或内部包仓库。先向维护者取得同一批原始 tarball 及其 SHA-512，不从公共 npm 下载，也不重新构建已交付版本。

| 项目 | 当前范围 |
| --- | --- |
| 组件包 | `@yami/design-system@0.1.0-candidate.5` |
| 配套 MCP | `@yami/design-system-mcp@0.1.0-candidate.2`，精确绑定上述组件版本 |
| 公开组件 | Button（含 ButtonLink）、Input、Card、ProductCard、ProductList |
| 运行环境 | Node 24；React / React DOM `~19.3.1` |
| 已验证宿主 | Next.js 16.4.3 App Router、Vite 8.3.5、TypeScript 6.0.2 |

完整源码、Storybook 与旧 Registry 包含更多组件，它们不等于当前候选包的公开入口。React Native 和其他宿主版本不在本轮验证范围。

YAMI 通过自有版本包、随包 Skill 和只读 MCP 接入消费项目，内部 Registry 维护源码分发契约。shadcn 仅作为结构化分发与 AI 发现、读取契约和示例的思路参考，其 CLI/Registry 兼容层不列入后续计划，也不作为使用 YAMI 的前置条件。

## 使用 yami-design-cli 初始化

首版 CLI 是单独的 private 本地候选包，名称与命令均为 `yami-design-cli`。支持 Node 24、npm/pnpm 和独立 Next.js/Vite 应用，目标平台为 macOS/Linux。本次本地验证在 macOS 执行，Linux 验证已配置到独立 CI 作业；workspace 与 Windows 尚不在验证范围。

先取得三个获授权的原始 tarball，在消费应用中执行：

```bash
npm install --save-dev /artifacts/yami-design-cli-0.1.0-candidate.1.tgz
./node_modules/.bin/yami-design-cli init \
  --design-package /artifacts/yami-design-system-0.1.0-candidate.5.tgz \
  --mcp-package /artifacts/yami-design-system-mcp-0.1.0-candidate.2.tgz \
  --locale zh --dry-run
```

去掉 `--dry-run` 执行实际初始化。CLI 将组件包装入 dependencies、MCP 包装入 devDependencies，并连接下文相同的项目 Skill 和 MCP 配置。相同内容重复运行不追加；同名内容冲突、产物不匹配或不支持的环境会在安装前停止。安装后失败可能留下已完成的依赖或配置变更，按报错阶段检查并恢复已审查的产物与 lockfile。

```bash
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` 只读检查安装内容、版本、Skill、MCP 配置，并实际查询规范、组件契约和示例；成功退出码为 0，阻塞时非零。它不调用模型，也不代表页面视觉与行为验收通过。

CLI 不修改页面入口、全局 reset、AGENTS.md、客户端信任或全局配置。按下文加载样式，重连受信任的客户端，再执行消费应用检查。可用 `--cwd` 指定应用，`--package-manager npm|pnpm` 明确包管理器；tarball 相对路径按命令执行目录解析。以下手动流程仍可单独使用。

## 安装并锁定产物

在消费项目目录执行，路径替换为维护者提供的原始文件：

```bash
npm install /absolute/path/yami-design-system-0.1.0-candidate.5.tgz /absolute/path/yami-design-system-mcp-0.1.0-candidate.2.tgz
```

提交消费项目的依赖声明与 lockfile；原始 tarball 保存在团队授权的产物位置。新机器或 CI 必须先取得相同字节的文件，当前没有远端自动分发服务。两个包保持 `private: true`，安装不等于发布。

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

先取得实际 CLI 路径：

```bash
node -p "require.resolve('@yami/design-system-mcp/cli')"
```

把输出替换进项目 `.codex/config.toml`，保留已有配置：

```toml
[mcp_servers.yami_design_system]
command = "node"
args = ["/absolute/path/returned/by/require.resolve/cli.mjs"]
cwd = "/absolute/path/to/consumer"
enabled_tools = ["list_design_documents", "search_design_documents", "read_design_document", "list_components", "get_component_contract", "get_component_example"]
startup_timeout_sec = 20
tool_timeout_sec = 30
```

项目配置遵循 Codex 的受信任项目规则，参见[官方 MCP 文档](https://developers.openai.com/codex/mcp)。只修改当前项目配置，不覆盖全局设置。Node 24 必须在客户端进程的 PATH 中可用。

```bash
codex mcp get yami_design_system --json
```

重启或重新连接客户端后，先调用 `list_components`，再读取所用组件的契约、示例与规范。每个成功查询的 `snapshot` 应与安装包的 `candidate-manifest.json` 一致。服务只读包内索引文件，不提供写文件、安装、生成代码或设计校验工具。

## 验证首次使用

让 AI 完成一个边界明确的小任务，并要求报告：

- 读取的包版本、Skill 路径及 MCP 快照；实际使用的组件契约和示例。
- 修改文件及其业务行为，未提供组件的能力缺口。
- 当前项目的类型检查、生产构建和浏览器验证结果。
- 所用语言、浅深色主题、桌面和移动端、键盘焦点与主要交互。

MCP 查询成功只证明知识可读。页面仍需使用真实组件并通过消费项目自己的检查；不要要求消费项目运行只存在于 YAMI 源码仓库的 `pnpm validate`。

## 升级与回退

升级前保留旧的两个原始 tarball、lockfile 与验证记录。阅读新包 `UPGRADE.json` 的迁移、视觉/交互和回退说明，再成对安装、更新 lockfile、重启 MCP 并重新验证页面。

若失败，恢复旧 tarball 与 lockfile，重新安装并重启 MCP。不得用同版本的新构建覆盖回退文件。包内 `UPGRADING.md` 说明版本门禁及其自动检查边界；类型检查通过不能替代视觉和交互审查。

## 排查常见问题

| 现象 | 处理 |
| --- | --- |
| 找不到包或 CLI | 确认在实际安装应用中执行解析命令，两个 tarball 均已安装 |
| MCP 无法启动 | 检查 Node 24、绝对 CLI 路径、项目目录；协议 stdout 不应混入脚本日志 |
| 快照版本不符 | 核对精确配对版本、lockfile 与真实安装位置，重启 MCP |
| 样式或字体异常 | 检查 CSS 导入顺序、宿主 reset、字体网络请求和许可范围 |
| 组件或属性不存在 | 查询当前索引与契约，说明缺口，不借用源码库中未开放的入口 |
| CI 无法安装本地路径 | 先恢复同一份授权原始 tarball，不能只提交 lockfile 后假定文件可下载 |
