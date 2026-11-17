---
"@yami/design-system": patch
---

Use the WCAG 2.2 Web target-size baseline of 24×24 CSS px with applicable exceptions, treating 44×44px as a touch recommendation rather than a layout minimum. Remove static warnings based solely on compact icon Button props; runtime bounds below 24px request review of actual hit areas and exceptions.

Reduce Switch's minimum outer control size to 32×32px while retaining its 32×20px track and 8px outer radius. Update bilingual documentation and metadata. Existing larger page rows and other components' expanded targets remain unchanged.
