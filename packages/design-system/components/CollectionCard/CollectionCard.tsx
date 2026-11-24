"use client";

import { HeroBannerProductsOnlyCard, type HeroBannerProductsOnlyItem } from "../HeroBanner";
import styles from "./CollectionCard.module.css";

export interface CollectionCardProps {
  item: Pick<HeroBannerProductsOnlyItem, "id" | "href" | "target" | "title" | "products">;
}

export function CollectionCard({ item }: CollectionCardProps) {
  return <HeroBannerProductsOnlyCard className={styles.card} item={item} />;
}
