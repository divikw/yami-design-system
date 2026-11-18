import { StrictMode, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { Drawer } from "../../../packages/design-system/components/Drawer";
import { QuantitySelect } from "../../../packages/design-system/components/QuantitySelect";
import "@yami/design-system/tokens.css";

function Demo({ size = "full" }: { size?: "full" | "half" }) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  return <><button onClick={() => setOpen(true)}>Open drawer</button>
    <Drawer open={open} size={size} lang="en" title="Coupons" closeLabel="Close coupons" onClose={() => setOpen(false)} footer={<button>Apply</button>}>
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
      const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
      await expect.poll(() => dialog.dataset.drawerState).toBe("open");
      const content = dialog.querySelector<HTMLElement>("[data-drawer-content]")!;
      const footer = dialog.querySelector<HTMLElement>('[data-slot="drawer-footer"]')!;
      const rect = dialog.getBoundingClientRect();
      expect(rect.right).toBeCloseTo(width, 0);
      expect(rect.bottom).toBeCloseTo(812, 0);
      expect(rect.width).toBeCloseTo(width < 1024 ? width : 480, 0);
      expect(getComputedStyle(dialog).borderTopLeftRadius).toBe(width < 1024 ? "16px" : "0px");
      expect(rect.top).toBeCloseTo(width < 1024 ? 48 : 0, 0);
      expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
      content.scrollTop = content.scrollHeight;
      expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(rect.bottom);
      expect(getComputedStyle(document.body).overflow).toBe("hidden");
      const close = dialog.querySelector<HTMLButtonElement>('button[aria-label="Close coupons"]')!;
      expect(getComputedStyle(close).borderRadius).toBe("4px");
      const closeBounds = close.getBoundingClientRect();
      expect([closeBounds.width, closeBounds.height]).toEqual([24, 24]);
      const padding = width < 1024 ? 16 : 24;
      expect(closeBounds.top - rect.top).toBe(padding);
      expect(rect.right - closeBounds.right).toBe(padding);
      expect(getComputedStyle(dialog.querySelector("header")!).padding).toBe(`${padding}px`);
      expect(getComputedStyle(content).padding).toBe(`${padding}px`);
      expect(getComputedStyle(content.querySelector("p")!).fontSize).toBe("16px");
      expect(close.querySelector("img")!.getBoundingClientRect().toJSON()).toEqual(closeBounds.toJSON());
      expect(document.elementFromPoint(closeBounds.right + 9, closeBounds.top - 9)?.closest("button")).toBe(close);
      const apply = footer.querySelector<HTMLButtonElement>("button")!;
      apply.focus();
      await userEvent.tab();
      await expect.poll(() => document.activeElement).toBe(close);
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(apply);
      await userEvent.keyboard("{Escape}");
      await expect.element(page.getByRole("button", { name: "Open drawer" })).toHaveFocus();
      await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
      await expect.poll(() => getComputedStyle(document.body).overflow).not.toBe("hidden");
    }
    await page.getByRole("button", { name: "Open drawer" }).click();
    await page.getByRole("combobox", { name: "Mask quantity", exact: true }).click();
    await page.getByRole("option", { name: "10+", exact: true }).click();
    await expect.element(page.getByRole("textbox", { name: "Mask quantity: enter quantity" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(document.querySelector("[data-drawer]")).not.toBeNull();
    expect(document.querySelector('[data-slot="quantity-select-display"]')!.textContent).toBe("1");
    await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
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
    const opener = document.querySelector("button")!;
    opener.focus();
    render(true);
    const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
    const enter = dialog.getAnimations().find((animation) => (animation as CSSAnimation).animationName.includes("drawer-enter"))!;
    expect(enter).toBeDefined();
    expect(enter.effect!.getTiming().duration).toBe(200);
    expect(getComputedStyle(document.querySelector("[data-drawer-backdrop]")!).animationDuration).toBe("0.15s");
    enter.pause();
    enter.currentTime = 100;
    const transform = new DOMMatrix(getComputedStyle(dialog).transform);
    expect(width < 1024 ? transform.m42 : transform.m41).toBeGreaterThan(0);
    expect(width < 1024 ? transform.m41 : transform.m42).toBe(0);
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Close details");
    enter.finish();
    await expect.poll(() => dialog.dataset.drawerState).toBe("open");
    render(false);
    expect(dialog.dataset.drawerState).toBe("exiting");
    expect(dialog.getAttribute("aria-modal") === "true").toBe(true);
    expect(dialog.textContent).toContain("Motion details");
    expect(dialog.textContent).toContain("Content stays visible until exit completes");
    expect(getComputedStyle(document.body).overflow).toBe("hidden");
    await expect.poll(() => document.activeElement?.getAttribute("aria-label")).toBe("Close details");
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
    await expect.poll(() => document.activeElement).toBe(opener);
    await expect.poll(() => getComputedStyle(document.body).overflow).not.toBe("hidden");
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
    const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
    expect(dialog.getAttribute("aria-modal") === "true").toBe(true);
    expect(dialog.dataset.drawerState).toBe("open");
    expect(afterClose).not.toHaveBeenCalled();
    flushSync(() => root.render(null));
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
    await expect.poll(() => getComputedStyle(document.body).overflow).not.toBe("hidden");
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
    const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
    expect(getComputedStyle(dialog).animationDuration).toBe("0s");
    expect(getComputedStyle(document.querySelector("[data-drawer-backdrop]")!).animationDuration).toBe("0s");
    render(false);
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
    expect(afterClose).toHaveBeenCalledTimes(1);
  } finally {
    root.unmount(); container.remove();
    await session.send("Emulation.setEmulatedMedia", { features: [] });
  }
});

