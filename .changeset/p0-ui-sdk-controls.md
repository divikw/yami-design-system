---
"@yami/design-system": minor
"@yami/prototypes": patch
---

Add Base UI-backed Switch, Select and Popover with YAMI styles, bilingual Storybook documentation and public exports. Reuse them in search filter switches, QuantitySelect and desktop FilterChip menus, retaining the existing mobile Sheet and quantity business logic.

Let nested native popovers handle keyboard events before Sheet, and keep the quantity pill visible above its menu with constrained scrolling in short viewports. Select supports string single-selection, cancelable changes and native form reset; custom part className replaces its default styles. Popover uses automatic collision handling; category menus preserve their bottom anchor and scroll within the available height.

Standardize Popover to the 12px semantic surface radius and 16px title; informational examples place an accessible close icon in the upper-right header with explicit token spacing.
