---
name: yami-design-system
version: 0.6.0-alpha.1
updated: 2026-10-11
audience: ai-agent
purpose: Entry point for AI agents producing UI under the YAMI brand.
---

# Yami Design System — AI Skill Manifest

This file tells an AI agent (Claude Code, Cursor, OpenAI Codex, etc.) **how to use YAMI to produce production-grade UI** without violating brand or system rules. It is the canonical entry point — read this first, then follow its links.

---

## When to use this skill

Trigger this skill when the user asks to:

- Generate any UI artifact (page, component, mockup HTML, JSX) "for YAMI", "in the YAMI style", "for 亚米", or "for the Asian grocery brand".
- Implement a specific YAMI page: product list (PLP), product detail (PDP), cart, hero / promo banner, account, search results, etc.
- Build or update a single component matching the YAMI catalog (Button, Card, Badge, Input, Checkbox, RadioGroup, Divider, AspectRatio, ProductCard, ProductList, HeroBanner, Tabs).
- Validate that an existing artifact conforms to YAMI rules.

Do **not** trigger when the request is for a different brand, a system-agnostic prototype, or content authoring that doesn't produce UI.

---

## First read — brand context (≤ 30 seconds)

Open [`DESIGN.compact.md`](./DESIGN.compact.md) (~120 lines).

It tells you in one screen:
- The two reds (`#FF0000` brand vs `#E00000` operational), what each is allowed on.
- The 6 semantic radius slots (including 16px mobile Sheet top corners), the 8px spacing grid.
- The font story (GT Walsheim for numerals, PingFang SC for CN body).
- The maintained component families and what they do.
- The 15 hard rules as one-liners.

Stop after this if the user just wants a description or onboarding answer.

---

## Implementation read — full spec + rules (when actually generating code)

Open [`DESIGN.md`](./DESIGN.md) (~860 lines). It is the **comprehensive spec + rules SSOT** in a single file (v0.2.0-alpha.2 consolidated the prior `DESIGN.extended.md` and rules-only `DESIGN.md` into one). It contains:

- **Full token tables** — colors, typography, spacing, radii, breakpoints, semantic aliases — every value tied to a real CSS variable from `generated/tokens.css`.
- **Component anatomy** for the maintained components with `tokenBindings` summaries.
- **Rules inline by topic** — each `<!-- rule-id: X -->` marker sits in the section it governs (Colors / Typography / Spacing / Components / Imagery). Plus a **bilingual Hard Rules summary table** at the end for navigation.
- **Page prototypes** — maintained page compositions under [`../prototypes/pages/`](../prototypes/pages/) — **consult the closest existing page before generating a new one**.
- **Agent Prompt Guide** — quick color reference + 5 ready-to-paste component prompts (Hero / ProductCard / Promo banner / Form field / Modal).
- **Known AI Failure Gallery** — 5 documented cases of AI generators repeatedly producing bad output, with the canonical fix.
- **Anti-patterns table** — bilingual list of refuse-on-sight code patterns (e.g. `opacity` for disabled, `box-shadow` on hover, 🛒 emoji on Add-to-Cart, fabricated tokens).
- **Quick Start** — copy-paste `:root {}` CSS Custom Properties + Tailwind v4 `@theme {}` blocks.

---

## Hard rules and automated coverage

Rule markers live inline in `DESIGN.md` topic sections; full bilingual prose is in the Hard Rules summary table. Each `<!-- rule-id: X -->` marker is wired to [`principles/principles.ts`](./principles/principles.ts) and a static validator at `principles/validators/X.ts`. The rule names alone:

`red-usage`, `semantic-color-only`, `numerals-font`, `type-hierarchy`, `no-custom-radii`, `elevation-on-press`, `no-opacity-disabled`, `focus-style`, `border-strength`, `emphasis-limit`, `card-no-border`, `tap-target`, `no-emoji`, `no-decorative-media`, `token-exists`.

