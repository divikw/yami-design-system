import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CartPage } from "../../../packages/prototypes/pages/CartPage";
import { createCartPageFixture } from "../../../packages/prototypes/pages/CartPage/fixtures";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

const appTabbarIcons = [
  new URL("../../../packages/design-system/assets/icons/tabbar/yami.svg", import.meta.url).href,
  new URL("../../../packages/design-system/assets/icons/tabbar/shop.svg", import.meta.url).href,
  new URL("../../../packages/design-system/assets/icons/tabbar/community.svg", import.meta.url).href,
  new URL("../../../packages/design-system/assets/icons/tabbar/cart-active.svg", import.meta.url).href,
  new URL("../../../packages/design-system/assets/icons/tabbar/account.svg", import.meta.url).href,
];

async function chooseQuantity(label: string, value: string) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test("CartPage link-style actions keep transparent hover feedback and keyboard focus", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...createCartPageFixture("en")} />));
    await document.fonts.ready;
    const actions = [...container.querySelectorAll<HTMLButtonElement>('button[class*="actionLink"], button[class*="learnLink"]')].filter((button) => button.getClientRects().length > 0);
    expect(actions.length).toBeGreaterThan(3);
    expect(actions).toContain(container.querySelector('aside button[type="submit"]'));
    expect(actions).toContain(container.querySelector('button[aria-label="Edit Coupons"]'));
    for (const button of actions) {
      const bounds = button.getBoundingClientRect();
      await userEvent.hover(page.elementLocator(button));
      await expect.poll(() => getComputedStyle(button).backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
      expect(getComputedStyle(button).textDecorationLine).toBe("underline");
      expect(getComputedStyle(button).textDecorationThickness).toBe("1px");
      expect(getComputedStyle(button).borderRadius).toBe("0px");
      expect(getComputedStyle(button).fontSize).toBe("14px");
      expect(getComputedStyle(button).fontWeight).toBe("400");
      expect(button.getBoundingClientRect().width).toBe(bounds.width);
      await userEvent.unhover(page.elementLocator(button));
      button.focus();
      await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(button);
      expect(button.matches(":focus-visible")).toBe(true);
      expect(getComputedStyle(button).outlineStyle).toBe("solid");
      expect(getComputedStyle(button).outlineWidth).toBe("2px");
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("CartPage keeps checkout red and validates an empty selection on activation at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("zh");
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    const checkout = page.getByRole("button", { name: "去结算", exact: true });
    const button = container.querySelector<HTMLButtonElement>('[data-slot="cart-checkout-bar"] > button:last-child')!;
    expect(getComputedStyle(button).backgroundColor).toBe("rgb(224, 0, 0)");
    expect(button.getAttribute("aria-disabled")).not.toBe("true");
    expect(container.querySelector('[data-slot="cart-totals"]')!.hasAttribute("hidden")).toBe(true);
    expect(container.textContent).not.toContain("请至少选择1件商品去结算");
    await checkout.click();
    await expect.element(page.getByRole("alert")).toHaveTextContent("请至少选择1件商品去结算");
    expect(container.querySelector('dialog[open]')).toBeNull();
    await page.getByRole("checkbox", { name: `选择 ${fixture.initialItems[0].title}`, exact: true }).click();
    expect(container.querySelector('[data-slot="cart-checkout-bar"] [role="alert"]')).toBeNull();
    await page.getByRole("button", { name: /^去结算 \(/ }).click();
    await expect.element(page.getByRole("dialog", { name: width < 1024 ? "订单明细" : "订单摘要", exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

for (const locale of ["zh", "en"] as const) {
  test.each([375, 1024, 1440])(`${locale} cart promo code aligns compact input and redeem through errors at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage {...createCartPageFixture(locale)} />));
      if (width < 1024) await page.getByRole("button", { name: locale === "zh" ? "编辑 优惠券" : "Edit Coupons", exact: true }).click();
      const form = container.querySelector<HTMLInputElement>(width < 1024 ? 'dialog[open] input[data-slot="input-control"]' : 'aside input[data-slot="input-control"]')!.form!;
      const input = form.querySelector("input")!;
      const field = form.querySelector<HTMLElement>('div[class*="field"]')!;
      const redeem = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      const edit = container.querySelector<HTMLButtonElement>(`button[aria-label="${locale === "zh" ? "编辑 优惠券" : "Edit Coupons"}"]`)!;
      await document.fonts.ready;
      const fieldBounds = field.getBoundingClientRect();
      const label = form.querySelector("label")!;
      expect(fieldBounds.height).toBeCloseTo(width < 1024 ? 48 : 40, 2);
      expect(redeem.getBoundingClientRect().height).toBeCloseTo(width < 1024 ? 40 : fieldBounds.height, 2);
      if (width >= 1024) expect(edit.getBoundingClientRect().height).toBe(fieldBounds.height);
      for (const button of width < 1024 ? [redeem] : [redeem, edit]) {
        expect(getComputedStyle(button).paddingLeft).toBe(width < 1024 ? "8px" : "16px");
        expect(getComputedStyle(button).paddingRight).toBe(width < 1024 ? "8px" : "16px");
      }
      if (width >= 1024) expect(edit.getBoundingClientRect().right).toBe(redeem.getBoundingClientRect().right);
      const redeemLabel = redeem.lastElementChild!.getBoundingClientRect();
      const editLabel = edit.lastElementChild!.getBoundingClientRect();
      if (width >= 1024) expect(editLabel.right).toBe(redeemLabel.right);
      if (locale === "zh" && width >= 1024) {
        expect(edit.getBoundingClientRect().width).toBe(redeem.getBoundingClientRect().width);
        expect(editLabel.left).toBe(redeemLabel.left);
      }
      expect(redeem.getBoundingClientRect().top).toBe(fieldBounds.top + (width < 1024 ? 4 : 0));
      expect(getComputedStyle(redeem).marginTop).toBe("0px");
      expect(label.htmlFor).toBe(input.id);
      if (width >= 1024) expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(fieldBounds.top - 4);
      await expect.element(page.elementLocator(input)).toHaveAccessibleName(locale === "zh" ? "折扣码" : "Promo code");
      await userEvent.click(redeem);
      expect(form.querySelector('[role="alert"]')!.textContent).toBe(locale === "zh" ? "请输入折扣码" : "Enter a promo code");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(redeem.getBoundingClientRect().top).toBe(field.getBoundingClientRect().top + (width < 1024 ? 4 : 0));
      await page.elementLocator(input).fill("BAD");
      await userEvent.keyboard("{Enter}");
      expect(form.querySelector('[role="alert"]')!.textContent).toBe(locale === "zh" ? "折扣码无效，请检查后重试" : "Invalid promo code. Check it and try again.");
      expect(redeem.getBoundingClientRect().top).toBe(field.getBoundingClientRect().top + (width < 1024 ? 4 : 0));
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test.each([375, 940])("CartPage keeps bare product titles clickable beside centered quantity controls at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = [{ ...fixture.initialItems[0], attributes: [], originalPriceCents: undefined }];
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    const row = container.querySelector('[data-slot="cart-item"]')!;
    const title = row.querySelector<HTMLAnchorElement>("h3 a")!;
    const titleBounds = title.getBoundingClientRect();
    expect(title.contains(document.elementFromPoint(titleBounds.right - 15, titleBounds.bottom - 2))).toBe(true);
    const quantity = row.querySelector('[role="combobox"]')!.getBoundingClientRect();
    const price = row.querySelector('[class*="price"]')!.getBoundingClientRect();
    expect(quantity.height).toBeGreaterThanOrEqual(44);
    expect(Math.abs(quantity.top + quantity.height / 2 - price.top - price.height / 2)).toBeLessThan(1);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([360, 375, 402, 660, 768, 1024, 1440])("CartPage fits the viewport and supports inline quantities at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const second = fixture.initialItems[1];
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage key={width} {...fixture} />));
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    for (const row of container.querySelectorAll('[data-slot="cart-item"]')) {
      const group = row.querySelector('[data-slot="cart-product-group"]')!;
      const details = group.querySelector('[data-slot="cart-product-details"]')!;
      const image = group.querySelector("img")!.getBoundingClientRect();
      const info = details.querySelector('[class*="itemInfo"]')!.getBoundingClientRect();
      expect(image.top).toBe(info.top);
      expect(info.left - image.right).toBe(parseFloat(getComputedStyle(group).columnGap));
      expect(details.contains(row.querySelector('[role="group"]'))).toBe(true);
      expect(details.contains(row.querySelector('[class*="price"]'))).toBe(true);
      if (width < 1024) {
        const price = details.querySelector('[class*="price"]')!.getBoundingClientRect();
        const actions = details.querySelector('[role="group"]')!.getBoundingClientRect();
        expect(price.top - info.bottom).toBe(4);
        expect(actions.top - price.bottom).toBe(4);
        const quantity = details.querySelector('[data-slot="quantity-select-display"]')!.getBoundingClientRect();
        expect(Math.abs(quantity.top + quantity.height / 2 - price.top - price.height / 2)).toBeLessThan(1);
      }
      const stockHint = row.querySelector('[class*="stockQuantity"]');
      if (stockHint) {
        expect(stockHint.getClientRects().length > 0).toBe(width >= 1024);
        expect(row.querySelector('[class*="stockInfo"]')!.getClientRects().length > 0).toBe(width < 1024);
        if (width >= 1024) {
          const hint = stockHint.getBoundingClientRect();
          const control = row.querySelector('[role="combobox"]')!.getBoundingClientRect();
          expect(hint.top).toBeGreaterThanOrEqual(control.bottom);
          expect(Math.abs(hint.left + hint.width / 2 - control.left - control.width / 2)).toBeLessThan(1);
        }
      }
      if (width >= 1024) {
        const selection = row.querySelector('[class*="itemCheck"]')!.getBoundingClientRect();
        expect(group.getBoundingClientRect().left - selection.right).toBe(4);
      }
    }
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
    await chooseQuantity(`${second.title} quantity`, "10+");
    await expect.element(page.getByRole("textbox", { name: `${second.title} quantity: enter quantity` })).toBeVisible();
    const input = page.getByRole("textbox", { name: `${second.title} quantity: enter quantity` });
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    const quantityRow = input.element().closest('[data-slot="cart-item"]')!;
    const rowHeight = quantityRow.getBoundingClientRect().height;
    await input.fill("26");
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("alert")).toHaveTextContent("Maximum quantity is 25");
    await expect.element(input).toHaveValue("25");
    expect(quantityRow.getBoundingClientRect().height).toBe(rowHeight);
    expect(quantityRow.contains(page.getByRole("alert").element())).toBe(false);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    await input.fill("12");
    await userEvent.keyboard("{Enter}");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    await expect.element(page.getByText("$219.96", { exact: true }).first()).toBeVisible();
    if (width < 1024) {
      const button = container.querySelector<HTMLButtonElement>('[data-slot="cart-checkout-bar"] > button:last-child')!;
      expect(getComputedStyle(button.parentElement!).position).toBe("fixed");
      expect(button.parentElement!.getBoundingClientRect().bottom).toBe(812 - 49);
      expect(button.getBoundingClientRect().bottom).toBeLessThanOrEqual(812);
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("CartPage invalidates coupons and keeps removal feedback inline", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const first = fixture.initialItems[0];
  try {
    await page.viewport(1440, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
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
    await page.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    const totals = container.querySelector('[data-slot="cart-totals"]')!;
    expect(totals.textContent).toContain("Discount");
    await page.getByRole("checkbox", { name: /^Select all/ }).click();
    expect(totals.textContent).not.toContain("Discount");
    await page.getByRole("button", { name: `Delete ${first.title}`, exact: true }).click();
    expect(container.querySelector(`[role="combobox"][aria-label="${first.title} quantity"]`)).toBeNull();
    const feedback = container.querySelector('[data-slot="cart-item-feedback"]')!;
    expect(feedback.textContent).toBe("Item has been removed");
    expect(feedback.parentElement!.firstElementChild).toBe(feedback);
    expect(document.activeElement).toBe(feedback.querySelector("p"));
    expect(page.getByRole("button", { name: "Undo", exact: true }).elements()).toHaveLength(0);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("CartPage keeps save/delete feedback in place and excludes it from counts, shipping and checkout at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("zh");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  const [first, second, third] = fixture.initialItems;
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await document.fonts.ready;
    const save = page.getByRole("button", { name: `稍后购买 ${first.title}`, exact: true });
    save.element().focus();
    await userEvent.keyboard("{Enter}");
    let feedback = container.querySelector<HTMLElement>('[data-slot="cart-item-feedback"]')!;
    expect(feedback.textContent).toBe("商品已移入稍后购买");
    expect(feedback.parentElement!.firstElementChild).toBe(feedback);
    expect(feedback.getBoundingClientRect().height).toBe(56);
    expect(getComputedStyle(feedback).gap).toBe("8px");
    expect(feedback.querySelector("img")!.getBoundingClientRect().width).toBe(40);
    expect(feedback.querySelector("img")!.getBoundingClientRect().height).toBe(40);
    expect(feedback.querySelector("button,input,select,a")).toBeNull();
    expect(document.activeElement).toBe(feedback.querySelector("p"));
    expect(container.querySelector('[aria-labelledby="cart-title"] small')!.textContent).toContain("5 件商品");
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("$163.68");
    expect(container.querySelector('[class*="notice"]')).toBeNull();
    expect(page.getByRole("button", { name: "撤销", exact: true }).elements()).toHaveLength(0);
    if (width === 1440) {
      await new Promise((resolve) => setTimeout(resolve, 3200));
      expect(container.querySelector('[data-slot="cart-item-feedback"]')).toBe(feedback);
    }
    await page.getByRole("tab", { name: "稍后购买 (3)", exact: true }).click();
    expect(page.getByRole("tabpanel", { name: "稍后购买 (3)" }).element().textContent).toContain(first.title);
    expect(container.querySelector('[data-slot="cart-item-feedback"]')).toBe(feedback);
    await page.getByRole("button", { name: `删除 ${second.title}`, exact: true }).click();
    feedback = container.querySelector<HTMLElement>('[data-slot="cart-item-feedback"]')!;
    expect(container.querySelectorAll('[data-slot="cart-item-feedback"]')).toHaveLength(1);
    expect(feedback.textContent).toBe("商品已删除");
    expect(feedback.parentElement!.firstElementChild).toBe(feedback);
    expect(feedback.querySelector("img")!.alt).toBe(second.title);
    expect(document.activeElement).toBe(feedback.querySelector("p"));
    expect(container.querySelector('[aria-labelledby="cart-title"] small')!.textContent).toContain("4 件商品");
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("$151.34");
    expect(container.querySelector('[aria-labelledby="merchant-yami"] [data-slot="cart-shipping"]')!.getAttribute("data-qualified")).toBe("false");
    await page.getByRole("button", { name: /^去结算 \(/ }).click();
    const summary = page.getByRole("dialog", { name: width < 1024 ? "订单明细" : "订单摘要", exact: true });
    expect(summary.element().textContent).not.toContain(first.title);
    expect(summary.element().textContent).not.toContain(second.title);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("button", { name: /^去结算 \(/ })).toHaveFocus();
    await chooseQuantity(`${third.title} 数量`, "2");
    expect(container.querySelector('[data-slot="cart-item-feedback"]')).toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("CartPage removes an empty merchant and focuses its visible title after the final item is deleted at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const item = fixture.initialItems[3];
  fixture.initialItems = [item];
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("button", { name: `Delete ${item.title}`, exact: true }).click();
    expect(container.querySelector('[data-slot="cart-item-feedback"]')).toBeNull();
    expect(container.querySelector('[aria-labelledby="merchant-snacks"]')).toBeNull();
    await expect.element(page.getByRole("heading", { name: "Your cart is empty", exact: true })).toBeVisible();
    await expect.element(page.getByRole(width < 1024 ? "tab" : "heading", { name: width < 1024 ? "Cart" : "Shopping cart", exact: true })).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([360, 375, 402, 768, 1024, 1440])("CartPage aligns checkbox targets, discovery gutters and drawer actions at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage key={width} {...fixture} />));
    const all = container.querySelector<HTMLElement>(width < 1024 ? '[data-slot="cart-checkout-bar"] [data-slot="checkbox"]' : '[aria-labelledby="cart-title"] [data-slot="checkbox"]')!;
    const merchant = container.querySelector<HTMLElement>('[aria-labelledby="merchant-yami"] header [data-slot="checkbox"]')!;
    const item = container.querySelector<HTMLElement>('[data-slot="cart-item"] [data-slot="checkbox"]')!;
    const center = (element: Element) => element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
    if (width >= 1024) expect(Math.abs(center(all) - center(item))).toBeLessThan(1);
    if (width >= 1024) expect(Math.abs(center(merchant) - center(item))).toBeLessThan(1);
    else {
      const shipping = container.querySelector('[aria-labelledby="merchant-yami"] [class*="shippingActions"]')!;
      const squareLeft = merchant.getBoundingClientRect().left + parseFloat(getComputedStyle(merchant, "::before").left);
      expect(squareLeft).toBe(shipping.getBoundingClientRect().left);
      expect(merchant.getBoundingClientRect().left).toBe(merchant.parentElement!.getBoundingClientRect().left);
      expect(center(item)).toBe(center(merchant));
      expect(container.querySelector('#merchant-yami')!.getBoundingClientRect().left - squareLeft).toBe(32);
      expect(container.querySelector('[data-slot="cart-item"] img')!.getBoundingClientRect().left).toBe(container.querySelector('#merchant-yami')!.getBoundingClientRect().left);
    }
    const glyph = merchant.querySelector('[data-slot="checkbox-indicator"] svg')!;
    expect(Math.abs(center(glyph) - center(merchant))).toBeLessThan(1);
    expect(Math.abs(glyph.getBoundingClientRect().top + glyph.getBoundingClientRect().height / 2 - merchant.getBoundingClientRect().top - merchant.getBoundingClientRect().height / 2)).toBeLessThan(1);
    const target = merchant.parentElement!;
    for (const checkbox of [all, merchant, item]) {
      expect((width < 1024 && checkbox === all ? checkbox : checkbox.parentElement!).getBoundingClientRect().width).toBe(40);
      expect((width < 1024 && checkbox === all ? checkbox : checkbox.parentElement!).getBoundingClientRect().height).toBe(40);
    }
    await page.getByRole("checkbox", { name: `Select ${fixture.initialItems[0].title}`, exact: true }).click();
    expect(merchant.getAttribute("aria-checked")).toBe("false");
    expect(all.getAttribute("aria-checked")).toBe("false");
    await page.elementLocator(target).click({ position: { x: 2, y: 2 } });
    expect(merchant.getAttribute("aria-checked")).toBe("true");
    expect(all.getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector("#merchant-yami")!.getAttribute("href")).toBe(fixture.merchants[0].href);
    await page.elementLocator(merchant).click();
    expect(merchant.getAttribute("aria-checked")).toBe("false");
    await userEvent.keyboard("{Space}");
    expect(merchant.getAttribute("aria-checked")).toBe("true");
    expect(getComputedStyle(merchant, "::before").outlineStyle).toBe("solid");
    await page.elementLocator(target).click({ position: { x: 2, y: 2 } });
    expect(merchant.getAttribute("aria-checked")).toBe("false");
    expect(getComputedStyle(merchant, "::before").outlineStyle).toBe("none");
    await page.elementLocator(target).click({ position: { x: 2, y: 2 } });
    await page.elementLocator(item).click();
    expect(all.getAttribute("aria-checked")).toBe("false");
    await page.elementLocator(all).click();
    expect(all.getAttribute("aria-checked")).toBe("true");
    expect(getComputedStyle(all, "::before").outlineStyle).toBe("none");
    expect([...container.querySelectorAll('[data-slot="cart-item"] [data-slot="checkbox"]')].every((checkbox) => checkbox.getAttribute("aria-checked") === "true")).toBe(true);
    await page.elementLocator(all).click();
    expect(all.getAttribute("aria-checked")).toBe("false");
    expect([...container.querySelectorAll('[data-slot="cart-item"] [data-slot="checkbox"]')].every((checkbox) => checkbox.getAttribute("aria-checked") === "false")).toBe(true);
    const tabs = container.querySelector('[data-slot="cart-discovery"] [role="tablist"]')!;
    const heading = container.querySelector('[data-slot="product-list-title"]')!;
    const products = container.querySelector('[data-slot="product-list-items"]')!;
    expect(heading.closest('[data-slot="product-list-heading"]')!.getBoundingClientRect().width).toBe(1);
    expect(Math.abs((width < 1024 ? tabs.firstElementChild! : tabs).getBoundingClientRect().left - products.getBoundingClientRect().left)).toBeLessThan(1);
    const learn = page.getByRole("button", { name: "Learn more", exact: true });
    const learnElement = learn.element();
    if (width >= 1024) expect(getComputedStyle(learnElement).textDecorationLine).toContain("underline");
    else {
      const intro = learnElement.closest('[class*="protectionIntro"]')!;
      expect(intro.tagName).toBe("DIV");
      expect(intro.querySelector("p")!.getBoundingClientRect().top - learnElement.getBoundingClientRect().bottom).toBe(2);
      expect(getComputedStyle(learnElement).borderRadius).toBe("0px");
      await userEvent.hover(learn);
      await expect.poll(() => getComputedStyle(learnElement).backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
    }
    await learn.click();
    await expect.element(page.getByRole("dialog", { name: "Shopping protection", exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(learn).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("CartPage shows eight desktop recommendation rows from the source snapshot and retains local actions", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  try {
    await page.viewport(1440, 900);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await document.fonts.ready;
    const products = container.querySelector('[data-slot="product-list-items"]')!;
    const cards = Array.from(products.children);
    expect(cards).toHaveLength(32);
    expect(new Set(fixture.recommendations.map((item) => item.id)).size).toBe(32);
    expect(new Set(cards.map((card) => Math.round(card.getBoundingClientRect().top))).size).toBe(8);
    const discovery = container.querySelector('[data-slot="cart-discovery"] [role="tablist"]')!.parentElement!.parentElement!;
    expect(getComputedStyle(discovery).paddingLeft).toBe("24px");
    expect(getComputedStyle(discovery).paddingRight).toBe("24px");
    const collection = container.querySelector('[data-slot="product-list"]')!;
    await expect.element(page.elementLocator(collection)).toHaveAccessibleName("Recommended for you");
    const heading = collection.querySelector('[data-slot="product-list-heading"]')!;
    expect(getComputedStyle(heading).clipPath).toBe("inset(50%)");
    const first = fixture.recommendations[0];
    expect(cards[0].textContent).toContain(first.title);
    expect(cards[0].textContent).toContain("$18.59");
    expect(cards[0].querySelector('a')!.getAttribute("href")).toBe(first.href);
    await page.getByRole("button", { name: `Add to cart ${first.title}`, exact: true }).click();
    await expect.element(page.getByRole("checkbox", { name: `Select ${first.title}`, exact: true })).toBeChecked();
    const viewAll = page.getByRole("button", { name: "View all Unavailable items", exact: true });
    const opener = Array.from(container.querySelectorAll("button")).find((button) => button.getAttribute("aria-label") === "View all Unavailable items")!;
    expect(getComputedStyle(opener).textDecorationLine).toContain("underline");
    expect(getComputedStyle(opener).fontWeight).toBe("400");
    await viewAll.click();
    await expect.element(page.getByRole("dialog", { name: "Unavailable items", exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(viewAll).toHaveFocus();
    await page.viewport(375, 812);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
    expect(getComputedStyle(discovery).paddingLeft).toBe("0px");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("CartPage protection drawer includes source artwork and policy lists at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...createCartPageFixture("zh")} />));
    const opener = page.getByRole("button", { name: "了解更多", exact: true });
    await opener.click();
    const dialog = container.querySelector<HTMLDialogElement>('dialog[open]')!;
    await expect.element(page.elementLocator(dialog)).toHaveAccessibleName("服务保障");
    expect(dialog.querySelectorAll('h3 img')).toHaveLength(4);
    const payments = dialog.querySelector('ul[aria-label="支付方式"]')!;
    const certifications = dialog.querySelector('ul[aria-label="支付安全认证"]')!;
    expect(payments.children).toHaveLength(12);
    expect(certifications.children).toHaveLength(5);
    expect(dialog.querySelectorAll('li:has(> span)')).toHaveLength(7);
    expect(dialog.textContent).toContain("绝不出售、出租或以任何方式从您的个人信息中获利");
    expect(dialog.textContent).toContain("运输丢失可退款");
    expect(dialog.textContent).toContain("FedEx、Amazon、DHL、OnTrac、UPS");
    expect(dialog.querySelector('[data-slot="sheet-footer"]')).toBeNull();
    const images = [...dialog.querySelectorAll<HTMLImageElement>('ul[aria-label] img')];
    await expect.poll(() => images.every((image) => image.complete && image.naturalWidth > 0)).toBe(true);
    expect([...payments.children].every((item) => item.getBoundingClientRect().height === 32)).toBe(true);
    expect([...certifications.children].every((item) => item.getBoundingClientRect().height === 32)).toBe(true);
    if (width === 1440) {
      expect(dialog.getBoundingClientRect().width).toBe(480);
      const body = dialog.querySelector('[data-sheet-content]')!;
      expect(getComputedStyle(body).paddingTop).toBe("24px");
      expect(getComputedStyle(body).paddingLeft).toBe("32px");
      expect(getComputedStyle(dialog.querySelector('header h2')!).fontSize).toBe("32px");
      const rows = new Map<number, number>();
      for (const item of payments.children) {
        const top = item.getBoundingClientRect().top;
        rows.set(top, (rows.get(top) ?? 0) + 1);
      }
      expect([...rows.values()]).toEqual([7, 5]);
    }
    expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
    await userEvent.keyboard("{Escape}");
    await expect.element(opener).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("CartPage payment marks match the source geometry and wrap within narrow containers", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const width of [360, 375, 402, 768, 1024, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage key={width} {...createCartPageFixture("en")} />));
      const marks = container.querySelector('ul[aria-label="Payment methods"]')!;
      const intro = marks.previousElementSibling!;
      expect(intro.tagName).toBe("DIV");
      expect(intro.querySelector("p")!.getBoundingClientRect().top - intro.querySelector("h2")!.getBoundingClientRect().bottom).toBe(width < 1024 ? 2 : 4);
      const items = Array.from(marks.children);
      expect(items).toHaveLength(12);
      expect(getComputedStyle(marks).gap).toBe(width < 1024 ? "4px" : "5px");
      expect(items[0].getBoundingClientRect().top - marks.previousElementSibling!.getBoundingClientRect().bottom).toBe(width < 1024 ? 12 : 8);
      for (const item of items) {
        const box = item.getBoundingClientRect();
        const image = item.querySelector("img")!;
        const imageBox = image.getBoundingClientRect();
        const borderless = image.alt === "Google Pay";
        expect([box.width, box.height]).toEqual(width < 1024 ? [48, 32] : [52, 36]);
        expect(getComputedStyle(item).borderRadius).toBe(borderless ? "0px" : "4px");
        expect(getComputedStyle(item).overflow).toBe("hidden");
        expect(getComputedStyle(item).borderTopWidth).toBe(borderless ? "0px" : "1px");
        if (!borderless) expect(getComputedStyle(item).borderTopColor).toBe("rgba(0, 0, 0, 0.1)");
        expect([imageBox.width, imageBox.height]).toEqual(width < 1024 ? [46, 30] : borderless ? [52, 36] : [50, 34]);
        expect(getComputedStyle(image).objectFit).toBe("contain");
        expect(getComputedStyle(image).objectPosition).toBe("50% 50%");
        expect(box.right).toBeLessThanOrEqual(marks.getBoundingClientRect().right + 1);
      }
      if (width === 1440) {
        expect(items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().right).toBe(5);
        expect(items[5].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom).toBe(5);
        const rowCounts = new Map<number, number>();
        for (const item of items) {
          const top = item.getBoundingClientRect().top;
          rowCounts.set(top, (rowCounts.get(top) ?? 0) + 1);
        }
        expect(Array.from(rowCounts.values())).toEqual([5, 5, 2]);
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("CartPage keeps shipping progress visible at zero, partial and qualified amounts", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  const product = fixture.initialItems[1];
  try {
    for (const width of [375, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage key={width} {...fixture} />));
      const progress = container.querySelector<HTMLProgressElement>('[aria-labelledby="merchant-yami"] progress')!;
      const progressWidth = progress.getBoundingClientRect().width;
      expect(container.querySelectorAll("progress")).toHaveLength(4);
      expect(progress.parentElement!.dataset.qualified).toBe("false");
      expect(progress.parentElement!.querySelector("img")!.getAttribute("src")).toContain("delivery-line.png");
      expect(progress.value).toBe(0);
      expect(progress.max).toBe(4900);
      if (width === 1440) {
        const header = container.querySelector('[aria-labelledby="merchant-yami"] header')!;
        const identity = header.querySelector("h2")!.parentElement!;
        const shippingActions = progress.parentElement!.parentElement!;
        expect(Math.abs(identity.getBoundingClientRect().width - shippingActions.getBoundingClientRect().width)).toBeLessThan(1);
        expect(header.getBoundingClientRect().height).toBe(52);
      }
      await expect.element(page.elementLocator(progress)).toBeVisible();
      await page.getByRole("checkbox", { name: `Select ${product.title}`, exact: true }).click();
      expect(progress.value).toBe(1833);
      expect(progress.getAttribute("aria-valuetext")).toContain("$30.67");
      for (const [quantity, value, hint] of [[2, 3666, "$12.34"], [3, 4900, "Free shipping"]] as const) {
        await chooseQuantity(`${product.title} quantity`, String(quantity));
        await expect.poll(() => progress.value).toBe(value);
        expect(progress.getAttribute("aria-valuetext")).toContain(hint);
        const shipping = progress.parentElement!;
        expect(shipping.dataset.qualified).toBe(String(quantity === 3));
        expect(shipping.querySelector("img")!.getAttribute("src")).toContain(quantity === 3 ? "shipping-qualified.png" : "delivery-line.png");
        const sample = document.createElement("span");
        sample.style.color = quantity === 3 || width < 1024 ? "var(--fill-success-primary)" : "var(--text-primary)";
        shipping.append(sample);
        expect(getComputedStyle(progress).accentColor).toBe(getComputedStyle(sample).color);
        sample.remove();
        if (quantity === 3) {
          expect(shipping.querySelector("p")!.textContent).toBe("You have earned free shipping");
          expect(shipping.querySelector("strong")!.textContent).toBe(" free shipping");
          expect(shipping.querySelector("img")!.getBoundingClientRect().width).toBe(width < 1024 ? 0 : 14);
        }
        expect(progress.getBoundingClientRect().width).toBe(progressWidth);
        await expect.element(page.elementLocator(progress)).toBeVisible();
      }
      await page.getByRole("checkbox", { name: `Select ${product.title}`, exact: true }).click();
      expect(progress.value).toBe(0);
      expect(progress.parentElement!.dataset.qualified).toBe("false");
      expect(progress.parentElement!.querySelector("img")!.getAttribute("src")).toContain("delivery-line.png");
      expect(progress.parentElement!.querySelector("p")!.textContent).not.toContain("You have earned");
      await expect.element(page.elementLocator(progress)).toBeVisible();
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});


test("CartPage reports coupon changes and focuses the empty unavailable drawer after removal", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    await dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true }).click();
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).toContain("Discount");
    await page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    await expect.element(dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true })).toBeChecked();
    await dialog.getByRole("checkbox", { name: fixture.coupons[0].title, exact: true }).click();
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await expect.poll(() => container.querySelector('dialog[open]')).toBeNull();
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).not.toContain("Discount");
    await page.getByRole("button", { name: "View all Unavailable items", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Unavailable items", exact: true });
    const unavailable = fixture.initialItems.filter((item) => item.availability !== "available");
    for (const item of unavailable) await dialog.getByRole("button", { name: `Delete ${item.title}`, exact: true }).click();
    await expect.element(dialog.getByText("No unavailable items", { exact: true })).toBeVisible();
    await expect.element(dialog.getByText("No unavailable items", { exact: true })).toHaveFocus();
    expect(dialog.getByRole("button", { name: "Undo", exact: true }).elements()).toHaveLength(0);
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole(innerWidth < 1024 ? "tab" : "heading", { name: innerWidth < 1024 ? "Cart" : "Shopping cart", exact: true })).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
  }
});

test("CartPage cycles the four title guarantees without shifting the cart layout", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const locale of ["zh", "en"] as const) {
      for (const width of [375, 1440]) {
        await page.viewport(width, 812);
        flushSync(() => root.render(<CartPage key={`${locale}-${width}`} {...createCartPageFixture(locale)} />));
        const carousel = container.querySelector<HTMLElement>('[data-slot="cart-security-carousel"]')!;
        const track = carousel.firstElementChild!;
        const slides = [...track.children];
        const animation = track.getAnimations()[0];
        if (width < 1024) { expect(getComputedStyle(carousel).display).toBe("none"); continue; }
        expect(animation).toBeDefined();
        expect(carousel.getAttribute("aria-hidden")).toBe("true");
        expect(slides).toHaveLength(5);
        expect(slides[0].textContent).toBe(slides[4].textContent);
        expect(new Set(slides.slice(0, 4).map((slide) => slide.textContent)).size).toBe(4);
        animation.pause();
        const top = container.querySelector('[aria-labelledby="merchant-yami"]')!;
        const merchantTop = top.getBoundingClientRect().top;
        for (const index of [0, 1, 2, 3, 4]) {
          animation.currentTime = index === 4 ? 14000 : index * 3500;
          const visibleSlide = slides[index === 4 ? 0 : index].getBoundingClientRect();
          expect(Math.abs(visibleSlide.top - carousel.getBoundingClientRect().top)).toBeLessThan(1);
          expect(top.getBoundingClientRect().top).toBe(merchantTop);
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
        }
        animation.play();
        await userEvent.hover(page.elementLocator(carousel));
        await expect.poll(() => getComputedStyle(track).animationPlayState).toBe("paused");
        await userEvent.unhover(page.elementLocator(carousel));
      }
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});


test.each([375, 1440])("CartPage saved cards support stock states, notifications, moving and deletion at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("zh");
  const [available, soldOut] = fixture.initialSavedItems;
  const delisted = fixture.initialItems.find((item) => item.availability === "delisted")!;
  fixture.initialSavedItems.push(delisted);
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("tab", { name: "稍后购买 (3)", exact: true }).click();
    const grid = container.querySelector<HTMLElement>('[data-slot="cart-saved-grid"]')!;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-slot="product-card"]'));
    expect(cards).toHaveLength(3);
    expect(getComputedStyle(grid).gridTemplateColumns.split(" ")).toHaveLength(width === 375 ? 2 : 4);
    expect(cards[0].querySelector('[data-slot="product-card-quick-add"]')).not.toBeNull();
    const availableDelete = page.getByRole("button", { name: `删除 ${available.title}`, exact: true });
    expect(availableDelete.element().getBoundingClientRect().top).toBe(cards[0].querySelector('[data-slot="product-card-price"]')!.getBoundingClientRect().bottom);
    expect(availableDelete.element().getBoundingClientRect().height).toBe(32);
    expect(getComputedStyle(availableDelete.element(), "::before").height).toBe("44px");
    for (const card of cards.slice(1)) expect(card.querySelector('[data-slot="product-card-quick-add"]')).toBeNull();
    expect(cards[1].querySelector('[data-slot="product-card-availability"]')!.textContent).toContain("已售完");
    expect(cards[1].querySelector('[data-slot="product-card-price"]')!.textContent).toContain("$8.99");
    expect(cards[2].querySelector('[data-slot="product-card-availability"]')!.textContent).toContain("已下架");
    expect(cards[2].querySelector("button")).toBeNull();
    const notify = page.getByRole("button", { name: `到货通知 ${soldOut.title}`, exact: true });
    await userEvent.hover(notify);
    expect(getComputedStyle(notify.element()).backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
    expect(getComputedStyle(notify.element()).borderRadius).toBe("0px");
    expect(getComputedStyle(notify.element()).textDecorationThickness).toBe("1px");
    const savedDelete = page.getByRole("button", { name: `删除 ${soldOut.title}`, exact: true });
    expect(savedDelete.element().getBoundingClientRect().top).toBe(notify.element().getBoundingClientRect().bottom);
    expect(notify.element().getBoundingClientRect().height).toBe(20);
    const stockLabel = notify.element().parentElement!.querySelector("p")!;
    expect(notify.element().getBoundingClientRect().top).toBe(stockLabel.getBoundingClientRect().bottom);
    expect(savedDelete.element().getBoundingClientRect().height).toBe(32);
    notify.element().scrollIntoView({ block: "center" });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const notifyBounds = notify.element().getBoundingClientRect();
    const deleteBounds = savedDelete.element().getBoundingClientRect();
    expect(document.elementFromPoint(notifyBounds.left + notifyBounds.width / 2, notifyBounds.bottom - 1)?.closest("button")).toBe(notify.element());
    expect(document.elementFromPoint(deleteBounds.left + deleteBounds.width / 2, deleteBounds.top + 1)?.closest("button")).toBe(savedDelete.element());
    for (const action of grid.querySelectorAll<HTMLButtonElement>('button[class*="actionLink"]')) expect(getComputedStyle(action).borderRadius).toBe("0px");
    notify.element().focus();
    await userEvent.keyboard("{Enter}");
    const notified = page.getByRole("button", { name: `已设置到货通知 ${soldOut.title}`, exact: true });
    await expect.element(notified).toHaveAttribute("aria-disabled", "true");
    await expect.element(notified).toHaveFocus();
    expect(getComputedStyle(notified.element()).outlineStyle).toBe("solid");
    expect(getComputedStyle(notified.element()).borderRadius).toBe("0px");
    await page.getByRole("button", { name: "查看全部 以下商品已失效", exact: true }).click();
    await expect.element(page.getByRole("dialog").getByRole("button", { name: `已设置到货通知 ${soldOut.title}`, exact: true })).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("button", { name: "查看全部 以下商品已失效", exact: true })).toHaveFocus();
    await page.getByRole("button", { name: `移入购物车 ${available.title}`, exact: true }).click();
    await expect.element(page.getByRole("checkbox", { name: `选择 ${available.title}`, exact: true })).not.toBeChecked();
    await expect.element(page.getByRole("button", { name: `删除 ${soldOut.title}`, exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(grid.querySelectorAll('[data-slot="product-card"]')).toHaveLength(1);
    await expect.element(page.getByRole("button", { name: `删除 ${delisted.title}`, exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(page.getByRole("tab", { name: "稍后购买 (0)", exact: true })).toHaveFocus();
    await expect.element(page.getByRole("tabpanel", { name: "稍后购买 (0)", exact: true })).toHaveTextContent("暂无商品");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

for (const locale of ["zh", "en"] as const) {
  test.each([375, 1024, 1440])(`${locale} unavailable drawer matches source layout and text actions at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const fixture = createCartPageFixture(locale);
    const unavailable = fixture.initialItems.filter((item) => item.availability !== "available");
    fixture.initialItems = [...fixture.initialItems.filter((item) => item.availability === "available"), ...Array.from({ length: 12 }, (_, index) => ({ ...unavailable[index % 2], id: `unavailable-${index}`, title: index === 0 ? unavailable[0].title.repeat(8) : unavailable[index % 2].title }))];
    const openerName = locale === "zh" ? "查看全部 以下商品已失效" : "View all Unavailable items";
    try {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage {...fixture} />));
      const opener = page.getByRole("button", { name: openerName, exact: true });
      await opener.click();
      const dialog = container.querySelector<HTMLDialogElement>('dialog[open]')!;
      const body = dialog.querySelector<HTMLElement>('[data-sheet-content]')!;
      const heading = dialog.querySelector('header h2')!;
      const row = dialog.querySelector<HTMLElement>('[data-slot="cart-item"]')!;
      const itemTitle = row.querySelector('h3')!;
      const titleText = itemTitle.querySelector('span')!;
      const image = row.querySelector('img')!;
      const price = row.querySelector('strong')!;
      const priceRow = price.parentElement!.parentElement!;
      const status = priceRow.querySelector('p')!;
      expect(dialog.querySelector('[data-slot="sheet-footer"]')).toBeNull();
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      expect(dialog.scrollWidth).toBeLessThanOrEqual(dialog.clientWidth);
      expect(getComputedStyle(body).paddingTop).toBe("0px");
      expect(getComputedStyle(row).paddingTop).toBe("24px");
      expect(getComputedStyle(row).paddingBottom).toBe("24px");
      expect(status.getBoundingClientRect().right).toBe(priceRow.getBoundingClientRect().right);
      expect(status.getBoundingClientRect().top).toBeLessThan(price.getBoundingClientRect().bottom);
      expect(getComputedStyle(price).color).toBe("rgb(224, 0, 0)");
      const normalPrice = dialog.querySelectorAll('[data-slot="cart-item"]')[1].querySelector('strong')!;
      expect(getComputedStyle(normalPrice).color).toBe(getComputedStyle(dialog).color);
      expect(getComputedStyle(row.querySelector('del')!).fontSize).toBe("14px");
      expect(getComputedStyle(titleText).webkitLineClamp).toBe("3");
      if (width >= 1024) {
        expect(dialog.getBoundingClientRect().width).toBeCloseTo(480, 2);
        expect(getComputedStyle(heading).fontSize).toBe("32px");
        expect(getComputedStyle(heading).fontWeight).toBe("400");
        expect(getComputedStyle(heading).paddingBottom).toBe("32px");
        expect(heading.previousElementSibling!.getBoundingClientRect().height).toBe(72);
        expect(getComputedStyle(body).paddingLeft).toBe("32px");
        expect(image.getBoundingClientRect().width).toBe(104);
        expect(getComputedStyle(row).columnGap).toBe("24px");
        expect(getComputedStyle(itemTitle).fontSize).toBe("18px");
        expect(titleText.getBoundingClientRect().height).toBe(84);
      } else {
        expect(getComputedStyle(body).paddingLeft).toBe("16px");
        expect(image.getBoundingClientRect().width).toBe(72);
      }
      const actions = Array.from(row.querySelectorAll<HTMLButtonElement>('[role="group"] button'));
      expect(actions).toHaveLength(3);
      for (const button of actions) {
        expect(getComputedStyle(button).fontSize).toBe("14px");
        expect(getComputedStyle(button).fontWeight).toBe("400");
        expect(getComputedStyle(button).textDecorationLine).toBe("underline");
        expect(getComputedStyle(button).borderRadius).toBe("0px");
        expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
        await userEvent.hover(page.elementLocator(button));
        await expect.poll(() => getComputedStyle(button).backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
      }
      actions[2].focus();
      await userEvent.keyboard("{Enter}");
      expect(actions[2].getAttribute("aria-disabled")).toBe("true");
      expect(document.activeElement).toBe(actions[2]);
      await userEvent.keyboard("{Escape}");
      await expect.element(opener).toHaveFocus();
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

for (const locale of ["zh", "en"] as const) {
  test(`${locale} merchant headers stack shipping below identity through the narrow desktop breakpoint`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      for (const width of [375, 768, 1024, 1061, 1280, 1366, 1367, 1440]) {
        await page.viewport(width, 812);
        flushSync(() => root.render(<CartPage key={width} {...createCartPageFixture(locale)} />));
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
        for (const header of container.querySelectorAll<HTMLElement>('[aria-labelledby^="merchant-"] header')) {
          const identity = header.querySelector("h2")!.parentElement!;
          const title = header.querySelector("h2")!;
          const shipping = header.querySelector('[data-slot="cart-shipping"]')!;
          const actions = shipping.parentElement!;
          const addMore = actions.querySelector("a")!;
          if (width <= 1366) {
            expect(actions.getBoundingClientRect().top - identity.getBoundingClientRect().bottom).toBe(width < 1024 ? 4 : 0);
            expect(header.getBoundingClientRect().bottom - actions.getBoundingClientRect().bottom).toBe(width < 1024 ? 8 : 12);
            const checkbox = identity.querySelector('[data-slot="checkbox"]')!;
            expect(checkbox.getBoundingClientRect().width).toBe(40);
            expect(checkbox.getBoundingClientRect().height).toBe(40);
            expect(identity.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
            expect(Math.abs(actions.getBoundingClientRect().right - identity.getBoundingClientRect().right)).toBeLessThan(1);
            if (width >= 1024) {
              expect(Math.abs(shipping.getBoundingClientRect().left - title.getBoundingClientRect().left)).toBeLessThan(1);
              expect(shipping.querySelector("p")!.getBoundingClientRect().height).toBe(20);
            }
          } else {
            expect(Math.abs(actions.getBoundingClientRect().top + actions.getBoundingClientRect().height / 2 - identity.getBoundingClientRect().top - identity.getBoundingClientRect().height / 2)).toBeLessThan(1);
          }
          expect(addMore.getBoundingClientRect().right).toBeLessThanOrEqual(header.getBoundingClientRect().right);
          expect(shipping.querySelector("progress")!.getBoundingClientRect().width).toBeGreaterThan(0);
        }
      }
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test.each(["zh", "en"] as const)("%s discovery collections preserve unavailable states and notification actions", async (locale) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture(locale);
  const unavailable = fixture.initialItems.filter((item) => item.availability !== "available");
  fixture.recommendations = unavailable;
  fixture.history = unavailable;
  fixture.favorites = unavailable;
  try {
    flushSync(() => root.render(<CartPage {...fixture} />));
    const names = locale === "zh" ? ["为你推荐", "历史浏览", "收藏商品"] : ["Recommended for you", "Recently viewed", "Favorites"];
    for (const name of names) {
      await page.getByRole("tab", { name, exact: true }).click();
      const panel = page.getByRole("tabpanel", { name, exact: true }).element();
      expect([...panel.querySelectorAll('[data-slot="product-card"]')].map((card) => card.getAttribute("data-availability"))).toEqual(["sold-out", "delisted"]);
      expect(panel.querySelector('[data-slot="product-card-quick-add"]')).toBeNull();
      expect(panel.textContent).toContain(locale === "zh" ? "已下架" : "No longer available");
      const notify = panel.querySelector<HTMLButtonElement>('[data-slot="product-card-availability"] button')!;
      expect(notify).not.toBeNull();
      if (name === names[0]) await page.elementLocator(notify).click();
      expect(notify.getAttribute("aria-disabled")).toBe("true");
      expect(notify.textContent).toBe(locale === "zh" ? "已设置到货通知" : "Notification set");
    }
  } finally { root.unmount(); container.remove(); }
});

test("CartPage discovery and Reorder tabs share responsive column counts", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const width of [375, 560, 768, 821, 1024, 1071, 1280, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<CartPage key={width} {...createCartPageFixture("en")} />));
      let columns = "";
      let cardWidth = 0;
      for (const name of ["Recommended for you", "Save for later (2)", "Recently viewed", "Favorites"]) {
        await page.getByRole("tab", { name, exact: true }).click();
        const panel = page.getByRole("tabpanel", { name, exact: true }).element();
        const grid = panel.querySelector<HTMLElement>('[data-slot="product-list-items"], [data-slot="cart-saved-grid"]')!;
        const currentColumns = getComputedStyle(grid).gridTemplateColumns;
        const currentCardWidth = grid.firstElementChild!.getBoundingClientRect().width;
        if (!columns) { columns = currentColumns; cardWidth = currentCardWidth; }
        expect(currentColumns).toBe(columns);
        expect(currentCardWidth).toBeCloseTo(cardWidth, 1);
        expect(getComputedStyle(grid).columnGap).toBe("16px");
      }
      expect(columns.split(" ")).toHaveLength(width < 560 ? 2 : width < 768 ? 3 : width < 1024 ? 4 : width < 1440 ? 3 : 4);
      if (width < 1024) {
        await page.getByRole("tab", { name: "Reorder", exact: true }).click();
        for (const name of ["Your Reorder", "Frequently Bought"]) {
          await page.getByRole("tab", { name, exact: true }).click();
          const grid = page.getByRole("tabpanel", { name, exact: true }).element().querySelector('[data-slot="cart-reorder-grid"]')!;
          expect(getComputedStyle(grid).gridTemplateColumns.split(" ")).toHaveLength(columns.split(" ").length);
        }
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

for (const locale of ["zh", "en"] as const) {
  test.each([360, 402])(`${locale} mobile app cart groups content and keeps checkout above navigation at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(width, 874);
      const fixture = createCartPageFixture(locale);
      flushSync(() => root.render(<CartPage {...fixture} />));
      const nav = container.querySelector('[data-slot="cart-app-navigation"]')!;
      const bar = container.querySelector('[data-slot="cart-checkout-bar"]')!;
      expect(nav.querySelectorAll('a, button')).toHaveLength(5);
      const entries = [...nav.querySelectorAll<HTMLElement>('a, button')];
      for (const [index, entry] of entries.entries()) {
        const icon = entry.querySelector('img')!;
        expect(icon.src).toBe(appTabbarIcons[index]);
        expect([icon.getBoundingClientRect().width, icon.getBoundingClientRect().height]).toEqual([24, 24]);
        expect(getComputedStyle(entry).fontSize).toBe('10px');
        expect(getComputedStyle(entry).lineHeight).toBe('14px');
        expect(entry.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
        expect(entry.lastElementChild!.getBoundingClientRect().top - icon.getBoundingClientRect().bottom).toBe(2);
      }
      const cartIcon = entries[3].querySelector('img')!.getBoundingClientRect();
      const count = entries[3].querySelector('[data-slot="badge"]')!.getBoundingClientRect();
      expect(count.left - cartIcon.left).toBe(14);
      expect(count.top - cartIcon.top).toBe(-4);
      expect(count.height).toBe(14);
      expect(nav.getBoundingClientRect().bottom).toBe(874);
      expect(getComputedStyle(nav.querySelector('span[class*="navCartCount"]')!).backgroundColor).toBe("rgb(224, 0, 0)");
      expect(bar.getBoundingClientRect().bottom).toBe(nav.getBoundingClientRect().top);
      expect(bar.getBoundingClientRect().height).toBe(64);
      const total = bar.querySelector('button[aria-haspopup="dialog"]')!;
      expect(total.lastElementChild!.getBoundingClientRect().right).toBe(total.getBoundingClientRect().right);
      const protection = container.querySelector('section[class*="protection"]')!;
      const unavailable = container.querySelector('section[class*="unavailable"]')!;
      const discovery = container.querySelector('[data-slot="cart-discovery"]')!;
      expect(protection.getBoundingClientRect().bottom).toBeLessThan(unavailable.getBoundingClientRect().top);
      expect(unavailable.getBoundingClientRect().bottom).toBeLessThan(discovery.getBoundingClientRect().top);
      expect(getComputedStyle(protection.querySelector('ul[class*="guarantees"]')!).gridTemplateColumns.split(" ")).toHaveLength(2);
      expect(protection.querySelector('img[alt="Apple Pay"]')).not.toBeNull();
      await page.elementLocator(bar.querySelector('[role="checkbox"]')!).click();
      expect(container.querySelector('[aria-labelledby="merchant-yami"] [role="checkbox"]')!.getAttribute('aria-checked')).toBe('true');
      await userEvent.hover(page.elementLocator(total));
      await expect.poll(() => getComputedStyle(total).backgroundColor).toMatch(/^rgba\(\d+, \d+, \d+, 0\)$/);
      await page.elementLocator(bar.querySelector('button[aria-haspopup="dialog"]')!).click();
      await expect.element(page.getByRole('dialog', { name: locale === 'zh' ? '订单明细' : 'Order details', exact: true })).toBeVisible();
      await userEvent.keyboard('{Escape}');
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
    } finally { root.unmount(); container.remove(); await page.viewport(viewport.width, viewport.height); }
  });
}

test("mobile Reorder filters purchase examples, adds locally and preserves cart state across tabs and resize", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture('en');
  try {
    await page.viewport(402, 874);
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole('tab', { name: 'Reorder', exact: true }).click();
    await expect.element(page.getByRole('tab', { name: 'Your Reorder', exact: true })).toBeVisible();
    const visibleGrid = () => container.querySelector('[data-slot="cart-reorder-grid"]')!;
    expect(visibleGrid().children).toHaveLength(fixture.reorderItems!.length);
    const purchaseBadge = visibleGrid().querySelector('[data-slot="badge"]')!;
    expect(getComputedStyle(purchaseBadge).color).not.toBe("rgb(255, 255, 255)");
    expect(purchaseBadge.textContent).toContain("purchased");
    expect(container.querySelector('[data-slot="cart-checkout-bar"]')!.getBoundingClientRect().height).toBe(0);
    expect(page.getByRole('tab', { name: 'Your Reorder', exact: true }).element().closest('[role="tablist"]')!.getAttribute('data-variant')).toBe('secondary');
    const grocery = page.getByRole('tab', { name: 'Grocery', exact: true });
    expect(grocery.element().closest('[role="tablist"]')!.getAttribute('data-variant')).toBe('tertiary');
    await grocery.click();
    expect(grocery.element().getAttribute('aria-controls')).toBe(visibleGrid().id);
    expect(visibleGrid().children).toHaveLength(2);
    await userEvent.keyboard('{Home}');
    expect(visibleGrid().children).toHaveLength(fixture.reorderItems!.length);
    await userEvent.keyboard('{End}');
    await expect.element(grocery).toHaveAttribute('aria-selected', 'true');
    expect(visibleGrid().children).toHaveLength(2);
    await page.getByRole('tab', { name: 'Frequently Bought', exact: true }).click();
    await expect.element(page.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true');
    const frequentGrid = page.getByRole('tabpanel', { name: 'Frequently Bought', exact: true }).element().querySelector('[data-slot="cart-reorder-grid"]')!;
    expect(frequentGrid.children).toHaveLength(fixture.frequentlyBoughtItems!.length);
    await page.getByRole('tab', { name: 'Your Reorder', exact: true }).click();
    await page.getByRole('button', { name: `Move to cart ${fixture.initialItems[0].title}`, exact: true }).click();
    await expect.element(page.getByRole('status')).toHaveTextContent('Added to cart');
    await page.getByRole('tab', { name: 'Cart', exact: true }).click();
    expect(page.getByRole('combobox', { name: `${fixture.initialItems[0].title} quantity`, exact: true }).element().textContent).toContain('2');
    await page.getByRole('tab', { name: 'Cart', exact: true }).click();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(page.getByRole('tab', { name: 'Reorder', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.viewport(1440, 900);
    await expect.poll(() => container.querySelector('[data-slot="cart-page"]')!.getAttribute('data-page-tab')).toBe('cart');
    expect(container.querySelector('[data-slot="cart-app-navigation"]')!.getBoundingClientRect().height).toBe(0);
    expect(container.querySelector('[data-slot="cart-checkout-bar"]')!.getBoundingClientRect().height).toBeGreaterThan(0);
  } finally { root.unmount(); container.remove(); await page.viewport(viewport.width, viewport.height); }
});

test("mobile page swipes exclude collection rails, interactive targets and vertical scrolling", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<CartPage {...createCartPageFixture('en')} />));
    const swipe = (element: Element, dx: number, dy = 0) => flushSync(() => {
      const start = new Touch({ identifier: 1, target: element, clientX: 200, clientY: 200 });
      const end = new Touch({ identifier: 1, target: element, clientX: 200 + dx, clientY: 200 + dy });
      element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start] }));
      element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }));
    });
    const cart = container.querySelector('[data-slot="cart-page"]')!;
    swipe(container.querySelector('[data-slot="cart-discovery"]')!, -100);
    expect(cart.getAttribute('data-page-tab')).toBe('cart');
    swipe(container.querySelector('[data-slot="cart-item"] button')!, -100);
    expect(cart.getAttribute('data-page-tab')).toBe('cart');
    swipe(container.querySelector('section[class*="merchant"]')!, -100, 200);
    expect(cart.getAttribute('data-page-tab')).toBe('cart');
    swipe(container.querySelector('section[class*="merchant"]')!, -100);
    expect(cart.getAttribute('data-page-tab')).toBe('reorder');
    swipe(page.getByRole('tablist', { name: 'Product categories', exact: true }).element(), 100);
    expect(cart.getAttribute('data-page-tab')).toBe('reorder');
    swipe(container.querySelector('[class*="reorderPanel"]')!, 100);
    expect(cart.getAttribute('data-page-tab')).toBe('cart');
  } finally { root.unmount(); container.remove(); await page.viewport(viewport.width, viewport.height); }
});

test("mobile Reorder handles missing history and unavailable purchase examples", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement('div'); document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    const fixture = createCartPageFixture('en');
    const soldOut = fixture.initialItems.find((item) => item.availability === 'sold-out')!;
    fixture.reorderItems = [];
    fixture.frequentlyBoughtItems = [{ ...soldOut, category: 'Grocery', purchaseCount: 12 }];
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole('tab', { name: 'Reorder', exact: true }).click();
    await expect.element(page.getByText('No items here yet', { exact: true }).first()).toBeVisible();
    await page.getByRole('tab', { name: 'Frequently Bought', exact: true }).click();
    const panel = page.getByRole('tabpanel', { name: 'Frequently Bought', exact: true }).element();
    expect(panel.textContent).toContain('Sold out');
    expect(panel.querySelector('button')).toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
  } finally { root.unmount(); container.remove(); await page.viewport(viewport.width, viewport.height); }
});

test.each([1024, 1280, 1440])("CartPage keeps PC navigation pinned and the summary clear while scrolling at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const scroll = { x: window.scrollX, y: window.scrollY };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<CartPage {...createCartPageFixture("en")} />));
    const header = container.querySelector<HTMLElement>('[data-slot="cart-desktop-header"]')!;
    const summary = container.querySelector("aside")!;
    window.scrollTo(0, 800);
    await expect.poll(() => window.scrollY).toBeGreaterThan(400);
    expect(header.getBoundingClientRect().top).toBe(0);
    expect(header.getBoundingClientRect().height).toBeGreaterThan(100);
    await expect.poll(() => summary.getBoundingClientRect().top).toBeCloseTo(header.getBoundingClientRect().bottom + 24, 1);
    await page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    await expect.element(dialog).toBeVisible();
    await expect.poll(() => dialog.element().contains(document.elementFromPoint(width - 32, 32))).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector("dialog[open]")).toBeNull();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
    window.scrollTo(scroll.x, scroll.y);
  }
});
