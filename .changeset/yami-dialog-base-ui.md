---
"@yami/design-system": minor
---

Migrate Dialog modal behavior to Base UI while preserving the controlled open/title/onClose/footer API, YAMI tokens, close control and legacy confirmation variant. Base UI owns focus, Escape, outside dismissal and scroll locking. Reuse the shared bilingual Docs template and keep PC/Mobile Story IDs.

The popup changes from a native dialog to a div portalled to body. DOM queries should use role or data-dialog; event targets are HTMLDivElement. Native showModal/close and method=dialog are no longer supported; submit forms with explicit form IDs. New critical confirmations should use AlertDialog; legacy role=alertdialog still permits outside dismissal. Cart sign-in consumers retain their existing props.

Align the default Dialog layout with AlertDialog: separate Close and title rows, full-width example fields, no footer divider, md pill actions (PC right-aligned / Mobile equal-width), and PC 16px top spacing, 24px side/footer spacing and title, with 16px body text.

Refine Mobile default Dialog with a 20px heading, 4px content top padding and 12px top/right close icon insets (reduced by 8px).
