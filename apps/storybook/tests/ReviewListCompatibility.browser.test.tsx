import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { ReviewList } from "@yami/design-system/components/ReviewList";
import "@yami/design-system/tokens.css";

test.each([390, 1440, 1920])(
  "automatically equalizes review heights and preserves responsive widths at %ipx",
  async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const reviews = [
      { id: "short", rating: 5, reviewer: "Customer A", review: "Good tea." },
      { id: "long", rating: 5, reviewer: "Customer B", review: "Fresh tea with a smooth taste. ".repeat(30) },
    ];

    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(
        <>
          <ReviewList title="Default" reviews={reviews} />
          <ReviewList title="Centered default" headingAlign="center" reviews={reviews} />
          <ReviewList title="Centered plain" headingAlign="center" mobileSurface="plain" reviews={reviews} />
        </>,
      ));
      const sections = container.querySelectorAll('[data-slot="review-list"]');
      const headingAlignments = Array.from(sections, (section) =>
        getComputedStyle(section.querySelector('[data-slot="review-list-title"]')!).textAlign,
      );
      expect(headingAlignments[1]).toBe(width < 1024 ? "start" : "center");
      expect(headingAlignments[2]).toBe("center");
      const rects = (section: Element) => Array.from(
        section.querySelectorAll('[data-slot="review-card"]'),
        (card) => card.getBoundingClientRect(),
      );
      for (const section of sections) {
        const [card, other] = rects(section);
        expect(Math.abs(card.height - other.height)).toBeLessThan(1);
        expect(Math.abs(card.y - other.y)).toBeLessThan(1);
        const copy = section.querySelectorAll<HTMLElement>('[data-slot="review-card-content"]')[1];
        expect(copy.scrollHeight).toBeLessThanOrEqual(copy.clientHeight + 1);
        const rail = section.querySelector('[data-slot="review-list-items"]')!;
        if (width < 1024) {
          expect(card.width).toBeCloseTo(344, 0);
          expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
        } else {
          const count = width >= 1920 ? 4 : 3;
          const gap = parseFloat(getComputedStyle(rail).columnGap);
          expect(Math.abs(card.width * count + gap * (count - 1) - rail.clientWidth)).toBeLessThan(2);
        }
      }
    } finally {
      root.unmount();
      container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  },
);
