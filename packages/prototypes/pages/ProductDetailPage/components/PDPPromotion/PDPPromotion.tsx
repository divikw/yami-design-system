import { type MouseEventHandler, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { PDPGiftActivity, PDPPromotionProps } from "./PDPPromotion.types";
import styles from "./PDPPromotion.module.css";

const couponIcon = new URL(
  "../../../../../design-system/assets/icons/base/coupons.svg",
  import.meta.url,
).href;
const giftCardIcon = new URL(
  "../../../../../design-system/assets/icons/base/gift.svg",
  import.meta.url,
).href;
const codeIcon = new URL(
  "../../../../../design-system/assets/icons/discount/code.svg",
  import.meta.url,
).href;
const giftIcon = new URL(
  "../../../../../design-system/assets/icons/discount/gift.svg",
  import.meta.url,
).href;

function ArrowIcon() {
  return <span className={styles.arrowIcon} aria-hidden="true" />;
}

function PromotionAction({ label, onClick }: { label?: string; onClick?: MouseEventHandler<HTMLButtonElement> }) {
  if (!label) return null;
  const content = <><span className={styles.actionText}>{label}</span><ArrowIcon /></>;
  return onClick ? (
    <button type="button" className={styles.action} aria-label={label} onClick={onClick}>
      {content}
    </button>
  ) : (
    <span className={styles.action}>{content}</span>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5" y="3" width="8" height="8" rx="1" fill="none" stroke="currentColor" />
      <path d="M3 5.5V13h7.5" fill="none" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m3.5 8.2 2.7 2.7 6.3-6.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeOffers(coupon: NonNullable<PDPPromotionProps["coupon"]>) {
  if (coupon.offers?.length) return coupon.offers;
  if (coupon.description) return coupon.description.split(/\s*[·•]\s*/).filter(Boolean);
  return coupon.title ? [coupon.title] : [];
}

function normalizeActivities(gifts: NonNullable<PDPPromotionProps["gifts"]>): readonly PDPGiftActivity[] {
  if (gifts.activities?.length) return gifts.activities;
  return (gifts.items ?? []).map((gift) => ({
    title: gift.title,
    detail: gift.detail,
    items: [{ image: gift.image, alt: gift.alt, quantity: gift.quantity }],
  }));
}

export function PDPPromotion({ giftCard, coupon, discountCode, gifts, className, ...rest }: PDPPromotionProps) {
  const [copied, setCopied] = useState(false);
  const [visibleActivityCount, setVisibleActivityCount] = useState(Number.POSITIVE_INFINITY);
  const copiedTimer = useRef<number | undefined>(undefined);
  const giftActivitiesRef = useRef<HTMLDivElement>(null);
  const offers = useMemo(() => coupon ? normalizeOffers(coupon) : [], [coupon]);
  const activities = useMemo(() => gifts ? normalizeActivities(gifts).slice(0, 3) : [], [gifts]);

  useEffect(() => () => {
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
  }, []);

  useLayoutEffect(() => {
    const container = giftActivitiesRef.current;
    if (!container || activities.length === 0) return;

    const updateVisibleActivities = () => {
      const activityElements = Array.from(container.children) as HTMLElement[];
      const gap = parseFloat(getComputedStyle(container).columnGap) || 0;
      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (const activity of activityElements) {
        const nextWidth = usedWidth + (nextVisibleCount > 0 ? gap : 0) + activity.getBoundingClientRect().width;
        if (nextWidth > container.clientWidth + 0.5) break;
        usedWidth = nextWidth;
        nextVisibleCount += 1;
      }

      setVisibleActivityCount(Math.max(1, nextVisibleCount));
    };

    updateVisibleActivities();
    const frame = requestAnimationFrame(updateVisibleActivities);
    if (typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(updateVisibleActivities);
    observer.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activities.length]);

  const copyDiscountCode = async () => {
    if (!discountCode || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(discountCode.code);
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!giftCard && !coupon && !discountCode && activities.length === 0) return null;

  return (
    <section {...rest} className={cx(styles.root, className)} data-slot="product-pricing-promotions">
      {giftCard ? (
        <div className={styles.row} data-slot="product-pricing-gift-card">
          <img className={styles.icon} src={giftCardIcon} alt="" aria-hidden="true" />
          <div className={styles.giftCardCopy}>
            <strong><span>{giftCard.label}</span><em>{giftCard.price}</em></strong>
            {giftCard.description ? <span className={styles.legacyDescription}>{giftCard.description}</span> : null}
          </div>
          <PromotionAction label={giftCard.detailsLabel} onClick={giftCard.onDetailsClick} />
        </div>
      ) : null}

      {coupon && offers.length > 0 ? (
        <div className={styles.row} data-slot="product-promotion-coupon">
          <img className={styles.icon} src={couponIcon} alt="" aria-hidden="true" />
          <div className={styles.couponOffers}>
            {offers.map((offer) => <span className={styles.couponOffer} key={offer}>{offer}</span>)}
          </div>
          <PromotionAction label={coupon.detailsLabel} onClick={coupon.onDetailsClick} />
        </div>
      ) : null}

      {discountCode ? (
        <div className={styles.row} data-slot="product-promotion-code">
          <img className={styles.icon} src={codeIcon} alt="" aria-hidden="true" />
          <strong className={styles.codeTitle}>{discountCode.label} <span>{discountCode.code}</span></strong>
          <button
            type="button"
            className={styles.copyAction}
            onClick={copyDiscountCode}
            aria-label={copied ? (discountCode.copiedLabel ?? "Copied!") : discountCode.copyLabel}
          >
            <span className={styles.copyActionText} aria-live="polite">
              {copied ? <><CheckIcon />{discountCode.copiedLabel ?? "Copied!"}</> : discountCode.copyLabel}
            </span>
            <span className={styles.copyActionCompact}>{copied ? <CheckIcon /> : <CopyIcon />}</span>
          </button>
        </div>
      ) : null}

      {gifts && activities.length > 0 ? (
        <div className={styles.gifts} data-slot="product-promotion-gifts">
          <div className={styles.giftsHeading}>
            <img className={styles.icon} src={giftIcon} alt="" aria-hidden="true" />
            <strong>{gifts.title}</strong>
            <PromotionAction
              label={gifts.detailsLabel ?? gifts.actionLabel}
              onClick={gifts.onDetailsClick}
            />
          </div>
          <div ref={giftActivitiesRef} className={styles.giftActivities}>
            {activities.map((activity, activityIndex) => {
              const visible = activityIndex < visibleActivityCount;
              const visibleItems = activity.items.length > 3 ? activity.items.slice(0, 2) : activity.items.slice(0, 3);
              const hiddenCount = activity.items.length - visibleItems.length;
              return (
                <article
                  className={styles.giftActivity}
                  key={`${activity.title}-${activityIndex}`}
                  data-visible={visible || undefined}
                  aria-hidden={!visible || undefined}
                >
                  <div className={styles.giftActivityCopy}>
                    <strong>{activity.title}</strong>
                    {activity.detail ? <span>{activity.detail}</span> : null}
                  </div>
                  <div className={styles.giftSkus}>
                    {visibleItems.map((item, itemIndex) => (
                      <div className={styles.giftSku} key={`${item.alt}-${itemIndex}`}>
                        <img src={item.image} alt={item.alt} />
                        <span className={styles.quantityBadge}>×{item.quantity ?? 1}</span>
                      </div>
                    ))}
                    {hiddenCount > 0 ? <span className={styles.moreGifts}>{hiddenCount}+</span> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
