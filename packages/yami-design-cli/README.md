# yami-design-cli

Private local CLI candidate for connecting YAMI design components, the packaged
consumer Skill and read-only MCP to an existing React Web application.
The package name and executable are both `yami-design-cli`.

Requires Node 24, npm or pnpm, and a standalone Next.js or Vite application.
Targets macOS/Linux, Next.js 16.4.3, Vite 8.3.5 and React 19.3.1. Local
verification for this candidate runs on macOS; Linux verification is configured
in the dedicated CI job. Workspaces and Windows are outside the verified scope.
Component and MCP artifacts must use candidate/knowledge schema version 1 and
exactly paired peer versions. The CLI has an independent version.

## Install and connect

Obtain the reviewed original local tarballs in the authorized environment.
Install the CLI in the consuming application's development dependencies:

```bash
npm install --save-dev /artifacts/yami-design-cli-0.1.0-candidate.1.tgz
./node_modules/.bin/yami-design-cli init \
  --design-package /artifacts/yami-design-system-0.1.0-candidate.5.tgz \
  --mcp-package /artifacts/yami-design-system-mcp-0.1.0-candidate.2.tgz \
  --locale zh --dry-run
```

Run the same `init` command without `--dry-run` to apply it. The design package
is an application dependency and the MCP companion is a development dependency.
Installation targets the selected project, includes the MCP companion under
`NODE_ENV=production` and disables lifecycle scripts. Host dependencies must
already be installed and satisfy the candidate's React peers. `init` retains the
React and framework dependency declarations.
Tarball hashes identify supplied bytes; they do not authenticate the publisher.
Keep original artifacts and the lockfile available to other authorized machines.

`init` writes only dependency/lockfile changes through the package manager,
`.agents/skills/yami-consumer/SKILL.md` and the YAMI MCP table in the project's
`.codex/config.toml`. It preserves unrelated TOML text and comments. Matching
configuration is reused; conflicting content, invalid artifacts, symlinked
managed paths and unsupported hosts fail preflight before installation.
Repeated successful initialization makes no further changes.
When the lockfile is missing, `init` runs the selected package manager to create
one from the current dependency declarations and the supplied tarballs.

Use `--cwd /absolute/application` to select another application. Tarball paths
are resolved from the invocation directory. `--package-manager npm|pnpm`
resolves lockfile ambiguity and cannot contradict `package.json`'s declared
manager. `--locale zh|en` selects only the Skill bridge language; default `zh`.
`--json`, `--help` and `--version` are also available.

## Finish the host styles

`init` prints these imports for review at Next.js `app/layout.tsx` (or
`src/app/layout.tsx`) or Vite `src/main.tsx`:

```tsx
import '@yami/design-system/styles/fonts.css';
import '@yami/design-system/tokens.css';
import '@yami/design-system/styles/base.css';
```

Review the host reset and authorized font loading first. `base.css` affects
global typography, headings and links. The CLI does not modify application
source, styles, AGENTS.md, global Skills, Codex trust or global client settings.
See the [consumer guide](https://yds-docsite.vercel.app/zh/docs/consume-package)
for font, theme, client-boundary and public-component contracts.

## Check the connection

```bash
./node_modules/.bin/yami-design-cli doctor
./node_modules/.bin/yami-design-cli doctor --json
```

`doctor` requires the selected package-manager lockfile, reads installed artifact manifests, verifies file digests and knowledge
identity, checks React peers, Skill references and the local MCP configuration,
then starts the verified MCP entry for real stdio queries. It reads the
component inventory, a design document, a component contract and its example;
each response must match the installed snapshot. It does not call a model or
write project files. JSON reports use `schemaVersion: 1`; exit 0 means connection
checks passed, while a nonzero exit means a blocker. Not-run checks remain
explicitly `not_run`.

A project configuration with `command = "node"` is reusable when its PATH
resolves to the same executable that is running `yami-design-cli`.

Reconnect/trust the project in Codex and confirm discovery in the client;
project configuration follows the [official Codex MCP rules](https://developers.openai.com/codex/mcp).
Run the consumer's type check, production build and browser tests. Verify real
fonts, responsive layouts, themes and keyboard interactions. A passing doctor
report does not establish visual acceptance or AI-generated task quality.

## Failure, upgrades and scope

Preflight/dry-run do not modify the application. If package installation or a
later step fails, the CLI reports its phase and exits nonzero; dependency or
configuration changes already completed may remain. Review those files, retain
the original paired tarballs/lockfile and follow the component package's
`UPGRADING.md`. There is no automatic project rollback.

`init` does not upgrade an installed version or replace same-version content.
Install reviewed upgrades through the existing paired-artifact procedure before
reconnecting with `init`/`doctor`. Moving a project or changing a pnpm layout can
change absolute MCP paths; review conflicting configuration before reinitializing.
There is no component source copying, generation, model runtime, remote service
or publishing command. These candidates remain unpublished.

Maintainers run `pnpm test:yami-design-cli`, `pnpm verify:yami-design-cli` and
`pnpm validate` from the YAMI repository. Appending `--native-codex` to the
verifier checks the generated configuration and Skill in the installed Codex
client. That test grants fixture trust only through its subprocess arguments;
it does not change global Codex settings or invoke a model. These repository
checks are not commands installed into the consuming application.
