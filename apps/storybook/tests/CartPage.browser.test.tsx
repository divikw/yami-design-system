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
    expect(container.querySelector('[aria-labelledby="merchant-yami"] [data-slot="cart-item"] h3')!.textContent).toBe(first.title);
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
      expect(container.querySelector("#merchant-yami")!.getAttribute("href")).toBe(fixture.merchants[0].href);
      await page.elementLocator(merchant).click();
      expect(merchant.getAttribute("aria-checked")).toBe("false");
      await userEvent.keyboard("{Space}");
      expect(merchant.getAttribute("aria-checked")).toBe("true");
      const tabs = container.querySelector('[role="tablist"]')!;
      const heading = container.querySelector('[data-slot="product-list-title"]')!;
      const products = container.querySelector('[data-slot="product-list-items"]')!;
      expect(Math.abs(tabs.getBoundingClientRect().left - heading.getBoundingClientRect().left)).toBeLessThan(1);
      expect(Math.abs(tabs.getBoundingClientRect().left - products.getBoundingClientRect().left)).toBeLessThan(1);
      const learn = page.getByRole("button", { name: "Learn more", exact: true });
      const learnElement = Array.from(container.querySelectorAll<HTMLButtonElement>('aside[aria-label="Order summary"] button')).find((button) => button.textContent === "Learn more")!;
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
        expect(header.getBoundingClientRect().height).toBe(56);
      }
      await expect.element(page.elementLocator(progress)).toBeVisible();
      await page.getByRole("checkbox", { name: `Select ${product.title}`, exact: true }).click();
      expect(progress.value).toBe(1833);
      expect(progress.getAttribute("aria-valuetext")).toContain("$30.67");
      const select = container.querySelector<HTMLSelectElement>(`select[aria-label="${product.title} quantity"]`)!;
      for (const [quantity, value, hint] of [[2, 3666, "$12.34"], [3, 4900, "Free shipping"]] as const) {
        select.value = String(quantity);
        select.dispatchEvent(new Event("change", { bubbles: true }));
        await expect.poll(() => progress.value).toBe(value);
        expect(progress.getAttribute("aria-valuetext")).toContain(hint);
        const shipping = progress.parentElement!;
        expect(shipping.dataset.qualified).toBe(String(quantity === 3));
        expect(shipping.querySelector("img")!.getAttribute("src")).toContain(quantity === 3 ? "shipping-qualified.png" : "delivery-line.png");
        const sample = document.createElement("span");
        sample.style.color = quantity === 3 ? "var(--fill-success-primary)" : "var(--text-primary)";
        shipping.append(sample);
        expect(getComputedStyle(progress).accentColor).toBe(getComputedStyle(sample).color);
        sample.remove();
        if (quantity === 3) {
          expect(shipping.querySelector("p")!.textContent).toBe("You have earned free shipping");
          expect(shipping.querySelector("strong")!.textContent).toBe(" free shipping");
          expect(shipping.querySelector("img")!.getBoundingClientRect().width).toBe(14);
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


test("CartPage reports coupon changes inside the drawer and supports undo after clearing unavailable items", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const fixture = createCartPageFixture("en");
  fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  try {
    flushSync(() => root.render(<CartPage {...fixture} />));
    await page.getByRole("button", { name: "Edit Coupons", exact: true }).click();
    let dialog = page.getByRole("dialog", { name: "Coupons", exact: true });
    await dialog.getByRole("button", { name: "Apply", exact: true }).click();
    await expect.element(dialog.getByRole("status")).toHaveTextContent("Coupon applied");
    await expect.element(dialog.getByRole("button", { name: "Remove coupon", exact: true })).toHaveAttribute("aria-pressed", "true");
    await dialog.getByRole("button", { name: "Remove coupon", exact: true }).click();
    await expect.element(dialog.getByRole("status")).toHaveTextContent("Coupon removed");
    await expect.element(dialog.getByRole("button", { name: "Apply", exact: true })).toHaveAttribute("aria-pressed", "false");
    await userEvent.keyboard("{Escape}");
    expect(container.querySelector('[data-slot="cart-totals"]')!.textContent).not.toContain("Discount");
    await page.getByRole("button", { name: "View all Unavailable items", exact: true }).click();
    dialog = page.getByRole("dialog", { name: "Unavailable items", exact: true });
    const unavailable = fixture.initialItems.filter((item) => item.availability !== "available");
    for (const item of unavailable) await dialog.getByRole("button", { name: `Delete ${item.title}`, exact: true }).click();
    await expect.element(dialog.getByText("No unavailable items", { exact: true })).toBeVisible();
    await expect.element(dialog.getByRole("status")).toHaveTextContent("Item deleted");
    await dialog.getByRole("button", { name: "Undo", exact: true }).click();
    await expect.element(dialog.getByText(unavailable.at(-1)!.title, { exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: `Delete ${unavailable.at(-1)!.title}`, exact: true }).click();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("heading", { name: "Shopping cart", exact: true })).toHaveFocus();
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
