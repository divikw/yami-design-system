import { Badge, Button } from "@yami/design-system";

import type { VVIPPriceProps } from "./ProductPricing.types";

import styles from "./ProductPricing.module.css";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function VVIPPrice({
  label,
  price,
  actionLabel,
  onAction,
  className,
  ...rest
}: VVIPPriceProps) {
  return (
    <div {...rest} className={cx(styles.vvipPrice, className)} data-slot="product-pricing-vvip">
      <div className={styles.vvipPriceValue}>
        <Badge color="yellow" emphasis="primary" size="md">VVIP</Badge>
        <span>{label}</span>
        <strong>{price}</strong>
      </div>
      <Button variant="primary" form="inline" size="sm" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
