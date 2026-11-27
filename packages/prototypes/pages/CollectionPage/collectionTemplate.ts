import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import type { TopicLandingPageProps } from "../TopicLandingPage/TopicLandingPage.types";
import type { createCollectionFaq } from "./collectionFaq.fixture";

export type CollectionStoryBase = { args: TopicLandingPageProps; parameters: { docs: object } };

export function createCollectionMeta<T extends CollectionStoryBase>(
  topicMeta: T,
  createPageFixture: (locale: TopicLandingPageLocale) => TopicLandingPageProps,
  faqByLocale: ReturnType<typeof createCollectionFaq>,
  description: string,
) {
  const page = createPageFixture("en");
  return {
    ...topicMeta,
    parameters: {
      ...topicMeta.parameters,
      createPageFixture,
      faqByLocale,
      docs: { ...topicMeta.parameters.docs, description: { component: description } },
    },
    args: {
      ...topicMeta.args,
      activityHeader: page.activityHeader,
      hero: {
        ...page.hero,
        image: undefined,
        tags: undefined,
        tagTone: undefined,
        style: {
          backgroundColor: "var(--surface-secondary)",
          minHeight: "clamp(10rem, 16dvw, var(--collection-hero-max-height, 15rem))",
        },
      },
      waterfall: {
        ...page.waterfall,
        catalogFilters: "brand" as const,
        initialRows: 3,
        rowsPerPage: 6,
      },
      hiddenModules: ["shortcuts", "start-here", "popular-picks"] satisfies TopicLandingPageProps["hiddenModules"],
      reviewsAfterProducts: true,
      primaryTabs: { ...page.primaryTabs, items: [] },
    },
  };
}

export const collectionMobile = {
  parameters: { viewport: { defaultViewport: "yamiMobile" } },
  globals: process.env.NODE_ENV === "test" ? { viewport: { value: "yamiMobile", isRotated: false } } : {},
};
