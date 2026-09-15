import styles from "./StoreDownloadButtons.module.css";

const appleIcon = new URL("../../../design-system/assets/icons/social/apple.svg", import.meta.url).href;
const googlePlayIcon = new URL("../../../design-system/assets/icons/social/google-play.svg", import.meta.url).href;

export function StoreDownloadButtons({ appStoreHref, playStoreHref, className }: { appStoreHref: string; playStoreHref: string; className?: string }) {
  return <div className={[styles.buttons, className].filter(Boolean).join(" ")}>
    <a className={`${styles.button} ${styles.appStore}`} href={appStoreHref} aria-label="Download On The App Store">
      <img className={`${styles.icon} ${styles.apple}`} src={appleIcon} alt="" />
      <span className={styles.copy}><span className={styles.caption}>Download On The</span><span className={styles.name}>App Store</span></span>
    </a>
    <a className={`${styles.button} ${styles.googlePlay}`} href={playStoreHref} aria-label="Get It On Google Play">
      <img className={styles.icon} src={googlePlayIcon} alt="" />
      <span className={styles.copy}><span className={styles.caption}>Get It On</span><span className={styles.name}>Google Play</span></span>
    </a>
  </div>;
}
