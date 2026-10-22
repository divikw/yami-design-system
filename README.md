# Yami Design System

由 AI 驱动的 Yami 设计系统与原型制作平台。

## Local development

```bash
corepack pnpm install
pnpm generate
pnpm dev
pnpm dev:storybook
pnpm dev:docsite
```

TypeScript 7 provides `tsc` through the `@typescript/native` alias. The root
`typescript` alias uses `@typescript/typescript6` for ESLint and the design-system
validators that require the compiler API. Keep both aliases when updating dependencies
([TypeScript migration guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0)).

### Storybook Token annotations

All Storybook stories support Token annotations in Codex's built-in browser. Open a story as a top-level page using Storybook's “Open in new tab” action, or `/iframe.html?id=<story-id>&viewMode=story` on the Storybook host. The browser API requires HTTPS or localhost and is unavailable inside the normal Storybook manager's preview iframe.

Enter Annotation mode, select an element, and expand Adjust. Custom controls show authored variable references for colors, typography, spacing, radii, borders, shadows, and dimensions. Theme and responsive rules resolve through the browser's CSS cascade. Single-variable hex colors support reversible previews; other controls display the reference and resolved value alongside the built-in style editors. Each element shows up to 12 custom controls, with a count in the heading when more are available.

Style analysis starts only when Annotation mode is first entered; subsequent hover inspection stops outside that mode. Active registrations are capped at 64 and styles are cleaned up when the preview unmounts. Browsers without the annotation API add no inspection styles or listeners. This integration lives only in `apps/storybook`; it does not ship to Canvas or Docsite. Logical spacing and borders follow YDS's maintained horizontal LTR layouts. Authored styles must be readable through CSSOM; cross-origin stylesheets and shadow roots are outside this integration's scope.

Regression check: `pnpm --filter @yami/storybook exec vitest run --project=browser tests/TokenAnnotations.browser.test.tsx`.

## AI workflow

Yami Design System does not call a model at runtime. Generate a `DirectionManifestV1`
JSON file in Codex or Kiro, then import it from the Canvas control panel. The
browser validates the schema before saving the direction to local storage.

No API key, login, or database is required.

See [`docs/ai-workflow.md`](docs/ai-workflow.md) for the reusable agent prompt
and import contract.

- Canvas Workbench: http://localhost:3200/workbench
- Canvas Preview: http://localhost:3200/preview?locale=en
- Storybook: http://localhost:6006
- Docsite: http://localhost:3400/zh

## Hosted environments

- Canvas Workbench: https://yds-prototype.vercel.app/workbench
- Canvas Preview: https://yds-prototype.vercel.app/preview?locale=en
- Storybook: https://yds-storybook.vercel.app
- Docsite: https://yds-docsite.vercel.app/zh

Docsite is a separate Vercel target at `apps/docsite`. Pull requests create
Preview deployments and updates to `main` create Production deployments.

The source repository and Vercel Production deployments are public. Canvas,
Storybook and Docsite all configure automatic Git deployments. The configuration
takes effect when it reaches the connected repository; verify the resulting
deployment before reporting a site update.
No Vercel project receives an AI secret. See
[`ADR 003`](docs/adr/003-public-production-and-manual-deployments.md) for the
current release policy.

Public availability does not grant reuse or redistribution rights for the
licensed fonts, brand marks or product photography. The asset-rights conflict
is recorded but not cleared; review the asset notices before forking, mirroring
or packaging static assets.
