import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./component-docs-template.module.css";

// Match the yamiDesktop and yamiMobile Storybook viewports.
const widths = { PC: 1024, Mobile: 375 } as const;
const devices = ["PC", "Mobile"] as const;
const frameMarkup = "<!doctype html><html><head></head><body></body></html>";

export function ComponentDocsPreview({ children, name, locale }: { children: ReactNode; name?: string; locale: "zh" | "en" }) {
  const [device, setDevice] = useState<keyof typeof widths>("PC");
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frameDocument || !viewport || !frame || !content) return;

    const owner = frame.ownerDocument;
    const root = owner.documentElement;
    const base = frameDocument.createElement("base");
    base.href = owner.baseURI;
    base.target = "_parent";
    const syncStyles = () => {
      frameDocument.head.replaceChildren(base, ...Array.from(
        owner.head.querySelectorAll('style, link[rel="stylesheet"]'),
        (node) => node.cloneNode(true),
      ));
    };
    const syncTheme = () => {
      const frameRoot = frameDocument.documentElement;
      frameRoot.lang = root.lang;
      frameRoot.dir = root.dir;
      frameRoot.dataset.theme = root.dataset.theme ?? "light";
      frameRoot.classList.toggle("dark", root.classList.contains("dark"));
    };
    const resize = () => {
      content.style.maxWidth = `${viewport.clientWidth}px`;
      frame.style.height = `${Math.ceil(content.getBoundingClientRect().height)}px`;
    };

    frameDocument.body.classList.add(styles.frameBody);
    syncTheme();
    syncStyles();
    resize();

    const stylesObserver = new MutationObserver(syncStyles);
    stylesObserver.observe(owner.head, { childList: true, subtree: true, characterData: true });
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class", "lang", "dir", "data-theme"] });
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    return () => {
      stylesObserver.disconnect();
      themeObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [frameDocument]);

  const label = locale === "zh" ? "示例预览" : "Example preview";
  return <div className={styles.preview}>
    <div className={`${styles.tabs} ${styles.previewDevices}`} role="group" aria-label={locale === "zh" ? "预览设备" : "Preview device"}>
      {devices.map((option) => <button key={option} type="button" aria-pressed={device === option} onClick={() => setDevice(option)}>{option}</button>)}
    </div>
    <div className={styles.previewViewport} ref={viewportRef}>
      <iframe
        className={styles.previewFrame}
        ref={frameRef}
        title={`${label}${name ? ` · ${name}` : ""} · ${device}`}
        width={widths[device]}
        height={252}
        srcDoc={frameMarkup}
        loading="lazy"
        onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
      />
    </div>
    {frameDocument && createPortal(
      <div ref={contentRef} className={`${styles.page} ${styles.frameContent}`}><div className={styles.demo}>{children}</div></div>,
      frameDocument.body,
    )}
  </div>;
}
