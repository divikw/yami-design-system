import type { RegularPriceProps } from "./ProductPricing.types";

import styles from "./ProductPricing.module.css";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function RegularPrice({
  currentPrice,
  unitPrice,
  originalPrice,
  discountLabel,
  saleEndsLabel,
  className,
  ...rest
}: RegularPriceProps) {
  return (
    <div {...rest} className={cx(styles.regularPrice, className)} data-slot="product-pricing-regular">
      <div className={styles.regularPriceValues}>
        <strong className={styles.currentPrice}>{currentPrice}</strong>
        {unitPrice ? <span className={styles.unitPrice}>{unitPrice}</span> : null}
        {originalPrice ? <span className={styles.originalPrice}>{originalPrice}</span> : null}
        {discountLabel ? (
          <span className={styles.discount} data-slot="product-detail-discount">
            {discountLabel}
          </span>
        ) : null}
      </div>
      {saleEndsLabel ? <span className={styles.saleEnds}>{saleEndsLabel}</span> : null}
    </div>
  );
}
