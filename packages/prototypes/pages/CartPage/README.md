# CartPage

Responsive Storybook draft based on the PC shopping cart inspected on 2026-10-13. Uses Header/Footer, Checkbox, QuantitySelect, Drawer, Input, Button, Tabs and ProductList; cart rows stay page-owned because ProductCard is for discovery collections.

This delivery targets light mode only. The new component and cart stories fix the light theme; existing shared theme tokens and other components are unchanged.

## Demo data and rules

- Product imagery/identities, visible price examples, payment/guarantee artwork and shipping examples reference the observed cart. Titles are shortened and English copy is authored for the prototype.
- Collections are a small curated set, not a copy of the customer's 191-unit cart. Quantities, purchase limits, selection and coupon DEMO10 are synthetic. No data is persisted or sent to the cart service.
- Only selected, available merchandise contributes to the total. Price values are integer cents and displayed row prices are quantity-adjusted line totals.
- Shipping progress remains visible at zero, partial and full completion, and follows selected item quantities.
- Each merchant qualifies free shipping from its own selected current-price subtotal before coupon deductions. No selection incurs no shipping. DEMO10 takes $10 off a merchandise subtotal of at least $100, excluding shipping; it becomes inapplicable when the subtotal drops. These are fixture rules, not verified production business logic.
- Tax is not estimated. Checkout opens a local order summary and does not submit an order or collect payment. Delete supports Undo, saved items can move back to the cart, recommendations add locally, and stock notifications are local demo state.
- Coupon and unavailable-item drawers follow the observed desktop layout. Mobile stacking and the fixed checkout bar are a proposed responsive composition requiring design review. The existing PC-only Footer is hidden below 1024px.
- Cart data is initialized from props; the Storybook host remounts on locale/scenario changes. Production API integration, real inventory, payment provider widgets and policy/legal copy review are outside this prototype.

## Verification

Stories: PC, Mobile, Selected, Empty, Loading, Failure with Retry, LongCart, NoCoupons, CouponDrawer, EmptyCouponDrawer, UnavailableDrawer, SavedForLater, and a hidden Interaction story. The calculator tests shipping boundaries, selected/ineligible items, quantity changes, coupon thresholds, integer cents and nonnegative merchandise totals. Browser tests cover 360/375/402/768/1024/1440px viewport geometry, merchant-header wrapping, price/action order, compact drawer rows, drawer behavior and cart interactions.

## Comparison review — 2026-10-13

Observed the live PC cart without changing selections, quantities or customer data. The source uses a 480px right drawer, 60×24px quantity pills, 16px product titles, 12px underlined row actions, a 4px rounded shipping track, a dark add-more action with a right arrow, and an email/social footer band. The local page now follows these details through maintained components and semantic tokens; button radii and heading sizes follow the design-system contract.

This review also fixes local behavior: Undo restores the deleted item's position, coupon application/removal reports the correct result inside the active drawer, and clearing unavailable items shows an empty state with Undo. Closing that empty drawer returns focus to the cart title when its original opener has disappeared. Browser regression covers these paths and the existing six viewport widths.

Remaining intentional prototype boundaries: fixture quantities/stock/coupons and shipping rules are examples; checkout is a local summary; notifications, newsletter submission and production payment widgets have no service integration. The source's account-specific cart size, personalized recommendations are not reproduced. Mobile is a proposed responsive layout, not a verified clone of the live mobile page.

The merchant-header follow-up matches the observed 56px PC band and equal-width identity/shipping halves. A 44px checkbox target remains independent from the normal-weight merchant navigation link; the origin has a middle-dot separator. Shipping uses the original 16×16px outlined delivery asset (`system/delivery-line.png`), and the compact 92px add-more link uses ButtonLink's rectangular `full` form with the system's 8px component radius (source: 4px). Mobile keeps these groups on separate rows.

The title security carousel reuses the four guarantee entries and source artwork in the observed order. Each entry holds for 3 seconds and slides vertically for 0.5 seconds, with a duplicate first entry for the seamless loop. Hover pauses the decorative carousel; reduced-motion preferences show the first entry statically. The full content remains available in the sidebar and protection drawer without repeated screen-reader announcements.
