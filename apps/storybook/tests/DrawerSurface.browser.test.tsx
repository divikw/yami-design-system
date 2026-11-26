import { StrictMode, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Drawer } from "../../../packages/design-system/components/Drawer";
import { Checkbox } from "../../../packages/design-system/components/Checkbox";
import "@yami/design-system/tokens.css";

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open drawer</button>
      <Drawer open={open} title="Details" closeLabel="Close details" onClose={() => setOpen(false)} footer={<button>Apply</button>}>
        <input aria-label="Search" />
        <button disabled>Disabled</button>
        <div hidden><button>Hidden</button></div>
        <textarea aria-label="Notes" />
        {Array.from({ length: 30 }, (_, index) => <p key={index}>Content {index}</p>)}
      </Drawer>
    </>
  );
}

const brands = ["SKIN1004", "COSRX", "Anua"];

test("Drawer keeps its accessible name when the visual title is replaced", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<Drawer open title="Navigation menu" titleContent={<span>YAMI</span>}
      closeLabel="Close navigation menu" onClose={() => {}}>
      <p>Menu content</p>
    </Drawer>));
    const dialog = page.getByRole("dialog", { name: "Navigation menu", exact: true });
    await expect.element(dialog).toBeVisible();
    await expect.element(dialog.getByText("YAMI", { exact: true })).toBeVisible();
  } finally {
    root.unmount(); container.remove();
  }
});

