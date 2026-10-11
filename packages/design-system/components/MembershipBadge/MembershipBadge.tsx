import { forwardRef, type HTMLAttributes } from "react";

import styles from "./MembershipBadge.module.css";

export type MembershipBadgeTier = "ruby-0" | "ruby" | "silver" | "gold";

const artwork: Record<MembershipBadgeTier, string> = {
  "ruby-0": new URL("./assets/ruby-0.svg", import.meta.url).href,
  ruby: new URL("./assets/ruby.svg", import.meta.url).href,
  silver: new URL("./assets/silver.svg", import.meta.url).href,
  gold: new URL("./assets/gold.svg", import.meta.url).href,
};

const labels: Record<MembershipBadgeTier, string> = {
  "ruby-0": "Ruby-0 会员",
  ruby: "Ruby 会员",
  silver: "Silver 会员",
  gold: "Gold 会员",
};

export interface MembershipBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Membership tier matching the Figma variant. Defaults to ruby-0. */
  tier?: MembershipBadgeTier;
  /** Accessible name override. Use an empty string beside an existing tier label. */
  alt?: string;
}

/** 56×20px membership badge with original Figma artwork. */
export const MembershipBadge = forwardRef<HTMLSpanElement, MembershipBadgeProps>(function MembershipBadge(
  { tier = "ruby-0", alt = labels[tier], className, ...rest },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-slot="membership-badge"
      data-tier={tier}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img className={styles.artwork} src={artwork[tier]} alt="" aria-hidden="true" />
    </span>
  );
});
