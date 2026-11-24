import { AppShippingCouponExample, NewUserCouponExample } from "@yami/design-system/components/Coupon/fixtures";
import { createTopicLandingPageFixture, type TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { downloadHref } from "../AppDownloadPage/fixtures";

export function createCollectionPageFixture(locale: TopicLandingPageLocale = "en") {
  return {
    ...createTopicLandingPageFixture(locale),
    couponSection: {
      title: locale === "zh" ? "优惠券" : "Coupons",
      cards: [
        <NewUserCouponExample useHref="#product-list" key="new-user" en={locale === "en"} />,
        <AppShippingCouponExample useHref={downloadHref} key="app-shipping" en={locale === "en"} />,
      ],
    },
  };
}
