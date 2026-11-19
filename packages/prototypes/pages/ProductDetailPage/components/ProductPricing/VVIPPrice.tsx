import { Button } from "@yami/design-system";

import type { VVIPPriceProps } from "./ProductPricing.types";

import styles from "./ProductPricing.module.css";

const vvipMark = new URL("./vvip-mark.svg", import.meta.url).href;

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function VVIPPrice({
  label,
  price,
  endsTodayLabel,
  actionLabel,
  onAction,
  className,
  ...rest
}: VVIPPriceProps) {
  return (
    <div {...rest} className={cx(styles.vvipPrice, className)} data-slot="product-pricing-vvip">
      <div className={styles.vvipPriceValue}>
        <img className={styles.vvipMark} src={vvipMark} alt="VVIP" />
        <span>{label}</span>
        <span className={styles.vvipPriceMeta} data-slot="product-pricing-vvip-meta">
          <strong>{price}</strong>
          <span
            className={styles.vvipPriceDivider}
            data-slot="product-pricing-vvip-divider"
            aria-hidden="true"
          />
          <span className={styles.vvipEndsToday}>{endsTodayLabel}</span>
        </span>
      </div>
      <Button variant="primary" form="inline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
