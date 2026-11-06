---
slug: mcp
title: MCP
description: "Query design rules, component contracts, and examples for the installed version in Codex, then verify the returned snapshot."
group: ai
order: 37
keywords: ["MCP", "Codex", "Skill", "component contract", "version snapshot"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/design-system/distribution/MCP.md
  - tooling/mcp/server.mjs
---

YAMI MCP provides local, read-only knowledge queries. The Skill guides AI on using YAMI in a project. MCP returns the rules, public components, contracts, and examples for the installed component version.

## Connect Codex

[CLI init](/en/docs/cli#init) can configure the project service `yami_design_system`. For manual setup or after moving a project, follow [Configure project read-only MCP](/en/docs/consume-package#configure-project-read-only-mcp) to check the package pair and local paths. Open and trust the consumer project in Codex, then connect the service.

## Query components and design rules

| Tool | Result |
| --- | --- |
| `list_components` | Public components, import paths, and example entries for the installed version |
| `get_component_contract` | Props, token bindings, and accessibility rules for a component |
| `get_component_example` | A TSX example for a component |
| `list_design_documents` | Available design rules, usage documents, and Skills |
| `search_design_documents` | Matching documents, line numbers, and excerpts |
| `read_design_document` | A page of text from a document ID |

## Verify the snapshot

Send this prompt in a Codex session to verify that the client can read the installed version.

```text
Call the current project's yami_design_system MCP tool list_components and show the snapshot from the tool response.
If Button is in the public list, call get_component_contract and get_component_example for it. Report its import path and example name.
```

Confirm that the calls succeeded. Compare every field in the tool response's `snapshot` with the `snapshot` from [doctor](/en/docs/cli#doctor). For manual setup, compare the fields with the installed component package's `candidate-manifest.json`. Then follow the [first-use checks](/en/docs/consume-package#verify-first-use).
