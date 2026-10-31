import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import { ProductMediaGallery } from "@yami/design-system/components/ProductMediaGallery";
import meta from "../../../packages/design-system/components/ProductMediaGallery/ProductMediaGallery.stories";
import "@yami/design-system/tokens.css";

const images = meta.args!.images!;

test("desktop thumbnail hover selects images and the main image exposes a cursor-following zoom", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = "480px";
  document.body.append(container);
  const root = createRoot(container);
  const hoverImages = images.map((image, index) => ({
    ...image,
    thumbnailPinned: index === images.length - 1,
    thumbnailOverlayLabel: index === images.length - 1 ? "Skin Info" : undefined,
  }));
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(
      <ProductMediaGallery images={hoverImages} desktopPreview desktopZoom />
    ));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const stage = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-stage"]')!;
    const thumbnails = container.querySelectorAll<HTMLButtonElement>('[data-slot="product-media-gallery-thumbnail"]');
    const pinnedThumbnail = thumbnails[thumbnails.length - 1]!;
    await page.elementLocator(thumbnails[1]!).hover();
    await expect.poll(() => gallery.dataset.activeIndex).toBe("1");
    expect(thumbnails[1]!.getAttribute("aria-pressed")).toBe("true");
    await page.elementLocator(pinnedThumbnail).hover();
    await expect.poll(() => gallery.dataset.activeIndex).toBe(String(hoverImages.length - 1));
    expect(pinnedThumbnail.getAttribute("aria-pressed")).toBe("true");
    await page.elementLocator(pinnedThumbnail).click();
    expect(container.querySelector("dialog[open]")).toBeNull();

    await page.elementLocator(stage).hover({ position: { x: 120, y: 180 } });
    const zoomPane = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-zoom-pane"]')!;
    const zoomLens = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-zoom-lens"]')!;
    await expect.poll(() => getComputedStyle(zoomPane).display).toBe("block");
    expect(getComputedStyle(zoomLens).display).toBe("block");
    expect(getComputedStyle(zoomPane).backgroundImage).toContain("url(");
    expect(zoomPane.getBoundingClientRect().left).toBeGreaterThan(stage.getBoundingClientRect().right);

    await page.getByRole("button", { name: "Open image preview" }).click();
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[data-slot="product-media-preview-image"]')?.getAttribute("alt"))
      .toBe(hoverImages.at(-1)!.alt);
    await page.getByRole("button", { name: "Close image preview" }).click();
    await expect.poll(() => container.querySelector("dialog")).toBeNull();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("desktop thumbnail overflow stays scrollable while the reference image remains pinned", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = "480px";
  document.body.append(container);
  const root = createRoot(container);
  const galleryImages = Array.from({ length: 8 }, (_, index) => ({
    ...images[index % images.length]!,
    id: `overflow-${index}`,
    alt: `Overflow product image ${index + 1}`,
    thumbnailPinned: index === 7,
    thumbnailOverlayLabel: index === 7 ? "Nutrition Facts" : undefined,
  }));
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} desktopPreview />));
    const rail = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnails"]')!;
    const scroller = container.querySelector<HTMLElement>(
      '[data-slot="product-media-gallery-thumbnail-scroller"]',
    )!;
    const pinned = rail.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnail"][data-pinned="true"]')!;
    await expect.poll(() => rail.dataset.thumbnailOverflow).toBe("true");
    const next = rail.querySelector<HTMLButtonElement>(
      '[data-rail-navigation-button="true"][data-direction="right"]',
    )!;
    const pinnedRight = pinned.getBoundingClientRect().right;
    expect(container.querySelector('[data-slot="product-media-gallery-more-thumbnail"]')).toBeNull();
    expect(scroller.children).toHaveLength(galleryImages.length - 1);
    expect(getComputedStyle(scroller).overflowX).toBe("auto");
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    expect(pinned.getBoundingClientRect().left).toBeLessThan(scroller.getBoundingClientRect().right);
    expect(getComputedStyle(next).width).toBe("24px");
    expect(getComputedStyle(next).height).toBe("24px");
    expect(getComputedStyle(next, "::before").width).toBe("32px");
    expect(getComputedStyle(next, "::before").height).toBe("32px");
    expect(new Set(Array.from(rail.querySelectorAll<HTMLElement>('[data-slot="product-media-gallery-thumbnail"]')).map(
      (thumbnail) => thumbnail.getBoundingClientRect().width,
    ))).toEqual(new Set([64]));
    await page.elementLocator(next).click();
    await expect.poll(() => scroller.scrollLeft).toBeGreaterThan(0);
    expect(pinned.getBoundingClientRect().right).toBeCloseTo(pinnedRight, 0);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("desktop overflow keeps every thumbnail reachable when preview is disabled", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = "480px";
  document.body.append(container);
  const root = createRoot(container);
  const galleryImages = Array.from({ length: 8 }, (_, index) => ({
    ...images[index % images.length]!, id: `fallback-${index}`, thumbnailPinned: index === 7,
  }));
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} />));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const scroller = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnail-scroller"]')!;
    await expect.poll(() => scroller.querySelectorAll("button").length).toBe(7);
    expect(container.querySelector('[data-slot="product-media-gallery-more-thumbnail"]')).toBeNull();
    expect(getComputedStyle(scroller).overflowX).toBe("auto");
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    const lastRegular = scroller.querySelectorAll<HTMLButtonElement>("button")[6]!;
    lastRegular.focus();
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => gallery.dataset.activeIndex).toBe("6");
    expect(lastRegular.getBoundingClientRect().right).toBeLessThanOrEqual(scroller.getBoundingClientRect().right + 1);
    expect(container.querySelector("dialog[open]")).toBeNull();
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} desktopPreview />));
    await expect.poll(() => scroller.querySelectorAll("button").length).toBe(7);
    expect(container.querySelector('[data-slot="product-media-gallery-more-thumbnail"]')).toBeNull();
    expect(getComputedStyle(scroller).overflowX).toBe("auto");
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} />));
    await expect.poll(() => scroller.querySelectorAll("button").length).toBe(7);
    expect(container.querySelector('[data-slot="product-media-gallery-more-thumbnail"]')).toBeNull();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([false, true])("desktop selection reveals thumbnails without moving the page with pinned=%s", async (pinned) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.cssText = "width: 480px; padding-top: 180px; height: 2000px";
  document.body.append(container);
  const root = createRoot(container);
  const galleryImages = Array.from({ length: 8 }, (_, index) => ({
    ...images[index % images.length]!,
    id: `reveal-${index}`,
    thumbnailPinned: pinned && index === 7,
  }));
  try {
    await page.viewport(1440, 600);
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} />));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const scroller = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnail-scroller"]')!;
    const thumbnails = scroller.querySelectorAll<HTMLElement>("button");
    window.scrollTo(0, 0);
    gallery.focus({ preventScroll: true });
    for (let index = 1; index < thumbnails.length; index++) {
      await userEvent.keyboard("{ArrowRight}");
      await expect.poll(() => gallery.dataset.activeIndex).toBe(String(index));
    }
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingInlineEnd) || 0;
    await expect.poll(() => thumbnails[thumbnails.length - 1]!.getBoundingClientRect().right)
      .toBeLessThanOrEqual(scroller.getBoundingClientRect().right - padding + 1);
    expect(scroller.scrollLeft).toBeGreaterThan(0);
    expect(window.scrollY).toBe(0);
    for (let index = thumbnails.length - 2; index >= 0; index--) {
      await userEvent.keyboard("{ArrowLeft}");
      await expect.poll(() => gallery.dataset.activeIndex).toBe(String(index));
    }
    await expect.poll(() => scroller.scrollLeft).toBe(0);
    expect(window.scrollY).toBe(0);
  } finally {
    root.unmount();
    container.remove();
    window.scrollTo(0, 0);
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([
  { label: "numeric", width: 900, height: 600 },
  { label: "px", width: "900px", height: "600px" },
  { label: "responsive", width: "calc(100vw - 900px)", height: "60vh" },
])("$label zoom dimensions cover the pane at both image edges", async ({ width, height }) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = "480px";
  document.body.append(container);
  const root = createRoot(container);
  const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="black"/></svg>')}`;
  try {
    await page.viewport(1800, 1000);
    flushSync(() => root.render(<ProductMediaGallery images={[{ id: "wide", src: source, alt: "Wide product image" }]} desktopZoom desktopZoomPaneWidth={width} desktopZoomPaneHeight={height} />));
    const stage = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-stage"]')!;
    const image = stage.querySelector<HTMLImageElement>("img")!;
    const pane = stage.querySelector<HTMLElement>('[data-slot="product-media-gallery-zoom-pane"]')!;
    await expect.poll(() => image.naturalWidth).toBe(200);
    for (const position of [{ x: 12, y: 12 }, { x: 468, y: 468 }]) {
      await page.elementLocator(stage).hover({ position });
      await expect.poll(() => getComputedStyle(pane).visibility).toBe("visible");
      const style = getComputedStyle(pane);
      const [backgroundWidth, backgroundHeight] = style.backgroundSize.split(" ").map(parseFloat);
      const x = parseFloat(style.backgroundPositionX);
      const y = parseFloat(style.backgroundPositionY);
      expect(x).toBeLessThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(0);
      expect(x + backgroundWidth!).toBeGreaterThanOrEqual(pane.clientWidth - 1);
      expect(y + backgroundHeight!).toBeGreaterThanOrEqual(pane.clientHeight - 1);
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("desktop arrows hide after mouse clicks and remain available for keyboard focus", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = "480px";
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<><button>Outside gallery</button><ProductMediaGallery images={images} defaultIndex={1} /></>));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const stage = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-stage"]')!;
    const arrows = Array.from(stage.querySelectorAll<HTMLButtonElement>('[data-rail-navigation-button]'));
    const outside = page.getByRole("button", { name: "Outside gallery" });
    await outside.click();
    for (const arrow of arrows) {
      await page.elementLocator(stage).hover();
      await expect.poll(() => getComputedStyle(arrow).visibility).toBe("visible");
      await page.elementLocator(arrow).click();
      expect(arrow.matches(":focus-visible")).toBe(false);
      await outside.hover();
      await expect.poll(() => getComputedStyle(arrow).visibility).toBe("hidden");
    }
    await outside.click();
    await userEvent.tab();
    expect(document.activeElement).toBe(gallery);
    for (const arrow of arrows) expect(getComputedStyle(arrow).visibility).toBe("visible");
    await userEvent.keyboard("{ArrowRight}");
    expect(gallery.dataset.activeIndex).toBe("2");
    await userEvent.tab();
    expect(gallery.contains(document.activeElement)).toBe(true);
    for (const arrow of arrows) expect(getComputedStyle(arrow).visibility).toBe("visible");
    await outside.click();
    for (const arrow of arrows) expect(getComputedStyle(arrow).visibility).toBe("hidden");
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

// Keep CDP touch emulation after desktop cases: Linux headless Chromium can
// retain coarse-pointer media capabilities after touch emulation is disabled.
test.each([false, true])("overflowing mobile thumbnails support touch scrolling with desktopPreview=%s", async (desktopPreview) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const session = cdp();
  const galleryImages = Array.from({ length: 8 }, (_, index) => ({
    ...images[index % images.length]!,
    id: `mobile-overflow-${index}`,
    thumbnailPinned: desktopPreview && index === 7,
  }));
  try {
    await page.viewport(375, 900);
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    flushSync(() => root.render(<ProductMediaGallery images={galleryImages} desktopPreview={desktopPreview} />));
    const rail = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnails"]')!;
    const scroller = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-thumbnail-scroller"]')!;
    await expect.poll(() => rail.dataset.thumbnailOverflow).toBe("true");
    expect(getComputedStyle(scroller).overflowX).toBe("auto");
    expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    const rect = scroller.getBoundingClientRect();
    const frame = window.frameElement!.getBoundingClientRect();
    const scale = frame.width / innerWidth;
    const point = {
      x: frame.left + (rect.left + rect.width / 2) * scale,
      y: frame.top + (rect.top + rect.height / 2) * scale,
      id: 0,
    };
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    for (let step = 1; step <= 16; step++) {
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove", touchPoints: [{ ...point, x: point.x - 150 * scale * step / 16 }],
      });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => scroller.scrollLeft).toBeGreaterThan(0);
    expect(container.querySelector("dialog[open]")).toBeNull();
  } finally {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("native touch snaps images without blocking vertical scrolling", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.cssText = "width: 100%; height: 2000px";
  document.body.append(container);
  const root = createRoot(container);
  const changed = vi.fn();
  const session = cdp();
  try {
    await page.viewport(656, 900);
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    flushSync(() => root.render(<ProductMediaGallery images={images} mobilePreview onIndexChange={changed} />));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const rail = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-rail"]')!;
    const box = rail.getBoundingClientRect();
    expect(box.width).toBe(container.clientWidth);
    expect(box.left - gallery.getBoundingClientRect().left).toBe(0);
    expect(box.top - gallery.getBoundingClientRect().top).toBe(8);
    expect(box.height).toBe(440);
    const slides = rail.querySelectorAll('[data-slot="product-media-gallery-slide"]');
    expect(slides[0].getBoundingClientRect().left - box.left).toBe(8);
    expect(getComputedStyle(rail).scrollPaddingInline).toBe("8px");
    expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
    expect(slides[0].getBoundingClientRect().width).toBe(440);
    expect(slides[0].getBoundingClientRect().height).toBe(440);
    expect(slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().right).toBe(8);
    expect(getComputedStyle(slides[0]).borderRadius).toBe("8px");
    expect(slides[1].getBoundingClientRect().left).toBeLessThan(box.right);
    // CDP uses top-page coordinates; Vitest scales its test iframe on CI.
    const swipe = async (xDistance: number, yDistance = 0) => {
      const rect = rail.getBoundingClientRect();
      const frame = window.frameElement!.getBoundingClientRect();
      const scale = frame.width / innerWidth;
      const point = {
        x: frame.left + (rect.left + rect.width / 2) * scale,
        y: frame.top + (rect.top + rect.height / 2) * scale,
        id: 0,
      };
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      for (let step = 1; step <= 16; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ ...point, x: point.x + xDistance * scale * step / 16,
            y: point.y + yDistance * scale * step / 16 }],
        });
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    await swipe(-300);
    await expect.poll(() => gallery.dataset.activeIndex).toBe("1");
    expect(container.querySelector("dialog[open]")).toBeNull();
    await expect.poll(() => rail.scrollLeft).toBeCloseTo(448, 0);
    expect(changed).toHaveBeenLastCalledWith(1);
    expect(container.querySelector('[data-slot="product-media-gallery-counter"]')?.textContent).toBe("2 / 4");
    await swipe(300);
    await expect.poll(() => rail.scrollLeft).toBe(0);
    await expect.poll(() => gallery.dataset.activeIndex).toBe("0");
    await swipe(300);
    expect(gallery.dataset.activeIndex).toBe("0");
    await swipe(0, -160);
    await expect.poll(() => window.scrollY).toBeGreaterThan(60);
    expect(gallery.dataset.activeIndex).toBe("0");
  } finally {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    root.unmount();
    container.remove();
    window.scrollTo(0, 0);
    await page.viewport(viewport.width, viewport.height);
  }
});

