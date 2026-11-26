import { useId } from "react";
import { Card } from "../Card";
import { Divider } from "../Divider";
import { SectionHeading, type SectionHeadingProps } from "../SectionHeading";
import type { SectionDividerProps } from "../sectionDivider.types";
import styles from "./UserReviews.module.css";

const copy = {
  zh: {
    title: "下载5星好评的App",
    benefits: "降价提醒 | 专属推荐 | 快速结算 | 跟踪订单",
    download: "下载亚米 App",
    qrCaption: "扫码下载 APP，随时随地逛亚米",
    reviews: "用户评价",
  },
  en: {
    title: "Download the 5-Star Rated App",
    benefits: "Sale price alerts | Exclusive discounts | Faster & more secure checkout | Easy order tracking",
    download: "Download the Yami app",
    qrCaption: "Shop on the go. Get the app.",
    reviews: "User reviews",
  },
};

export interface UserReview {
  id: string;
  quote: string;
  author: string;
}

export interface UserReviewsProps extends SectionDividerProps {
  download: {
    appStore: { href: string; iconSrc: string };
    googlePlay: { href: string; iconSrc: string };
    qr: { href: string; src: string };
  };
  reviewColumns: readonly (readonly UserReview[])[];
  locale?: "zh" | "en";
  titleStyle?: "display" | "section";
  titleFontFamily?: SectionHeadingProps["titleFontFamily"];
  className?: string;
}

export function UserReviews({
  download,
  reviewColumns,
  locale = "zh",
  titleStyle = "display",
  titleFontFamily = "sans",
  dividerPosition = "top",
  dividerVariant = "gray",
  className,
}: UserReviewsProps) {
  const titleId = useId();
  const content = copy[locale];
  const columns = reviewColumns.filter((column) => column.length > 0);

  return (
    <section
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-slot="user-reviews"
      data-divider-position={dividerPosition}
      data-divider-variant={dividerVariant}
      aria-labelledby={titleId}
      lang={locale}
    >
      <div className={styles.container} data-slot="user-reviews-container">
        <div className={styles.panel}>
          <div className={styles.download}>
            <header className={styles.heading}>
              {titleStyle === "section" ? (
                <SectionHeading
                  id={titleId}
                  title={content.title}
                  titleFontFamily={titleFontFamily}
                  titleClassName={styles.sectionTitle}
                  slot="user-reviews"
                />
              ) : (
                <h2 id={titleId} className={styles.displayTitle} data-title-font-family={titleFontFamily}>
                  {content.title}
                </h2>
              )}
              <p>{content.benefits}</p>
            </header>
            <div className={styles.downloadOptions}>
              <a className={styles.qrLink} href={download.qr.href} aria-label={content.download}>
                <img src={download.qr.src} alt="" width={100} height={100} />
              </a>
              <div className={styles.storeDetails}>
                <div className={styles.stores}>
                  <a className={styles.storeLink} href={download.appStore.href}>
                    <img src={download.appStore.iconSrc} alt="" width={20} height={20} />
                    App Store
                  </a>
                  <Divider className={styles.divider} orientation="vertical" />
                  <a className={styles.storeLink} href={download.googlePlay.href}>
                    <img src={download.googlePlay.iconSrc} alt="" width={20} height={20} />
                    Google Play
                  </a>
                </div>
                <p>{content.qrCaption}</p>
              </div>
            </div>
          </div>

          {columns.length > 0 && (
            <div className={styles.reviewPane}>
              <div className={styles.reviewViewport} role="region" aria-label={content.reviews}>
                <div className={styles.reviewGrid}>
                  {columns.map((column) => (
                    <ul className={styles.reviewColumn} key={column[0].id} role="list">
                      {column.map(({ id, quote, author }) => (
                        <Card as="li" key={id} className={styles.reviewCard}>
                          <figure>
                            <blockquote><p>“{quote}”</p></blockquote>
                            <figcaption>{author}</figcaption>
                          </figure>
                        </Card>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
