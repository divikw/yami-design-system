"use client";

import { useId } from "react";
import { Button, ButtonLink, type ButtonLinkProps } from "../Button";
import { Checkbox } from "../Checkbox";
import styles from "./Coupon.module.css";

interface CouponContent {
  title: string;
  description: string;
  validity?: string;
  disabled?: boolean;
  className?: string;
}

export type CouponProps = CouponContent & ({
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  claim?: never;
} | {
  claim: {
    status: "available" | "claiming" | "claimed";
    label: string;
    onClaim: () => void;
    useLink?: Pick<ButtonLinkProps, "href" | "target"> & { label: string };
  };
  selected?: never;
  onSelectedChange?: never;
});

export function Coupon({ title, description, validity, selected, disabled = false, onSelectedChange, claim, className }: CouponProps) {
  const descriptionId = useId();
  const titleId = `${descriptionId}-title`;
  const Root = claim ? "div" : "label";
  return <Root className={[styles.coupon, className].filter(Boolean).join(" ")} data-slot="coupon" aria-busy={claim?.status === "claiming" || undefined} data-disabled={disabled || undefined}>
    <span className={`${styles.segment} ${styles.header}`} aria-live={claim ? "polite" : undefined}>
      <strong className={styles.title} id={titleId}>{title}</strong>
      {claim?.status === "claimed" && claim.useLink && !disabled ? (
        <ButtonLink variant="secondary" size="sm" href={claim.useLink.href} target={claim.useLink.target} aria-describedby={`${titleId} ${descriptionId}`}>
          {claim.useLink.label}
        </ButtonLink>
      ) : claim?.status === "claimed" ? (
        <span className={styles.claimStatus} data-slot="coupon-claim-status">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {claim.label}
        </span>
      ) : claim ? (
        <Button variant="secondary" size="sm" disabled={disabled || claim.status === "claiming"}
          aria-describedby={`${titleId} ${descriptionId}`} onClick={claim.onClaim}>
          {claim.label}
        </Button>
      ) : (
        <Checkbox className={styles.selector} checked={selected} disabled={disabled} onCheckedChange={onSelectedChange} aria-labelledby={titleId} aria-describedby={descriptionId} />
      )}
    </span>
    <span className={`${styles.segment} ${styles.details}`} id={descriptionId}>
      <span>{description}</span>
      {validity ? <span>{validity}</span> : null}
    </span>
  </Root>;
}
