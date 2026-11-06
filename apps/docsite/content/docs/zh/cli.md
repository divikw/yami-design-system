---
slug: cli
title: CLI
description: "用 yami-design-cli 初始化现有 React Web 项目并检查组件包、Skill 和 MCP 的连接。"
group: start
order: 27
keywords: ["CLI", "yami-design-cli", "init", "doctor", "接入"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/yami-design-cli/README.md
  - packages/yami-design-cli/src/cli.mjs
---

`yami-design-cli` 在已有的独立 Next.js 或 Vite 应用中接入 YAMI 组件包、随包 Skill 和只读 MCP。使用 Node 24 和项目本地的 CLI。安装和样式设置见[在现有项目使用 YAMI](/zh/docs/consume-package)。

## init

按[初始化步骤](/zh/docs/consume-package#initialize-with-yami-design-cli)安装 CLI，再传入已校验的组件包和 MCP 原始 tarball。先用 `--dry-run` 查看计划，确认依赖和项目配置后，去掉该参数执行接入。

| 参数 | 用途 |
| --- | --- |
| `--design-package` 和 `--mcp-package` | 指定同批交付的两个本地 tarball |
| `--dry-run` | 只执行预检并列出变更计划 |
| `--locale` | 用 `zh` 或 `en` 选择项目 Skill 桥接文件的语言 |
| `--cwd` | 指定消费项目目录 |
| `--package-manager` | 指定项目使用的 `npm` 或 `pnpm` |
| `--json` | 输出 JSON，便于读取计划和结果 |

接入已有候选版本的项目时，按[升级与回退](/zh/docs/consume-package#upgrade-and-roll-back)先更新配对依赖。

## doctor

在消费项目根目录运行检查。

```bash
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` 只读检查已安装包、Skill 和项目 MCP 配置，并发起实际的知识查询。看到 `status: "pass"` 后，保留 `snapshot`，用 [MCP 验证步骤](/zh/docs/mcp#verify-the-snapshot)和 Codex 的工具回执对照。如果 `mcp_config` 失败，先检查 [Node 和 MCP 路径](/zh/docs/consume-package#configure-project-read-only-mcp)。
