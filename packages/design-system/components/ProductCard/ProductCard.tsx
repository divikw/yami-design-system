/** ProductCard — Figma-backed YAMI desktop product tile. */

import { Button } from "../Button";
import { Card } from "../Card";

import styles from "./ProductCard.module.css";
import { ProductCardMedia } from "./ProductCardMedia";
import { ProductCardOffer } from "./ProductCardOffer";
import { ProductCardSummary } from "./ProductCardSummary";
import type { ProductCardProps } from "./ProductCard.types";

export type {
  ProductBadge,
  ProductCardPresentation,
  ProductCardPromotion,
  ProductCardProps,
  ProductCardSurface,
} from "./ProductCard.types";

export function ProductCard({
  presentation = "rich",
  surface = "plain",
  image,
  imageAlt,
  imageLoading = "lazy",
  imageFetchPriority,
  brand,
  brandHref,
  title,
  priceCurrent,
  priceOriginal,
  unitPrice,
  ranking,
  rating,
  ratingCount,
  soldCount,
  promotions,
  countdown,
  badges,
  onAddToCart,
  addButtonDisabled = false,
  addButtonAriaLabel = "Add to cart",
  availability = "available",
  availabilityLabel = availability === "delisted" ? "No longer available" : "Sold out",
  onNotify,
  notifyLabel = "Notify me",
  notifyDisabled = false,
  href,
}: ProductCardProps) {
  const availabilityContent = availability !== "available" ? (
    <div className={styles.availability} data-slot="product-card-availability">
      <p>{availabilityLabel}</p>
      {availability === "sold-out" && onNotify ? <Button className={styles.notify} size="sm" variant="tertiary" onClick={onNotify} disabled={notifyDisabled} aria-label={`${notifyLabel} ${typeof title === "string" ? title : ""}`.trim()}>{notifyLabel}</Button> : null}
    </div>
  ) : null;
  return (
    <Card
      as="article"
      padding="none"
      interactive={false}
      className={styles.card}
    >
      <div
        className={styles.root}
        data-slot="product-card"
        data-presentation={presentation}
        data-surface={surface}
        data-availability={availability}
      >
        <ProductCardMedia
          image={image}
          imageAlt={imageAlt}
          imageLoading={imageLoading}
          imageFetchPriority={imageFetchPriority}
          badges={presentation === "rich" ? badges : undefined}
          onAddToCart={
            presentation === "compact" || availability !== "available" ? undefined : onAddToCart
          }
          addButtonAriaLabel={addButtonAriaLabel}
          addButtonDisabled={addButtonDisabled}
          priceBadge={presentation === "minimal" ? priceCurrent : undefined}
          href={href}
          linkLabel={title}
        />
        {presentation !== "minimal" && (
          <div className={styles.content} data-slot="product-card-content">
            <ProductCardSummary
              brand={brand}
              brandHref={brandHref}
              title={title}
              href={href}
              ranking={presentation === "rich" ? ranking : undefined}
              rating={presentation === "rich" ? rating : undefined}
              ratingCount={presentation === "rich" ? ratingCount : undefined}
              soldCount={presentation === "rich" ? soldCount : undefined}
            />
            <ProductCardOffer
              priceCurrent={priceCurrent}
              priceOriginal={priceOriginal}
              unitPrice={unitPrice}
              promotions={presentation === "rich" ? promotions : undefined}
              countdown={presentation === "rich" ? countdown : undefined}
              onAddToCart={
                presentation === "compact" && availability === "available" ? onAddToCart : undefined
              }
              addButtonAriaLabel={addButtonAriaLabel}
              addButtonDisabled={addButtonDisabled}
            />
            {availabilityContent}
          </div>
        )}
        {presentation === "minimal" && availabilityContent ? <div className={styles.content}>{availabilityContent}</div> : null}
      </div>
    </Card>
  );
}
