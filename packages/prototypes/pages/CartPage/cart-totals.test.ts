import { describe, expect, it } from "vitest";
import { calculateCartTotals } from "./cart-totals";
import type { CartCoupon, CartItemData, CartMerchant } from "./CartPage.types";

const merchants: CartMerchant[] = [
  { id: "a", title: "A", origin: "US", href: "/a", shippingCents: 599, freeShippingCents: 4900 },
  { id: "b", title: "B", origin: "Japan", href: "/b", shippingCents: 1999, freeShippingCents: 9900 },
];
function item(patch: Partial<CartItemData> = {}): CartItemData {
  return { id: "one", merchantId: "a", title: "Item", href: "/item", image: "/image", attributes: [], priceCents: 1000, quantity: 1, maxQuantity: 25, selected: true, availability: "available", ...patch };
}
const coupon: CartCoupon = { id: "demo", code: "DEMO10", title: "Coupon", description: "Demo", minSubtotalCents: 10000, discountCents: 1000 };

describe("cart totals", () => {
  it("charges no shipping when nothing can be checked out", () => {
    expect(calculateCartTotals([item({ selected: false }), item({ availability: "sold-out" }), item({ availability: "delisted" })], merchants, coupon))
      .toMatchObject({ quantity: 0, subtotalCents: 0, shippingCents: 0, discountCents: 0, totalCents: 0 });
  });
  it("qualifies shipping per seller, at the exact threshold", () => {
    const totals = calculateCartTotals([item({ priceCents: 4900 }), item({ id: "two", merchantId: "b", priceCents: 1000, quantity: 2 })], merchants);
    expect(totals).toMatchObject({ quantity: 3, subtotalCents: 6900, shippingCents: 1999, totalCents: 8899, merchantSubtotals: { a: 4900, b: 2000 } });
  });
  it("recalculates qualification and discounts after quantity changes", () => {
    expect(calculateCartTotals([item({ priceCents: 2500, quantity: 4 })], merchants, coupon)).toMatchObject({ subtotalCents: 10000, discountCents: 1000, shippingCents: 0, totalCents: 9000 });
    expect(calculateCartTotals([item({ priceCents: 2500, quantity: 1 })], merchants, coupon)).toMatchObject({ subtotalCents: 2500, discountCents: 0, shippingCents: 599, totalCents: 3099 });
  });
  it("keeps integer cents and prevents a coupon from making merchandise negative", () => {
    expect(calculateCartTotals([item({ priceCents: 1833, quantity: 3 })], merchants)).toMatchObject({ subtotalCents: 5499, totalCents: 5499 });
    expect(calculateCartTotals([item({ priceCents: 100 })], merchants, { ...coupon, minSubtotalCents: 0, discountCents: 1000 })).toMatchObject({ discountCents: 100, totalCents: 599 });
  });
});
