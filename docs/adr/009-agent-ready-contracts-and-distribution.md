# ADR 009 — Agent-ready contracts and distribution

## Status

Accepted for M3.5 implementation on 2026-09-04.
Distribution and AI scope clarified on 2026-11-05.

## Context

YAMI already exposes Storybook, component metadata, generated Catalog and Registry files, and an AI
Skill. The component metadata did not have a resolvable schema, Registry v1 omitted the design and
quality evidence an agent needs to select a component safely, and page and Skill validation remained
implicit. Calling that surface shadcn-compatible overstated the current delivery contract.

## Decision

- Treat Storybook as the visual and interaction source of truth, component `meta.json` as the authored
  contract, and Registry v2 as a deterministic internal source-distribution contract.
- Keep stable components available through the private workspace package. Use Registry for source
  bundles, lab components, and future page recipes.
- Borrow shadcn's distribution and AI-access ideas: explicit component files and dependencies,
  structured discovery, and contract/example retrieval. Implement them through YAMI's own versioned
  package, internal Registry, Skill and MCP. YAMI owns its component APIs, Tokens and knowledge index.
- Require Registry items to carry explicit source/target files, dependencies, documentation, tokens,
  rules, accessibility evidence, interaction coverage, and a deterministic SHA-256 content digest.
- Keep model-independent structural Skill evaluation in CI. Run Codex and Kiro task rehearsals as
  recorded maintainer evidence, without model API calls in CI.
- Defer CLI and MCP productization until the M4 pilot demonstrates repeated workflow friction that
  cannot be addressed through the package, Registry, Skill, and existing repository scripts.

## Read-only MCP pilot — 2026-11-04

After the installable candidate and versioned knowledge distribution landed in PRs #197 and #198,
add a local, read-only MCP pilot. This supersedes the MCP deferral above for that scope.
A separate private companion candidate consumes the exact
installed design-system peer version; MCP SDK dependencies stay outside the React runtime.
It exposes only indexed local design documents, component contracts and consumer examples through
stdio tools and resources. It has no write, install, code-execution, remote-fetch or validation tools.
Remote hosting, general CLI productization and package publication remain deferred.

## Distribution and AI scope — 2026-11-05

This clarification replaces the earlier proposed shadcn adapter mapping. shadcn is a reference for
distribution and AI access, not a compatibility target. shadcn CLI/Registry adaptation is outside
the roadmap; it is not a missing YAMI capability or a release prerequisite.

The current route is an installable YAMI React Web package with versioned design knowledge, a
package-owned consumer Skill, and an optional read-only MCP companion bound to the exact installed
version. Registry v2 remains YAMI's internal source-distribution contract. The independent Next.js
and Vite rehearsals demonstrate package consumption and knowledge queries; they do not demonstrate
AI-generated task quality or adoption in a real business project.

Follow-up order:

1. Finish PR #200's unified consumer entry and upgrade/delivery guards, then verify main-branch checks
   after an authorized merge.
2. Evaluate real AI tasks against the installed package, Skill and MCP: generation, refinement,
   missing-component handling, and type/build/browser results. Keep query success distinct from
   generated-output quality.
3. For an explicitly selected and authorized business-project pilot, preserve verified original
   artifacts and record their paired identities before handoff. Measure discovery, correction,
   upgrade and rollback friction. The current pilot scope excludes Project Board.
4. Expand public components, page examples and supported host versions according to those task and
   consumer results, with contracts and verification for each addition.
5. Use pilot evidence to decide remote artifact retrieval for new machines/CI and a registry delivery
   workflow. Package publication requires separate authorization; packages remain unpublished during
   the current work.

## Consequences

Registry v2 replaces v1 at the existing generated paths because no runtime consumer of the v1 wire
shape exists in this repository. Consumers must check `schemaVersion`. M3.5 proves readiness for a
small team pilot; it does not prove adoption, remote package publishing, or an automatic upgrade
platform. The current distribution and AI scope above governs follow-up work.
