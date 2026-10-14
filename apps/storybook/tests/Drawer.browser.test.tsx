import { StrictMode, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { Drawer } from "../../../packages/design-system/components/Drawer";
import { QuantitySelect } from "../../../packages/design-system/components/QuantitySelect";
import "@yami/design-system/tokens.css";

function Demo() {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  return <><button onClick={() => setOpen(true)}>Open drawer</button>
    <Drawer open={open} title="Coupons" closeLabel="Close coupons" onClose={() => setOpen(false)} footer={<button>Apply</button>}>
      <input aria-label="Code" />
      <QuantitySelect locale="en" label="Mask quantity" value={quantity} max={25} onValueChange={setQuantity} />
      {Array.from({ length: 40 }, (_, index) => <p key={index}>Coupon {index + 1}</p>)}
    </Drawer>
  </>;
}

test("Drawer keeps right-edge desktop and safe mobile geometry, fixed footer and focus in light mode", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<StrictMode><Demo /></StrictMode>));
    for (const width of [375, 768, 1024, 1440]) {
      await page.viewport(width, 812);
      await page.getByRole("button", { name: "Open drawer" }).click();
      const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
      await expect.poll(() => dialog.dataset.drawerState).toBe("open");
      const content = dialog.querySelector<HTMLElement>("[data-sheet-content]")!;
      const footer = dialog.querySelector<HTMLElement>('[data-slot="sheet-footer"]')!;
      const rect = dialog.getBoundingClientRect();
      expect(rect.right).toBeCloseTo(width, 0);
      expect(rect.bottom).toBeCloseTo(812, 0);
      expect(rect.width).toBeCloseTo(width < 1024 ? width : 480, 0);
      expect(getComputedStyle(dialog).borderTopLeftRadius).toBe(width < 1024 ? "16px" : "0px");
      expect(rect.top).toBeCloseTo(width < 1024 ? 48 : 0, 0);
      expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
      content.scrollTop = content.scrollHeight;
      expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(rect.bottom);
      expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");
      const close = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close coupons"]')!;
      const apply = footer.querySelector<HTMLButtonElement>("button")!;
      apply.focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(close);
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(apply);
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("button", { name: "Open drawer" })).toHaveFocus();
      expect(container.querySelector("dialog[open]")).toBeNull();
      expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
    }
    await page.getByRole("button", { name: "Open drawer" }).click();
    await page.getByRole("combobox", { name: "Mask quantity", exact: true }).click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    await expect.element(page.getByRole("textbox", { name: "Mask quantity: enter quantity" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(container.querySelector("dialog[open]")).not.toBeNull();
    expect(container.querySelector('[data-slot="quantity-select-display"]')!.textContent).toBe("1");
    await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => container.querySelector("dialog[open]")).toBeNull();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1440])("Drawer animates its entry axis and retains content, focus and modal lock through exit at %ipx", async (width) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const afterClose = vi.fn();
  const render = (open: boolean) => flushSync(() => root.render(<>
    <button>Open motion drawer</button>
    <Drawer open={open} title={open ? "Motion details" : ""} closeLabel="Close details" onClose={() => render(false)} onAfterClose={afterClose}>
      {open ? <p>Content stays visible until exit completes</p> : null}
    </Drawer>
  </>));
  try {
    await page.viewport(width, 812);
    render(false);
    const opener = container.querySelector("button")!;
    opener.focus();
    render(true);
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    const enter = dialog.getAnimations().find((animation) => (animation as CSSAnimation).animationName.includes("drawer-enter"))!;
    expect(enter).toBeDefined();
    expect(enter.effect!.getTiming().duration).toBe(200);
    expect(getComputedStyle(dialog, "::backdrop").animationDuration).toBe("0.15s");
    enter.pause();
    enter.currentTime = 100;
    const transform = new DOMMatrix(getComputedStyle(dialog).transform);
    expect(width < 1024 ? transform.m42 : transform.m41).toBeGreaterThan(0);
    expect(width < 1024 ? transform.m41 : transform.m42).toBe(0);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Close details");
    enter.finish();
    await expect.poll(() => dialog.dataset.drawerState).toBe("open");
    render(false);
    expect(dialog.dataset.drawerState).toBe("exiting");
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.textContent).toContain("Motion details");
    expect(dialog.textContent).toContain("Content stays visible until exit completes");
    expect(getComputedStyle(document.documentElement).overflow).toBe("hidden");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Close details");
    await expect.poll(() => container.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
    expect(afterClose).toHaveBeenCalledTimes(1);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("Drawer cancels a pending exit when reopened and releases the modal on unmount", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const afterClose = vi.fn();
  const render = (open: boolean) => flushSync(() => root.render(<Drawer open={open} title="Details" closeLabel="Close details" onClose={() => render(false)} onAfterClose={afterClose}>Details</Drawer>));
  try {
    render(true);
    render(false);
    render(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.dataset.drawerState).toBe("open");
    expect(afterClose).not.toHaveBeenCalled();
    flushSync(() => root.render(null));
    expect(document.querySelector("dialog:modal[data-sheet]")).toBeNull();
    expect(getComputedStyle(document.documentElement).overflow).not.toBe("hidden");
  } finally {
    root.unmount(); container.remove();
  }
});

test("Drawer skips motion and closes immediately for reduced-motion users", async () => {
  const session = cdp();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const afterClose = vi.fn();
  const render = (open: boolean) => flushSync(() => root.render(<Drawer open={open} title="Details" closeLabel="Close details" onClose={() => render(false)} onAfterClose={afterClose}>Details</Drawer>));
  try {
    await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    render(true);
    const dialog = container.querySelector<HTMLDialogElement>("dialog")!;
    expect(getComputedStyle(dialog).animationDuration).toBe("0s");
    expect(getComputedStyle(dialog, "::backdrop").animationDuration).toBe("0s");
    render(false);
    expect(container.querySelector("dialog")).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
  } finally {
    root.unmount(); container.remove();
    await session.send("Emulation.setEmulatedMedia", { features: [] });
  }
});
