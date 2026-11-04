# ADR 009 — Agent-ready contracts and distribution

## Status

Accepted for M3.5 implementation on 2026-09-04.

## Context

YAMI already exposes Storybook, component metadata, generated Catalog and Registry files, and an AI
Skill. The component metadata did not have a resolvable schema, Registry v1 omitted the design and
quality evidence an agent needs to select a component safely, and page and Skill validation remained
implicit. Calling that surface shadcn-compatible overstated the current delivery contract.

## Decision

- Treat Storybook as the visual and interaction source of truth, component `meta.json` as the authored
  contract, and Registry v2 as a deterministic internal source-distribution contract.
- Keep stable components available through the private workspace package. Use Registry for source
  bundles, lab components, and future page recipes; do not generate a shadcn registry in M3.5.
- Document a future adapter mapping without making it a current compatibility claim:
  - design-system → `registry:base`
  - primitive action, form, layout, navigation, and display components → `registry:ui`
  - composite components → `registry:component`
  - page recipes → `registry:block` or `registry:page`
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
Remote hosting, general CLI productization, shadcn adaptation and package publication remain deferred.

## Consequences

Registry v2 replaces v1 at the existing generated paths because no runtime consumer of the v1 wire
shape exists in this repository. Consumers must check `schemaVersion`. M3.5 proves readiness for a
small team pilot; it does not prove adoption, remote package publishing, shadcn compatibility, or an
automatic upgrade platform.
