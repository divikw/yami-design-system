import { PDPPromotion } from "../PDPPromotion";
import type { ProductPricingProps } from "./ProductPricing.types";
import { RegularPrice } from "./RegularPrice";
import { VVIPPrice } from "./VVIPPrice";

import styles from "./ProductPricing.module.css";

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ProductPricing({ regular, giftCard, vvip, promotions, className, ...rest }: ProductPricingProps) {
  return (
    <div {...rest} className={cx(styles.root, className)} data-slot="product-detail-price">
      <RegularPrice {...regular} />
      {vvip ? <VVIPPrice {...vvip} /> : null}
      {giftCard || promotions ? <PDPPromotion giftCard={giftCard} {...promotions} /> : null}
    </div>
  );
}
