---
"@yami/design-system": patch
"@yami/topic-generator": patch
---

Add theme-aware blue focus-ring and focus-ring-inverse tokens for keyboard focus indicators, independently of existing neutral borders and selection states. Migrate component and consuming-page keyboard outlines, update design guidance and validators, and verify light, dark, inverse and fixed-polarity surfaces.

Keep keyboard outlines inside scrolling tab lists without gutters so the complete ring remains visible.

Align Primary B keyboard outlines with the visible capsule, preserving equal offset on all sides and the original 44px hit area.

Prevent clipped focus outlines in chip groups, product cards and galleries, shortcut/hero/brand rails, theme content and review lists. Align preview and video-link corner radii with their visible surfaces, and retain two-line product titles by clamping the text layer.

Migrate the Topic Generator workbench keyboard outlines to the same focus tokens while preserving state borders and existing control geometry.
