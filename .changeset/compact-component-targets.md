---
"@yami/design-system": patch
"@yami/prototypes": patch
---

Remove layout inflation from the former 44px target floor: Select uses a 40px trigger and 32px options, interactive Card uses a 32px minimum, and QuantitySelect uses a 32px trigger/input wrapper and mobile options with a matching 32px visible pill and inline editor, retaining 28px desktop options. Adjust the cart's title-only price-row clearance to the smaller quantity target. Preserve authored navigation dimensions and non-layout hit-area extensions.

Connect the quantity popup side strokes to the 32px pill midpoint in both opening directions, preserving the transparent center for trigger interaction.
