# AI direction workflow

This documents the legacy home-only direction format. The current workbench
does not expose JSON direction import/export. For multi-page variants with
shareable addresses, use the [PROTOTYPE project workflow](../apps/canvas/README.md).
Canvas never sends prompts or project assets to an external model.

## Agent prompt

```text
Create a Yami Design System DirectionManifestV1 JSON design direction.

Read:
- packages/contracts/src/manifest.ts
- docs/adr/001-architecture-and-migration-contract.md

Requirements:
- extends must be "current"
- use only the fixed home slots and five supported section kinds
- preserve an existing section's kind
- use shallow prop patches and full array replacement
- use only allowed semantic token overrides
- do not emit HTML, CSS statements, functions, React elements or external URLs
- return one JSON object with no Markdown fence
```

## Legacy storage behavior

- The reader validates stored entries against `DirectionManifestV1`; invalid
  entries are ignored.
- Drafts are stored in `yami-design-system:drafts:v1` local storage. Existing
  `yami-canvas:drafts:v1` drafts migrate automatically on first read.
- A direction URL alone does not transfer a locally stored draft to another browser.
- `current` always resolves from the Ecommerce Home fixture; it is never copied
  into a second manifest.
