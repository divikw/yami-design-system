import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { ReviewList } from "@yami/design-system/components/ReviewList";
import "@yami/design-system/tokens.css";

test.each([390, 1440, 1920])(
  "preserves default review geometry alongside opt-in equal cards at %ipx",
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
          <ReviewList title="Campaign" cardHeight="equal" headingAlign="center" reviews={reviews} />
        </>,
      ));
      const sections = container.querySelectorAll('[data-slot="review-list"]');
      const rects = (section: Element) => Array.from(
        section.querySelectorAll('[data-slot="review-card"]'),
        (card) => card.getBoundingClientRect(),
      );
      for (const section of [sections[0], sections[1]]) {
        const [short, long] = rects(section);
        expect(long.height - short.height).toBeGreaterThan(20);
        expect(Math.abs(short.y + short.height / 2 - long.y - long.height / 2)).toBeLessThan(1);
      }
      const [short, long] = rects(sections[2]);
      expect(Math.abs(short.height - long.height)).toBeLessThan(1);
      expect(Math.abs(short.y - long.y)).toBeLessThan(1);
      for (const section of sections) {
        const [card] = rects(section);
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
