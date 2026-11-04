---
name: yami-design-system
description: Build or review YAMI React Web interfaces using the installed @yami/design-system candidate, its versioned design rules, component contracts, and examples. Use for YAMI UI work in consuming projects, not unrelated brands or design-system repository maintenance.
---

# Use the installed YAMI design system

Read [index.json](./index.json) first. Its `packageVersion`, `sourceCommit`, and
`sourceDirty` identify this knowledge snapshot. Compare its version with the
installed `@yami/design-system/package.json` on disk; resolve both from the
consuming project, not a global Skill or another checkout. Stop on a mismatch.

The index's `components` array is the complete importable component inventory for
this candidate. Each entry gives its public import, named exports, maturity,
contract, usage, and a copyable example. `composes` and relative dependencies in
contracts describe implementation relationships, not additional public imports.
If a required capability is absent, explain the gap instead of inventing an API.

Read [the brand overview](./references/DESIGN.compact.md), then the relevant
sections of [the full design rules](./references/DESIGN.md). These are snapshots
of the maintained upstream documents. They describe a larger system; components,
page templates, scripts, and validators mentioned there are not automatically
available in this package. Links marked “upstream reference” are optional source
context at the recorded revision, not dependencies needed to use this snapshot.

Before implementing, read the selected component's contract and usage from the
index. Prefer its packaged example: those files use only this candidate's public
imports and contain no external image requests. Copy the example into the app's
source and connect its callbacks to the app's own behavior. Do not import example
TSX as a library component or assume the example's demonstration state is a
production service. Upstream snippets in usage/spec documents may need adaptation
to the candidate inventory.

Use semantic CSS variables from the indexed Token JSON/CSS. The reference copies
match the runtime tokens byte for byte. Do not invent Token names or copy values
into another stylesheet. Load the actual runtime styles once at the host's global
entry; see the [consumption contract](./references/DISTRIBUTION.md) for versions,
fonts, themes, and client boundaries:

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

Keep actions and navigation distinct: Button performs an action; ButtonLink or a
native anchor navigates with a real href. Preserve the user's labels and actions.
Use the design rules and component usage for emphasis, focus, disabled states,
language, theme, and responsive behavior.

Run the consuming app's type check, production build, tests, and relevant browser
checks. Inspect real states at the supported widths/themes. `pnpm validate` and
the upstream Storybook/Registry scripts belong to the YAMI source repository;
they are not installed by this package. This snapshot does not provide MCP,
shadcn installation, a model runtime, or a standalone design-validation CLI.
