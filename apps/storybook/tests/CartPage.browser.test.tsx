import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CartPage } from "../../../packages/prototypes/pages/CartPage";
import { createCartPageFixture } from "../../../packages/prototypes/pages/CartPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

test("CartPage fits mobile and desktop, supports quantities, coupon invalidation and reversible removal", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const first = fixture.initialItems[0];
  const second = fixture.initialItems[1];
  try {
    for (const width of [360, 375, 402, 768, 1024, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage key={width} {...fixture} />));
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      if (width < 768) {
        const merchant = container.querySelector('[aria-labelledby="merchant-yami"]')!;
        const heading = merchant.querySelector("h2")!.getBoundingClientRect();
        const shipping = merchant.querySelector('[data-slot="cart-shipping"] p')!;
        expect(shipping.getBoundingClientRect().top).toBeGreaterThanOrEqual(heading.bottom);
        expect(shipping.getBoundingClientRect().width).toBeGreaterThan(100);
        expect(shipping.getBoundingClientRect().height).toBeLessThanOrEqual(3 * parseFloat(getComputedStyle(shipping).lineHeight));
        const row = container.querySelector('[data-slot="cart-item"]')!;
        expect(row.querySelector('[role="group"]')!.getBoundingClientRect().top).toBeGreaterThanOrEqual(row.querySelector("strong")!.getBoundingClientRect().bottom);
      }
      await page.getByRole("checkbox", { name: `Select ${second.title}`, exact: true }).click();
      const select = container.querySelector<HTMLSelectElement>(`select[aria-label="${second.title} quantity"]`)!;
      select.value = "custom";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await expect.element(page.getByRole("textbox", { name: `${second.title} quantity: enter quantity` })).toBeVisible();
      const input = page.getByRole("textbox", { name: `${second.title} quantity: enter quantity` });
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      await input.fill("26");
      await page.getByRole("button", { name: "Apply", exact: true }).click();
      await expect.element(page.getByRole("alert")).toHaveTextContent("Enter a whole number from 1 to 25");
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      await input.fill("12");
      await page.getByRole("button", { name: "Apply", exact: true }).click();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
      await expect.element(page.getByText("$219.96", { exact: true }).first()).toBeVisible();
      if (width < 1024) {
        const button = container.querySelector<HTMLButtonElement>('[data-slot="cart-checkout-bar"] button')!;
        expect(getComputedStyle(button.parentElement!).position).toBe("fixed");
        expect(button.parentElement!.getBoundingClientRect().bottom).toBe(812);
        expect(button.getBoundingClientRect().bottom).toBeLessThanOrEqual(812);
      }
    }
    await page.getByRole("button", { name: "View all Unavailable items", exact: true }).click();
    const unavailableDialog = container.querySelector('dialog[open]')!;
    expect(unavailableDialog.scrollWidth).toBeLessThanOrEqual(unavailableDialog.clientWidth);
    const itemDescription = unavailableDialog.querySelector('[data-slot="cart-item"] p')!;
    expect(getComputedStyle(itemDescription).marginTop).toBe("0px");
    expect(getComputedStyle(itemDescription).marginBottom).toBe("0px");
    await userEvent.keyboard("{Escape}");
    await page.getByRole("checkbox", { name: /^Select all/ }).click();
    await page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    await expect.element(page.getByRole("dialog", { name: "Coupons", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await userEvent.keyboard("{Escape}");
    const totals = container.querySelector('[data-slot="cart-totals"]')!;
    expect(totals.textContent).toContain("Discount");
    await page.getByRole("checkbox", { name: /^Select all/ }).click();
    expect(totals.textContent).not.toContain("Discount");
    await page.getByRole("button", { name: `Delete ${first.title}`, exact: true }).click();
    expect(container.querySelector(`select[aria-label="${first.title} quantity"]`)).toBeNull();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    expect(container.querySelector(`select[aria-label="${first.title} quantity"]`)).not.toBeNull();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("CartPage aligns checkbox glyphs and targets, compacts discovery gutters and preserves the text-link drawer action", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    for (const width of [360, 375, 402, 768, 1024, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage key={width} {...fixture} />));
      const all = container.querySelector<HTMLElement>('[aria-labelledby="cart-title"] [data-slot="checkbox"]')!;
      const merchant = container.querySelector<HTMLElement>('[aria-labelledby="merchant-yami"] header [data-slot="checkbox"]')!;
      const item = container.querySelector<HTMLElement>('[data-slot="cart-item"] [data-slot="checkbox"]')!;
      const center = (element: Element) => element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
      expect(Math.abs(center(all) - center(item))).toBeLessThan(1);
      expect(Math.abs(center(merchant) - center(item))).toBeLessThan(1);
      const glyph = merchant.querySelector('[data-slot="checkbox-indicator"] svg')!;
      expect(Math.abs(center(glyph) - center(merchant))).toBeLessThan(1);
      expect(Math.abs(glyph.getBoundingClientRect().top + glyph.getBoundingClientRect().height / 2 - merchant.getBoundingClientRect().top - merchant.getBoundingClientRect().height / 2)).toBeLessThan(1);
      const target = merchant.parentElement!;
      expect(target.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      expect(target.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
      await page.getByRole("checkbox", { name: `Select ${fixture.initialItems[0].title}`, exact: true }).click();
      expect(merchant.getAttribute("aria-checked")).toBe("mixed");
      await page.elementLocator(target).click({ position: { x: 2, y: 2 } });
      expect(merchant.getAttribute("aria-checked")).toBe("true");
      expect(all.getAttribute("aria-checked")).toBe("true");
      await page.elementLocator(container.querySelector("#merchant-yami")!).click();
      expect(merchant.getAttribute("aria-checked")).toBe("false");
      await userEvent.keyboard("{Space}");
      expect(merchant.getAttribute("aria-checked")).toBe("true");
      const tabs = container.querySelector('[role="tablist"]')!;
      const heading = container.querySelector('[data-slot="product-list-title"]')!;
      const products = container.querySelector('[data-slot="product-list-items"]')!;
      expect(Math.abs(tabs.getBoundingClientRect().left - heading.getBoundingClientRect().left)).toBeLessThan(1);
      expect(Math.abs(tabs.getBoundingClientRect().left - products.getBoundingClientRect().left)).toBeLessThan(1);
      const learn = page.getByRole("button", { name: "Learn more", exact: true });
      const learnElement = container.querySelector<HTMLElement>('aside[aria-label="Order summary"] button[aria-haspopup="dialog"]')!;
      expect(getComputedStyle(learnElement).textDecorationLine).toContain("underline");
      await learn.click();
      await expect.element(page.getByRole("dialog", { name: "Shopping protection", exact: true })).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(learn).toHaveFocus();
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
