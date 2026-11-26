import type { ProductListItem } from "@yami/design-system";

import { createCollectionProductFilters, filterCollectionProducts } from "./CollectionProductFilters";
import styles from "./CollectionHeroGallery.module.css";

export function createCollectionHeroGallery(products: ProductListItem[]) {
  const featured = filterCollectionProducts(products, createCollectionProductFilters(products));
  const selected = new Map<string, { id: string; src: string; alt: string }>();
  for (const { id, image, imageAlt } of featured) {
    const src = (typeof image === "string" ? image : image?.src)?.trim();
    if (!src || selected.has(id)) continue;
    selected.set(id, { id, src, alt: imageAlt ?? "" });
    if (selected.size === 12) break;
  }
  if (selected.size < 12) return null;

  const images = [...selected.values()];
  const rows = [images.filter((_, i) => i % 2 === 0), images.filter((_, i) => i % 2 === 1)];

  return (
    <div className={styles.productGallery}>
      {rows.map((row) => (
        <div key={row[0].id} className={styles.galleryTrack}>
          {[0, 1, 2, 3].map((copy) => (
            <div key={copy} className={styles.galleryGroup} aria-hidden={copy > 0 || undefined}>
              {row.map(({ id, src, alt }) => (
                <div key={id} className={styles.galleryTile}>
                  <img src={src} alt={copy > 0 ? "" : alt} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
