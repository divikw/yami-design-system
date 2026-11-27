import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import type { TopicLandingPageProps } from "../TopicLandingPage/TopicLandingPage.types";
import { beautyProductsById } from "./localizedBeautyProduct";

const collections = [
  { id: "k-beauty", en: "K-Beauty", zh: "K-Beauty", products: ["5022432061", "1022281871", "1022431511", "1194269971"] },
  { id: "brand", en: "ANUA", zh: "ANUA", products: ["1022281871", "1022500901", "1022446461", "1022517231"] },
  { id: "skin1004", en: "SKIN1004", zh: "SKIN1004", products: ["1022190081", "1022190061", "1022738691", "1022190131"] },
  { id: "romand", en: "rom&nd", zh: "rom&nd", products: ["1194269971", "1023244621", "1194270051", "1194270391"] },
  { id: "toners", en: "Toners", zh: "爽肤水", products: ["1022281871", "1022138761", "1030425321", "1022215801"] },
  { id: "sun-serums", en: "Sun Serums", zh: "防晒精华", products: ["1022431511", "1022685961", "5196078061", "1180045951"] },
  { id: "lip-tints", en: "Lip Tints", zh: "唇釉", relatedIds: ["k-beauty", "brand", "romand"], products: ["1194269971", "1194337511", "1194226491", "1023140441"] },
];

type Device = "pc" | "mobile";

const storyId = (id: string) => `yami-pages-landing-page-collection-page-${id}`;

export function createRelatedCollectionSections(
  currentComponentId: string,
  locale: TopicLandingPageLocale,
  device: Device,
) {
  const current = collections.find(collection => storyId(collection.id) === currentComponentId);
  const related = collections.filter(collection =>
    collection !== current && (current?.relatedIds?.includes(collection.id) ?? true),
  );
  const items = related.map(collection => ({
    id: collection.id,
    title: collection[locale],
    href: `./?path=/story/${storyId(collection.id)}--${device}&globals=locale:${locale};viewport.value:${device === "pc" ? "yamiDesktopMd" : "yamiMobile"}`,
    target: "_top" as const,
    products: collection.products.map(id => {
      const product = beautyProductsById.get(id);
      if (!product) throw new Error(`Missing product ${id} in ${collection.en}`);
      return { src: product.image, alt: product[locale] };
    }),
  }));
  return {
    relatedCollections: {
      title: locale === "zh" ? "相关专辑" : "Related Collections",
      previousLabel: locale === "zh" ? "上一组专辑" : "Previous collections",
      nextLabel: locale === "zh" ? "下一组专辑" : "Next collections",
      items,
    },
    relatedKeywords: {
      title: locale === "zh" ? "探索更多" : "Explore More",
      items: items.map(({ title, href, target }) => ({ label: title, href, target })),
    },
  } satisfies Pick<TopicLandingPageProps, "relatedCollections" | "relatedKeywords">;
}
