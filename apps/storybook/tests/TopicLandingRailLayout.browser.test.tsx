import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import { TopicLandingPage } from "../../../packages/prototypes/pages/TopicLandingPage/TopicLandingPage";
import { createTopicKeywordLandingPageFixture } from "../../../packages/prototypes/pages/TopicLandingPage/topic.fixtures";

test.each([390, 1024, 1199, 1200, 1280, 1281, 1439, 1440, 1441, 1680, 1920])(
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
        expect(review.getBoundingClientRect().width).toBeCloseTo(320, 0);
        expect(products.scrollWidth).toBeGreaterThan(products.clientWidth);
        expect(reviews.scrollWidth).toBeGreaterThan(reviews.clientWidth);
      } else {
        // Topic bodies stop growing at 1440px, including their page gutters.
        const bodyWidth = products.closest('[data-slot="product-list-container"]')!.getBoundingClientRect().width;
        expect(bodyWidth).toBeLessThanOrEqual(1440);
        const count = bodyWidth > 1280 ? 6 : bodyWidth >= 1200 ? 5 : 4;
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

test("keeps a long collection link readable on mobile without a horizontal scroll area", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(320, 900);
    flushSync(() => root.render(<TopicLandingPage
      {...createTopicKeywordLandingPageFixture("en")}
      showChrome={false}
      relatedKeywords={{ title: "Explore more", items: [{ label: "Ingredient".repeat(12), href: "/collections/ingredients" }] }}
    />));

    const region = page.getByRole("region", { name: "Explore more" });
    const link = region.getByRole("link", { name: "Ingredient".repeat(12) }).element();
    expect(link.getAttribute("href")).toBe("/collections/ingredients");
    const list = region.getByRole("list").element();
    const tag = list.querySelector('[data-slot="tag"]')!;
    expect(tag.getBoundingClientRect().width).toBeLessThanOrEqual(list.clientWidth);
    expect(tag.getBoundingClientRect().height).toBeGreaterThan(32);
    expect(list.scrollWidth).toBe(list.clientWidth);
    expect(list.parentElement?.tabIndex).toBe(-1);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
