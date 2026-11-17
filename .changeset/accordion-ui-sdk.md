---
"@yami/design-system": minor
---

Replace the experimental single-panel Accordion API with Base UI-backed Accordion, AccordionItem, AccordionTrigger and AccordionContent composition. Migrate label/children to Trigger/Content and expanded/defaultExpanded/onExpandedChange to the root value/defaultValue/onValueChange array API. Expansion is single by default; use multiple for independent expansion and keepMounted to retain closed panel state.

Retain YAMI styling and keyboard accessibility. Standardize nonzero Card padding to 16px on desktop and 8px on mobile; padding="none" remains unchanged.
