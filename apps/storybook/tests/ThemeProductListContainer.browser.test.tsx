import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { ThemeProductList } from "@yami/design-system/components/ThemeProductList";
import { createThemeProductListProps } from "../../../packages/design-system/components/ThemeProductList/fixtures";
import "@yami/design-system/tokens.css";

test.each([800, 1000, 1200, 1440])("keeps theme artwork and products aligned in a %ipx container", async (width) => {
  const previous = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.width = `${width}px`;
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(1841, 900);
    flushSync(() => root.render(<ThemeProductList {...createThemeProductListProps()} />));
    const rail = container.querySelector<HTMLElement>('[data-slot="product-list-items"]')!;
    const slot = rail.querySelector<HTMLElement>('[data-slot="product-list-leading-content"]')!;
    const panel = slot.querySelector<HTMLElement>('[data-slot="theme-product-list-content"]')!;
    const product = rail.querySelector<HTMLElement>('[data-slot="product-list-item"]')!;
    const artwork = panel.getBoundingClientRect();
    const productBox = product.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(rail).columnGap);
    expect(productBox.width).toBeGreaterThanOrEqual(180);
    expect(Math.abs(artwork.width - (productBox.width * 2 + gap))).toBeLessThan(1);
    expect(Math.abs(artwork.height - slot.getBoundingClientRect().height)).toBeLessThan(1);
    expect(Math.abs(artwork.top - productBox.top)).toBeLessThan(1);
    expect(Math.abs(artwork.bottom - productBox.bottom)).toBeLessThan(1);
    expect(getComputedStyle(panel).borderRadius).toBe("8px");
    expect(getComputedStyle(panel).clipPath).toBe("inset(0px round 8px)");
    const overlay = panel.querySelector<HTMLElement>('[data-slot="theme-product-list-overlay"]')!;
    expect(overlay.getBoundingClientRect().height).toBeLessThan(artwork.height);
    expect(overlay.scrollHeight).toBeLessThanOrEqual(overlay.clientHeight + 1);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(previous.width, previous.height);
  }
});
