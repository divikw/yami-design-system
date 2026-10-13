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
