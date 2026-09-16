import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import { TopicLandingPage } from "../../../packages/prototypes/pages/TopicLandingPage/TopicLandingPage";
import { createTopicKeywordLandingPageFixture } from "../../../packages/prototypes/pages/TopicLandingPage/topic.fixtures";

test.each([390, 1024, 1280, 1439, 1440, 1680, 1920])(
  "preserves the Topic page rail columns at %ipx",
  async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(<TopicLandingPage {...createTopicKeywordLandingPageFixture("zh")} />));
      const products = container.querySelector('#popular-picks [data-slot="product-list-items"]')!;
      const reviews = container.querySelector('#reviews [data-slot="review-list-items"]')!;
      const product = products.querySelector('[data-slot="product-list-item"]')!;
      const review = reviews.querySelector("li")!;
      if (width < 1024) {
        expect(product.getBoundingClientRect().width).toBeCloseTo(152, 0);
        expect(review.getBoundingClientRect().width).toBeCloseTo(344, 0);
        expect(products.scrollWidth).toBeGreaterThan(products.clientWidth);
        expect(reviews.scrollWidth).toBeGreaterThan(reviews.clientWidth);
      } else {
        const count = width >= 1440 ? 6 : width >= 1200 ? 5 : 4;
        for (const [list, item, columns] of [[products, product, count], [reviews, review, 3]] as const) {
          const gap = parseFloat(getComputedStyle(list).columnGap);
          const occupied = item.getBoundingClientRect().width * columns + gap * (columns - 1);
          expect(Math.abs(occupied - list.clientWidth)).toBeLessThan(2);
        }
      }
    } finally {
      root.unmount();
      container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  },
);
