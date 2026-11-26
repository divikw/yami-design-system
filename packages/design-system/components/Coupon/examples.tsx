"use client";

import { useEffect, useState } from "react";
import { Coupon, type CouponProps } from "./Coupon";

export function CouponExample() {
  const [selected, setSelected] = useState(false);
  return <Coupon title="立享 10% OFF" description="亚米自营商品通用，特殊商品除外" validity="有效期至 01/01/2027 15:59" selected={selected} onSelectedChange={setSelected} />;
}

type ClaimStatus = NonNullable<CouponProps["claim"]>["status"];

const claimLabels = {
  en: { available: "Claim", claiming: "Claiming…", claimed: "Claimed" },
  zh: { available: "领取", claiming: "领取中", claimed: "已领取" },
};

function usePreviewClaim(en: boolean, validDays: number, useHref: string | null) {
  const [status, setStatus] = useState<ClaimStatus>("available");
  const [expiresAt, setExpiresAt] = useState<Date>();
  useEffect(() => {
    if (status !== "claiming") return;
    const timer = window.setTimeout(() => {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + validDays);
      setExpiresAt(expiry);
      setStatus("claimed");
    }, 750);
    return () => window.clearTimeout(timer);
  }, [status, validDays]);
  return {
    expiryLabel: expiresAt
      ? `${en ? "Valid until" : "可用至"} ${expiresAt.toLocaleString(en ? "en-US" : "zh-CN", { dateStyle: "short", timeStyle: "short" })}`
      : undefined,
    claim: {
      status,
      label: claimLabels[en ? "en" : "zh"][status],
      onClaim: () => setStatus("claiming"),
      useLink: useHref === null ? undefined : { href: useHref, label: en ? "Use now" : "去使用", target: useHref.startsWith("#") ? undefined : "_blank" },
    },
  };
}

export function NewUserCouponExample({
  en,
  title = en ? "Save 10%" : "立享 10% OFF",
  description = en ? "Valid on Yami-fulfilled items. Exclusions apply." : "亚米自营商品通用，特殊商品除外",
  validity: unclaimedValidity = en ? "New users only. Valid for 7 days after claiming." : "仅限新用户, 领取后7天内有效",
  disabled,
  useHref = `https://www.yamibuy.com/${en ? "en" : "zh"}`,
}: Partial<Pick<CouponProps, "title" | "description" | "validity" | "disabled">> & { en: boolean; useHref?: string | null }) {
  const { claim, expiryLabel } = usePreviewClaim(en, 7, useHref);
  return (
    <Coupon
      title={title}
      description={description}
      disabled={disabled}
      validity={expiryLabel ?? unclaimedValidity}
      claim={claim}
    />
  );
}

export function AppShippingCouponExample({ en, useHref }: { en: boolean; useHref: string | null }) {
  const { claim, expiryLabel } = usePreviewClaim(en, 30, useHref);
  return (
    <Coupon
      title={en ? "App-exclusive free shipping" : "App 专享免运费券"}
      description={en ? "For your first order in the Yami app only." : "仅限亚米 App 首单"}
      validity={expiryLabel ?? (en ? "Valid for 30 days after claiming." : "领取后 30 天内有效")}
      claim={claim}
    />
  );
}
