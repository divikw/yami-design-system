import type { HTMLAttributes, MouseEventHandler } from "react";

export interface PDPGiftSku {
  image: string;
  alt: string;
  quantity?: number;
}

export interface PDPGiftActivity {
  title: string;
  detail?: string;
  items: readonly PDPGiftSku[];
}

export interface PDPPromotionGift {
  image: string;
  alt: string;
  title: string;
  detail: string;
  quantity?: number;
}

export interface PDPPromotionProps extends HTMLAttributes<HTMLElement> {
  giftCard?: {
    label: string;
    price: string;
    detailsLabel: string;
    description?: string;
    onDetailsClick?: MouseEventHandler<HTMLButtonElement>;
  };
  coupon?: {
    offers?: readonly string[];
    title?: string;
    description?: string;
    detailsLabel: string;
    onDetailsClick?: () => void;
  };
  discountCode?: {
    label: string;
    code: string;
    copyLabel: string;
    copiedLabel?: string;
  };
  gifts?: {
    title: string;
    detailsLabel?: string;
    actionLabel?: string;
    onDetailsClick?: () => void;
    activities?: readonly PDPGiftActivity[];
    items?: readonly PDPPromotionGift[];
  };
}
