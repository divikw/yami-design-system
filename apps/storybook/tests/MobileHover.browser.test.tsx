import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, Checkbox, Coupon, ProductCard, QuantitySelect, Tabs, TabsContent, TabsList, TabsTrigger } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test.each([375, 1023, 1024, 1440])("cart controls reserve mouse hover for desktop layouts at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<div style={{ width: 320, maxWidth: "100%", display: "grid", gap: 16 }}>
      <p>Pointer parking</p>
      <Button variant="emphasis">Checkout</Button>
      <Button variant="tertiary">Shipping information</Button>
      <Checkbox aria-label="Select all" />
      <QuantitySelect label="Quantity" value={1} max={9} onValueChange={() => {}} />
      <Tabs defaultValue="one"><TabsList variant="tertiary" aria-label="Collections"><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger></TabsList><TabsContent value="one">Products</TabsContent><TabsContent value="two">Saved</TabsContent></Tabs>
      <Coupon title="Save $10" description="Selected merchandise" selected={false} onSelectedChange={() => {}} />
      <ProductCard title="Product" href="#product" image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E" priceCurrent="$1.00" onAddToCart={() => {}} addButtonAriaLabel="Add product" />
    </div>));
    const card = container.querySelector('[data-slot="product-card"]')!;
    const imageWrap = card.querySelector('[class*="imageWrap"]')!;
    const image = imageWrap.querySelector("img")!;
    const coupon = container.querySelector('[data-slot="coupon"]')!;
    const cases = [
      { target: page.getByRole("button", { name: "Checkout", exact: true }).element(), styled: page.getByRole("button", { name: "Checkout", exact: true }).element(), property: "backgroundColor" },
      { target: page.getByRole("button", { name: "Shipping information", exact: true }).element(), styled: page.getByRole("button", { name: "Shipping information", exact: true }).element(), property: "backgroundColor" },
      { target: page.getByRole("checkbox", { name: "Select all", exact: true }).element(), styled: page.getByRole("checkbox", { name: "Select all", exact: true }).element(), property: "backgroundColor", pseudo: "::before" },
      { target: page.getByRole("combobox", { name: "Quantity", exact: true }).element(), styled: container.querySelector('[data-slot="quantity-select-display"]')!, property: "backgroundColor" },
      { target: page.getByRole("tab", { name: "Two", exact: true }).element(), styled: page.getByRole("tab", { name: "Two", exact: true }).element(), property: "backgroundColor", pseudo: "::before" },
      { target: coupon, styled: coupon.firstElementChild!, property: "backgroundColor" },
      { target: imageWrap, styled: image, property: "transform" },
      { target: page.getByRole("button", { name: "Add product", exact: true }).element(), styled: page.getByRole("button", { name: "Add product", exact: true }).element(), property: "backgroundColor" },
    ];
    for (const entry of cases) {
      await page.getByText("Pointer parking", { exact: true }).hover();
      const read = () => getComputedStyle(entry.styled, entry.pseudo).getPropertyValue(entry.property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`));
      const before = read();
      await userEvent.hover(page.elementLocator(entry.target));
      if (width < 1024) expect(read()).toBe(before);
      else await expect.poll(read).not.toBe(before);
    }
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("mobile buttons retain keyboard focus and held-press feedback without hover", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<Button variant="emphasis">Checkout</Button>));
    const button = page.getByRole("button", { name: "Checkout", exact: true });
    const background = getComputedStyle(button.element()).backgroundColor;
    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    expect(getComputedStyle(button.element()).outlineWidth).toBe("2px");
    await userEvent.keyboard("[Space>]");
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).not.toBe(background);
    await userEvent.keyboard("[/Space]");
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).toBe(background);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
