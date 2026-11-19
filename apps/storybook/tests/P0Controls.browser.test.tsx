import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createRef, useRef, useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, Drawer, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Popover, PopoverTrigger, PopoverContent, PopoverTitle } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";

function NestedPopover() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return <Drawer open title="Outer drawer" closeLabel="Close drawer" onClose={() => { throw new Error("Inner Escape must not close the drawer"); }}>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={trigger}>Open details</PopoverTrigger>
      <PopoverContent><PopoverTitle>Inner details</PopoverTitle><Button variant="secondary">Inner action</Button></PopoverContent>
    </Popover>
  </Drawer>;
}

test("Select preserves cancellation, external form ownership and controlled reset behavior", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const inputRef = createRef<HTMLInputElement>();
  let cancelChange = true;
  let cancelReset = true;
  const items = [{ value: "standard", label: "Standard" }, { value: "express", label: "Express" }];
  try {
    flushSync(() => root.render(<>
      <form id="select-reset-form" onReset={(event) => { if (cancelReset) event.preventDefault(); }} />
      <Select form="select-reset-form" name="delivery" defaultValue="standard" inputRef={inputRef} items={items}
        onValueChange={(_, details) => { if (cancelChange) details.cancel(); }}>
        <SelectTrigger aria-label="Delivery"><SelectValue /></SelectTrigger>
        <SelectContent>{items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
      </Select>
      <Select form="select-reset-form" name="controlled" value="express" items={items}>
        <SelectTrigger aria-label="Controlled"><SelectValue /></SelectTrigger>
      </Select>
    </>));
    const form = container.querySelector("form")!;
    const trigger = page.getByRole("combobox", { name: "Delivery", exact: true });
    expect(inputRef.current?.form).toBe(form);
    await trigger.click();
    await page.getByRole("option", { name: "Express", exact: true }).click();
    await expect.element(trigger).toHaveTextContent("Standard");
    cancelChange = false;
    if (trigger.element().getAttribute("aria-expanded") !== "true") await trigger.click();
    await page.getByRole("option", { name: "Express", exact: true }).click();
    await expect.element(trigger).toHaveTextContent("Express");
    form.reset();
    await expect.element(trigger).toHaveTextContent("Express");
    cancelReset = false;
    form.reset();
    await expect.poll(() => Object.fromEntries(new FormData(form))).toEqual({ delivery: "standard", controlled: "express" });
    await expect.element(trigger).toHaveTextContent("Standard");
  } finally { root.unmount(); container.remove(); }
});

test("Escape dismisses a nested popover before its parent drawer", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<NestedPopover />));
    const trigger = page.getByRole("button", { name: "Open details", exact: true });
    await trigger.click();
    await expect.element(page.getByRole("dialog", { name: "Inner details", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Inner action", exact: true }).click();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.element(page.getByRole("dialog", { name: "Outer drawer", exact: true })).toBeVisible();
  } finally { root.unmount(); container.remove(); }
});

for (const theme of ["light", "dark"]) {
  test.each([375, 1440])(`${theme} P0 controls preserve form state, keyboard selection and popover dismissal at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const wasDark = document.documentElement.classList.contains("dark");
    const container = document.createElement("div");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(<form>
        <Switch name="enabled" aria-label="Enabled" defaultChecked />
        <Switch name="locked" aria-label="Locked" defaultChecked disabled />
        <Switch name="readonly" aria-label="Read only" defaultChecked readOnly />
        <Switch name="canceled" aria-label="Canceled" onCheckedChange={(_, details) => details.cancel()} />
        <Select name="delivery" defaultValue="standard" items={[{ value: "standard", label: "Standard" }, { value: "disabled", label: "Unavailable", disabled: true }, { value: "express", label: "Express" }]}>
          <SelectTrigger aria-label="Delivery"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="disabled" disabled>Unavailable</SelectItem><SelectItem value="express">Express</SelectItem></SelectContent>
        </Select>
        <Popover><PopoverTrigger render={<Button variant="secondary" />}>Details</PopoverTrigger><PopoverContent><PopoverTitle>Delivery details</PopoverTitle><Button variant="secondary">Inside</Button></PopoverContent></Popover>
        <Button variant="secondary">Outside</Button>
      </form>));
      const form = container.querySelector("form")!;
      const values = () => Object.fromEntries(new FormData(form));
      expect(values()).toEqual({ enabled: "on", readonly: "on", delivery: "standard" });
      const enabled = page.getByRole("switch", { name: "Enabled", exact: true });
      expect(enabled.element().getBoundingClientRect().height).toBe(32);
      await enabled.click();
      await page.getByRole("switch", { name: "Read only", exact: true }).click();
      await page.getByRole("switch", { name: "Canceled", exact: true }).click();
      expect(values()).toEqual({ readonly: "on", delivery: "standard" });
      const trigger = page.getByRole("combobox", { name: "Delivery" });
      expect(trigger.element().getBoundingClientRect().height).toBe(40);
      await trigger.click();
      await expect.element(page.getByRole("option", { name: "Standard", exact: true })).toBeVisible();
      expect(page.getByRole("option", { name: "Standard", exact: true }).element().getBoundingClientRect().height).toBe(32);
      await expect.element(page.getByRole("option", { name: "Standard", exact: true })).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      // Base UI keeps disabled options focusable so keyboard users can discover them.
      await expect.element(page.getByRole("option", { name: "Unavailable", exact: true })).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
      expect(values().delivery).toBe("standard");
      await userEvent.keyboard("{ArrowDown}");
      await expect.element(page.getByRole("option", { name: "Express", exact: true })).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect.element(trigger).toHaveTextContent("Express");
      expect(values().delivery).toBe("express");
      form.reset();
      await expect.poll(values).toEqual({ enabled: "on", readonly: "on", delivery: "standard" });
      const details = page.getByRole("button", { name: "Details", exact: true });
      await details.click();
      const panel = page.getByRole("dialog", { name: "Delivery details" });
      await expect.element(panel).toBeVisible();
      expect(getComputedStyle(panel.element()).padding).toBe("12px");
      const box = panel.element().getBoundingClientRect();
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
      await userEvent.keyboard("{Escape}");
      await expect.element(details).toHaveFocus();
      await details.click();
      await page.getByRole("button", { name: "Outside", exact: true }).click();
      await expect.element(details).toHaveAttribute("aria-expanded", "false");
    } finally { root.unmount(); container.remove(); document.documentElement.classList.toggle("dark", wasDark); await page.viewport(viewport.width, viewport.height); }
  });
}
