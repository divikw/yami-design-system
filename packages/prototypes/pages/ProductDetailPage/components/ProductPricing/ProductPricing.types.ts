import type { HTMLAttributes, MouseEventHandler } from "react";

import type { PDPPromotionProps } from "../PDPPromotion";

export interface RegularPriceProps extends HTMLAttributes<HTMLDivElement> {
  currentPrice: string;
  unitPrice?: string;
  originalPrice?: string;
  discountLabel?: string;
  saleEndsLabel?: string;
}

export interface GiftCardPriceProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  price: string;
  detailsLabel: string;
  description?: string;
  onDetailsClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface VVIPPriceProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  price: string;
  endsTodayLabel: string;
  actionLabel: string;
  onAction?: MouseEventHandler<HTMLButtonElement>;
}

export interface ProductPricingProps extends HTMLAttributes<HTMLDivElement> {
  regular: RegularPriceProps;
  giftCard?: GiftCardPriceProps;
  vvip?: VVIPPriceProps;
  promotions?: PDPPromotionProps;
}
