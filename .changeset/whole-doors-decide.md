---
"@yami/design-system": minor
"@yami/prototypes": patch
---

Add the shared TabBar component extracted from CartPage, with host-controlled
current destination, links or action buttons, icons and quantity badges.
CartPage now composes TabBar in its fixed footer and order-details drawer,
preserving destinations, count updates and mobile-only placement. No public
CartPage API changes; component exports, bilingual docs and Storybook examples
are included.
