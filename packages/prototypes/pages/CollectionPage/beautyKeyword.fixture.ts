import type { ProductListItem, ReviewCardProps } from "@yami/design-system";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import type { TopicLandingPageProps } from "../TopicLandingPage/TopicLandingPage.types";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createCollectionFaq, type CollectionFaqEntries } from "./collectionFaq.fixture";
import reviews from "./beauty-reviews.json";
import selections from "./beauty-keywords.products.json";
import catalog from "./k-beauty.products.json";
import { localizedBeautyProduct } from "./localizedBeautyProduct";

type Copy = Record<TopicLandingPageLocale, string>;

interface Keyword {
  title: Copy;
  description: Copy;
  groups: { value: string; label: Copy; ids: string[] }[];
  faq: CollectionFaqEntries;
}

export const beautyProductsById = new Map([...catalog, ...selections].map(item => [item.id, item]));

// Each excerpt comes from the linked Yami product’s public review data.
export function createBeautyReviews(products: ProductListItem[], locale: TopicLandingPageLocale): ReviewCardProps[] {
  const ids = new Set(products.map(product => product.id));
  return reviews.filter(review => ids.has(review.productId)).slice(0, 3).map(review => {
    const product = beautyProductsById.get(review.productId);
    if (!product) throw new Error(`Missing reviewed product ${review.productId}`);
    return {
      id: `${product.id}-${review.reviewer}`,
      rating: review.rating,
      review: review[locale],
      reviewer: review.reviewer,
      product: {
        name: product[locale],
        brand: product.brand,
        imageSrc: product.image,
        imageAlt: product[locale],
        href: localizedBeautyProduct(product, locale).href,
      },
    };
  });
}

type CollectionMeta = {
  args: Pick<TopicLandingPageProps, "hero" | "waterfall">;
  parameters: { docs: object };
};

export function createBeautyKeywordMeta<T extends CollectionMeta>(collection: T, keyword: Keyword) {
  function createPageFixture(locale: TopicLandingPageLocale = "en") {
    const page = createCollectionPageFixture(locale);
    const groups = keyword.groups.map(group => ({
      value: group.value,
      label: group.label[locale],
      products: group.ids.map(id => {
        const item = beautyProductsById.get(id);
        if (!item) throw new Error(`Missing beauty product ${id} in ${keyword.title.en}`);
        return localizedBeautyProduct(item, locale);
      }),
    }));
    const products = groups.flatMap(group => group.products);
    return {
      ...page,
      activityHeader: { ...page.activityHeader, title: keyword.title[locale] },
      hero: { ...page.hero, title: keyword.title[locale], description: keyword.description[locale] },
      reviewList: { ...page.reviewList, reviews: createBeautyReviews(products, locale) },
      waterfall: {
        ...page.waterfall,
        products,
        productsByTab: { ...Object.fromEntries(groups.map(g => [g.value, g.products])), all: products },
        defaultValue: "all",
        tabs: groups.map(({ value, label }) => ({ value, label })),
      },
    };
  }
  const fixture = createPageFixture();
  const related = (locale: TopicLandingPageLocale) => ({
    title: locale === "zh" ? "探索更多" : "Explore More",
    items: ["K-Beauty", ...keyword.groups.map(group => group.label[locale])],
  });
  return {
    ...collection,
    args: {
      ...collection.args,
      activityHeader: fixture.activityHeader,
      hero: { ...collection.args.hero, title: fixture.hero.title, description: fixture.hero.description },
      waterfall: { ...collection.args.waterfall, ...fixture.waterfall },
    },
    parameters: {
      ...collection.parameters,
      createPageFixture,
      docs: { ...collection.parameters.docs, description: { component: keyword.description.en } },
      faqByLocale: createCollectionFaq(keyword.faq),
      relatedKeywordsByLocale: { en: related("en"), zh: related("zh") },
    },
  };
}
