"use client";

import {
  type CSSProperties,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type PointerEvent,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { RailNavigationButton } from "../Button/RailNavigation";
import type { ImageSource } from "../image.types";
import { ResponsiveImage } from "../ResponsiveImage";
import { ProductMediaPreview } from "./ProductMediaPreview";

import styles from "./ProductMediaGallery.module.css";

export interface ProductMediaGalleryItem {
  id: string;
  src: ImageSource;
  alt: string;
  thumbnailPinned?: boolean;
  thumbnailOverlayLabel?: string;
}

export interface ProductMediaGalleryHandle {
  openPreview: (imageId: string) => boolean;
}

export interface ProductMediaGalleryProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  images: readonly ProductMediaGalleryItem[];
  defaultIndex?: number;
  galleryLabel?: string;
  thumbnailsLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  desktopPreview?: boolean;
  desktopZoom?: boolean;
  desktopZoomPaneWidth?: number | string;
  desktopZoomPaneHeight?: number | string;
  mobilePreview?: boolean;
  openPreviewLabel?: string;
  closePreviewLabel?: string;
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  onIndexChange?: (index: number) => void;
}

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)));
}

function pageStep(rail: HTMLDivElement) {
  const width = rail.firstElementChild?.getBoundingClientRect().width || rail.clientWidth;
  return width + (parseFloat(getComputedStyle(rail).columnGap) || 0);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const ProductMediaGallery = forwardRef<ProductMediaGalleryHandle, ProductMediaGalleryProps>(function ProductMediaGallery({
  images,
  defaultIndex = 0,
  galleryLabel = "Product images",
  thumbnailsLabel = "Choose product image",
  previousLabel = "Previous image",
  nextLabel = "Next image",
  desktopPreview = false,
  desktopZoom = false,
  desktopZoomPaneWidth,
  desktopZoomPaneHeight,
  mobilePreview = false,
  openPreviewLabel = "Open image preview",
  closePreviewLabel = "Close image preview",
  imageLoading = "eager",
  onIndexChange,
  className,
  ...rest
}, ref) {
  const [pointerFocus, setPointerFocus] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [pinnedLayout, setPinnedLayout] = useState<"inline" | "edge">("edge");
  const [selectedIndex, setActiveIndex] = useState(() =>
    clampIndex(defaultIndex, images.length),
  );
  const [visibleRegularThumbnailCount, setVisibleRegularThumbnailCount] = useState(images.length);
  const [hasThumbnailOverflow, setHasThumbnailOverflow] = useState(false);
  const activeIndex = clampIndex(selectedIndex, images.length);
  const railRef = useRef<HTMLDivElement>(null);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const previewPointer = useRef<{ x: number; y: number } | null>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const pinnedThumbnailIndex = images.findIndex((image) => image.thumbnailPinned);
  const regularThumbnails = images
    .map((image, index) => ({ image, index }))
    .filter(({ index }) => index !== pinnedThumbnailIndex);

  useImperativeHandle(ref, () => ({
    openPreview(imageId) {
      const index = images.findIndex((image) => image.id === imageId);
      return openPreviewAt(index);
    },
  }));

  // Keep a full page aligned when mounting, resizing, or crossing the PC breakpoint.
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const alignImage = () => {
      rail.scrollTo({
        left: getComputedStyle(rail).overflowX === "auto"
          ? pageStep(rail) * activeIndexRef.current : 0,
        behavior: "instant",
      });
    };
    alignImage();
    const observer = new ResizeObserver(alignImage);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [images.length, previewOpen]);

  useLayoutEffect(() => {
    const thumbnailRail = thumbnailRailRef.current;
    if (!thumbnailRail) return;

    const updateThumbnailLayout = () => {
      const gap = parseFloat(getComputedStyle(thumbnailRail).columnGap) || 0;
      // The size token is a responsive clamp(), so obtain the resolved layout width
      // rather than parsing the custom-property source text.
      const thumbnailSize = thumbnailRail.querySelector<HTMLElement>("button")
        ?.getBoundingClientRect().width || 0;
      if (!thumbnailSize) return;

      const pinnedWidth = pinnedThumbnailIndex >= 0 ? thumbnailSize + gap : 0;
      const availableWidth = Math.max(0, thumbnailRail.clientWidth - pinnedWidth);
      const visibleCapacity = Math.max(
        1,
        Math.floor((availableWidth + gap + 0.5) / (thumbnailSize + gap)),
      );
      const nextHasOverflow = regularThumbnails.length > visibleCapacity;
      const nextVisibleCount = nextHasOverflow
        ? Math.max(0, visibleCapacity - 1)
        : regularThumbnails.length;

      setHasThumbnailOverflow((current) => current === nextHasOverflow ? current : nextHasOverflow);
      setVisibleRegularThumbnailCount((current) => current === nextVisibleCount ? current : nextVisibleCount);
      if (pinnedThumbnailIndex >= 0) {
        const nextLayout = nextHasOverflow ? "edge" : "inline";
        setPinnedLayout((current) => current === nextLayout ? current : nextLayout);
      }
    };

    updateThumbnailLayout();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateThumbnailLayout);
    observer.observe(thumbnailRail);
    return () => observer.disconnect();
  }, [pinnedThumbnailIndex, regularThumbnails.length]);
  const activeImage = images[activeIndex];

  if (!activeImage) return null;

  function selectImage(index: number) {
    const nextIndex = clampIndex(index, images.length);
    const rail = railRef.current;
    if (rail && getComputedStyle(rail).overflowX === "auto") {
      rail.scrollTo({ left: pageStep(rail) * nextIndex, behavior: "instant" });
    }
    if (nextIndex === activeIndexRef.current) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    onIndexChange?.(nextIndex);
  }

  function move(step: number) {
    const nextIndex =
      (activeIndex + step + images.length) % images.length;
    selectImage(nextIndex);
  }

  function openPreviewAt(index: number) {
    const enabled = window.matchMedia("(min-width: 1024px)").matches
      ? desktopPreview
      : mobilePreview;
    if (!enabled || index < 0 || index >= images.length) return false;
    selectImage(index);
    setPreviewOpen(true);
    return true;
  }

  function updateZoom(event: PointerEvent<HTMLDivElement>) {
    if (
      !desktopZoom ||
      !window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches
    ) return;
    const stage = event.currentTarget;
    const rect = stage.getBoundingClientRect();
    const image = stage.querySelector<HTMLImageElement>(
      'img[data-slot="product-media-gallery-image"]',
    );
    const imageRatio = image?.naturalWidth && image.naturalHeight
      ? image.naturalWidth / image.naturalHeight
      : rect.width / rect.height;
    const stageRatio = rect.width / rect.height;
    const contentWidth = imageRatio >= stageRatio ? rect.width : rect.height * imageRatio;
    const contentHeight = imageRatio >= stageRatio ? rect.width / imageRatio : rect.height;
    const contentLeft = (rect.width - contentWidth) / 2;
    const contentTop = (rect.height - contentHeight) / 2;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left - contentLeft) / contentWidth));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top - contentTop) / contentHeight));
    const lensX = Math.max(0.2, Math.min(0.8, x));
    const lensY = Math.max(0.2, Math.min(0.8, y));
    const zoom = 2.5;
    const paneWidth = typeof desktopZoomPaneWidth === "number" ? desktopZoomPaneWidth : rect.width;
    const paneHeight = typeof desktopZoomPaneHeight === "number" ? desktopZoomPaneHeight : rect.height;
    const initialZoomedWidth = contentWidth * zoom;
    const initialZoomedHeight = contentHeight * zoom;
    const coverScale = Math.max(
      1,
      paneWidth / initialZoomedWidth,
      paneHeight / initialZoomedHeight,
    );
    const zoomedWidth = initialZoomedWidth * coverScale;
    const zoomedHeight = initialZoomedHeight * coverScale;
    const backgroundX = Math.max(
      paneWidth - zoomedWidth,
      Math.min(0, paneWidth / 2 - x * zoomedWidth),
    );
    const backgroundY = Math.max(
      paneHeight - zoomedHeight,
      Math.min(0, paneHeight / 2 - y * zoomedHeight),
    );

    stage.style.setProperty("--product-media-zoom-background-width", `${zoomedWidth}px`);
    stage.style.setProperty("--product-media-zoom-background-height", `${zoomedHeight}px`);
    stage.style.setProperty("--product-media-zoom-background-x", `${backgroundX}px`);
    stage.style.setProperty("--product-media-zoom-background-y", `${backgroundY}px`);
    stage.style.setProperty("--product-media-zoom-lens-x", `${contentLeft + lensX * contentWidth}px`);
    stage.style.setProperty("--product-media-zoom-lens-y", `${contentTop + lensY * contentHeight}px`);
    stage.style.setProperty("--product-media-zoom-lens-width", `${contentWidth * 0.4}px`);
    stage.style.setProperty("--product-media-zoom-lens-height", `${contentHeight * 0.4}px`);
    setZoomActive(true);
  }

  function renderThumbnail(image: ProductMediaGalleryItem, index: number) {
    return (
      <button
        key={image.id}
        className={styles.thumbnailButton}
        type="button"
        aria-label={`View image ${index + 1} of ${images.length}: ${image.alt}`}
        aria-pressed={index === activeIndex}
        onPointerEnter={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) selectImage(index);
        }}
        onClick={() => selectImage(index)}
        data-slot="product-media-gallery-thumbnail"
        data-selected={index === activeIndex ? "true" : undefined}
        data-pinned={image.thumbnailPinned || undefined}
      >
        <ResponsiveImage
          className={styles.thumbnailImage}
          source={image.src}
          alt=""
          fallbackWidth={80}
          fallbackHeight={80}
          loading="lazy"
          revealOnLoad={false}
        />
        {image.thumbnailOverlayLabel ? (
          <span
            className={styles.thumbnailOverlay}
            data-slot="product-media-gallery-thumbnail-overlay"
          >
            {image.thumbnailOverlayLabel}
          </span>
        ) : null}
      </button>
    );
  }

  function renderMoreThumbnail(image: ProductMediaGalleryItem, index: number, count: number) {
    return (
      <button
        key={`more-${image.id}`}
        className={styles.thumbnailButton}
        type="button"
        aria-label={`View ${count} more product images, starting with image ${index + 1}`}
        data-slot="product-media-gallery-more-thumbnail"
        data-thumbnail-more="true"
        onPointerEnter={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) selectImage(index);
        }}
        onClick={() => openPreviewAt(index)}
      >
        <ResponsiveImage
          className={styles.thumbnailImage}
          source={image.src}
          alt=""
          fallbackWidth={80}
          fallbackHeight={80}
          loading="lazy"
          revealOnLoad={false}
        />
        <span className={styles.thumbnailMoreOverlay} aria-hidden="true">+{count}</span>
      </button>
    );
  }

  const displayedRegularThumbnails = regularThumbnails.slice(0, visibleRegularThumbnailCount);
  const firstHiddenThumbnail = regularThumbnails[visibleRegularThumbnailCount];
  const hiddenThumbnailCount = regularThumbnails.length - visibleRegularThumbnailCount;

  return (
    <section
      {...rest}
      className={cx(styles.root, className)}
      aria-label={galleryLabel}
      data-slot="product-media-gallery"
      data-active-index={activeIndex}
      data-zoom-active={zoomActive || undefined}
      data-pointer-focus={pointerFocus || undefined}
      data-thumbnail-overflow={hasThumbnailOverflow || undefined}
      tabIndex={rest.tabIndex ?? 0}
      onPointerDown={(event) => {
        rest.onPointerDown?.(event);
        setPointerFocus(true);
      }}
      onBlur={(event) => {
        rest.onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget)) setPointerFocus(false);
      }}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        setPointerFocus(false);
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
    >
      <div
        ref={thumbnailRailRef}
        className={styles.thumbnails}
        role="group"
        aria-label={thumbnailsLabel}
        data-slot="product-media-gallery-thumbnails"
        data-has-pinned-thumbnail={pinnedThumbnailIndex >= 0 || undefined}
        data-pinned-layout={pinnedThumbnailIndex >= 0 ? pinnedLayout : undefined}
      >
        <div
          className={styles.thumbnailScroller}
          data-slot="product-media-gallery-thumbnail-scroller"
        >
          {displayedRegularThumbnails.map(({ image, index }) => renderThumbnail(image, index))}
          {hasThumbnailOverflow && firstHiddenThumbnail
            ? renderMoreThumbnail(firstHiddenThumbnail.image, firstHiddenThumbnail.index, hiddenThumbnailCount)
            : null}
        </div>
        {pinnedThumbnailIndex >= 0
          ? renderThumbnail(images[pinnedThumbnailIndex]!, pinnedThumbnailIndex)
          : null}
      </div>

      <div
        className={styles.stage}
        data-slot="product-media-gallery-stage"
        data-zoom-active={zoomActive || undefined}
        onPointerEnter={updateZoom}
        onPointerMove={updateZoom}
        onPointerLeave={() => setZoomActive(false)}
      >
        <div
          ref={railRef}
          className={styles.imageRail}
          data-slot="product-media-gallery-rail"
          onScroll={(event) => {
            if (previewOpen) return;
            const rail = event.currentTarget;
            if (!rail.clientWidth || getComputedStyle(rail).overflowX !== "auto") return;
            const maxScroll = rail.scrollWidth - rail.clientWidth;
            const atEnd = maxScroll > 0 && rail.scrollLeft >= maxScroll - 1;
            const index = atEnd ? images.length - 1
              : clampIndex(Math.round(rail.scrollLeft / pageStep(rail)), images.length);
            if (index === activeIndexRef.current) return;
            activeIndexRef.current = index;
            setActiveIndex(index);
            onIndexChange?.(index);
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className={styles.slide}
              data-active={index === activeIndex}
              data-slot="product-media-gallery-slide"
              aria-hidden={index !== activeIndex}
            >
              <ResponsiveImage
                className={styles.mainImage}
                source={image.src}
                alt={image.alt}
                fallbackWidth={757}
                fallbackHeight={757}
                loading={index === activeIndex ? imageLoading : "lazy"}
                fetchPriority={index === defaultIndex ? "high" : "auto"}
                revealOnLoad={false}
                draggable={false}
                data-slot={index === activeIndex ? "product-media-gallery-image" : "product-media-gallery-inactive-image"}
              />
              {mobilePreview && (
                <button
                  type="button"
                  className={cx(styles.previewTrigger, styles.mobilePreviewTrigger)}
                  aria-label={openPreviewLabel}
                  aria-haspopup="dialog"
                  tabIndex={index === activeIndex ? 0 : -1}
                  data-slot="product-media-mobile-preview-trigger"
                  onPointerDown={(event) => { previewPointer.current = { x: event.clientX, y: event.clientY }; }}
                  onPointerCancel={() => { previewPointer.current = null; }}
                  onClick={(event) => {
                    const start = previewPointer.current;
                    previewPointer.current = null;
                    if (event.detail !== 0 && (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8)) return;
                    selectImage(index);
                    setPreviewOpen(true);
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {desktopPreview && (
          <button
            type="button"
            className={cx(styles.previewTrigger, styles.desktopPreviewTrigger)}
            aria-label={openPreviewLabel}
            aria-haspopup="dialog"
            data-slot="product-media-preview-trigger"
            onClick={() => {
              if (window.matchMedia("(min-width: 1024px)").matches) {
                setZoomActive(false);
                setPreviewOpen(true);
              }
            }}
          />
        )}

        {desktopZoom ? (
          <div
            className={styles.zoomPane}
            aria-hidden="true"
            data-slot="product-media-gallery-zoom-pane"
            style={{
              backgroundImage: `url("${typeof activeImage.src === "string" ? activeImage.src : activeImage.src.src}")`,
              "--product-media-zoom-pane-size": typeof desktopZoomPaneWidth === "number"
                ? `${desktopZoomPaneWidth}px`
                : desktopZoomPaneWidth,
              "--product-media-zoom-pane-height": typeof desktopZoomPaneHeight === "number"
                ? `${desktopZoomPaneHeight}px`
                : desktopZoomPaneHeight,
            } as CSSProperties}
          />
        ) : null}
        {desktopZoom ? (
          <span
            className={styles.zoomLens}
            aria-hidden="true"
            data-slot="product-media-gallery-zoom-lens"
          />
        ) : null}

        {images.length > 1 ? (
          <>
            <RailNavigationButton
              className={cx(styles.navigationButton, styles.previousButton)}
              direction="left"
              label={previousLabel}
              onClick={() => move(-1)}
            />
            <RailNavigationButton
              className={cx(styles.navigationButton, styles.nextButton)}
              direction="right"
              label={nextLabel}
              onClick={() => move(1)}
            />
            <span
              className={styles.counter}
              aria-live="polite"
              data-slot="product-media-gallery-counter"
            >
              {activeIndex + 1} / {images.length}
            </span>
          </>
        ) : null}
      </div>
      {(desktopPreview || mobilePreview) && previewOpen && (
        <ProductMediaPreview
          desktopPreview={desktopPreview}
          mobilePreview={mobilePreview}
          images={images}
          activeIndex={activeIndex}
          galleryLabel={galleryLabel}
          thumbnailsLabel={thumbnailsLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          closeLabel={closePreviewLabel}
          onSelect={selectImage}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </section>
  );
});
