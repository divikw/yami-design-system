---
"@yami/design-system": minor
"@yami/prototypes": minor
---

Align the light-mode cart with the source desktop page and mobile Cart/Reorder design. Add shared App navigation icons, responsive product grids, sold-out and delisted ProductCard states, and local stock-notification actions. Replace delete/save undo rows with focused inline success placeholders.

Add compact Input density and preserve native resets, read-only values, disabled-error states and keyboard focus. Give Checkbox and RadioGroup a 40×40px layout target. Animate Drawer entry/exit with reduced-motion support and an optional onAfterClose callback.

QuantitySelect now uses a custom dropdown and an inline 10+ input: blur or Enter commits, Escape restores the value, and over-limit feedback uses a toast. Consumers no longer receive Apply/Cancel controls; review layouts that relied on the previous inline editor or 20px selection-control footprint. Existing component props remain supported, and new availability and density props preserve their previous defaults. Cart checkout, inventory, purchase history and notification actions remain local prototype state.
