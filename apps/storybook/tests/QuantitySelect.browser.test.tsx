import { useState } from "react";
import { Drawer } from "../../../packages/design-system/components/Drawer";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { QuantitySelect } from "../../../packages/design-system/components/QuantitySelect";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

test("QuantitySelect matches the source cart pill while preserving its accessible target and keyboard focus", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const props = { value: 1, max: 10000, label: "Mask quantity", locale: "en" as const, onValueChange: () => {} };
  try {
    for (const width of [375, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<QuantitySelect key={width} {...props} />));
      const select = container.querySelector<HTMLButtonElement>('[role="combobox"]')!;
      const display = container.querySelector<HTMLElement>('[data-slot="quantity-select-display"]')!;
      const rect = display.getBoundingClientRect();
      const target = select.getBoundingClientRect();
      expect(rect.width).toBe(60);
      expect(rect.height).toBe(24);
      expect(target.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(rect.top + rect.height / 2 - target.top - target.height / 2)).toBeLessThan(1);
      expect(document.elementFromPoint(target.left + 2, target.top + 2)).toBe(select);
      expect(document.elementFromPoint(target.right - 2, target.bottom - 2)).toBe(select);
      expect(getComputedStyle(display).borderRadius).toBe("9999px");
      await userEvent.tab();
      await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toHaveFocus();
      expect(getComputedStyle(display).outlineWidth).toBe("2px");
      expect(getComputedStyle(display).outlineOffset).toBe("2px");
    }
    flushSync(() => root.render(<QuantitySelect {...props} value={10000} />));
    await expect.element(page.getByRole("textbox", { name: "Mask quantity: enter quantity", exact: true })).toHaveValue("10000");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
    flushSync(() => root.render(<QuantitySelect {...props} disabled />));
    await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toBeDisabled();
    expect(getComputedStyle(container.querySelector('[data-slot="quantity-select-display"]')!).opacity).toBe("1");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});


function ControlledQuantity({ loading = false }: { loading?: boolean }) {
  const [value, setValue] = useState(1);
  return <><QuantitySelect value={value} max={2} label="Limited quantity" locale="en" loading={loading} onValueChange={setValue} /><button style={{ marginLeft: 160 }}>Outside</button></>;
}

