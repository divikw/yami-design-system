import type { FooterProps, HeaderProps } from "@yami/design-system";

export type CartLocale = "zh" | "en";
export interface CartItemData {
  id: string;
  merchantId: string;
  title: string;
  href: string;
  image: string;
  attributes: string[];
  priceCents: number;
  originalPriceCents?: number;
  quantity: number;
  maxQuantity: number;
  selected: boolean;
  availability: "available" | "sold-out" | "delisted";
  lowStock?: boolean;
  notifyAvailable?: boolean;
}
export interface CartReorderItem extends CartItemData {
  category: string;
  purchaseCount: number;
}
export interface CartMerchant {
  id: string;
  title: string;
  origin: string;
  href: string;
  shippingCents: number;
  freeShippingCents: number;
}
export interface CartCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  minSubtotalCents: number;
  discountCents: number;
}
export interface CartPageProps {
  locale: CartLocale;
  header: HeaderProps;
  footer: FooterProps;
  merchants: CartMerchant[];
  initialItems: CartItemData[];
  initialSavedItems: CartItemData[];
  recommendations: CartItemData[];
  history: CartItemData[];
  favorites: CartItemData[];
  /** Local example purchase history; independent of browsing history. */
  reorderItems?: CartReorderItem[];
  frequentlyBoughtItems?: CartReorderItem[];
  coupons: CartCoupon[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  initialPageTab?: "cart" | "reorder";
  initialCollection?: "recommended" | "saved" | "history" | "favorites";
  initialDrawer?: "coupons" | "unavailable" | "protection" | "summary" | null;
}
