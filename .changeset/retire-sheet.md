---
"@yami/design-system": major
"@yami/prototypes": patch
"@yami/docsite": patch
---

Remove Sheet and SheetProps from the component library and registry. Use Drawer for edge panels, with size="content" to preserve the former mobile default. Use Dialog for centered desktop filters and search. Both components accept initialFocus and finalFocus.

Migrate DOM selectors from the Sheet prefix to the Drawer prefix on the panel, backdrop, viewport, and content. Update header, description, and footer slot selectors to drawer-header, drawer-description, and drawer-footer.
