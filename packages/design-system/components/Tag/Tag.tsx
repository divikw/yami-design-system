"use client";

import { useRender } from "@base-ui/react/use-render";
import { forwardRef, type HTMLAttributes } from "react";

import type { ImageSource } from "../image.types";
import { ResponsiveImage } from "../ResponsiveImage";
import styles from "./Tag.module.css";

export type TagContext = "content" | "overlay";
export type TagMode = "dark" | "light";
export type TagSize = "m" | "l";
export type TagVariant = "filled" | "outline";

export interface TagImage {
  src: ImageSource;
  /** Keep empty when the artwork repeats the visible label. */
  alt: string;
}

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Placement context: ordinary content or a visual background.
   */
  context?: TagContext;
  /** Light or dark mode of the surface behind the Tag. */
  mode?: TagMode;
  /** Legacy size alias. Both values use the same 32px mobile / 36px desktop height. */
  size?: TagSize;
  /** Filled or outlined container treatment. */
  variant?: TagVariant;
  /** Optional leading artwork. */
  image?: TagImage;
  /** Replace the span with a semantically equivalent label element. */
  render?: useRender.RenderProp;
}

/**
 * Static, pill-shaped label for short descriptive keywords.
 * Tag is intentionally non-interactive; use a Button or Tabs for actions.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    context = "content",
    image,
    mode = "light",
    size = "m",
    variant = "filled",
    className,
    children,
    render,
    ...rest
  },
  ref,
) {
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    props: {
      ...rest,
      className: [styles.tag, className].filter(Boolean).join(" "),
      "data-slot": "tag",
      "data-context": context,
      "data-has-image": image ? "true" : undefined,
      "data-mode": mode,
      "data-size": size,
      "data-variant": variant,
      children: <>
        {image && (
          <span className={styles.image} data-slot="tag-image">
            <ResponsiveImage
              source={image.src}
              alt={image.alt}
              width={32}
              height={32}
            />
          </span>
        )}
        {children}
      </>,
    },
  });
});
