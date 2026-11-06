---
slug: mcp
title: MCP
description: "在 Codex 查询已安装版本的设计规范、组件契约和示例，并核对返回的版本快照。"
group: ai
order: 37
keywords: ["MCP", "Codex", "Skill", "组件契约", "版本快照"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/design-system/distribution/MCP.md
  - tooling/mcp/server.mjs
---

YAMI 的 MCP 提供本地只读知识查询。Skill 指导 AI 如何在项目中使用 YAMI，MCP 则返回已安装组件版本的规范、公开组件、契约和示例。

## 连接 Codex

[CLI 的 init](/zh/docs/cli#init) 可以配置项目级服务 `yami_design_system`。手动接入或移动项目后，按[配置项目只读 MCP](/zh/docs/consume-package#configure-project-read-only-mcp)核对配对版本和本机路径。在 Codex 中打开并信任消费项目，再连接服务。

## 查询组件与规范

| 工具 | 返回内容 |
| --- | --- |
| `list_components` | 当前版本的公开组件、导入路径和示例入口 |
| `get_component_contract` | 指定组件的属性、Token 绑定和无障碍规则 |
| `get_component_example` | 指定组件的 TSX 示例 |
| `list_design_documents` | 可查询的规范、用法和 Skill |
| `search_design_documents` | 与关键词匹配的文档、行号和片段 |
| `read_design_document` | 按文档 ID 分页读取原文 |

## 核对快照

在 Codex 会话中发送这段提示词，确认客户端能读到实际安装的版本。

```text
请直接调用当前项目的 yami_design_system MCP 工具 list_components，显示工具回执中的 snapshot。
如果公开清单里有 Button，再调用 get_component_contract 和 get_component_example，列出 Button 的导入路径和示例名称。
```

确认工具调用成功。用实际回执的 `snapshot` 和 [doctor](/zh/docs/cli#doctor) 的快照逐项比对。手动接入时，对照已安装组件包的 `candidate-manifest.json`。再按[首次使用验收](/zh/docs/consume-package#verify-first-use)检查页面。