test("Drawer keeps its accessible description and divider in the fixed header while content scrolls", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    flushSync(() => root.render(<Drawer open size="full" title="Coupons" description="Only applicable coupons are shown."
      closeLabel="Close coupons" onClose={() => {}} aria-describedby="extra-description">
      <p id="extra-description">Select one coupon.</p>
      {Array.from({ length: 40 }, (_, index) => <p key={index}>Coupon {index + 1}</p>)}
      <button>Last coupon</button>
    </Drawer>));
    const dialog = document.querySelector("[data-drawer]")!;
    const description = dialog.querySelector('[data-slot="drawer-description"]')!;
    const header = dialog.querySelector('[data-slot="drawer-header"]')!;
    expect(dialog.getAttribute("aria-describedby")).toContain(description.id);
    expect(dialog.getAttribute("aria-describedby")).toContain("extra-description");
    expect(header.contains(description)).toBe(true);
    expect(getComputedStyle(header).borderBottomWidth).toBe("1px");
    await expect.poll(() => dialog.getAttribute("data-drawer-state")).toBe("open");
    const top = description.getBoundingClientRect().top;
    await page.getByRole("button", { name: "Last coupon", exact: true }).click();
    expect(dialog.querySelector('[data-drawer-content]')!.scrollTop).toBeGreaterThan(0);
    expect(description.getBoundingClientRect().top).toBe(top);
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each(["content", "full"] as const)("Drawer %s uses 16px top corners on mobile and square corners on desktop", async (size) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const theme of ["light", "dark"]) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      flushSync(() => root.render(<Drawer open title="Details" closeLabel="Close details" onClose={() => {}} size={size}>Details</Drawer>));
      for (const width of [375, 1023, 1024, 1440]) {
        await page.viewport(width, 812);
        const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
        await expect.poll(() => dialog.dataset.swipeDirection).toBe(width < 1024 ? "down" : "right");
        await expect.poll(() => dialog.dataset.drawerState).toBe("open");
        const style = getComputedStyle(dialog);
        expect(style.getPropertyValue("--radius-surface-sheet").trim()).toBe("16px");
        expect(style.borderTopLeftRadius).toBe(width < 1024 ? "16px" : "0px");
        expect(style.borderTopRightRadius).toBe(width < 1024 ? "16px" : "0px");
        expect(style.borderBottomLeftRadius).toBe("0px");
        expect(style.borderBottomRightRadius).toBe("0px");
        const close = page.getByRole("button", { name: "Close details", exact: true }).element();
        const button = close.getBoundingClientRect();
        const surface = dialog.getBoundingClientRect();
        expect([button.width, button.height]).toEqual([24, 24]);
        expect(button.top - surface.top).toBeCloseTo(width < 1024 ? 16 : 24, 2);
        expect(surface.right - button.right).toBeCloseTo(width < 1024 ? 16 : 24, 2);
        expect(close.querySelector("img")!.getBoundingClientRect().width).toBe(24);
        expect(getComputedStyle(close, "::before").width).toBe("44px");
      }
    }
  } finally {
    root.unmount();
    document.documentElement.classList.remove("dark");
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

function ChildDemo() {
  const [open, setOpen] = useState(false);
  const [child, setChild] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const entry = useRef<HTMLButtonElement>(null);
  const goBack = () => {
    setChild(false);
    requestAnimationFrame(() => entry.current?.focus());
  };

  return (
    <>
      <button onClick={() => { setChild(false); setOpen(true); }}>Open filters</button>
      <Drawer
        open={open}
        title={child ? "Brand" : "All filters"}
        closeLabel="Close filters"
        onClose={() => setOpen(false)}
        back={child ? { label: "Back to filters", onClick: goBack } : undefined}
        contentPadding="compact"
        footer={<button onClick={() => setOpen(false)}>View results</button>}
      >
        <div hidden={child}>
          <button ref={entry} onClick={() => setChild(true)}>
            Brand{selected.length > 0 ? ` ${selected.length} selected` : ""}
          </button>
        </div>
        {child && (
          <div role="group" aria-label="Brand options">
            {brands.map((brand) => (
              <label key={brand}>
                <Checkbox
                  checked={selected.includes(brand)}
                  onCheckedChange={(checked) => setSelected((current) => (
                    checked ? [...current, brand] : current.filter((item) => item !== brand)
                  ))}
                />
                {brand}
              </label>
            ))}
          </div>
        )}
      </Drawer>
    </>
  );
}

test("Drawer confines focus, keeps its footer fixed and releases its modal lock across breakpoints", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const originalOverflow = document.documentElement.style.overflow;
  try {
    flushSync(() => root.render(<StrictMode><Demo /></StrictMode>));
    for (const width of [375, 768, 1440]) {
      await page.viewport(width, 812);
      await page.getByRole("button", { name: "Open drawer" }).click();
      const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
      expect(dialog.getAttribute("aria-modal") === "true").toBe(true);
      await expect.poll(() => dialog.dataset.drawerState).toBe("open");
      const bounds = dialog.getBoundingClientRect();
      expect(bounds.width).toBe(width < 1024 ? width : 480);
      if (width < 1024) {
        expect(bounds.bottom).toBe(innerHeight);
        expect(bounds.height).toBe(innerHeight - 48);
      } else {
        expect(bounds.top).toBe(0);
        expect(bounds.right).toBe(innerWidth);
        expect(bounds.height).toBe(innerHeight);
      }
      expect(getComputedStyle(document.body).overflow).toBe("hidden");
      const close = dialog.querySelector<HTMLButtonElement>("button")!;
      const closeBounds = close.getBoundingClientRect();
      const closeIcon = close.querySelector<HTMLImageElement>("img")!;
      const closeIconBounds = closeIcon.getBoundingClientRect();
      expect(closeBounds.width).toBe(24);
      expect(closeBounds.height).toBe(24);
      expect(getComputedStyle(close, "::before").width).toBe("44px");
      expect(getComputedStyle(close, "::before").height).toBe("44px");
      expect(closeIconBounds.width).toBe(24);
      expect(closeIconBounds.height).toBe(24);
      expect(bounds.right - closeIconBounds.right).toBe(width < 1024 ? 16 : 24);
      expect(closeIconBounds.top - bounds.top).toBe(width < 1024 ? 16 : 24);
      await expect.poll(() => document.activeElement).toBe(close);
      await userEvent.tab();
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Search");
      await userEvent.tab();
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Notes");
      await userEvent.tab();
      expect(document.activeElement?.textContent).toBe("Apply");
      await userEvent.tab();
      await expect.poll(() => document.activeElement).toBe(close);
      await userEvent.tab({ shift: true });
      expect(document.activeElement?.textContent).toBe("Apply");
      const content = dialog.querySelector<HTMLElement>("[data-drawer-content]")!;
      const footer = dialog.querySelector<HTMLElement>('[data-slot="drawer-footer"]')!;
      const footerTop = footer.getBoundingClientRect().top;
      content.scrollTop = content.scrollHeight;
      expect(content.scrollTop).toBeGreaterThan(100);
      expect(footer.getBoundingClientRect().top).toBe(footerTop);
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
      await expect.poll(() => document.activeElement?.textContent).toBe("Open drawer");
      expect(document.documentElement.style.overflow).toBe(originalOverflow);
      expect(getComputedStyle(document.body).overflow).not.toBe("hidden");
    }
  } finally {
    root.unmount();
    document.documentElement.classList.remove("dark");
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("Drawer keeps content clicks open, dismisses the backdrop, and preserves an existing scroll lock", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const originalOverflow = document.documentElement.style.overflow;
  try {
    await page.viewport(375, 812);
    document.documentElement.style.overflow = "hidden";
    flushSync(() => root.render(<Demo />));
    await page.getByRole("button", { name: "Open drawer" }).click();
    const dialog = document.querySelector<HTMLDivElement>("[data-drawer]")!;
    await page.getByRole("textbox", { name: "Search" }).click();
    expect(dialog.getAttribute("aria-modal") === "true").toBe(true);
    await userEvent.click(dialog.parentElement!, { position: { x: 4, y: 4 } });
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
    expect(document.documentElement.style.overflow).toBe("hidden");
    await page.getByRole("button", { name: "Open drawer" }).click();
    flushSync(() => root.render(null));
    expect(document.querySelector("[data-drawer]")).toBeNull();
    expect(document.documentElement.style.overflow).toBe("hidden");
  } finally {
    root.unmount();
    document.documentElement.classList.remove("dark");
    container.remove();
    document.documentElement.style.overflow = originalOverflow;
    await page.viewport(viewport.width, viewport.height);
  }
});

test("Drawer child view returns to its parent without closing the dialog and keeps selections", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<ChildDemo />));
    await page.getByRole("button", { name: "Open filters" }).click();
    expect(getComputedStyle(document.querySelector<HTMLElement>("[data-drawer-content]")!).padding).toBe("8px");
    const surface = document.querySelector("[data-drawer]")!;
    const close = page.getByRole("button", { name: "Close filters" }).element();
    const closeBounds = close.getBoundingClientRect();
    const rightInset = surface.getBoundingClientRect().right - closeBounds.right;
    await page.getByRole("button", { name: "Brand" }).click();
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Back to filters");
    const back = page.getByRole("button", { name: "Back to filters" }).element();
    const backBounds = back.getBoundingClientRect();
    expect([backBounds.width, backBounds.height]).toEqual([closeBounds.width, closeBounds.height]);
    expect(backBounds.left - surface.getBoundingClientRect().left).toBeCloseTo(rightInset, 2);
    expect(back.querySelector("img")!.getBoundingClientRect().width).toBe(24);
    expect(getComputedStyle(back, "::before").width).toBe("44px");
    expect(page.getByRole("checkbox").elements()).toHaveLength(3);
    await page.getByRole("checkbox", { name: "SKIN1004" }).click();
    await page.getByRole("checkbox", { name: "COSRX" }).click();
    await userEvent.keyboard("{Escape}");
    expect(page.getByRole("dialog", { name: "All filters" })).toBeVisible();
    expect(page.getByRole("button", { name: "Brand 2 selected" })).toBeVisible();
    expect(document.activeElement?.textContent).toContain("Brand 2 selected");
    await page.getByRole("button", { name: "View results" }).click();
    await expect.poll(() => document.querySelector("[data-drawer]")).toBeNull();
  } finally {
    root.unmount();
    document.documentElement.classList.remove("dark");
    container.remove();
  }
});
