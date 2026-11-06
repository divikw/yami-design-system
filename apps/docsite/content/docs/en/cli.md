---
slug: cli
title: CLI
description: "Use yami-design-cli to initialize an existing React Web project and check its component package, Skill, and MCP connection."
group: start
order: 27
keywords: ["CLI", "yami-design-cli", "init", "doctor", "setup"]
updatedAt: "2026-11-06"
sourceRefs:
  - packages/yami-design-cli/README.md
  - packages/yami-design-cli/src/cli.mjs
---

`yami-design-cli` connects the YAMI component package, packaged Skill, and read-only MCP to an existing standalone Next.js or Vite application. Use Node 24 and the project's local CLI. See [Use YAMI in an existing project](/en/docs/consume-package) for installation and styles.

## init

Follow the [initialization steps](/en/docs/consume-package#initialize-with-yami-design-cli) to install the CLI and supply the verified original component and MCP tarballs. Use `--dry-run` first to review the planned dependency and configuration changes, then remove it to apply them.

| Option | Purpose |
| --- | --- |
| `--design-package` and `--mcp-package` | Select the two local tarballs from the same delivery |
| `--dry-run` | Run preflight and show the plan |
| `--locale` | Select `zh` or `en` for the project's Skill bridge |
| `--cwd` | Select the consumer project directory |
| `--package-manager` | Specify whether the project uses `npm` or `pnpm` |
| `--json` | Print the plan or result as JSON |

For a project that already uses a candidate version, follow [Upgrade and roll back](/en/docs/consume-package#upgrade-and-roll-back) to update the pair first.

## doctor

Run the check from the consumer project root.

```bash
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` checks the installed packages, Skill and project MCP configuration, and runs read-only knowledge queries. When the result reports `status: "pass"`, keep its `snapshot` and use the [MCP verification steps](/en/docs/mcp#verify-the-snapshot) to compare it with the actual Codex tool response. If `mcp_config` fails, start with the [Node and MCP paths](/en/docs/consume-package#configure-project-read-only-mcp).