test.each([375, 1440])("QuantitySelect opens a source-styled list with selection, keyboard and dismissal at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<ControlledQuantity />));
    const trigger = page.getByRole("combobox", { name: "Limited quantity", exact: true });
    await trigger.click();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    const popup = document.querySelector<HTMLElement>('[data-slot="quantity-select-popup"]')!;
    const display = container.querySelector<HTMLElement>('[data-slot="quantity-select-display"]')!;
    expect(popup.getBoundingClientRect().width).toBe(60);
    expect(getComputedStyle(popup).boxShadow).toBe("none");
    expect(getComputedStyle(popup).borderRadius).toBe("0px");
    expect(getComputedStyle(display).borderTopWidth).toBe("2px");
    expect(getComputedStyle(display.lastElementChild!).transform).toBe("matrix(-1, 0, 0, -1, 0, 0)");
    const first = page.getByRole("option", { name: "1", exact: true });
    await expect.element(first).toHaveAttribute("aria-selected", "true");
    expect(first.element().querySelector('svg')).not.toBeNull();
    expect(page.getByRole("option").elements()).toHaveLength(2);
    expect(first.element().getBoundingClientRect().height).toBe(width === 375 ? 44 : 28);
    await expect.element(first).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(page.getByRole("option", { name: "2", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(trigger).toHaveTextContent("2");
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await page.getByRole("button", { name: "Outside", exact: true }).click();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.element(page.getByRole("button", { name: "Outside", exact: true })).toHaveFocus();
    await trigger.click();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveTextContent("2");
    await trigger.click();
    flushSync(() => root.render(<ControlledQuantity loading />));
    await expect.element(trigger).toBeDisabled();
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    flushSync(() => root.render(<ControlledQuantity />));
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("QuantitySelect keeps its popup and 10+ editor inside a native drawer and dismisses only the inner control", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<Drawer open title="Quantity test" closeLabel="Close" onClose={() => { throw new Error("Inner escape must not close the drawer"); }}><QuantitySelect value={1} max={25} label="Drawer quantity" locale="en" onValueChange={() => {}} /></Drawer>));
    const trigger = page.getByRole("combobox", { name: "Drawer quantity", exact: true });
    await trigger.click();
    expect(page.getByRole("option", { name: "10+", exact: true }).element().closest("dialog")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.element(page.getByRole("dialog", { name: "Quantity test", exact: true })).toBeVisible();
    await trigger.click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    await expect.element(page.getByRole("textbox", { name: "Drawer quantity: enter quantity", exact: true })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
    await expect.element(page.getByRole("dialog", { name: "Quantity test", exact: true })).toBeVisible();
  } finally {
    root.unmount(); container.remove();
  }
});

test("QuantitySelect flips and scrolls within a short viewport", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.cssText = "position: fixed; bottom: 0; left: 8px";
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 360);
    flushSync(() => root.render(<QuantitySelect value={1} max={25} label="Edge quantity" locale="en" onValueChange={() => {}} />));
    const trigger = page.getByRole("combobox", { name: "Edge quantity", exact: true });
    await trigger.click();
    const list = page.getByRole("listbox").element();
    const popup = document.querySelector<HTMLElement>('[data-slot="quantity-select-popup"]')!;
    await expect.poll(() => popup.dataset.side).toBe("top");
    expect(popup.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    expect(popup.getBoundingClientRect().bottom).toBeLessThanOrEqual(360);
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(375);
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

function InlineQuantity({ onChange, loading = false, disabled = false, locale = "en" }: { onChange: (value: number) => void; loading?: boolean; disabled?: boolean; locale?: "zh" | "en" }) {
  const [value, setValue] = useState(1);
  return <><QuantitySelect value={value} max={25} label="Inline quantity" locale={locale} loading={loading} disabled={disabled} onValueChange={(next) => { setValue(next); onChange(next); }} /><button style={{ marginLeft: 160 }}>Outside</button></>;
}

test.each([375, 1440])("QuantitySelect replaces 10+ in place and commits once on blur or Enter at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const changes: number[] = [];
  const onChange = (next: number) => changes.push(next);
  const locale = width === 375 ? "en" : "zh";
  try {
    await page.viewport(width, 812);
    flushSync(() => root.render(<InlineQuantity onChange={onChange} locale={locale} />));
    const trigger = page.getByRole("combobox", { name: "Inline quantity", exact: true });
    const before = container.querySelector('[data-slot="quantity-select-display"]')!.getBoundingClientRect();
    await trigger.click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    const input = page.getByRole("textbox", { name: locale === "en" ? "Inline quantity: enter quantity" : "Inline quantity：输入数量", exact: true });
    await expect.element(input).toHaveFocus();
    expect(container.querySelector<HTMLButtonElement>('[role="combobox"]')!.hidden).toBe(true);
    const after = input.element().getBoundingClientRect();
    expect({ width: after.width, height: after.height, left: after.left, top: after.top }).toEqual({ width: before.width, height: before.height, left: before.left, top: before.top });
    expect(input.element().closest("label")!.getBoundingClientRect().height).toBe(44);
    expect(getComputedStyle(input.element()).textAlign).toBe("center");
    expect(page.getByRole("button").elements()).toHaveLength(1);
    await input.fill("12");
    expect(changes).toEqual([]);
    await userEvent.keyboard("{Enter}");
    expect(changes).toEqual([12]);
    await expect.element(input).not.toHaveFocus();
    await expect.element(input).toHaveValue("12");
    const outside = page.getByRole("button", { name: "Outside", exact: true });
    await outside.click();
    expect(changes).toEqual([12]);
    await input.fill("18");
    await outside.click();
    expect(changes).toEqual([12, 18]);
    await expect.element(outside).toHaveFocus();
    const controlHeight = container.querySelector('[data-slot="quantity-select"]')!.getBoundingClientRect().height;
    await input.fill("26");
    await userEvent.keyboard("{Enter}");
    expect(changes).toEqual([12, 18, 25]);
    await expect.element(input).toHaveValue("25");
    const toast = page.getByRole("alert").element();
    expect(container.contains(toast)).toBe(false);
    expect(getComputedStyle(toast).position).toBe("fixed");
    expect(container.querySelector('[data-slot="quantity-select"]')!.getBoundingClientRect().height).toBe(controlHeight);
    await expect.element(input).not.toHaveAttribute("aria-invalid", "true");
    await expect.element(page.getByRole("alert")).toHaveTextContent(locale === "en" ? "Maximum quantity is 25" : "已达到数量上限 25");
    await input.fill("20");
    await userEvent.keyboard("{Escape}");
    await expect.element(input).toHaveValue("25");
    expect(changes).toEqual([12, 18, 25]);
    await input.fill("1a2.3");
    await expect.element(input).toHaveValue("123");
    await userEvent.keyboard("{Escape}");
    await input.fill("24");
    flushSync(() => root.render(<InlineQuantity onChange={onChange} locale={locale} loading />));
    await expect.element(input).toBeDisabled();
    await outside.click();
    expect(changes).toEqual([12, 18, 25]);
    flushSync(() => root.render(<InlineQuantity onChange={onChange} locale={locale} />));
    await input.fill("");
    await userEvent.keyboard("{Enter}");
    expect(changes).toEqual([12, 18, 25, 1]);
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveTextContent("1");
    await trigger.click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    await input.fill("0");
    await userEvent.keyboard("{Enter}");
    expect(changes).toEqual([12, 18, 25, 1]);
    await expect.element(trigger).toHaveFocus();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("QuantitySelect restarts its transient limit toast in a drawer without moving focus or leaving stale portals", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<Drawer open title="Quantity toast test" closeLabel="Close" onClose={() => {}}><InlineQuantity onChange={() => {}} /></Drawer>));
    await page.getByRole("combobox", { name: "Inline quantity", exact: true }).click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    const input = page.getByRole("textbox", { name: "Inline quantity: enter quantity", exact: true });
    const outside = page.getByRole("button", { name: "Outside", exact: true });
    await input.fill("26");
    await outside.click();
    const firstToast = page.getByRole("alert").element();
    expect(firstToast.closest("dialog")).not.toBeNull();
    await expect.element(outside).toHaveFocus();
    await new Promise((resolve) => setTimeout(resolve, 1400));
    await input.fill("27");
    await outside.click();
    expect(firstToast.isConnected).toBe(false);
    expect(document.querySelectorAll('[data-slot="quantity-limit-toast"]')).toHaveLength(1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await expect.element(page.getByRole("alert")).toHaveTextContent("Maximum quantity is 25");
    await expect.element(outside).toHaveFocus();
    await expect.poll(() => document.querySelector('[data-slot="quantity-limit-toast"]'), { timeout: 4000 }).toBeNull();
    await input.fill("28");
    await outside.click();
    expect(document.querySelector('[data-slot="quantity-limit-toast"]')).not.toBeNull();
    root.unmount();
    expect(document.querySelector('[data-slot="quantity-limit-toast"]')).toBeNull();
  } finally {
    root.unmount(); container.remove();
  }
});
