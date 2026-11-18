import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./component-docs-template.module.css";

const frameMarkup = "<!doctype html><html><head></head><body></body></html>";

export type DocsPreviewMode = "viewport" | "document";
type PreviewProps = { children: ReactNode; name?: string; locale: "zh" | "en"; mode?: DocsPreviewMode; previewBackground?: string };

export function ComponentDocsPreview({ mode = "viewport", children, name, locale, previewBackground }: PreviewProps) {
  return <div className={styles.preview}>
    {mode === "viewport" ? <ViewportPreview name={name} locale={locale} previewBackground={previewBackground}>{children}</ViewportPreview> :
      <div className={`${styles.page} ${styles.frameContent}`} style={{ background: previewBackground }}>
        <div className={styles.demo}>{children}</div>
      </div>}
  </div>;
}

function ViewportPreview({ children, name, locale, previewBackground }: PreviewProps) {
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
    frameDocument.body.style.background = previewBackground ?? "";
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
  }, [frameDocument, previewBackground]);

  const label = locale === "zh" ? "示例预览" : "Example preview";
  return <>
    <div className={styles.previewViewport} ref={viewportRef} style={{ background: previewBackground }}>
      <iframe
        className={styles.previewFrame}
        ref={frameRef}
        title={`${label}${name ? ` · ${name}` : ""}`}
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
  </>;
}
