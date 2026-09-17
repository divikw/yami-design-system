import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { BrandProductRail } from "@yami/design-system/components/BrandProductRail";
import { ProductList } from "@yami/design-system/components/ProductList";
import { SocialMediaGallery } from "@yami/design-system/components/SocialMediaGallery";
import { TrendingSearches } from "@yami/design-system/components/TrendingSearches";
import { createBrandProductRailProps } from "../../../packages/design-system/components/BrandProductRail/fixtures";
import { createTrendingSearchesProps } from "../../../packages/design-system/components/TrendingSearches/fixtures";
import "@yami/design-system/tokens.css";

for (const kind of ["brands", "searches"] as const) {
  test(`${kind}: centered rail geometry, paging and mobile behavior`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const render = (align: "start" | "center", short = false) => {
      const brands = createBrandProductRailProps("zh", "#all");
      const searches = createTrendingSearchesProps("zh");
      flushSync(() => root.render(kind === "brands"
        ? <BrandProductRail {...brands} headingAlign={align} campaigns={short ? brands.campaigns.slice(0, 1) : brands.campaigns} />
        : <TrendingSearches {...searches} headingAlign={align} keywords={short ? searches.keywords.slice(0, 1) : searches.keywords} />));
    };
    const slot = kind === "brands" ? "brand-product-rail" : "trending-searches";
    const rail = () => host.querySelector<HTMLElement>(`[data-slot="${slot}-list"]`)!;
    const buttons = () => Array.from(host.querySelectorAll<HTMLButtonElement>('button[data-rail-navigation-button]'));
    try {
      await page.viewport(1440, 900);
      render("start");
      const originalTitle = host.querySelector<HTMLElement>('[data-section-heading-title]')!;
      const originalWeight = getComputedStyle(originalTitle).fontWeight;
      const originalGap = rail().getBoundingClientRect().top - originalTitle.getBoundingClientRect().bottom;
      render("center");
      await expect.poll(() => buttons().length).toBe(2);
      const title = host.querySelector<HTMLElement>('[data-section-heading-title]')!;
      expect(getComputedStyle(title).fontWeight).toBe(originalWeight);
      if (kind === "brands") {
        const link = title.querySelector("a")!;
        expect(link.getAttribute("href")).toBe("#all");
        expect(getComputedStyle(link).display).toBe("inline-flex");
        expect(link.querySelector('[data-icon="arrow-right"]')).not.toBeNull();
        expect(getComputedStyle(host.querySelector('[data-only-view-all="true"]')!).display).toBe("none");
      }
      if (kind === "searches") {
        expect(Math.abs(rail().getBoundingClientRect().top - title.getBoundingClientRect().bottom - originalGap)).toBeLessThan(1);
      }
      const content = rail().getBoundingClientRect();
      const heading = title.getBoundingClientRect();
      expect(Math.abs((heading.left + heading.right - content.left - content.right) / 2)).toBeLessThan(2);
      const [previous, next] = buttons();
      for (const [button, edge] of [[previous, content.left], [next, content.right]] as const) {
        const rect = button.getBoundingClientRect();
        expect(Math.abs((rect.left + rect.right) / 2 - edge)).toBeLessThan(2);
        expect(Math.abs((rect.top + rect.bottom - content.top - content.bottom) / 2)).toBeLessThan(2);
      }
      expect(previous.getAttribute("aria-disabled")).toBe("true");
      next.click();
      await expect.poll(() => rail().scrollLeft).toBeGreaterThan(0);
      await expect.poll(() => previous.getAttribute("aria-disabled")).not.toBe("true");
      rail().scrollLeft = rail().scrollWidth;
      rail().dispatchEvent(new Event("scroll"));
      await expect.poll(() => next.getAttribute("aria-disabled")).toBe("true");

      await page.viewport(375, 812);
      expect(getComputedStyle(host.querySelector("[data-section-heading]")!).flexDirection).toBe("row");
      expect(getComputedStyle(title).textAlign).not.toBe("center");
      if (kind === "brands") {
        expect(getComputedStyle(title.querySelector("a")!).display).toBe("none");
      }
      await expect.poll(() => buttons().every(button => button.getClientRects().length === 0)).toBe(true);
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
      if (kind === "searches") {
        const toggle = host.querySelector<HTMLButtonElement>('[data-slot="trending-searches-toggle"]')!;
        const expanded = toggle.getAttribute("aria-expanded");
        toggle.click();
        await expect.poll(() => toggle.getAttribute("aria-expanded")).not.toBe(expanded);
      }
      await page.viewport(1440, 900);
      render("center", true);
      await expect.poll(() => buttons().length).toBe(0);
      render("start");
      await expect.poll(() => buttons().length).toBe(2);
      expect(getComputedStyle(host.querySelector('[data-section-heading]')!).flexDirection).toBe("row");
    } finally {
      flushSync(() => root.unmount());
      host.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("mobile card headings stay left aligned while plain sections may center", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const brands = createBrandProductRailProps("zh", "#all");
  try {
    flushSync(() => root.render(<>
      <ProductList title="Products" products={[]} headingAlign="center" mobileSurface="card" />
      <SocialMediaGallery title="Social" cards={[]} headingAlign="center" />
      <ProductList title="Plain products" products={[]} headingAlign="center" mobileSurface="plain" />
      <BrandProductRail {...brands} campaigns={[]} headingAlign="center" mobileSurface="plain" />
    </>));
    for (const width of [375, 1024]) {
      await page.viewport(width, 812);
      const headings = Array.from(host.querySelectorAll<HTMLElement>("[data-section-heading]"));
      expect(headings).toHaveLength(4);
      const titleLink = headings[3].querySelector("h2 a")!;
      expect(getComputedStyle(titleLink).columnGap).toBe("4px");
      expect(titleLink.getAttribute("href")).toBe("#all");
      for (const [index, heading] of headings.entries()) {
        expect(getComputedStyle(heading).flexDirection).toBe(width < 1024 && index < 2 ? "row" : "column");
      }
    }
  } finally {
    flushSync(() => root.unmount());
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
