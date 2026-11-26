import { useId } from "react";
import { ButtonLink } from "../Button";
import { Card } from "../Card";
import { Divider } from "../Divider";
import { SectionHeading, type SectionHeadingProps } from "../SectionHeading";
import type { SectionDividerProps } from "../sectionDivider.types";
import styles from "./UserReviews.module.css";

const shoppingImage = new URL("./assets/app-download-shopping.webp", import.meta.url).href;

const copy = {
  zh: {
    title: "下载5星好评的App",
    benefits: "降价提醒 | 专属推荐 | 快速结算 | 跟踪订单",
    download: "下载亚米 App",
    qrCaption: "扫码下载 APP，随时随地逛亚米",
    reviews: "用户评价",
    shoppingImageAlt: "打开的亚米商品箱中装着食品、洗护用品、纸尿裤和厨房小家电。",
  },
  en: {
    title: "Download the 5-Star Rated App",
    benefits: "Sale price alerts | Exclusive discounts | Faster & more secure checkout | Easy order tracking",
    download: "Download the Yami app",
    qrCaption: "Shop on the go. Get the app.",
    reviews: "User reviews",
    shoppingImageAlt: "An open Yami box filled with food, personal care products, diapers, and a kitchen appliance.",
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
    /** Mobile download destination. Defaults to the QR link destination. */
    mobileHref?: string;
    /** App icon displayed above the mobile download button. */
    mobileIconSrc?: string;
  };
  /** Apply responsive page padding around the panel. Defaults to true. */
  padding?: boolean;
  version?: "v1" | "v2";
  imageLayout?: "balanced" | "image-first" | "compact";
  reviewColumns?: readonly (readonly UserReview[])[];
  locale?: "zh" | "en";
  titleStyle?: "display" | "section";
  titleFontFamily?: SectionHeadingProps["titleFontFamily"];
  className?: string;
}

export function UserReviews({
  download,
  version = "v1",
  imageLayout = "balanced",
  padding = true,
  reviewColumns = [],
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
      <div className={styles.container} data-slot="user-reviews-container" data-padding={padding}>
        <div className={styles.panel} data-version={version} data-image-layout={version === "v2" ? imageLayout : undefined}>
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
              {download.mobileIconSrc && (
                <img className={styles.mobileIcon} src={download.mobileIconSrc} alt="" width={80} height={80} />
              )}
              <ButtonLink
                className={styles.mobileDownload}
                href={download.mobileHref ?? download.qr.href}
                size="md"
              >
                {content.download}
              </ButtonLink>
            </div>
          </div>

          {version === "v2" ? (
            <img className={styles.shoppingImage} src={shoppingImage} alt={content.shoppingImageAlt} width={1000} height={1000} />
          ) : columns.length > 0 && (
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
