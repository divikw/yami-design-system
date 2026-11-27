import { useEffect, useState } from "react";
import type { ProductListItem, TagMode } from "@yami/design-system";
import { TopicLandingPage } from "../TopicLandingPage/TopicLandingPage";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import type { TopicLandingPageProps } from "../TopicLandingPage/TopicLandingPage.types";
import type { createRelatedCollectionSections } from "./relatedCollections.fixture";

export default function CollectionPageContent({ page, componentId, locale, device, mode }: {
  page: TopicLandingPageProps;
  componentId: string;
  locale: TopicLandingPageLocale;
  device: "pc" | "mobile";
  mode: TagMode;
}) {
  const [notifications, setNotifications] = useState<ReadonlySet<string>>(() => new Set());
  const [createSections, setCreateSections] = useState<typeof createRelatedCollectionSections>();
  const [loadError, setLoadError] = useState<Error>();
  useEffect(() => {
    let active = true;
    import("./relatedCollections.fixture").then(
      module => { if (active) setCreateSections(() => module.createRelatedCollectionSections); },
      error => { if (active) setLoadError(error); },
    );
    return () => { active = false; };
  }, []);
  if (loadError) throw loadError;
  const sections = createSections?.(componentId, locale, device);
  const soldOutIds = new Set(page.waterfall.products.filter(product => product.availability === "sold-out").map(product => product.id));
  const applyAvailability = (product: ProductListItem): ProductListItem =>
    soldOutIds.has(product.id) ? {
      ...product,
      availability: "sold-out",
      availabilityLabel: locale === "zh" ? "已售完" : "Sold out",
      onNotify: () => setNotifications(current => new Set(current).add(product.id)),
      notifyLabel: notifications.has(product.id)
        ? (locale === "zh" ? "已设置到货通知" : "Notification set")
        : (locale === "zh" ? "到货通知" : "Notify me"),
      notifyDisabled: notifications.has(product.id),
    } : product;
  return (
    <TopicLandingPage
      {...page}
      waterfall={{
        ...page.waterfall,
        products: page.waterfall.products.map(applyAvailability),
        productsByTab: Object.fromEntries(Object.entries(page.waterfall.productsByTab ?? {}).map(
          ([category, products]) => [category, products.map(applyAvailability)],
        )),
      }}
      collectionLoading={!sections}
      relatedCollections={sections?.relatedCollections}
      relatedKeywords={sections && { ...sections.relatedKeywords, mode }}
    />
  );
}
