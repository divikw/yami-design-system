import { createHeroBannerItems, type HeroBannerLocale } from "../HeroBanner/fixtures";
import type { SectionBannerItem } from "./SectionBanner";

export function createSectionBannerItems(locale: HeroBannerLocale): SectionBannerItem[] {
  return createHeroBannerItems(locale, (slug) => `/campaigns/${slug}`).filter(
    (item): item is SectionBannerItem => Boolean(item.products?.length),
  );
}
