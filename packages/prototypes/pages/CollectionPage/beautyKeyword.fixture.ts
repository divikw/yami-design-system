import type { ProductListItem, ReviewCardProps } from "@yami/design-system";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { createCollectionMeta, type CollectionStoryBase } from "./collectionTemplate";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createCollectionFaq, type CollectionFaqEntries } from "./collectionFaq.fixture";
import reviews from "./beauty-reviews.json";
import { beautyProductsById, localizedBeautyProduct } from "./localizedBeautyProduct";

type Copy = Record<TopicLandingPageLocale, string>;

interface Keyword {
  title: Copy;
  description: Copy;
  faqSubject: Copy;
  groups: { value: string; label: Copy; ids: string[] }[];
  faq: CollectionFaqEntries;
}

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

export function createBeautyKeywordMeta<T extends CollectionStoryBase>(topicMeta: T, keyword: Keyword) {
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
  return createCollectionMeta(topicMeta, createPageFixture, createCollectionFaq(keyword.faqSubject, keyword.faq), keyword.description.en);
}
