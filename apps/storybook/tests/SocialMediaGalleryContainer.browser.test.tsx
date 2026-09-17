import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { SocialMediaGallery } from "@yami/design-system/components/SocialMediaGallery";
import { createSocialMediaGalleryFixture } from "../../../packages/design-system/components/SocialMediaGallery/fixtures";
import "@yami/design-system/tokens.css";

test.each([640, 800, 1000, 1280, 1440])("fits cards and product footers inside a %ipx desktop container", async (width) => {
  const previous = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = `${width}px`;
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(1841, 900);
    flushSync(() => root.render(<SocialMediaGallery {...createSocialMediaGalleryFixture("zh")} />));
    const rail = container.querySelector<HTMLElement>('[data-slot="social-media-gallery-list"]')!;
    const cards = container.querySelectorAll<HTMLElement>('[data-slot="social-video-card"]');
    const gap = parseFloat(getComputedStyle(rail).columnGap);
    const count = (rail.clientWidth + gap) / (cards[0].getBoundingClientRect().width + gap);
    expect(Math.abs(count - Math.round(count))).toBeLessThan(0.02);
    for (const card of cards) {
      const footer = card.querySelector<HTMLElement>('[data-slot="social-video-card-products"]')!;
      expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth + 1);
      for (const badge of footer.querySelectorAll<HTMLElement>('[data-product-overflow]')) {
        if (!badge.getBoundingClientRect().width) continue;
        expect(badge.scrollWidth).toBeLessThanOrEqual(badge.clientWidth + 1);
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(previous.width, previous.height);
  }
});
