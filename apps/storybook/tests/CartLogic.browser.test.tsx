import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CartPage } from "../../../packages/prototypes/pages/CartPage/CartPage";
import { createCartPageFixture } from "../../../packages/prototypes/pages/CartPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

test.each([375, 1440])("coupon changes are staged until Save and discarded by Close or Escape at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    const totals = container.querySelector('[data-slot="cart-totals"]')!;
    const open = () => page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    const option = dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true });
    await open();
    const field = dialog.getByRole("textbox", { name: "Promo code", exact: true }).element().closest('[data-slot="input"]')!;
    const redeem = dialog.getByRole("button", { name: "Redeem", exact: true }).element();
    expect(field.contains(redeem)).toBe(width < 1024);
    expect(Boolean(dialog.element().querySelector('[data-slot="sheet-description"]'))).toBe(width < 1024);
    expect(getComputedStyle(dialog.element().querySelector('[data-slot="sheet-header"]')!).borderBottomWidth).toBe(width < 1024 ? "1px" : "0px");
    const card = option.element().closest('[data-slot="coupon"]')!;
    expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    await expect.poll(() => dialog.getByRole("button", { name: "Save", exact: true }).element().getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight);
    await option.click();
    await expect.element(option).toBeChecked();
    expect(totals.textContent).not.toContain("Discount");
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    await open();
    await expect.element(option).not.toBeChecked();
    await dialog.getByRole("textbox", { name: "Promo code", exact: true }).fill("DEMO10");
    await dialog.getByRole("button", { name: "Redeem", exact: true }).click();
    await expect.element(option).toBeChecked();
    expect(totals.textContent).not.toContain("Discount");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    expect(totals.textContent).toContain("Discount");
    await open();
    await expect.element(option).toBeChecked();
    await option.click();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    await open();
    await expect.element(option).toBeChecked();
    await option.click();
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    expect(totals.textContent).not.toContain("Discount");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("coupon drawer keeps one selection and hides coupons that do not meet the current cart conditions", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  fixture.coupons.push({ ...fixture.coupons[0], id: "ineligible", code: "HIGH", title: "$100 off $1000", minSubtotalCents: 100000 });
  try {
    await page.viewport(1440, 812);
    flushSync(() => root.render(<CartPage {...fixture} initialDrawer="coupons" />));
    const dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    await dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true }).click();
    await dialog.getByRole("checkbox", { name: fixture.coupons[1].title, exact: true }).click();
    await expect.element(dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true })).not.toBeChecked();
    expect(dialog.getByRole("checkbox").elements()).toHaveLength(2);
    expect(dialog.element().textContent).not.toContain("$100 off $1000");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("−$5.00");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("adding a saved product from browsing history keeps focus on the active collection at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const item = fixture.history[0];
  fixture.initialSavedItems = [];
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("button", { name: `Save for later ${item.title}`, exact: true }).click();
    await page.getByRole("tab", { name: "Recently viewed", exact: true }).click();
    const add = page.getByRole("button", { name: `Add to cart ${item.title}`, exact: true });
    await add.click();
    await expect.element(add).toHaveFocus();
    await expect.element(page.getByRole("tab", { name: "Recently viewed", exact: true })).toHaveAttribute("aria-selected", "true");
    await expect.element(page.getByRole("checkbox", { name: `Select ${item.title}`, exact: true })).toBeChecked();
    await expect.element(page.getByRole("tab", { name: "Save for later (0)", exact: true })).toBeVisible();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("switching to a guest account stops applying the signed-in coupon", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} signedIn />));
    await page.getByRole("textbox", { name: "Promo code", exact: true }).fill("DEMO10");
    await page.getByRole("button", { name: "Redeem", exact: true }).click();
    const totals = container.querySelector('[data-slot="cart-totals"]')!;
    expect(totals.textContent).toContain("Discount");
    expect(totals.textContent).toContain("$283.67");
    flushSync(() => root.render(<CartPage {...fixture} signedIn={false} />));
    expect(totals.textContent).not.toContain("Discount");
    expect(totals.textContent).toContain("$293.67");
    await page.getByRole("button", { name: /^Checkout \(/ }).click();
    await expect.element(page.getByRole("dialog", { name: "Sign in / Register", exact: true })).toBeVisible();
    flushSync(() => root.render(<CartPage {...fixture} signedIn />));
    expect(container.querySelector('dialog[open]')).toBeNull();
    expect(totals.textContent).not.toContain("Discount");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("repeated additions respect purchase limits and preserve another merchant's selection and shipping", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const limited = fixture.initialItems.find((item) => item.merchantId === "japan")!;
  const other = fixture.initialItems.find((item) => item.merchantId === "yami")!;
  fixture.initialItems = [{ ...limited, quantity: 1, selected: true }, { ...other, selected: true }];
  fixture.history = [limited];
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("tab", { name: "Recently viewed", exact: true }).click();
    const add = page.getByRole("button", { name: `Add to cart ${limited.title}`, exact: true });
    await add.click();
    const totals = container.querySelector('[data-slot="cart-totals"]')!;
    const atLimit = totals.textContent;
    await add.click();
    expect(totals.textContent).toBe(atLimit);
    await expect.element(page.getByRole("combobox", { name: `${limited.title} quantity`, exact: true })).toHaveTextContent("2");
    await expect.element(page.getByRole("status")).toHaveTextContent("Purchase limit reached");
    await page.getByRole("checkbox", { name: `Select ${limited.title}`, exact: true }).click();
    await expect.element(page.getByRole("checkbox", { name: `Select ${other.title}`, exact: true })).toBeChecked();
    expect(totals.textContent).toContain("$129.99");
    expect(totals.textContent).not.toContain("$25.90");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("signing out closes the coupon drawer and signing back in does not reopen it", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  try {
    flushSync(() => root.render(<CartPage {...fixture} signedIn initialDrawer="coupons" />));
    await expect.element(page.getByRole("dialog", { name: "Coupons", exact: true })).toBeVisible();
    flushSync(() => root.render(<CartPage {...fixture} signedIn={false} initialDrawer="coupons" />));
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    flushSync(() => root.render(<CartPage {...fixture} signedIn initialDrawer="coupons" />));
    expect(container.querySelector('dialog[open]')).toBeNull();
  } finally { root.unmount(); container.remove(); }
});

test.each([375, 1440])("cart feedback expires and repeated additions restart its lifetime at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = [];
  const item = fixture.recommendations[0];
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<CartPage {...fixture} />));
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const add = page.getByRole("button", { name: `Add to cart ${item.title}`, exact: true }).element();
    const merchantTopBefore = container.querySelector('main')!.getBoundingClientRect().top;
    flushSync(() => add.click());
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Added to cart");
    if (width >= 1024) {
      const notice = container.querySelector('[data-slot="cart-add-notice"]')!;
      const header = container.querySelector('[data-slot="cart-desktop-header"]')!;
      const cart = header.querySelector('[data-slot="header-cart"]')!;
      expect(header.contains(notice)).toBe(true);
      expect(notice.textContent).toContain(item.title);
      expect(notice.textContent).toContain("$18.59");
      expect(notice.querySelector('img')!.getAttribute('src')).toBe(item.image);
      expect(getComputedStyle(notice).position).toBe("absolute");
      expect(notice.getBoundingClientRect().right).toBe(cart.getBoundingClientRect().right);
      expect(container.querySelector('main')!.getBoundingClientRect().top).toBe(merchantTopBefore);
      expect(container.querySelector('main > div > div[class*="notice"]')).toBeNull();
    }
    flushSync(() => vi.advanceTimersByTime(2999));
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Added to cart");
    flushSync(() => add.click());
    flushSync(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Added to cart");
    flushSync(() => vi.advanceTimersByTime(2999));
    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("$43.17");
    expect(page.getByRole("checkbox", { name: `Select ${item.title}`, exact: true }).element()).toBeChecked();
  } finally {
    root.unmount(); container.remove();
    vi.useRealTimers();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("desktop add feedback can be dismissed from the keyboard without removing the product", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = [];
  const item = fixture.recommendations[0];
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} />));
    const add = page.getByRole("button", { name: `Add to cart ${item.title}`, exact: true });
    await add.click();
    await expect.element(add).toHaveFocus();
    const close = page.getByRole("button", { name: "Dismiss added item", exact: true });
    close.element().focus();
    await userEvent.keyboard("{Enter}");
    expect(container.querySelector('[data-slot="cart-add-notice"]')).toBeNull();
    await expect.element(add).toHaveFocus();
    await expect.element(page.getByRole("checkbox", { name: `Select ${item.title}`, exact: true })).toBeChecked();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("$24.58");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each(["dismiss", "expire"])("saved-item add feedback restores a connected keyboard target on %s", async (action) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const item = fixture.initialSavedItems.find((entry) => entry.availability === "available")!;
  fixture.initialSavedItems = [item];
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} initialCollection="saved" />));
    await page.getByRole("button", { name: `Move to cart ${item.title}`, exact: true }).click();
    const savedTab = page.getByRole("tab", { name: "Save for later (0)", exact: true });
    await expect.element(savedTab).toHaveFocus();
    const close = page.getByRole("button", { name: "Dismiss added item", exact: true });
    close.element().focus();
    if (action === "dismiss") await userEvent.keyboard("{Enter}");
    else await expect.poll(() => container.querySelector('[data-slot="cart-add-notice"]'), { timeout: 5000 }).toBeNull();
    expect(container.querySelector('[data-slot="cart-add-notice"]')).toBeNull();
    await expect.element(savedTab).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
