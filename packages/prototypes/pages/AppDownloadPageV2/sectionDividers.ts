import type { SectionDividerProps } from "../../../design-system/components/sectionDivider.types";

export type AppDownloadSectionId = "hero" | "welcome-coupon" | "discount-products" | "coupon-guide" | "savings-calculator" | "brand-special" | "sns-trend" | "reviews" | "bottom-cta-section";
export type AppDownloadSectionDividers = Partial<Record<AppDownloadSectionId, SectionDividerProps>>;

export function dividerAttributes({ dividerPosition = "none", dividerVariant = "gray" }: SectionDividerProps) {
  return { "data-divider-position": dividerPosition, "data-divider-variant": dividerVariant };
}
