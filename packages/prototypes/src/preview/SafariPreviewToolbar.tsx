import React from "react";
import backLight from "./assets/safari-back-light.svg";
import backDark from "./assets/safari-back-dark.svg";
import readerLight from "./assets/safari-reader-light.svg";
import readerDark from "./assets/safari-reader-dark.svg";
import reloadLight from "./assets/safari-reload-light.svg";
import reloadDark from "./assets/safari-reload-dark.svg";
import moreLight from "./assets/safari-more-light.svg";
import moreDark from "./assets/safari-more-dark.svg";
import styles from "./SafariPreviewToolbar.module.css";

const assetUrl = (asset: string | { src: string }) => typeof asset === "string" ? asset : asset.src;

export interface SafariPreviewToolbarProps {
  theme: "light" | "dark";
  address: string;
  openHref: string;
  canGoBack: boolean;
  onBack: () => void;
  onReload: () => void;
}

/** Fixed Default variant from the supplied Safari reference, not browser emulation. */
export function SafariPreviewToolbar({ theme, address, openHref, canGoBack, onBack, onReload }: SafariPreviewToolbarProps) {
  const dark = theme === "dark";
  return <nav className={styles.toolbar} data-safari-preview-toolbar="" data-theme={theme} aria-label="Safari 预览工具栏">
    <button className={styles.roundButton} type="button" aria-label="Safari 返回上一页" disabled={!canGoBack} onClick={onBack}>
      <img src={assetUrl(dark ? backDark : backLight)} alt="" />
    </button>
    <div className={styles.addressBar}>
      <span className={styles.reader} aria-hidden="true"><img src={assetUrl(dark ? readerDark : readerLight)} alt="" /></span>
      <span className={styles.address} title={address}>{address}</span>
      <button className={styles.reload} type="button" aria-label="Safari 刷新页面" onClick={onReload}>
        <img src={assetUrl(dark ? reloadDark : reloadLight)} alt="" />
      </button>
    </div>
    <details className={styles.more}>
      <summary className={styles.roundButton} aria-label="Safari 更多操作"><img src={assetUrl(dark ? moreDark : moreLight)} alt="" /></summary>
      <div className={styles.menu}><a href={openHref} target="_blank" rel="noreferrer">在新窗口打开</a></div>
    </details>
  </nav>;
}
