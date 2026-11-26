import type { UserReviewsProps } from "@yami/design-system";
import { AppShippingCouponExample, NewUserCouponExample } from "@yami/design-system/components/Coupon/fixtures";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";
import { createTopicLandingPageFixture, type TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { downloadHref } from "../AppDownloadPage/fixtures";

export function createCollectionPageFixture(
  locale: TopicLandingPageLocale = "en",
  { showCouponUseLinks = true, newUserCouponCopy }: {
    showCouponUseLinks?: boolean;
    newUserCouponCopy?: { title: string; validity: string };
  } = {},
) {
  return {
    ...createTopicLandingPageFixture(locale),
    couponSection: {
      title: locale === "zh" ? "优惠券" : "Coupons",
      cards: [
        <NewUserCouponExample {...newUserCouponCopy} useHref={showCouponUseLinks ? "#product-list" : null} key="new-user" en={locale === "en"} />,
        <AppShippingCouponExample useHref={showCouponUseLinks ? downloadHref : null} key="app-shipping" en={locale === "en"} />,
      ],
    },
    appReviews: {
      ...userReviewsExamples[locale],
      dividerPosition: "top",
      dividerVariant: "gray",
      titleStyle: "section",
    } satisfies UserReviewsProps,
    serviceCommitment: { locale },
  };
}
