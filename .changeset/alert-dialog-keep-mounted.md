---
"@yami/design-system": patch
---

Fix AlertDialog visibility when `keepMounted` is enabled. Closed dialogs stay hidden while their DOM remains mounted, and opening the dialog shows the full-page backdrop.
