import type { GiftCardPriceProps } from "./ProductPricing.types";

import styles from "./ProductPricing.module.css";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function GiftCardPrice({
  label,
  price,
  detailsLabel,
  onDetailsClick,
  className,
  ...rest
}: GiftCardPriceProps) {
  return (
    <div {...rest} className={cx(styles.giftCardPrice, className)} data-slot="product-pricing-gift-card">
      <span>{label}</span>
      <strong>{price}</strong>
      <button type="button" className={styles.detailsButton} onClick={onDetailsClick}>
        {detailsLabel}
      </button>
    </div>
  );
}
