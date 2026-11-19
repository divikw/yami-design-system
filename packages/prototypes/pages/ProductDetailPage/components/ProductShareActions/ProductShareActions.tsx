import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@yami/design-system";

import styles from "./ProductShareActions.module.css";

const heartIcon = new URL(
  "../../../../../design-system/assets/icons/action/heart.svg",
  import.meta.url,
).href;
const shareIcon = new URL(
  "../../../../../design-system/assets/icons/action/share.svg",
  import.meta.url,
).href;
const facebookIcon = new URL(
  "../../../../../design-system/assets/icons/social/facebook.svg",
  import.meta.url,
).href;
const pinterestIcon = new URL(
  "../../../../../design-system/assets/icons/social/pinterest.svg",
  import.meta.url,
).href;
const emailIcon = new URL(
  "../../../../../design-system/assets/icons/social-monochrome/email.svg",
  import.meta.url,
).href;
const wechatIcon = new URL(
  "../../../../../design-system/assets/icons/social/wechat.svg",
  import.meta.url,
).href;
const weiboIcon = new URL(
  "../../../../../design-system/assets/icons/social/weibo.svg",
  import.meta.url,
).href;
const wechatQrCode = new URL("./wechat-share-qr.svg", import.meta.url).href;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a9.7 9.7 0 0 0-8.4 14.55L2.3 21.7l5.3-1.25A9.72 9.72 0 1 0 12 2Zm0 17.68a7.7 7.7 0 0 1-3.93-1.08l-.28-.17-3.13.74.78-3.04-.18-.3A7.72 7.72 0 1 1 12 19.68Zm4.23-5.78c-.23-.12-1.37-.67-1.58-.75-.21-.08-.36-.12-.52.12-.15.23-.59.75-.72.9-.13.16-.27.18-.5.06-.23-.12-.98-.36-1.86-1.15a7 7 0 0 1-1.29-1.6c-.13-.23-.01-.36.1-.47.1-.1.23-.27.35-.4.11-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.45-.38-.39-.52-.4h-.44c-.16 0-.4.06-.62.29-.21.23-.8.79-.8 1.92 0 1.13.82 2.22.94 2.38.11.15 1.62 2.47 3.92 3.47.55.24.98.38 1.31.49.55.17 1.05.15 1.45.09.44-.07 1.37-.56 1.56-1.1.19-.55.19-1.02.13-1.11-.05-.1-.2-.16-.44-.27Z"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10.3 13.7a4.5 4.5 0 0 0 6.36 0l2.12-2.12a4.5 4.5 0 0 0-6.36-6.36L11.2 6.44M13.7 10.3a4.5 4.5 0 0 0-6.36 0l-2.12 2.12a4.5 4.5 0 0 0 6.36 6.36l1.22-1.22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.18 3.84h2.76l-6.03 6.91L21 20.16h-5.55l-4.35-5.71-4.98 5.71H3.36l6.45-7.39L3 3.84h5.7l3.93 5.22 4.55-5.22Zm-.97 14.66h1.53L7.86 5.41H6.22L16.21 18.5Z"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="m4.6 8.1 2.1 2.1 4.7-4.7"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilledHeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A5.45 5.45 0 0 1 7.5 3 6 6 0 0 1 12 5.09 6 6 0 0 1 16.5 3 5.45 5.45 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.51L12 21.35Z"
      />
    </svg>
  );
}

export interface ProductShareActionsProps {
  affiliateLabel: string;
  shareLabel: string;
  favoriteLabel: string;
  locale?: "en" | "zh";
}

