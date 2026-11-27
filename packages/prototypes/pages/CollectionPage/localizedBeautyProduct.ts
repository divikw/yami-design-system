import type { ProductListItem } from "@yami/design-system";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import selections from "./beauty-keywords.products.json";
import catalog from "./k-beauty.products.json";

export const beautyProductsById = new Map([...catalog, ...selections].map(item => [item.id, item]));

export function localizedBeautyProduct(item: (typeof catalog)[number], locale: TopicLandingPageLocale): ProductListItem {
  const title = item[locale];
  return {
    id: item.id,
    title,
    image: item.image,
    imageAlt: title,
    href: `https://www.yami.com/us/${locale}/p/${item.slug}/${item.id}`,
    brand: item.brand,
    brandHref: `https://www.yami.com/us/${locale}/search?q=${encodeURIComponent(item.brand)}`,
    priceCurrent: item.price,
    priceOriginal: item.originalPrice,
    availability: item.soldOut ? "sold-out" : "available",
    addButtonAriaLabel: locale === "zh" ? `添加${title}到购物车` : `Add ${title} to cart`,
  };
}
