"use client";

import { useId, type ReactNode } from "react";
import {
  HeroBanner,
  type HeroBannerProps,
  type HeroBannerImageTextProductsItem,
  type HeroBannerProductsOnlyItem,
} from "../HeroBanner";
import { SectionHeading } from "../SectionHeading";
import styles from "./SectionBanner.module.css";

export type SectionBannerItem = HeroBannerImageTextProductsItem | HeroBannerProductsOnlyItem;

export interface SectionBannerProps
  extends Omit<HeroBannerProps, "title" | "items" | "dividerPosition" | "dividerVariant"> {
  /** 整组 Banner 上方的模块标题。 */
  title: ReactNode;
  /** 模块标题的补充描述。 */
  description?: ReactNode;
  /** 模块标题对齐方式：start 左对齐，center 居中。 */
  headingAlign?: "start" | "center";
  /** 仅支持带商品的卡片：图文商品卡或纯商品卡。 */
  items: SectionBannerItem[];
}

export function SectionBanner({ title, description, headingAlign = "start", className, ...props }: SectionBannerProps) {
  const titleId = useId();

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-slot="section-banner"
    >
      <SectionHeading
        id={titleId}
        title={title}
        description={description}
        align={headingAlign}
        slot="section-banner"
        className={styles.heading}
      />
      <HeroBanner
        {...props}
        aria-labelledby={titleId}
        dividerPosition="none"
        className={styles.banner}
      />
    </div>
  );
}
