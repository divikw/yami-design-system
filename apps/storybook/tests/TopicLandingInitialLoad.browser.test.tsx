import { page } from "vitest/browser";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";

import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import { TopicLandingPage, createTopicLandingPageFixture } from "@yami/prototypes/topic-landing-page";

const imageSrc = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="white"/></svg>');

for (const width of [1280, 390]) {
  test(`first viewport slides and fades together while the Hero image is pending at ${width}px`, async () => {
    const originalViewport = { width: innerWidth, height: innerHeight };
    await page.viewport(width, 900);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const fixture = createTopicLandingPageFixture("en");
    try {
      flushSync(() => root.render(<TopicLandingPage {...fixture} hero={{ ...fixture.hero, image: { ...fixture.hero.image, src: imageSrc + encodeURIComponent(`<!--pending-${width}-->`) }, backgroundImageSrc: imageSrc }} />));
      const heroImage = container.querySelector<HTMLImageElement>('[data-slot="theme-hero-media"] img')!;
      const tabs = container.querySelector<HTMLElement>('[data-slot="topic-landing-tabs"]')!;
      const tabsTop = tabs.getBoundingClientRect().top;
      expect(heroImage.dataset.imageState).toBe("pending");
      expect(heroImage.loading).toBe("eager");
      expect(heroImage.fetchPriority).toBe("high");
      expect(getComputedStyle(tabs).opacity).toBe("1");
      const targets = [...container.querySelectorAll<HTMLElement>('[data-initial-fade="true"]')];
      expect(targets.some(target => target.dataset.slot === "topic-landing-tabs-container")).toBe(true);
      const animations = targets.map(target => {
        expect(getComputedStyle(target).animationDuration).toBe("0.35s");
        expect(new DOMMatrixReadOnly(getComputedStyle(target).transform).m42).toBe(24);
        expect(getComputedStyle(target).opacity).toBe("0");
        return target.getAnimations()[0];
      });
      // All content shares the same first paint, including navigation text.
      expect(new Set(animations.map(animation => animation.currentTime)).size).toBe(1);
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 175;
      }
      const halfwayPositions = targets.map(target => new DOMMatrixReadOnly(getComputedStyle(target).transform).m42);
      expect(halfwayPositions.every(value => value > 0 && value < 24)).toBe(true);
      expect(new Set(halfwayPositions).size).toBe(1);
      expect(tabs.getBoundingClientRect().top).toBeCloseTo(tabsTop, 0);
      for (const animation of animations) animation.finish();
      for (const target of targets) {
        expect(getComputedStyle(target).opacity).toBe("1");
        expect(new DOMMatrixReadOnly(getComputedStyle(target).transform).m42).toBe(0);
      }
      const shortcuts = container.querySelector<HTMLElement>('[data-slot="topic-landing-shortcut-rail"]')!;
      expect(shortcuts.dataset.motionInitial).toBe("true");
      expect(container.querySelector('[data-slot="topic-landing-review-list"]')?.getAttribute("data-motion-initial")).toBeNull();
      // Image decoding completes independently of the readable first paint.
      await expect.poll(() => heroImage.dataset.imageState).toBe("loaded");
      expect(tabs.getBoundingClientRect().top).toBeCloseTo(tabsTop, 0);
    } finally {
      root.unmount();
      container.remove();
      await page.viewport(originalViewport.width, originalViewport.height);
    }
  });
}

test("a cached first-screen image has no additional fade", async () => {
  const cached = new Image();
  cached.src = imageSrc;
  await cached.decode();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createTopicLandingPageFixture("en");
  try {
    flushSync(() => root.render(<TopicLandingPage {...fixture} hero={{ ...fixture.hero, image: { ...fixture.hero.image, src: imageSrc }, backgroundImageSrc: imageSrc }} />));
    const image = container.querySelector<HTMLImageElement>('[data-slot="theme-hero-media"] img')!;
    expect(image.dataset.initialImage).toBe("cached");
    expect(getComputedStyle(image).transitionProperty).not.toContain("opacity");
    await expect.poll(() => image.dataset.imageState).toBe("loaded");
  } finally {
    root.unmount();
    container.remove();
  }
});
