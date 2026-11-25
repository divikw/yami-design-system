import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import { TopicLandingPage, createTopicLandingPageFixture } from "@yami/prototypes/topic-landing-page";

test.each([390, 1224])("shows collection filters from 12 products at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createTopicLandingPageFixture("en");
  const products = fixture.waterfall.products.slice(0, 12).map((product, index) => ({
    ...product,
    availability: index === 0 ? "sold-out" as const : "available" as const,
  }));
  const renderCollection = (count: number) => {
    const all = products.slice(0, count);
    flushSync(() => root.render(<TopicLandingPage
      {...fixture}
      showChrome={false}
      waterfall={{
        ...fixture.waterfall,
        catalogFilters: true,
        products: all,
        productsByTab: { all },
        defaultValue: "all",
      }}
    />));
  };
  const toolbar = () => container.querySelector("#product-list [data-collection-product-filters]");
  const cards = () => container.querySelectorAll('#product-list [data-slot="product-card"]');
  const soldOutCard = () => container.querySelector('#product-list [data-availability="sold-out"]');

  try {
    await page.viewport(width, 900);
    renderCollection(11);
    expect(toolbar()).toBeNull();
    expect(cards()).toHaveLength(11);
    expect(soldOutCard()).not.toBeNull();

    renderCollection(12);
    expect(toolbar()).not.toBeNull();
    expect(cards()).toHaveLength(11);
    expect(soldOutCard()).toBeNull();

    renderCollection(11);
    expect(toolbar()).toBeNull();
    expect(cards()).toHaveLength(11);
    expect(soldOutCard()).not.toBeNull();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