test("Mobile half-height drawer snaps in both directions, keeps its footer visible and resets after closing", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const session = cdp();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    flushSync(() => root.render(<Demo size="half" />));
    const opener = page.getByRole("button", { name: "Open drawer" });
    await opener.click();
    const popup = document.querySelector<HTMLElement>("[data-drawer]")!;
    const handle = popup.querySelector<HTMLElement>('[role="slider"]')!;
    const footer = popup.querySelector<HTMLElement>('[data-slot="drawer-footer"]')!;
    async function expectPosition(top: number) {
      await expect.poll(() => popup.getBoundingClientRect().top).toBeCloseTo(top, 0);
      expect(footer.getBoundingClientRect().bottom).toBeCloseTo(812, 0);
    }
    async function drag(distance: number) {
      const rect = handle.getBoundingClientRect();
      const frame = window.frameElement!.getBoundingClientRect();
      const scale = frame.width / innerWidth;
      const x = frame.left + (rect.left + rect.width / 2) * scale;
      const y = frame.top + (rect.top + rect.height / 2) * scale;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      for (let step = 1; step <= 12; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove", touchPoints: [{ x, y: y + distance * scale * step / 12 }],
        });
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    }
    await expect.poll(() => popup.dataset.drawerState).toBe("open");
    await expectPosition(406);
    await drag(-320);
    await expectPosition(48);
    await drag(320);
    await expectPosition(406);
    handle.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expectPosition(48);
    await userEvent.keyboard("{Escape}");
    await expect.element(opener).toHaveFocus();
    await opener.click();
    await expect.element(page.getByRole("slider", { name: "Panel height" })).toHaveAttribute("aria-valuenow", "50");
  } finally {
    root.unmount(); container.remove();
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await page.viewport(viewport.width, viewport.height);
  }
});

test("A non-modal drawer allows outside actions and an independently dismissible nested drawer", async () => {
  function NestedDemo() {
    const [open, setOpen] = useState(true);
    const [nested, setNested] = useState(false);
    const [count, setCount] = useState(0);
    return <>
      <button onClick={() => setCount(count + 1)}>Outside {count}</button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Notes" closeLabel="Close"
        swipeDirection="right" modal={false} disablePointerDismissal>
        <button onClick={() => setNested(true)}>Open details</button>
        <Drawer open={nested} onClose={() => setNested(false)} title="Details" closeLabel="Close" swipeDirection="up" size="content">
          Details
        </Drawer>
      </Drawer>
    </>;
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<NestedDemo />));
    await page.getByRole("button", { name: "Outside 0" }).click();
    await expect.element(page.getByRole("button", { name: "Outside 1" })).toBeVisible();
    expect(document.querySelector("[data-drawer-backdrop]")).toBeNull();
    const opener = page.getByRole("button", { name: "Open details" });
    await opener.click();
    const child = page.getByRole("dialog", { name: "Details", exact: true });
    await expect.element(child).toHaveAttribute("aria-modal", "true");
    await expect.poll(() => child.element().getBoundingClientRect().top).toBeCloseTo(0, 0);
    await userEvent.keyboard("{Escape}");
    await expect.element(opener).toHaveFocus();
    await expect.element(child).not.toBeInTheDocument();
    await expect.element(page.getByRole("dialog", { name: "Notes" })).toBeVisible();
  } finally {
    root.unmount(); container.remove();
  }
});

test("Custom vertical snap points support controlled updates and cancellation", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const points = ["180px", "25rem", 1];
  function ControlledStops() {
    const [point, setPoint] = useState<string | number | null>(points[0]);
    return <Drawer open title="Panel" lang="en" closeLabel="Close" onClose={() => {}}
      swipeDirection="down" snapPoints={points} snapPoint={point}
      onSnapPointChange={(next, details) => {
        if (next === 1) details.cancel();
        else setPoint(next);
      }}>Content</Drawer>;
  }
  try {
    flushSync(() => root.render(<ControlledStops />));
    const slider = page.getByRole("slider", { name: "Panel height" });
    await expect.element(slider).toHaveAttribute("aria-valuetext", "180px");
    (slider.element() as HTMLElement).focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(slider).toHaveAttribute("aria-valuetext", "25rem");
    await userEvent.keyboard("{End}");
    await expect.element(slider).toHaveAttribute("aria-valuetext", "25rem");
  } finally {
    root.unmount(); container.remove();
  }
});
