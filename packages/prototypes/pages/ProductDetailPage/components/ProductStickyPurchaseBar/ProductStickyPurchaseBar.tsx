import { Button } from "@yami/design-system";

import styles from "./ProductStickyPurchaseBar.module.css";

export interface ProductStickyPurchaseBarProps {
  imageSrc: string;
  imageAlt: string;
  brand: string;
  title: string;
  addToCartLabel: string;
  disabled?: boolean;
}

export function ProductStickyPurchaseBar({
  imageSrc,
  imageAlt,
  brand,
  title,
  addToCartLabel,
  disabled = false,
}: ProductStickyPurchaseBarProps) {
  return (
    <div
      className={styles.root}
      data-slot="product-detail-sticky-purchase-bar"
    >
      <div className={styles.inner}>
        <img
          className={styles.image}
          src={imageSrc}
          alt={imageAlt}
          width={56}
          height={56}
        />

        <div className={styles.summary}>
          <span
            className={styles.brand}
            data-slot="product-detail-sticky-purchase-brand"
          >
            {brand}
          </span>
          <span
            className={styles.title}
            data-slot="product-detail-sticky-purchase-title"
          >
            {title}
          </span>
        </div>

        <div className={styles.action}>
          <Button
            variant="emphasis"
            form="full"
            size="lg"
            disabled={disabled}
            data-pdp-sticky-add-to-cart="true"
          >
            {addToCartLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