export function ProductShareActions({
  affiliateLabel,
  shareLabel,
  favoriteLabel,
  locale = "en",
}: ProductShareActionsProps) {
  const [wechatExpanded, setWechatExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteSelected, setFavoriteSelected] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);
  const shareTriggerRef = useRef<HTMLButtonElement>(null);
  const wechatQrId = useId();
  const shareMenuId = useId();
  const isChinese = locale === "zh";

  useEffect(() => () => {
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
  }, []);

  const resetWechat = () => setWechatExpanded(false);
  const shareCurrentPage = (channel: "whatsapp" | "facebook" | "x" | "pinterest" | "email" | "weibo") => {
    if (typeof window === "undefined") return;

    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(document.title);
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${pageTitle}%20${pageUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      x: `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?url=${pageUrl}&description=${pageTitle}`,
      email: `mailto:?subject=${pageTitle}&body=${pageUrl}`,
      weibo: `https://service.weibo.com/share/share.php?url=${pageUrl}&title=${pageTitle}`,
    };

    if (channel === "email") {
      window.location.href = shareUrls.email;
      return;
    }

    window.open(shareUrls[channel], "_blank", "noopener,noreferrer");
  };
  const copyCurrentLink = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.root} role="group" aria-label={shareLabel}>
      <Button
        className={styles.pcButton}
        variant="tertiary"
        form="inline"
        size="sm"
        data-pdp-affiliate-link="true"
      >
        {affiliateLabel}
      </Button>

      <div
        className={styles.sharePopoverAnchor}
        data-open={menuOpen || undefined}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => {
          setMenuOpen(false);
          resetWechat();
        }}
        onFocusCapture={() => setMenuOpen(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setMenuOpen(false);
            resetWechat();
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          resetWechat();
          shareTriggerRef.current?.focus();
          setMenuOpen(false);
        }}
      >
        <Button
          ref={shareTriggerRef}
          className={styles.pcIconButton}
          variant="tertiary"
          form="icon"
          size="sm"
          aria-label={shareLabel}
          aria-haspopup="dialog"
          aria-controls={shareMenuId}
          aria-expanded={menuOpen}
          data-pdp-share-trigger="true"
          onClick={() => setMenuOpen(true)}
        >
          <img src={shareIcon} alt="" width={20} height={20} />
        </Button>

        <div
          id={shareMenuId}
          className={`${styles.shareMenu} ${isChinese ? styles.shareMenuChinese : ""}`}
          data-slot="product-detail-share-menu"
          role="dialog"
          aria-label={shareLabel}
        >
          <div className={`${styles.shareMenuSurface} ${isChinese ? styles.shareMenuSurfaceChinese : ""}`}>
            {isChinese ? (
              <div className={styles.chineseShareLayout}>
                <section className={styles.chineseShareSection} aria-labelledby="wechat-share-heading">
                  <h3 id="wechat-share-heading" className={styles.chineseShareHeading}>微信分享</h3>
                  <span
                    className={`${styles.socialButton} ${styles.staticSocialIcon} ${styles.wechat} ${styles.chineseWechatButton}`}
                    role="img"
                    aria-label="微信分享"
                    aria-disabled="true"
                  >
                    <img src={wechatIcon} alt="" />
                  </span>
                  <div className={styles.chineseQr}>
                    <img src={wechatQrCode} alt="微信分享二维码" width={160} height={160} />
                  </div>
                </section>

                <section className={styles.chineseShareSection} aria-labelledby="more-share-heading">
                  <h3 id="more-share-heading" className={styles.chineseShareHeading}>更多分享方式</h3>
                  <div className={styles.chineseSocialGrid}>
                    <Button className={`${styles.socialButton} ${styles.facebook}`} variant="tertiary" form="icon" size="md" aria-label="分享到 Facebook" onFocus={resetWechat} onClick={() => shareCurrentPage("facebook")}>
                      <img src={facebookIcon} alt="" />
                    </Button>
                    <Button className={`${styles.socialButton} ${styles.x}`} variant="tertiary" form="icon" size="md" aria-label="分享到 X" onFocus={resetWechat} onClick={() => shareCurrentPage("x")}>
                      <XIcon />
                    </Button>
                    <Button className={`${styles.socialButton} ${styles.email}`} variant="tertiary" form="icon" size="md" aria-label="通过邮件分享" onFocus={resetWechat} onClick={() => shareCurrentPage("email")}>
                      <img src={emailIcon} alt="" />
                    </Button>
                    <Button className={`${styles.socialButton} ${styles.weibo}`} variant="tertiary" form="icon" size="md" aria-label="分享到微博" onFocus={resetWechat} onClick={() => shareCurrentPage("weibo")}>
                      <img src={weiboIcon} alt="" />
                    </Button>
                    <Button className={`${styles.socialButton} ${styles.copyLink}`} variant="tertiary" form="icon" size="md" aria-label="复制商品链接" onFocus={resetWechat} onClick={copyCurrentLink}>
                      <LinkIcon />
                    </Button>
                  </div>
                  {copied ? (
                    <span className={styles.copyFeedback} role="status" aria-live="polite">
                      <span className={styles.successIcon}><SuccessIcon /></span>
                      链接已复制
                    </span>
                  ) : null}
                </section>
              </div>
            ) : (
              <div className={styles.socialGrid}>
              <Button className={`${styles.socialButton} ${styles.whatsapp}`} variant="tertiary" form="icon" size="md" aria-label="Share on WhatsApp" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={() => shareCurrentPage("whatsapp")}>
                <WhatsAppIcon />
              </Button>
              <Button className={`${styles.socialButton} ${styles.facebook}`} variant="tertiary" form="icon" size="md" aria-label="Share on Facebook" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={() => shareCurrentPage("facebook")}>
                <img src={facebookIcon} alt="" />
              </Button>
              <Button className={`${styles.socialButton} ${styles.x}`} variant="tertiary" form="icon" size="md" aria-label="Share on X" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={() => shareCurrentPage("x")}>
                <XIcon />
              </Button>
              <Button className={`${styles.socialButton} ${styles.pinterest}`} variant="tertiary" form="icon" size="md" aria-label="Share on Pinterest" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={() => shareCurrentPage("pinterest")}>
                <img src={pinterestIcon} alt="" />
              </Button>
              <Button className={`${styles.socialButton} ${styles.email}`} variant="tertiary" form="icon" size="md" aria-label="Share by email" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={() => shareCurrentPage("email")}>
                <img src={emailIcon} alt="" />
              </Button>
              <Button className={`${styles.socialButton} ${styles.wechat}`} variant="tertiary" form="icon" size="md" aria-label="Share on WeChat" aria-controls={wechatQrId} aria-expanded={wechatExpanded} onMouseEnter={() => setWechatExpanded(true)} onFocus={() => setWechatExpanded(true)}>
                <img src={wechatIcon} alt="" />
              </Button>
              <Button className={`${styles.socialButton} ${styles.copyLink}`} variant="tertiary" form="icon" size="md" aria-label="Copy product link" onMouseEnter={resetWechat} onFocus={resetWechat} onClick={copyCurrentLink}>
                <LinkIcon />
              </Button>
              </div>
            )}

            {!isChinese && copied ? (
              <span className={styles.copyFeedback} role="status" aria-live="polite">
                <span className={styles.successIcon}><SuccessIcon /></span>
                Link Copied
              </span>
            ) : null}

            {!isChinese ? (
              <div
                className={styles.wechatQrReveal}
                data-expanded={wechatExpanded || undefined}
                aria-hidden={!wechatExpanded}
              >
                <div className={styles.wechatQrClip}>
                  <div
                    id={wechatQrId}
                    className={styles.wechatQr}
                    data-slot="product-detail-wechat-qr"
                  >
                    <img src={wechatQrCode} alt="WeChat share QR code" width={144} height={144} />
                    <span>Scan to Share with WeChat</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Button
        className={styles.pcIconButton}
        variant="tertiary"
        form="icon"
        size="sm"
        aria-label={favoriteLabel}
        aria-pressed={favoriteSelected}
        data-pdp-header-action="favorite"
        onClick={() => setFavoriteSelected((current) => !current)}
      >
        {favoriteSelected ? (
          <span className={styles.favoriteSelected}><FilledHeartIcon /></span>
        ) : (
          <img src={heartIcon} alt="" width={20} height={20} />
        )}
      </Button>
    </div>
  );
}
