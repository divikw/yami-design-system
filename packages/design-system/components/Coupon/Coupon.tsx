"use client";

import { useId } from "react";
import { Checkbox } from "../Checkbox";
import styles from "./Coupon.module.css";

export interface CouponProps {
  title: string;
  description: string;
  validity?: string;
  selected: boolean;
  disabled?: boolean;
  onSelectedChange: (selected: boolean) => void;
  className?: string;
}

export function Coupon({ title, description, validity, selected, disabled = false, onSelectedChange, className }: CouponProps) {
  const descriptionId = useId();
  const titleId = `${descriptionId}-title`;
  return <label className={[styles.coupon, className].filter(Boolean).join(" ")} data-slot="coupon" data-disabled={disabled || undefined}>
    <span className={`${styles.segment} ${styles.header}`}>
      <strong className={styles.title} id={titleId}>{title}</strong>
      <Checkbox className={styles.selector} checked={selected} disabled={disabled} onCheckedChange={onSelectedChange} aria-labelledby={titleId} aria-describedby={descriptionId} />
    </span>
    <span className={`${styles.segment} ${styles.details}`} id={descriptionId}>
      <span>{description}</span>
      {validity ? <span className={styles.validity}>{validity}</span> : null}
    </span>
  </label>;
}
