import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { SearchResultsPage } from "../../../packages/prototypes/pages/SearchResultsPage/SearchResultsPage";
import { createSearchResultsFixture } from "../../../packages/prototypes/pages/SearchResultsPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";
import "@yami/design-system/styles/fonts.css";

function bounds(element: Element) {
  const box = element.getBoundingClientRect();
  return { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height };
}

for (const locale of ["zh", "en"] as const) for (const width of [375, 1023, 1024, 1280, 1920]) {
  test(`${locale}/${width}px: pagination preserves the search grid, alignment and mobile layout`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const originalMargin = document.body.style.margin;
    document.body.style.margin = "0";
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const fixture = createSearchResultsFixture(locale);
    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(<SearchResultsPage {...fixture} />));
      await document.fonts.ready;
      const screen = container.querySelector<HTMLElement>('[data-slot="search-results-page"]')!;
      const toolbar = screen.querySelector<HTMLElement>('[data-slot="search-results-toolbar"]')!;
      const grid = screen.querySelector<HTMLElement>('[data-slot="product-list-container"]')!;
      const nav = screen.querySelector<HTMLElement>('[data-slot="search-results-pagination"]')!;
      const cards = [...grid.querySelectorAll<HTMLElement>('[data-slot="product-list-item"]')];
      expect(cards).toHaveLength(fixture.products.length);
      expect(screen.scrollWidth).toBeLessThanOrEqual(screen.clientWidth);
      expect(nav).toHaveAttribute("aria-label", locale === "zh" ? "分页导航" : "Pagination");
      const pageTwo = nav.querySelector<HTMLButtonElement>('button[aria-label="' + (locale === "zh" ? "第 2 页" : "Page 2") + '"]')!;
      if (width < 1024) {
        expect(getComputedStyle(nav).display).toBe("none");
        expect(bounds(nav).height).toBe(0);
        pageTwo.focus();
        expect(nav.contains(document.activeElement)).toBe(false);
        expect(screen.querySelector('[data-slot="search-results-layout-toggle"]')).toBeVisible();
      } else {
        expect(nav).toBeVisible();
        expect(nav).toHaveAccessibleName(locale === "zh" ? "分页导航" : "Pagination");
        expect(bounds(nav).x).toBe(bounds(toolbar).x);
        expect(bounds(nav).width).toBe(bounds(toolbar).width);
        expect(bounds(nav).width).toBe(bounds(grid).width);
        expect(bounds(nav).y).toBeGreaterThanOrEqual(bounds(grid).y + bounds(grid).height);
        expect(pageTwo.getBoundingClientRect().height).toBe(32);
        const before = { toolbar: bounds(toolbar), grid: bounds(grid), nav: bounds(nav), cards: cards.map(bounds) };
        const productText = cards.map(card => card.textContent);
        await userEvent.click(pageTwo);
        expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("2");
        expect(nav.querySelector(":focus-visible")).toBeNull();
        expect({ toolbar: bounds(toolbar), grid: bounds(grid), nav: bounds(nav), cards: cards.map(bounds) }).toEqual(before);
        expect(cards.map(card => card.textContent)).toEqual(productText);
        await userEvent.tab();
        const focused = document.activeElement as HTMLElement;
        expect(nav.contains(focused)).toBe(true);
        expect(getComputedStyle(focused).outlineWidth).toBe("2px");
        expect(getComputedStyle(focused).outlineOffset).toBe("2px");
        expect(getComputedStyle(focused).outlineColor).toBe("rgb(0, 102, 235)");
        const focusBox = bounds(focused);
        const navBox = bounds(nav);
        expect(focusBox.x - 4).toBeGreaterThanOrEqual(navBox.x);
        expect(focusBox.x + focusBox.width + 4).toBeLessThanOrEqual(navBox.x + navBox.width);
        expect(focusBox.y - 4).toBeGreaterThanOrEqual(navBox.y);
        expect(focusBox.y + focusBox.height + 4).toBeLessThanOrEqual(navBox.y + navBox.height);
      }
      flushSync(() => root.render(<SearchResultsPage {...fixture} products={[]} />));
      expect(container.querySelector('[data-slot="search-results-pagination"]')).toBeNull();
      expect(container.querySelector("h2")).toHaveTextContent(fixture.copy.emptyTitle);
    } finally {
      root.unmount();
      container.remove();
      document.body.style.margin = originalMargin;
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("controlled page updates retain query, sort and category and accept the host's new products", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createSearchResultsFixture("en");
  const change = vi.fn();
  const request = { query: fixture.query, page: 1, sort: "price-low" as const, categoryIds: [fixture.copy.categoryOptions[0].value] };
  try {
    await page.viewport(1280, 900);
    flushSync(() => root.render(<SearchResultsPage {...fixture} products={fixture.products.slice(0, 3)}
      interaction={{ request, pageCount: 2, onRequestChange: change }} />));
    const nav = container.querySelector<HTMLElement>('[data-slot="search-results-pagination"]')!;
    const initialProducts = [...container.querySelectorAll('[data-slot="product-list-item"]')].map(el => el.textContent);
    await userEvent.click(nav.querySelector<HTMLButtonElement>('[aria-label="Page 2"]')!);
    expect(change).toHaveBeenLastCalledWith({ ...request, page: 2 });
    flushSync(() => root.render(<SearchResultsPage {...fixture} products={fixture.products.slice(3, 6)}
      interaction={{ request: { ...request, page: 2 }, pageCount: 2, onRequestChange: change }} />));
    expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent("2");
    const updated = [...container.querySelectorAll('[data-slot="product-list-item"]')].map(el => el.textContent);
    expect(updated).toHaveLength(3);
    expect(updated).not.toEqual(initialProducts);
    await userEvent.click(nav.querySelector<HTMLButtonElement>('[aria-label="Page 1"]')!);
    expect(change).toHaveBeenLastCalledWith(request);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
