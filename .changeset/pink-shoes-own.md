---
"@yami/design-system": patch
---

Render the ButtonGroup and Breadcrumb roots with Base UI’s `useRender`. Existing props, refs, YAMI tokens, and keyboard behavior are preserved. Breadcrumb continues to support native links and framework links through `renderLink`. Consumers can keep their existing calls.
