import type { CartCoupon, CartItemData, CartMerchant } from "./CartPage.types";

/** Demo rule: selected current-price subtotal qualifies shipping before coupons. */
export function calculateCartTotals(items: CartItemData[], merchants: CartMerchant[], coupon?: CartCoupon) {
  const selected = items.filter((item) => item.selected && item.availability === "available");
  const subtotalCents = selected.reduce((total, item) => total + item.priceCents * item.quantity, 0);
  const quantity = selected.reduce((total, item) => total + item.quantity, 0);
  const merchantSubtotals = Object.fromEntries(merchants.map((merchant) => [merchant.id,
    selected.filter((item) => item.merchantId === merchant.id).reduce((total, item) => total + item.priceCents * item.quantity, 0),
  ]));
  const shippingCents = merchants.reduce((total, merchant) => {
    const subtotal = merchantSubtotals[merchant.id];
    return total + (subtotal > 0 && subtotal < merchant.freeShippingCents ? merchant.shippingCents : 0);
  }, 0);
  const discountCents = coupon && quantity > 0 && subtotalCents >= coupon.minSubtotalCents
    ? Math.min(coupon.discountCents, subtotalCents) : 0;
  return { quantity, subtotalCents, shippingCents, discountCents, totalCents: subtotalCents + shippingCents - discountCents, merchantSubtotals };
}

export function formatCartMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
