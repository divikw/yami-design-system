import { StrictMode, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
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
    const select = container.querySelector<HTMLSelectElement>("select")!;
    select.value = "custom";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await expect.element(page.getByRole("textbox", { name: "Mask quantity: enter quantity" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(container.querySelector("dialog[open]")).not.toBeNull();
    expect(select.value).toBe("1");
    await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(container.querySelector("dialog[open]")).toBeNull();
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
