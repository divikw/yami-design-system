import type { CollectionModuleDividers } from "../TopicLandingPage/TopicLandingPage.types";
import type { UserReviewsProps } from "@yami/design-system";
import { AppShippingCouponExample, NewUserCouponExample } from "@yami/design-system/components/Coupon/fixtures";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";
import { createTopicLandingPageFixture, type TopicLandingPageLocale } from "../TopicLandingPage/fixtures";

export function createCollectionPageFixture(locale: TopicLandingPageLocale = "en") {
  const newUserCouponCopy = locale === "en" ? {
    title: "10% OFF Your First Order",
    validity: "Valid for 7 days after claiming.",
  } : undefined;
  return {
    ...createTopicLandingPageFixture(locale),
    moduleDividers: {
      hero: "none",
      couponSection: "bottom",
      waterfall: "bottom",
      reviewList: "bottom",
      faq: "bottom",
      relatedCollections: "bottom",
      relatedKeywords: "bottom",
      appReviews: "none",
      serviceCommitment: "none",
    } satisfies CollectionModuleDividers,
    couponSection: {
      title: locale === "zh" ? "新人优惠" : "Welcome Offers",
      cards: [
        <NewUserCouponExample {...newUserCouponCopy} useHref={null} key="new-user" en={locale === "en"} />,
        <AppShippingCouponExample useHref={null} key="app-shipping" en={locale === "en"} />,
      ],
    },
    appReviews: {
      ...userReviewsExamples[locale],
      version: "v2",
      dividerPosition: "none",
      dividerVariant: "gray",
      titleStyle: "section",
    } satisfies UserReviewsProps,
    serviceCommitment: { locale },
  };
}