test("mobile preview opens the selected image and supports a single touch-scrollable bottom thumbnail row", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const session = cdp();
  const manyImages = Array.from({ length: 11 }, (_, index) => ({ ...images[index % images.length], id: `image-${index}` }));
  const originalOverflow = document.documentElement.style.overflow;
  try {
    await page.viewport(375, 812);
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    flushSync(() => root.render(<ProductMediaGallery images={manyImages} defaultIndex={2} desktopPreview mobilePreview />));
    await page.getByRole("button", { name: "Open image preview" }).click();
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    expect(dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(true);
    expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(dialog.getBoundingClientRect().width).toBe(innerWidth);
    expect(dialog.getBoundingClientRect().height).toBe(innerHeight);
    expect(dialog.querySelector('[data-slot="product-media-preview-image"]')?.getAttribute("alt")).toBe(manyImages[2].alt);
    const rail = dialog.querySelector<HTMLElement>('[data-slot="product-media-preview-thumbnails"]')!;
    const thumbnails = Array.from(rail.querySelectorAll("button"));
    expect(thumbnails).toHaveLength(11);
    expect(new Set(thumbnails.map((button) => button.getBoundingClientRect().top)).size).toBe(1);
    expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
    expect(rail.getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
    expect(getComputedStyle(rail).overflowX).toBe("auto");
    expect(document.documentElement.style.overflow).toBe("hidden");
    const stage = dialog.querySelector<HTMLElement>('[data-slot="product-media-preview-stage"]')!;
    const swipeImage = async (direction: -1 | 1) => {
      const rect = stage.getBoundingClientRect();
      const frame = window.frameElement!.getBoundingClientRect();
      const scale = frame.width / innerWidth;
      // Cross the snap midpoint without relying on platform-dependent fling velocity.
      const distance = rect.width * 0.6 * direction;
      const point = { x: frame.left + (rect.left + rect.width * (direction < 0 ? 0.8 : 0.2)) * scale,
        y: frame.top + (rect.top + rect.height / 2) * scale, id: 0 };
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      for (let step = 1; step <= 16; step++) {
        await session.send("Input.dispatchTouchEvent", { type: "touchMove",
          touchPoints: [{ ...point, x: point.x + distance * scale * step / 16 }] });
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    const selectedImage = () => dialog.querySelector('[data-slot="product-media-preview-image"]');
    const imageRail = dialog.querySelector<HTMLElement>('[data-slot="product-media-preview-rail"]')!;
    expect(getComputedStyle(imageRail).overscrollBehaviorX).toBe("none");
    await swipeImage(-1);
    await expect.poll(() => thumbnails[3].getAttribute("aria-pressed")).toBe("true");
    await expect.poll(() => imageRail.scrollLeft).toBe(imageRail.clientWidth * 3);
    expect(selectedImage()?.getAttribute("alt")).toBe(manyImages[3].alt);
    await swipeImage(1);
    await expect.poll(() => thumbnails[2].getAttribute("aria-pressed")).toBe("true");
    await expect.poll(() => imageRail.scrollLeft).toBe(imageRail.clientWidth * 2);
    await page.elementLocator(thumbnails[0]).click();
    await expect.poll(() => thumbnails[0].getAttribute("aria-pressed")).toBe("true");
    await expect.poll(() => dialog.querySelector('[data-slot="product-media-preview-rail"]')!.scrollLeft).toBe(0);
    await swipeImage(1);
    expect(thumbnails[0].getAttribute("aria-pressed")).toBe("true");
    await page.elementLocator(thumbnails[10]).click();
    await swipeImage(-1);
    expect(thumbnails[10].getAttribute("aria-pressed")).toBe("true");
    await page.elementLocator(thumbnails[2]).click();
    expect(selectedImage()?.getAttribute("alt")).toBe(manyImages[2].alt);
    const rect = rail.getBoundingClientRect();
    const frame = window.frameElement!.getBoundingClientRect();
    const scale = frame.width / innerWidth;
    const point = { x: frame.left + (rect.left + rect.width * 0.8) * scale,
      y: frame.top + (rect.top + rect.height / 2) * scale, id: 0 };
    const beforeScroll = rail.scrollLeft;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
    for (let step = 1; step <= 16; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove",
        touchPoints: [{ ...point, x: point.x - 200 * scale * step / 16 }] });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => rail.scrollLeft).toBeGreaterThan(beforeScroll + 80);
    await page.elementLocator(thumbnails[10]).click();
    expect(dialog.querySelector('[data-slot="product-media-preview-image"]')?.getAttribute("alt")).toBe(manyImages[10].alt);
    expect(thumbnails[10].getAttribute("aria-pressed")).toBe("true");
    await page.viewport(1440, 900);
    expect(dialog.open).toBe(true);
    expect(getComputedStyle(rail).flexDirection).toBe("column");
    const desktopStage = dialog.querySelector<HTMLElement>('[data-slot="product-media-preview-stage"]')!;
    const desktopSidebar = dialog.querySelector<HTMLElement>('[data-slot="product-media-preview-sidebar"]')!;
    const closeButton = dialog.querySelector<HTMLElement>('[aria-label="Close image preview"]')!;
    const desktopStageRect = desktopStage.getBoundingClientRect();
    const desktopSidebarRect = desktopSidebar.getBoundingClientRect();
    expect(desktopStageRect.left).toBe(0);
    expect(desktopStageRect.right).toBeLessThanOrEqual(desktopSidebarRect.left);
    expect(desktopSidebarRect.right).toBeLessThan(closeButton.getBoundingClientRect().left);
    const previousButton = dialog.querySelector<HTMLElement>('[data-rail-navigation-button="true"]')!;
    const previousRect = previousButton.getBoundingClientRect();
    const closeRect = closeButton.getBoundingClientRect();
    expect((previousRect.top + previousRect.bottom) / 2).toBe((closeRect.top + closeRect.bottom) / 2);
    await page.viewport(375, 812);
    expect(getComputedStyle(rail).flexDirection).toBe("row");
    await page.getByRole("button", { name: "Close image preview" }).click();
    await expect.poll(() => container.querySelector("dialog")).toBeNull();
    expect(document.documentElement.style.overflow).toBe(originalOverflow);
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    expect(gallery.dataset.activeIndex).toBe("10");
    expect(document.activeElement).toBe(gallery);
    await page.getByRole("button", { name: "Open image preview" }).click();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => container.querySelector("dialog")).toBeNull();
  } finally {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("preserves the selected image when a breakpoint scroll reset precedes resize alignment", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const changed = vi.fn();
  const NativeResizeObserver = window.ResizeObserver;
  const pending: (() => void)[] = [];
  let deferAlignment = false;
  const observer = vi.spyOn(window, "ResizeObserver").mockImplementation(function (callback) {
    return new NativeResizeObserver((entries, instance) => {
      if (deferAlignment && entries.some(({ target }) => target.getAttribute("data-slot") === "product-media-gallery-rail")) {
        pending.push(() => callback(entries, instance));
      } else callback(entries, instance);
    });
  });
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<ProductMediaGallery images={images} defaultIndex={3} onIndexChange={changed} />));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const rail = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-rail"]')!;
    deferAlignment = true;
    await page.viewport(375, 900);
    await expect.poll(() => pending.length).toBeGreaterThan(0);
    flushSync(() => rail.dispatchEvent(new Event("scroll", { bubbles: true })));
    expect(changed).not.toHaveBeenCalled();
    expect(gallery.dataset.activeIndex).toBe("3");
    deferAlignment = false;
    for (const align of pending) align();
    await expect.poll(() => rail.scrollLeft).toBeCloseTo(rail.clientWidth * 3, 0);
  } finally {
    observer.mockRestore();
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("preserves selection across resizing and handles single or empty galleries", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 900);
    flushSync(() => root.render(<ProductMediaGallery images={images} defaultIndex={2} />));
    const gallery = container.querySelector<HTMLElement>('[data-slot="product-media-gallery"]')!;
    const rail = container.querySelector<HTMLElement>('[data-slot="product-media-gallery-rail"]')!;
    await expect.poll(() => rail.scrollLeft).toBeCloseTo(rail.clientWidth * 2, 0);
    expect(gallery.dataset.activeIndex).toBe("2");
    const thumbnails = container.querySelectorAll<HTMLButtonElement>('[data-slot="product-media-gallery-thumbnail"]');
    await page.elementLocator(thumbnails[3]!).click();
    await expect.poll(() => rail.scrollLeft).toBeCloseTo(rail.scrollWidth - rail.clientWidth, 0);
    rail.scrollTo({ left: 10000, behavior: "instant" });
    await expect.poll(() => rail.scrollLeft).toBeCloseTo(rail.scrollWidth - rail.clientWidth, 0);
    for (const width of [440, 441, 656, 923, 1023, 1024, 375]) {
      await page.viewport(width, 900);
      await expect.poll(() => rail.scrollLeft).toBeCloseTo(width < 1024 ? rail.scrollWidth - rail.clientWidth : 0, 0);
      expect(gallery.dataset.activeIndex).toBe("3");
      const inset = width > 440 && width < 1024 ? "8px" : "0px";
      expect(getComputedStyle(gallery).paddingTop).toBe(inset);
      expect(getComputedStyle(gallery).paddingLeft).toBe(inset);
      expect(getComputedStyle(gallery).paddingRight).toBe(inset);
      expect(getComputedStyle(gallery).paddingBottom).toBe("0px");
      if (width < 1024) {
        const gap = width > 440 ? 8 : 0;
        const imageWidth = width > 440 ? Math.min(rail.clientWidth - 48, 440) : rail.clientWidth;
        expect(rail.firstElementChild!.getBoundingClientRect().width).toBeCloseTo(imageWidth, 0);
        expect(rail.firstElementChild!.getBoundingClientRect().height).toBeCloseTo(imageWidth, 0);
        expect(getComputedStyle(rail).columnGap).toBe(`${gap}px`);
        expect(rail.scrollWidth).toBeCloseTo(imageWidth * images.length + gap * (images.length - 1) + gap * 2, 0);
        expect(rail.lastElementChild!.getBoundingClientRect().right).toBeCloseTo(rail.getBoundingClientRect().right - gap, 0);
        expect(rail.getBoundingClientRect().left).toBe(gallery.getBoundingClientRect().left);
        expect(rail.getBoundingClientRect().right).toBe(gallery.getBoundingClientRect().right);
        expect(document.documentElement.scrollWidth).toBe(document.documentElement.clientWidth);
        expect(container.querySelector('[data-slot="product-media-gallery-counter"]')?.textContent).toBe("4 / 4");
      }
    }
    await page.viewport(923, 900);
    await page.elementLocator(thumbnails[0]!).click();
    await expect.poll(() => gallery.dataset.activeIndex).toBe("0");
    rail.scrollTo({ left: 10000, behavior: "instant" });
    await expect.poll(() => gallery.dataset.activeIndex).toBe("3");
    expect(rail.lastElementChild!.getBoundingClientRect().right).toBeCloseTo(rail.getBoundingClientRect().right - 8, 0);
    flushSync(() => root.render(<ProductMediaGallery images={images.slice(0, 1)} />));
    await expect.poll(() => gallery.dataset.activeIndex).toBe("0");
    expect(rail.scrollWidth).toBe(rail.clientWidth);
    expect(container.querySelector('[data-slot="product-media-gallery-counter"]')).toBeNull();
    flushSync(() => root.render(<ProductMediaGallery images={[]} />));
    expect(container.querySelector('[data-slot="product-media-gallery"]')).toBeNull();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
