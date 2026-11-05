---
slug: consume-package
title: Use YAMI in an existing project
description: "Install local React Web candidates, connect the versioned Skill and read-only MCP, and verify upgrades and rollback."
group: start
order: 25
keywords: ["Install", "Package", "Consumer", "Skill", "MCP", "Codex", "Upgrade", "Rollback"]
updatedAt: "2026-11-05"
sourceRefs:
  - docs/adr/009-agent-ready-contracts-and-distribution.md
  - packages/design-system/DISTRIBUTION.md
  - packages/design-system/distribution.json
  - packages/design-system/distribution/MCP.md
  - packages/design-system/UPGRADING.md
  - tooling/distribution/upgrade.mjs
---

For teams that already have a React Web application and want to reuse YAMI components and design knowledge. Follow this page for installation, styles, Skill, MCP and verification without forking the entire YAMI repository or running upstream Storybook.

## Check the supported scope

These are local candidates for the authorized environment. They are not published to npm or an internal package registry. Obtain the original paired tarballs and their SHA-512 values from the maintainer; do not download them from public npm or rebuild delivered versions.

| Item | Current scope |
| --- | --- |
| Component package | `@yami/design-system@0.1.0-candidate.5` |
| Companion MCP | `@yami/design-system-mcp@0.1.0-candidate.2`, bound to that exact component version |
| Public components | Button (including ButtonLink), Input, Card, ProductCard, ProductList |
| Runtime | Node 24; React / React DOM `~19.3.1` |
| Verified hosts | Next.js 16.4.3 App Router, Vite 8.3.5, TypeScript 6.0.2 |

The full source, Storybook and legacy Registry contain more components than the candidate exposes. React Native and other host versions are outside this verification scope.

Consumer projects use YAMI's own versioned package, packaged Skill and read-only MCP; the internal Registry maintains the source-distribution contract. shadcn is a reference for structured distribution, AI discovery and contract/example retrieval. Its CLI/Registry compatibility layer is outside the roadmap and is not a prerequisite for using YAMI.

## Install and lock the artifacts

Run in the consumer project, replacing paths with the original files supplied by the maintainer:

```bash
npm install /absolute/path/yami-design-system-0.1.0-candidate.5.tgz /absolute/path/yami-design-system-mcp-0.1.0-candidate.2.tgz
```

Commit the consumer dependency declarations and lockfile; keep original tarballs in the team's authorized artifact location. A new machine or CI must obtain the same bytes first. There is no remote automatic distribution service. Both packages retain `private: true`; installation does not publish them.

GT Walsheim remains subject to its existing license. Confirm the target environment before loading its font entry; a preview with missing fonts is not a brand visual acceptance result.

## Load styles and use components

Load once in Next.js `app/layout.tsx` or Vite `src/main.tsx`:

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

`base.css` affects global typography, headings and links. Inspect the host reset first; a partial integration may omit it while maintaining its own baseline and verifying the components used. Do not copy Token values or private component styles.

```tsx
'use client';
import { Button } from '@yami/design-system/components/Button';

export function SaveButton() {
  return <Button htmlType="button" onClick={() => window.alert('Saved')}>Save</Button>;
}
```

Replace the example feedback with real application behavior. Keep event handlers and controlled state in consumer Client Components. Declare `lang="en"` or `lang="zh"` on `html`; add the `dark` class for dark mode. If omitting the font entry, provide an authorized host font loader.

## Let Codex discover the packaged Skill

This example assumes installation at the project root. In a monorepo, adapt paths to the actual application; do not point to knowledge in another checkout.

Create `.agents/skills/yami-consumer/SKILL.md`:

```markdown
---
name: yami-consumer
description: Use when creating or reviewing YAMI-branded React UI in this project; read the installed version's rules, contracts and examples.
---

Read ../../../node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.md first.
Confirm the installed version using the adjacent index.json and use only its public components.
Read component contracts and examples through yami_design_system MCP; check every snapshot.
Report missing capabilities without inventing APIs or falling back to another version's global Skill.
Follow the current project's edit scope and verification requirements. This Skill does not authorize publishing.
```

The reading convention can also be placed in `AGENTS.md` at the project root, using `node_modules/@yami/design-system/knowledge/yami-design-system/SKILL.md` relative to that root. Do not copy the Skill directory's `../../../` prefix. Locate the installed entry points:

```bash
node -p "require.resolve('@yami/design-system/skill')"
node -p "require.resolve('@yami/design-system/knowledge/index.json')"
```

This configuration guides existing AI tools to packaged knowledge. It does not install an independent agent or prove generated output has passed acceptance checks.

## Configure project read-only MCP

Resolve the actual CLI path first:

```bash
node -p "require.resolve('@yami/design-system-mcp/cli')"
```

Substitute the output into the project's `.codex/config.toml`, preserving existing settings:

```toml
[mcp_servers.yami_design_system]
command = "node"
args = ["/absolute/path/returned/by/require.resolve/cli.mjs"]
cwd = "/absolute/path/to/consumer"
enabled_tools = ["list_design_documents", "search_design_documents", "read_design_document", "list_components", "get_component_contract", "get_component_example"]
startup_timeout_sec = 20
tool_timeout_sec = 30
```

Project configuration follows Codex's trusted-project rules; see the [official MCP documentation](https://developers.openai.com/codex/mcp). Change the current project's settings without overwriting global configuration. Node 24 must be available in the client's PATH.

```bash
codex mcp get yami_design_system --json
```

Restart or reconnect the client, call `list_components`, then read the contracts, examples and rules used. Each successful query's `snapshot` must match the installed `candidate-manifest.json`. The server reads indexed package files only; it has no file-writing, installation, generation or design-validation tools.

## Verify first use

Give AI a small task with a clear boundary and require a report containing:

- Package version, Skill path, MCP snapshot, and the contracts and examples actually read.
- Changed files, application behavior and missing component capabilities.
- Results from the project's own typecheck, production build and browser verification.
- Languages, light/dark themes, desktop/mobile layouts, keyboard focus and main interactions checked.

A successful MCP query proves knowledge is readable. The page must still use real components and pass the consumer's checks; do not require consumers to run `pnpm validate`, which exists only in the YAMI source repository.

## Upgrade and roll back

Retain both previous original tarballs, the lockfile and verification evidence. Read the new package's `UPGRADE.json` for migration, visual/behavior changes and rollback before installing the pair, updating the lockfile, restarting MCP and rechecking pages.

On failure, restore the previous tarballs and lockfile, reinstall and restart MCP. Never overwrite rollback files with a new build of the same version. The packaged `UPGRADING.md` explains version gates and their limits; type compatibility does not replace visual and interaction review.

## Troubleshoot common problems

| Symptom | Action |
| --- | --- |
| Package or CLI not found | Resolve from the actual application and install both tarballs |
| MCP will not start | Check Node 24, the absolute CLI path and project directory; keep script logs out of protocol stdout |
| Snapshot version differs | Check the exact pair, lockfile and real installation path, then restart MCP |
| Styles or fonts differ | Check CSS order, host reset, font requests and the authorized scope |
| Missing component or prop | Read the current index and contract; report the gap without borrowing unopened source entries |
| CI cannot install a local path | Restore the same authorized original tarballs first; a lockfile alone does not make them downloadable |
