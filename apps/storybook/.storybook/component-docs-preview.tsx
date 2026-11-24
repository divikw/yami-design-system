import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "@yami/design-system";
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
  const [styledFrame, setStyledFrame] = useState<{ document: Document; status: "ready" | "error" }>();
  const status = styledFrame?.document === frameDocument ? styledFrame.status : "loading";
  const isLead = name === "lead";
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
    const frame = frameRef.current;
    if (!frameDocument || !frame) return;

    const owner = frame.ownerDocument;
    const root = owner.documentElement;
    const head = frameDocument.head;
    const base = frameDocument.createElement("base");
    base.href = owner.baseURI;
    base.target = "_parent";
    head.prepend(base);
    frameDocument.body.classList.add(styles.frameBody);

    let stylesheetVersion = 0;
    let copies = new Map<Element, { node: Element; loaded: Promise<boolean> }>();
    const syncStyles = () => {
      const next = new Map(Array.from(owner.head.querySelectorAll('style, link[rel="stylesheet"]'), (source) => {
        const existing = copies.get(source);
        if (existing?.node.isEqualNode(source)) return [source, existing] as const;

        const node = source.cloneNode(true) as Element;
        const loaded = node.tagName === "LINK" ? new Promise<boolean>((resolve) => {
          node.addEventListener("load", () => resolve(true), { once: true });
          node.addEventListener("error", () => resolve(false), { once: true });
        }) : Promise.resolve(true);
        return [source, { node, loaded }] as const;
      }));

      // Keep loaded links in place when Storybook adds or updates another head node.
      for (const [source, copy] of copies) {
        if (next.get(source) !== copy) copy.node.remove();
      }
      let sibling = base.nextSibling;
      for (const { node } of next.values()) {
        if (node !== sibling) head.insertBefore(node, sibling);
        sibling = node.nextSibling;
      }
      copies = next;

      const version = ++stylesheetVersion;
      void Promise.all(Array.from(copies.values(), ({ loaded }) => loaded)).then(async (results) => {
        if (version !== stylesheetVersion) return;
        const loaded = results.every(Boolean);
        if (loaded && isLead) {
          // Resolve the fonts used by the preview before releasing the mobile Docs skeleton.
          frameDocument.body.getBoundingClientRect();
          await frameDocument.fonts.ready;
        }
        if (version !== stylesheetVersion) return;
        const status = loaded ? "ready" : "error";
        setStyledFrame(current => current?.document === frameDocument && current.status === status
          ? current
          : { document: frameDocument, status });
      });
    };
    const syncTheme = () => {
      const frameRoot = frameDocument.documentElement;
      frameRoot.lang = root.lang;
      frameRoot.dir = root.dir;
      frameRoot.dataset.theme = root.dataset.theme ?? "light";
      frameRoot.classList.toggle("dark", root.classList.contains("dark"));
    };
    syncTheme();
    syncStyles();

    const stylesObserver = new MutationObserver(syncStyles);
    stylesObserver.observe(owner.head, { childList: true, subtree: true, characterData: true });
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class", "lang", "dir", "data-theme"] });
    return () => {
      stylesheetVersion++;
      stylesObserver.disconnect();
      themeObserver.disconnect();
      base.remove();
      for (const { node } of copies.values()) node.remove();
    };
  }, [frameDocument, isLead]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frameDocument || !viewport || !frame || !content) return;

    frameDocument.body.style.background = previewBackground ?? "";
    if (status !== "ready") return;

    const docsWindow = frame.ownerDocument.defaultView;
    const resize = () => {
      const width = viewport.clientWidth;
      if (fullWidth === true && !viewportWidth) {
        const desktop = docsWindow?.matchMedia("(min-width: 1024px)").matches;
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
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    if (fullWidth) docsWindow?.addEventListener("resize", resize);
    return () => {
      resizeObserver.disconnect();
      if (fullWidth) docsWindow?.removeEventListener("resize", resize);
    };
  }, [frameDocument, fullWidth, previewBackground, status, viewportWidth]);

  const label = locale === "zh" ? "示例预览" : "Example preview";
  return <>
    <div className={styles.previewViewport} ref={viewportRef} data-full-width={fullWidth === true ? "" : undefined}
      aria-busy={status === "loading" || undefined} style={{ background: previewBackground }}>
      <iframe
        className={styles.previewFrame}
        ref={frameRef}
        title={`${label}${name ? ` · ${name}` : ""}`}
        style={{ width: fullWidth === "fluid" ? `min(100%, ${viewportWidth ?? "100%"})` : viewportWidth,
          visibility: status === "ready" ? undefined : "hidden" }}
        height={252}
        srcDoc={frameMarkup}
        loading={isLead ? "eager" : "lazy"}
        data-docs-preview-pending={isLead && status === "loading" ? "" : undefined}
        onLoad={(event) => setFrameDocument(event.currentTarget.contentDocument)}
      />
      {status === "loading" && <Skeleton className={styles.previewPlaceholder} />}
      {status === "error" && <div className={styles.previewError} role="status">
        {locale === "zh" ? "预览样式加载失败，请刷新页面重试。" : "Preview styles failed to load. Refresh the page to try again."}
      </div>}
    </div>
    {frameDocument && createPortal(
      <div ref={contentRef} className={`${styles.page} ${styles.frameContent}`} data-full-width={fullWidth ? "" : undefined}>
        <div className={styles.demo} data-fill-content-width={fillContentWidth ? "" : undefined}>{children}</div>
      </div>,
      frameDocument.body,
    )}
  </>;
}
