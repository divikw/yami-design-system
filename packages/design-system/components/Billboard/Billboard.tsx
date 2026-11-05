import styles from "./Billboard.module.css";
import type { BillboardProps } from "./Billboard.types";
import {
  buildImageSrcSet,
  getImageSourceUrl,
  ResponsiveImage,
} from "../ResponsiveImage";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * A full-bleed promotional band with one campaign destination.
 *
 * The artwork carries the offer, the styling and the call to action; the
 * component contributes the band, the link and the accessible name. That name
 * is a prop rather than something read off the artwork, because a reader has
 * no other way in — the words are pixels. It names the link as well as the
 * band: naming only the band leaves the link itself nameless, since an empty
 * alt gives it nothing to compute a name from.
 */
export function Billboard({
  image,
  href,
  label,
  mobileTextFallback = false,
  imageLoading = "lazy",
  revealOnLoad = false,
  className,
  ...rest
}: BillboardProps) {
  const showMobileText = mobileTextFallback && !image.mobile;
  return (
    <section
      {...rest}
      className={cx(styles.root, className)}
      data-slot="billboard"
      aria-label={label}
    >
      <a
        className={styles.link}
        href={href}
        aria-label={label}
        data-slot="billboard-link"
        data-mobile-text={showMobileText || undefined}
      >
        <picture>
          {image.mobile && (
            <source
              media="(max-width: 1023.98px)"
              srcSet={
                typeof image.mobile.src === "string"
                  ? image.mobile.src
                  : buildImageSrcSet(image.mobile.src) ||
                    getImageSourceUrl(image.mobile.src)
              }
              sizes={
                typeof image.mobile.src === "string"
                  ? undefined
                  : image.mobile.src.sizes
              }
              width={
                typeof image.mobile.src === "string"
                  ? image.mobile.width
                  : image.mobile.src.width
              }
              height={
                typeof image.mobile.src === "string"
                  ? image.mobile.height
                  : image.mobile.src.height
              }
            />
          )}
          <ResponsiveImage
            className={styles.image}
            source={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading={imageLoading}
            decoding="async"
            revealOnLoad={revealOnLoad}
            data-slot="billboard-image"
          />
        </picture>
        {showMobileText && (
          <span className={styles.mobileText} data-slot="billboard-mobile-text">
            <span>{label}</span>
            <svg className={styles.mobileArrow} width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M10 16h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </a>
    </section>
  );
}
