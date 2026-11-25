import type {
  ActivityPageHeaderProps,
  BrandProductRailProps,
  ThemeHeroProps,
  FooterProps,
  HeaderProps,
  CollectionCardProps,
  ProductListItem,
  ProductListProps,
  ReviewListProps,
  ShortcutRailProps,
  TagMode,
  ThemeProductListProps,
} from "@yami/design-system";
import type { HTMLAttributes, ReactElement } from "react";

export interface TopicLandingPagePrimaryTab {
  value: string;
  label: string;
  targetId: string;
}

export interface TopicLandingPagePrimaryTabs {
  ariaLabel: string;
  defaultValue: string;
  items: TopicLandingPagePrimaryTab[];
}

export type TopicLandingPageModuleId =
  | "hero"
  | "shortcuts"
  | "start-here"
  | "popular-picks"
  | "brand-spotlight"
  | "reviews"
  | "explore-more";

export type TopicLandingPageWaterfallProps = ProductListProps & {
  productsByTab?: Record<string, ProductListItem[]>;
  /** Use the catalog filter toolbar in place of the inline category tabs. */
  catalogFilters?: boolean;
  /** Number of grid rows shown before loading more, overriding rowsPerPage for the first batch. */
  initialRows?: number;
  /** Number of grid rows added by each load-more action and shown initially by default. */
  rowsPerPage?: number;
};

export type TopicLandingPageProductRailProps = ProductListProps & {
  productsByTab?: Record<string, ProductListItem[]>;
};

export interface TopicLandingPageFaq {
  title: string;
  description?: string;
  items: readonly { id: string; question: string; answer: string }[];
}

export interface TopicLandingPageRelatedKeywords {
  title: string;
  items: readonly string[];
  mode?: TagMode;
}

export interface TopicLandingPageProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum width shared by every content container inside main. Numbers are treated as pixels. */
  contentMaxWidth?: number | string;
  /** Font family shared by the hero title and every module title inside main. */
  titleFontFamily?: "sans" | "serif";
  /** Hides online-only global chrome for self-contained offline delivery. */
  showChrome?: boolean;
  /** Let the PC header scroll away and reveal it when scrolling toward the top. */
  revealHeaderOnScrollUp?: boolean;
  activityHeader: ActivityPageHeaderProps;
  header: HeaderProps;
  hero: ThemeHeroProps;
  couponSection?: { title: string; cards: readonly ReactElement[] };
  primaryTabs: TopicLandingPagePrimaryTabs;
  shortcutRail: ShortcutRailProps;
  standardRail?: ThemeProductListProps;
  reviewList?: ReviewListProps;
  /** Place the review section after the product grid. */
  reviewsAfterProducts?: boolean;
  faq?: TopicLandingPageFaq;
  relatedCollections?: {
    title: string;
    previousLabel: string;
    nextLabel: string;
    items: CollectionCardProps["item"][];
  };
  relatedKeywords?: TopicLandingPageRelatedKeywords;
  productRail: TopicLandingPageProductRailProps;
  /** Optional brand collection rendered immediately after Popular Picks. */
  brandRail?: BrandProductRailProps;
  waterfall: TopicLandingPageWaterfallProps;
  /** Modules intentionally omitted by the compiled page plan. */
  hiddenModules?: readonly TopicLandingPageModuleId[];
  footer: FooterProps;
}
