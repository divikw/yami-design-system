import { AppShippingCouponExample, NewUserCouponExample } from "@yami/design-system/components/Coupon/fixtures";
import { createTopicLandingPageFixture, type TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { downloadHref } from "../AppDownloadPage/fixtures";

export function createCollectionPageFixture(
  locale: TopicLandingPageLocale = "en",
  { showCouponUseLinks = true }: { showCouponUseLinks?: boolean } = {},
) {
  return {
    ...createTopicLandingPageFixture(locale),
    couponSection: {
      title: locale === "zh" ? "优惠券" : "Coupons",
      cards: [
        <NewUserCouponExample useHref={showCouponUseLinks ? "#product-list" : null} key="new-user" en={locale === "en"} />,
        <AppShippingCouponExample useHref={showCouponUseLinks ? downloadHref : null} key="app-shipping" en={locale === "en"} />,
      ],
    },
  };
}