**Three rules cause most AI failures**:
- `emphasis-limit` — 1 emphasis Button per screen. Output 2 → instant fail.
- `no-opacity-disabled` — disabled buttons use `--button-disabled` + `--text-disabled`. Never CSS `opacity`.
- `token-exists` — fabricating size tokens (e.g. a `heading-lg` size that doesn't exist — only `-md` / `-xl` / `-2xl` do). CI checks docs with `check:tokens-in-docs`; `validateDesign` checks supported code patterns, not every runtime outcome.

---

## Components catalog

The generated [`catalog.json`](./generated/catalog.json) is the current component inventory. Components ship as source-owned bundles under [`components/`](./components/); use each bundle's `meta.json`, `usage.md`, Story, and public export as its contract.

| Name | Category | When to use |
|---|---|---|
| [`Button`](./components/Button/meta.json) | action | Perform actions; use ButtonLink for button-shaped navigation. **At most 1 emphasis per screen.** |
| [`ButtonGroup`](./components/ButtonGroup/meta.json) | action | Related Button / ButtonLink entries; named group, consistent sizes, 8px gap. |
| [`Card`](./components/Card/meta.json) | layout | Surface primitive. No border by default. |
| [`Badge`](./components/Badge/meta.json) | display | Status / promo labels. Uses the semantic badge palette; keyboard focus has separate blue aliases. |
| [`Input`](./components/Input/meta.json) | form | Text input. Keep state borders; use a separate 2px blue --focus-ring keyboard outline. |
| [`Checkbox`](./components/Checkbox/meta.json) | form | Independent or multi-select choice. Neutral selected state. |
| [`RadioGroup`](./components/RadioGroup/meta.json) | form | Exclusive selection with arrow-key navigation. |
| [`Divider`](./components/Divider/meta.json) | layout | default (1px) / emphasis (2px); separate inverse boolean; horizontal or vertical. |
| [`AspectRatio`](./components/AspectRatio/meta.json) | layout | Style-neutral ratio constraint for responsive media. |
| [`ProductCard`](./components/ProductCard/meta.json) | composite | Canonical product tile. Composes Card + AspectRatio + Badge + ProductCardAddButton. |
| [`ProductList`](./components/ProductList/meta.json) | composite | Responsive product collection with rail and waterfall layouts. |
| [`HeroBanner`](./components/HeroBanner/meta.json) | composite | Responsive homepage campaign rail shared by PC and Mobile. |
| [`Tabs`](./components/Tabs/meta.json) | navigation | Compound tab navigation. Triggers must sit inside `TabsList`. |
| [`Pagination`](./components/Pagination/meta.json) | navigation | PC-only numbered pagination from 1024px. Controlled result updates or native links; hidden on mobile. |
| [`Breadcrumb`](./components/Breadcrumb/meta.json) | navigation | Hierarchical links with explicit current-page semantics; preserves PDP and docsite styles. Pages own visibility. |

Each `meta.json` declares props, variants, `tokenBindings` (which property of which selector reads which token), rules consumed, and a11y profile.

## Choose actions by behavior

- Use Button for actions such as saving, submitting, opening a dialog, or generating a receipt. Use ButtonLink with a real `href` for navigation or a direct file download with button appearance; use a plain anchor for text navigation. Button has no `href`, `as`, or `asChild` API; do not redirect from its click handler to imitate a link.
- Links and buttons may share a layout. Keep their semantics, align them deliberately, preserve focus order, and allow wrapping. Matching filled appearance is optional. Prefer ButtonGroup for related Button and ButtonLink entries with consistent sizes and an accessible name. Use a normal layout container for plain text links mixed with buttons.
- Preserve the user's labels, destinations, and actions when repairing visuals. Do not turn “View order” into “Print order” to make an example easier to style. Choose visual priority from the business task; not every card needs a primary or emphasis button.
- ButtonLink shares Button styles and renders a native anchor. Preserve native link activation and browser actions. It supports inline/full forms and has no loading/disabled API; render static content when navigation is unavailable. Do not copy private Button CSS into pages. Detailed examples belong in the usage documents above.

## Storybook + registry consumption contract

For AI prototype generation, Storybook is the maintained visual source of truth
and Registry v2 is the deterministic internal source-distribution contract. It is
not a generated shadcn registry; the future adapter mapping is documented in
[`ADR 009`](../../docs/adr/009-agent-ready-contracts-and-distribution.md).

- First consume the injected `Storybook Catalog Source of Truth` section. Its
  titles and canonical exports tell you which YAMI assets/components are
  actively maintained for generation.
- Then consume [`generated/registry.json`](./generated/registry.json) and
  [`generated/registry-items/`](./generated/registry-items/) for item names,
  source/target files, dependencies, design rules, quality evidence, content
  digests, and the design-system base package.
- Only claim catalog-backed output for components that have both a catalog
  contract and a maintained Storybook story. Components documented in
  `DESIGN.md` but not yet listed in Storybook are available as design guidance,
  not as primary recipe targets.
- Activation checks require used catalog components to be backed by a local
  registry item that includes their Storybook `Showcase`; otherwise the output
  remains a draft with `registry_story_missing:<Component>`.
- Prefer `renderRecipeArtifact` for catalog-backed delivery. Free-form HTML is
  reference-only and must say why it is not componentized.

---

## Validate your output

After generating, run from the Yami Design System repository root:

```bash
pnpm validate
```

This command verifies lint, types, design principles, documentation/token/catalog
consistency, generated artifacts, package boundaries, Button usage checks, and tests. The 15 principle checks have different coverage; a pass is not a complete design review. `check:button-usage` checks explicit misuse and statically known group contracts. Dynamic callbacks, computed props, visual hierarchy, and hit-area clipping still need review. Run the affected Storybook/browser tests and inspect relevant layouts when UI changes. Skill evaluation verifies references and fixtures; it does not run an AI against the prompts.

Principle validators remain available from
[`principles/index.ts`](./principles/index.ts) without a Design Labs runtime.

---

## Isolation

`packages/design-system/` is a workspace source package consumed by Canvas,
Storybook, and prototypes. It must remain independent from application runtimes:

- Do not import Next.js, Motion, Zod, Design Labs, or Astryx runtime modules.
- Do not copy token values into an application-specific stylesheet.
- Keep `tokens/**/*.tokens.json` as the token source of truth.

Canvas and Storybook consume the package through its public exports; prototypes
own page composition and serializable direction resolution.

---

## Quick start for code generation

When the user asks for a YAMI page or component:

1. **Match the request to an existing page.** For PLP, PDP, search, home, or campaign work, inspect [`../prototypes/pages/`](../prototypes/pages/) and reuse the closest maintained page composition before adding a new one.
2. **Read the used component contracts.** Inspect `meta.json`, `usage.md`, the relevant Story, and public exports before editing or composing components; metadata alone does not define usage boundaries. For actions, follow [Button usage](./components/Button/usage.md) and [ButtonGroup usage](./components/ButtonGroup/usage.md). Never re-declare `tokenBindings`.
3. **Reach for semantic aliases, not raw tokens.** Use `--text-emphasis` (not `--color-red-500`), `--button-primary` (not `--color-black-900`). Component-side aliasing is in `generated/tokens.css` under `/* Semantic Aliases */`.
4. **Copy the Quick Start CSS / Tailwind v4 block** from [`DESIGN.md → Quick Start`](./DESIGN.md) into a fresh project if you need a standalone consumption surface.
5. **Refuse the Anti-patterns** in [`DESIGN.md → Anti-patterns AI agents repeatedly produce`](./DESIGN.md). When in doubt: refuse and explain.
6. **Final step:** run `pnpm validate` before declaring done.

---

## Cross-references

| Document | Role |
|---|---|
| [`README.md`](./README.md) | Package overview, dir inventory, voice quick-reference |
| [`DESIGN.md`](./DESIGN.md) | Comprehensive spec + rules SSOT (AI / engineer / CI validator) |
| [`DESIGN.compact.md`](./DESIGN.compact.md) | 30-second brand entry (designer / PM / stakeholder) |
| [`decisions.md`](./decisions.md) | "Why" behind every rule / decision |
| [`CHANGELOG.md`](./CHANGELOG.md) | Version history (tokens / components / documentation) |
| [`content/`](./content/) | Voice, bilingual rules, copy patterns |
| [`motion/`](./motion/) | Motion patterns / durations / easings |
| [`generated/tokens.css`](./generated/tokens.css) | Auto-generated CSS Custom Properties (source: `tokens/*.tokens.json` DTCG JSON) |
| [`principles/`](./principles/) | AST validators + sync checks |
| [`generated/catalog.json`](./generated/catalog.json) | Maintained Storybook component inventory |
| [`generated/registry.json`](./generated/registry.json) | Deterministic internal source registry |
| [`../prototypes/pages/`](../prototypes/pages/) | Maintained page compositions and Storybook stories |
