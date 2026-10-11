"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import { forwardRef, type HTMLAttributes } from "react";

import { MembershipIcon, type MembershipIconTier } from "../MembershipIcon";
import styles from "./Avatar.module.css";

const defaultAvatar = new URL("./assets/default-avatar.png", import.meta.url).href;

export type AvatarSize = "sm" | "md" | "lg";

const membershipNames: Record<MembershipIconTier, string> = {
  "ruby-0": "Ruby-0",
  ruby: "Ruby",
  silver: "Silver",
  gold: "Gold",
};

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Avatar image URL. Omit to use the default YAMI avatar. */
  src?: string;
  /** Accessible name; use an empty string beside a visible name. */
  alt: string;
  /** Fixed diameter: sm 32px, md 40px, lg 48px on mobile and desktop. */
  size?: AvatarSize;
  /** Optional membership ring and bottom-right tier icon. */
  membershipTier?: MembershipIconTier;
}

/** Non-interactive circular identity image. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, size = "md", membershipTier, lang = "en", className, ...rest },
  ref,
) {
  const label = alt.trim();
  const accessibleLabel = label && membershipTier
    ? lang.toLowerCase().startsWith("zh")
      ? `${label}，${membershipNames[membershipTier]} 会员`
      : `${label}, ${membershipNames[membershipTier]} member`
    : label;
  const imageSrc = src || defaultAvatar;

  // A different source must not inherit the previous image's loaded state.
  return (
    <AvatarPrimitive.Root
      key={imageSrc}
      {...rest}
      ref={ref}
      lang={lang}
      className={[styles.avatar, className].filter(Boolean).join(" ")}
      data-slot="avatar"
      data-size={size}
      data-membership-tier={membershipTier}
      role={label ? "img" : undefined}
      aria-label={accessibleLabel || undefined}
      aria-hidden={label ? undefined : true}
    >
      <span className={styles.portrait}>
        <AvatarPrimitive.Image
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className={styles.image}
          data-slot="avatar-image"
        />
        <AvatarPrimitive.Fallback className={styles.image} data-slot="avatar-default" aria-hidden="true">
          <img src={defaultAvatar} alt="" className={styles.image} />
        </AvatarPrimitive.Fallback>
      </span>
      {membershipTier && (
        <span className={styles.membership} data-slot="avatar-membership" aria-hidden="true">
          <MembershipIcon tier={membershipTier} alt="" className={styles.membershipIcon} />
        </span>
      )}
    </AvatarPrimitive.Root>
  );
});
