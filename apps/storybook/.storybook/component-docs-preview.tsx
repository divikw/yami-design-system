import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./component-docs-template.module.css";

const frameMarkup = "<!doctype html><html><head></head><body></body></html>";

export type DocsPreviewMode = "viewport" | "document";
export type DocsPreviewFullWidth = boolean | "fluid";
type PreviewProps = { children: ReactNode; name?: string; locale: "zh" | "en"; mode?: DocsPreviewMode; previewBackground?: string; viewportWidth?: string; fullWidth?: DocsPreviewFullWidth; fillContentWidth?: boolean };

export function ComponentDocsPreview({ mode = "viewport", children, name, locale, previewBackground, viewportWidth, fullWidth, fillContentWidth }: PreviewProps) {
  return <div className={styles.preview}>
    {mode === "viewport" ? <ViewportPreview name={name} locale={locale} previewBackground={previewBackground} viewportWidth={viewportWidth}
      fullWidth={fullWidth} fillContentWidth={fillContentWidth}>{children}</ViewportPreview> :
      <div className={`${styles.page} ${styles.frameContent}`} style={{ background: previewBackground }}>
        <div className={styles.demo} data-fill-content-width={fillContentWidth ? "" : undefined}>{children}</div>
      </div>}
  </div>;
}

function ViewportPreview({ children, name, locale, previewBackground, viewportWidth, fullWidth, fillContentWidth }: PreviewProps) {
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const [leadReady, setLeadReady] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const docsWindow = frame?.ownerDocument.defaultView;
    if (!frame || fullWidth || viewportWidth || docsWindow?.frameElement?.id !== "storybook-preview-iframe") return;

    const storybookWindow = docsWindow.parent;
    const syncWidth = () => { frame.style.width = `${storybookWindow.innerWidth}px`; };
    syncWidth();
    storybookWindow.addEventListener("resize", syncWidth);
    return () => storybookWindow.removeEventListener("resize", syncWidth);
  }, [fullWidth, viewportWidth]);

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
    let active = true;
    let awaitingLeadStyles = name === "lead";
    let stylesheetVersion = 0;
    const resize = () => {
      const width = viewport.clientWidth;
      if (fullWidth === true && !viewportWidth) {
        const desktop = owner.defaultView?.matchMedia("(min-width: 1024px)").matches;
        frame.style.width = desktop ? `${Math.max(width, 1024)}px` : "var(--breakpoints-mobile)";
      }
      if (!fullWidth) content.style.maxWidth = `${width}px`;
      const height = Math.ceil(content.getBoundingClientRect().height);
      frame.style.height = `${height}px`;
      if (fullWidth === true && frame.clientWidth) {
        // Preserve the device's media queries while fitting the preview in the card.
        const scale = Math.min(1, width / frame.clientWidth);
        const paintedHeight = height * scale;
        viewport.style.height = `${Math.max(252, Math.ceil(paintedHeight))}px`;
        frame.style.insetInlineStart = `${(width - frame.clientWidth * scale) / 2}px`;
        frame.style.insetBlockStart = `${Math.max(0, (252 - paintedHeight) / 2)}px`;
        frame.style.transform = `scale(${scale})`;
      }
    };
    const syncStyles = () => {
      const styles = Array.from(
        owner.head.querySelectorAll('style, link[rel="stylesheet"]'),
        (node) => node.cloneNode(true) as HTMLElement,
      );
      if (awaitingLeadStyles) {
        const version = ++stylesheetVersion;
        // The lead preview can reflow again once the cloned stylesheets and fonts load.
        const loads = styles.filter((node) => node.tagName === "LINK").map((link) =>
          new Promise<void>((resolve) => {
            link.addEventListener("load", () => resolve(), { once: true });
            link.addEventListener("error", () => resolve(), { once: true });
          }),
        );
        void Promise.all(loads).then(async () => {
          if (!active || version !== stylesheetVersion) return;
          resize();
          await frameDocument.fonts.ready;
          if (!active || version !== stylesheetVersion) return;
          resize();
          awaitingLeadStyles = false;
          setLeadReady(true);
        });
      }
      frameDocument.head.replaceChildren(base, ...styles);
    };
    const syncTheme = () => {
      const frameRoot = frameDocument.documentElement;
      frameRoot.lang = root.lang;
      frameRoot.dir = root.dir;
      frameRoot.dataset.theme = root.dataset.theme ?? "light";
      frameRoot.classList.toggle("dark", root.classList.contains("dark"));
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
    if (fullWidth) owner.defaultView?.addEventListener("resize", resize);
    return () => {
      active = false;
      stylesObserver.disconnect();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      if (fullWidth) owner.defaultView?.removeEventListener("resize", resize);
    };
  }, [frameDocument, fullWidth, name, previewBackground, viewportWidth]);

  const label = locale === "zh" ? "示例预览" : "Example preview";
  return <>
    <div className={styles.previewViewport} ref={viewportRef} data-full-width={fullWidth === true ? "" : undefined} style={{ background: previewBackground }}>
      <iframe
        className={styles.previewFrame}
        ref={frameRef}
        title={`${label}${name ? ` · ${name}` : ""}`}
        style={{ width: fullWidth === "fluid" ? `min(100%, ${viewportWidth ?? "100%"})` : viewportWidth }}
        height={252}
        srcDoc={frameMarkup}
        loading={name === "lead" ? "eager" : "lazy"}
        data-docs-preview-pending={name === "lead" && !leadReady ? "" : undefined}
        onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
      />
    </div>
    {frameDocument && createPortal(
      <div ref={contentRef} className={`${styles.page} ${styles.frameContent}`} data-full-width={fullWidth ? "" : undefined}>
        <div className={styles.demo} data-fill-content-width={fillContentWidth ? "" : undefined}>{children}</div>
      </div>,
      frameDocument.body,
    )}
  </>;
}
