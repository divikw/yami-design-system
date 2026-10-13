import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ProductDetailPage } from "../../../packages/prototypes/pages/ProductDetailPage/ProductDetailPage";
import { createProductDetailPageFixture } from "../../../packages/prototypes/pages/ProductDetailPage/fixtures";
import { createFoodProductDetailPageFixture } from "../../../packages/prototypes/pages/ProductDetailPage/food-fixtures";
import { createBeverageProductDetailPageFixture } from "../../../packages/prototypes/pages/ProductDetailPage/beverage-fixtures";
import "@yami/design-system/tokens.css";

for (const [name, fixture] of Object.entries({ beauty: createProductDetailPageFixture, food: createFoodProductDetailPageFixture, beverage: createBeverageProductDetailPageFixture })) {
  for (const locale of ["zh", "en"] as const) for (const dark of [false, true]) {
    test(`${name} breadcrumb keeps localized navigation and compact unclipped focus in ${locale}/${dark ? "dark" : "light"}`, async () => {
      const viewport = { width: innerWidth, height: innerHeight };
      const originalClassName = document.documentElement.className;
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container);
      try {
        await page.viewport(1280, 900);
        document.documentElement.classList.toggle("dark", dark);
        flushSync(() => root.render(<ProductDetailPage {...fixture(locale)} />));
        const nav = container.querySelector<HTMLElement>('[data-slot="product-detail-breadcrumb"]')!;
        expect(nav).toHaveAccessibleName(locale === "zh" ? "面包屑导航" : "Breadcrumb");
        expect(nav.querySelector("ol")).not.toBeNull();
        expect(nav.querySelector('[aria-current="page"]')).toBeNull();
        expect([...nav.querySelectorAll('[aria-hidden="true"]')].every(e => e.textContent === "/")).toBe(true);
        await userEvent.tab();
        for (const link of nav.querySelectorAll<HTMLAnchorElement>("a")) {
          expect(link.getAttribute("href")).toContain(`/us/${locale}/c/`);
          expect(link.getBoundingClientRect().height).toBe(24);
          expect(link.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
          link.focus();
          expect(link).toHaveFocus();
          const style = getComputedStyle(link);
          expect(style.outlineWidth).toBe("2px");
          expect(style.outlineOffset).toBe("2px");
          expect(style.outlineColor).toBe(dark ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
          const bounds = link.getBoundingClientRect();
          const navBounds = nav.getBoundingClientRect();
          expect(bounds.left - 4).toBeGreaterThanOrEqual(navBounds.left);
          expect(bounds.right + 4).toBeLessThanOrEqual(navBounds.right);
          expect(bounds.top - 4).toBeGreaterThanOrEqual(navBounds.top);
          expect(bounds.bottom + 4).toBeLessThanOrEqual(navBounds.bottom);
        }
        await page.viewport(375, 812);
        await expect.poll(() => nav.getBoundingClientRect().height).toBe(0);
      } finally {
        root.unmount();
        container.remove();
        document.documentElement.className = originalClassName;
        await page.viewport(viewport.width, viewport.height);
      }
    });
  }
}
