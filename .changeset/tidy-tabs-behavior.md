---
"@yami/design-system": patch
---

Complete Tabs keyboard focus, preserve distinct ARIA IDs for localized values, and fix disabled colors across variants and themes. Stack vertical segmented tabs correctly, distribute full-width segmented triggers, and align the component contract and Storybook examples with maintained web dimensions.

Keep the horizontal Primary B selected surface inset by 2px from its background on mobile and desktop, including inverse colors.

Keep the Secondary selected underline fully inside the scroll container so its visible 2px thickness matches Primary Style A.

Use compact vertical Primary A rows (44px) and 4px item gaps for vertical Primary A and Secondary. Keep horizontal geometry and keyboard navigation intact, and make the vertical story's controls reflect its orientation.

Localize Tabs descriptions and usage guidance, and organize Storybook around an overview, playground, combined states, composition, and behavior examples while preserving existing story IDs.

Run state-changing story checks only in tests so normal previews retain their initial selection, focus, scroll position, theme, and layout. Align the manual activation story's controls with its initial configuration. Preserve keyboard focus indicators.
