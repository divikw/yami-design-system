---
"@yami/design-system": minor
"@yami/prototypes": patch
"@yami/docsite": patch
---

Migrate Sheet modal behavior to Base UI Dialog, keeping its controlled API, responsive geometry, descriptions, footer, and child-view Back/Escape behavior. Desktop now defaults to a 480px full-height right-edge panel; explicit desktopPlacement="center" retains the prior centered layout. Mobile presentation is unchanged. Add bilingual shared-template Docs and localized PC/Mobile previews.

Sheet and its Drawer wrapper now render a div portalled to body. Replace native dialog queries with role/data-sheet queries; native showModal/close/method=dialog are no longer supported and event targets are HTMLDivElement. Drawer keeps its existing entry/exit animations with a real backdrop element. QuantitySelect now recognizes portalled YAMI modal containers for nested menus and limit feedback. Business state remains caller-owned.

Keep cart action styling and product nutrition typography intact outside their former page ancestors, and update consumer regression queries for the portalled sheets.

Reduce mobile Close top/right button insets to 8px (12px to the icon); keep desktop insets unchanged. Manage heading spacing with container padding and gap.

Keep mobile Header bottom padding at 12px with no extra bottom padding on the inner heading container; desktop spacing is preserved.

Keep the existing search filters centered with an explicit desktopPlacement.

Expose Base UI initialFocus/finalFocus targets for custom headers and shortcut openers. Adapt docsite navigation and search to restore their triggers reliably, preserve the navigation backdrop blur/motion on the real backdrop element, and retain centered desktop search.
