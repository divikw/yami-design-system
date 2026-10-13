# CartPage

Responsive Storybook draft based on the PC shopping cart inspected on 2026-10-13. Uses Header/Footer, Checkbox, QuantitySelect, Drawer, Input, Button, Tabs and ProductList; cart rows stay page-owned because ProductCard is for discovery collections.

This delivery targets light mode only. The new component and cart stories fix the light theme; existing shared theme tokens and other components are unchanged.

## Demo data and rules

- Product imagery/identities, visible price examples, payment/guarantee artwork and shipping examples reference the observed cart. Titles are shortened and English copy is authored for the prototype.
- Collections are a small curated set, not a copy of the customer's 191-unit cart. Quantities, purchase limits, selection and coupon DEMO10 are synthetic. No data is persisted or sent to the cart service.
- Only selected, available merchandise contributes to the total. Price values are integer cents and displayed row prices are quantity-adjusted line totals.
- Each merchant qualifies free shipping from its own selected current-price subtotal before coupon deductions. No selection incurs no shipping. DEMO10 takes $10 off a merchandise subtotal of at least $100, excluding shipping; it becomes inapplicable when the subtotal drops. These are fixture rules, not verified production business logic.
- Tax is not estimated. Checkout opens a local order summary and does not submit an order or collect payment. Delete supports Undo, saved items can move back to the cart, recommendations add locally, and stock notifications are local demo state.
- Coupon and unavailable-item drawers follow the observed desktop layout. Mobile stacking and the fixed checkout button are a proposed responsive composition requiring design review. The existing PC-only Footer is hidden below 1024px.
- Cart data is initialized from props; the Storybook host remounts on locale/scenario changes. Production API integration, real inventory, payment provider widgets and policy/legal copy review are outside this prototype.

## Verification

Stories: PC, Mobile, Selected, Empty, Loading, Failure with Retry, LongCart, NoCoupons, and a hidden Interaction story. The calculator tests shipping boundaries, selected/ineligible items, quantity changes, coupon thresholds, integer cents and nonnegative merchandise totals. Browser tests cover viewport geometry, drawer behavior and cart interactions.
