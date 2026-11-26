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
  ServiceCommitmentProps,
  ShortcutRailProps,
  TagMode,
  ThemeProductListProps,
  UserReviewsProps,
} from "@yami/design-system";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactElement } from "react";

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
  /** Use catalog filters in place of category tabs. "brand" shows a brand filter and omits the category and all-filters entries. */
  catalogFilters?: boolean | "brand";
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
  items: readonly (string | { label: string; href: string; target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"] })[];
  mode?: TagMode;
}

export type CollectionModuleDividers = Partial<Record<
  "header" | "hero" | "couponSection" | "waterfall" | "reviewList" | "faq" |
  "relatedCollections" | "relatedKeywords" | "appReviews" | "serviceCommitment" | "footer",
  NonNullable<ProductListProps["dividerPosition"]> | "both"
>>;

export interface TopicLandingPageProps extends HTMLAttributes<HTMLDivElement> {
  /** Outer divider placement for each collection module. Omitted entries retain the component default. */
  moduleDividers?: CollectionModuleDividers;
  /** Maximum width shared by every content container inside main. Numbers are treated as pixels. */
  contentMaxWidth?: number | string;
  /** Font family shared by collection content headings inside main. */
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
  /** App download panel and app reviews shown after the related keywords. */
  appReviews?: UserReviewsProps;
  /** Service commitments shown at the top of the page, above the navigation. */
  serviceCommitment?: ServiceCommitmentProps;
  productRail: TopicLandingPageProductRailProps;
  /** Optional brand collection rendered immediately after Popular Picks. */
  brandRail?: BrandProductRailProps;
  waterfall: TopicLandingPageWaterfallProps;
  /** Modules intentionally omitted by the compiled page plan. */
  hiddenModules?: readonly TopicLandingPageModuleId[];
  footer: FooterProps;
}
