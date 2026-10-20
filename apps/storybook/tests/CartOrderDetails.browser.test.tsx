import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CartPage } from "../../../packages/prototypes/pages/CartPage/CartPage";
import { createCartPageFixture } from "../../../packages/prototypes/pages/CartPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

for (const locale of ["zh", "en"] as const) {
  test.each([375, 546])(`${locale} mobile order details shows selected thumbnails, seller shipping and a working fixed footer at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const fixture = createCartPageFixture(locale);
    const item = { ...fixture.initialItems[1], selected: true, quantity: 2 };
    fixture.initialItems = [item];
    try {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage {...fixture} />));
      const opener = page.getByRole("button", { name: `${locale === "zh" ? "明细" : "Details"} $42.65`, exact: true });
      await opener.click();
      const dialog = page.getByRole("dialog", { name: locale === "zh" ? "订单明细" : "Order details", exact: true });
      await expect.element(dialog).toBeVisible();
      const details = dialog.element().querySelector('[data-slot="cart-order-details"]')!;
      expect(details.querySelectorAll("img")).toHaveLength(1);
      expect(details.querySelector("img")!.alt).toBe(item.title);
      expect(details.textContent).toContain("$36.66");
      expect(details.textContent).toContain("$5.99");
      expect(details.textContent).toContain("$42.65");
      expect(details.textContent).toContain(locale === "zh" ? "1 个商家，2 件商品" : "1 seller, 2 items");
      await expect.poll(() => dialog.element().getBoundingClientRect().height).toBeLessThan(764);
      const bar = dialog.element().querySelector('[data-slot="cart-checkout-bar"]')!;
      const nav = dialog.element().querySelector('[data-slot="cart-app-navigation"]')!;
      expect(bar.getBoundingClientRect().bottom).toBe(nav.getBoundingClientRect().top);
      await expect.poll(() => nav.getBoundingClientRect().bottom).toBe(812);
      await dialog.getByRole("button", { name: locale === "zh" ? "运费说明" : "Shipping information", exact: true }).click();
      await expect.element(dialog.getByRole("button", { name: locale === "zh" ? "运费说明" : "Shipping information", exact: true })).toHaveAttribute("aria-expanded", "true");
      await dialog.getByRole("checkbox", { name: locale === "zh" ? "全选" : "All", exact: true }).click();
      expect(details.querySelectorAll("img")).toHaveLength(0);
      expect(details.textContent).toContain("$0.00");
      await dialog.getByRole("button", { name: locale === "zh" ? "去结算" : "Checkout", exact: true }).click();
      await expect.element(dialog.getByRole("alert")).toBeVisible();
      await dialog.getByRole("checkbox", { name: locale === "zh" ? "全选" : "All", exact: true }).click();
      expect(details.textContent).toContain("$42.65");
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => container.querySelector("dialog[open]")).toBeNull();
      await expect.element(opener).toHaveFocus();
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("long mobile order details scrolls between the header and fixed checkout/navigation", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = Array.from({ length: 40 }, (_, index) => ({ ...fixture.initialItems[1], id: `long-${index}`, selected: true }));
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<CartPage {...fixture} initialDrawer="summary" />));
    const dialog = page.getByRole("dialog", { name: "Order details", exact: true }).element();
    const content = dialog.querySelector('[data-sheet-content]')!;
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    expect(dialog.getBoundingClientRect().height).toBeLessThanOrEqual(764);
    expect(content.getBoundingClientRect().bottom).toBeLessThanOrEqual(dialog.querySelector('[data-slot="cart-checkout-bar"]')!.getBoundingClientRect().top);
    await expect.poll(() => dialog.querySelector('[data-slot="cart-app-navigation"]')!.getBoundingClientRect().bottom).toBe(812);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("guest checkout from mobile order details requests sign-in and releases the summary", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = [{ ...fixture.initialItems[1], selected: true }];
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<CartPage {...fixture} signedIn={false} initialDrawer="summary" />));
    await page.getByRole("dialog", { name: "Order details", exact: true }).getByRole("button", { name: "Checkout", exact: true }).click();
    await expect.element(page.getByRole("dialog", { name: "Sign in / Register", exact: true })).toBeVisible();
    await expect.poll(() => container.querySelector('[data-slot="cart-order-details"]')).toBeNull();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("mobile order details keeps per-seller shipping and the saved coupon in the same total", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<CartPage {...fixture} initialDrawer="coupons" />));
    const coupons = page.getByRole("dialog", { name: "Coupons", exact: true });
    await coupons.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true }).click();
    await coupons.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector("dialog[open]")).toBeNull();
    await page.getByRole("button", { name: "Details $283.67", exact: true }).click();
    const details = page.getByRole("dialog", { name: "Order details", exact: true }).element().querySelector('[data-slot="cart-order-details"]')!;
    expect(details.textContent).toContain("4 sellers, 6 items");
    expect(details.querySelectorAll('dl dl > div')).toHaveLength(4);
    for (const amount of ["$7.99", "$25.90", "$19.99", "−$10.00", "$283.67"]) expect(details.textContent).toContain(amount);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
