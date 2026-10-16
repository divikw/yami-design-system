import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { CartPage } from "../../../packages/prototypes/pages/CartPage/CartPage";
import { createCartPageFixture } from "../../../packages/prototypes/pages/CartPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

for (const locale of ["zh", "en"] as const) {
  test.each([375, 1440])(`${locale} guest cart shares a sign-in gate and restores focus at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const fixture = createCartPageFixture(locale);
    fixture.initialItems = [];
    const title = locale === "zh" ? "登录/注册" : "Sign in / Register";
    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(<CartPage {...fixture} signedIn={false} />));
      expect(container.querySelector('[data-slot="cart-discovery"] [role="tablist"]')).toBeNull();
      const collection = page.getByRole("heading", { name: locale === "zh" ? "为你推荐" : "Recommended for you", exact: true });
      await expect.element(collection).toBeVisible();
      const openers = [
        container.querySelector<HTMLButtonElement>('[data-slot="cart-empty-state"] button')!,
        container.querySelector<HTMLButtonElement>('[class*="couponSignIn"] button')!,
        container.querySelector<HTMLButtonElement>('[data-slot="cart-checkout-bar"] > button:last-child')!,
      ];
      for (const opener of openers) {
        await page.elementLocator(opener).click();
        const dialog = page.getByRole("dialog", { name: title, exact: true });
        await expect.element(dialog).toBeVisible();
        expect(dialog.element().querySelector('a')!.getAttribute("href")).toBe(fixture.header.account.href);
        expect(container.querySelector('dialog[data-sheet]')).toBeNull();
        await userEvent.keyboard("{Escape}");
        await expect.element(page.elementLocator(opener)).toHaveFocus();
      }
      if (width >= 1024) {
        const input = page.getByRole("textbox", { name: locale === "zh" ? "折扣码" : "Promo code", exact: true });
        await input.fill("DEMO10");
        await page.getByRole("button", { name: locale === "zh" ? "兑换" : "Redeem", exact: true }).click();
        await expect.element(page.getByRole("dialog", { name: title, exact: true })).toBeVisible();
        await userEvent.keyboard("{Escape}");
        await expect.element(input).toHaveValue("DEMO10");
        expect(container.textContent).not.toContain(locale === "zh" ? "优惠券已使用" : "Coupon applied");
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("guest recommendations add selected items, preserve them behind the save gate and return to empty", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = [];
  const item = fixture.recommendations[0];
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} signedIn={false} />));
    await page.getByRole("button", { name: `Add to cart ${item.title}`, exact: true }).click();
    await expect.element(page.getByRole("checkbox", { name: `Select ${item.title}`, exact: true })).toBeChecked();
    expect(container.querySelector('[data-slot="cart-empty-state"]')).toBeNull();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("$24.58");
    await page.getByRole("button", { name: `Save for later ${item.title}`, exact: true }).click();
    await expect.element(page.getByRole("dialog", { name: "Sign in / Register", exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("checkbox", { name: `Select ${item.title}`, exact: true })).toBeChecked();
    await page.getByRole("button", { name: `Delete ${item.title}`, exact: true }).click();
    await expect.element(page.getByRole("heading", { name: "Your cart is empty", exact: true })).toBeVisible();
    expect(container.querySelector('[data-slot="cart-totals"]')!.hasAttribute("hidden")).toBe(true);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each(["coupons", "summary"] as const)("guest %s preview distinguishes account actions from order details", async (initialDrawer) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<CartPage {...createCartPageFixture("en")} signedIn={false} initialDrawer={initialDrawer} />));
    await expect.element(page.getByRole("dialog", { name: initialDrawer === "coupons" ? "Sign in / Register" : innerWidth < 1024 ? "Order details" : "Order summary", exact: true })).toBeVisible();
    if (initialDrawer === "coupons") expect(container.querySelector('dialog[data-sheet]')).toBeNull();
  } finally { root.unmount(); container.remove(); }
});

test.each([375, 1440])("every shopping-protection entry opens the shared details and restores focus at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<CartPage {...createCartPageFixture("en")} signedIn={false} />));
    const entries = [...container.querySelectorAll<HTMLButtonElement>('ul[class*="guarantees"] button')];
    expect(entries).toHaveLength(4);
    for (const entry of entries) {
      await page.elementLocator(entry).click();
      await expect.element(page.getByRole("dialog", { name: "Shopping protection", exact: true })).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(page.elementLocator(entry)).toHaveFocus();
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
