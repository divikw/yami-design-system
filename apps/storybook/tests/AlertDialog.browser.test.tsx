import { useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";

function Demo({ controlled = false, blocked = false, disabled = false, long = false, onConfirm = () => {} }: { controlled?: boolean; blocked?: boolean; disabled?: boolean; long?: boolean; onConfirm?: () => void }) {
  const [open, setOpen] = useState(false);
  return <AlertDialog open={controlled ? open : undefined} onOpenChange={(next, details) => { if (!next && blocked) details.cancel(); else setOpen(next); }}>
    <AlertDialogTrigger render={<Button />}>Open confirmation</AlertDialogTrigger>
    <AlertDialogContent lang="en">
      <AlertDialogHeader><AlertDialogTitle>Delete address?</AlertDialogTitle><AlertDialogDescription>{long ? "This address will be permanently removed. ".repeat(150) : "This action cannot be undone."}</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={disabled} onClick={onConfirm}>Confirm</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}

function mount(element: React.ReactNode) {
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container); flushSync(() => root.render(element));
  return () => { root.unmount(); container.remove(); };
}

const dialogElement = () => document.querySelector<HTMLElement>('[role="alertdialog"]');

test("modal name, description, safe focus, focus trap, outside press, Escape and restore", async () => {
  await page.viewport(1024, 812);
  const cleanup = mount(<Demo />);
  try {
    await page.getByRole("button", { name: "Open confirmation" }).click();
    await expect.element(page.getByRole("alertdialog", { name: "Delete address?" })).toBeVisible();
    expect(dialogElement()!.getAttribute("aria-describedby")).toBeTruthy();
    await expect.poll(() => document.activeElement?.textContent).toBe("Cancel");
    await userEvent.tab(); expect(document.activeElement?.textContent).toBe("Confirm");
    await userEvent.tab(); expect(document.activeElement?.textContent).toBe("Cancel");
    await userEvent.tab({ shift: true }); expect(document.activeElement?.textContent).toBe("Confirm");
    await userEvent.click(document.querySelector('[data-slot="alert-dialog-content"]')!.parentElement!, { position: { x: 4, y: 4 } });
    expect(dialogElement()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(dialogElement).toBeNull();
    await expect.poll(() => document.activeElement?.textContent).toBe("Open confirmation");
    await page.getByRole("button", { name: "Open confirmation" }).click();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect.poll(dialogElement).toBeNull();
    await expect.poll(() => document.activeElement?.textContent).toBe("Open confirmation");
  } finally { cleanup(); }
});

test("controlled confirmation commits once; disabled actions and cancelled close requests stay open", async () => {
  const onConfirm = vi.fn();
  let cleanup = mount(<Demo controlled onConfirm={onConfirm} />);
  try {
    await page.getByRole("button", { name: "Open confirmation" }).click();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await expect.poll(dialogElement).toBeNull();
    cleanup(); cleanup = mount(<Demo controlled disabled onConfirm={onConfirm} />);
    await page.getByRole("button", { name: "Open confirmation" }).click();
    const action = page.getByRole("button", { name: "Confirm", exact: true });
    await expect.element(action).toBeDisabled();
    action.element().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onConfirm).toHaveBeenCalledTimes(1); expect(dialogElement()).not.toBeNull();
    cleanup(); cleanup = mount(<Demo controlled blocked />);
    await page.getByRole("button", { name: "Open confirmation" }).click();
    await userEvent.keyboard("{Escape}"); expect(dialogElement()).not.toBeNull();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(dialogElement()).not.toBeNull();
  } finally { cleanup(); }
});

test("PC/mobile geometry, long-message scrolling and theme-aware surfaces", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const cleanup = mount(<Demo long />);
  try {
    for (const width of [360, 375, 402, 1024]) {
      await page.viewport(width, 812);
      await page.getByRole("button", { name: "Open confirmation" }).click();
      await expect.element(page.getByRole("alertdialog")).toBeVisible();
      const dialog = dialogElement()!;
      const bounds = dialog.getBoundingClientRect();
      expect(bounds.width).toBe(Math.min(width >= 1024 ? 480 : 400, width - 32));
      expect(Math.abs(bounds.left - (width - bounds.width) / 2)).toBeLessThan(1);
      expect(bounds.top).toBeGreaterThanOrEqual(47);
      const header = dialog.querySelector<HTMLElement>('[data-slot="alert-dialog-header"]')!;
      const footer = dialog.querySelector<HTMLElement>('[data-slot="alert-dialog-footer"]')!;
      expect(getComputedStyle(header).textAlign).toBe(width >= 1024 ? "start" : "center");
      expect(dialog.querySelectorAll("button")).toHaveLength(2);
      const cancel = page.getByRole("button", { name: "Cancel", exact: true }).element();
      expect(getComputedStyle(cancel).borderRadius).toBe("9999px");
      const confirm = page.getByRole("button", { name: "Confirm", exact: true }).element();
      expect(getComputedStyle(confirm).backgroundColor).toBe("rgba(0, 0, 0, 0.87)");
      expect(dialog.querySelector('[role="group"]')).not.toBeNull();
      expect(confirm.getBoundingClientRect().height).toBe(40);
      expect(getComputedStyle(cancel, "::before").content).toBe("none");
      expect(getComputedStyle(confirm, "::before").content).toBe("none");
      if (width < 1024) expect(Math.abs(cancel.getBoundingClientRect().width - confirm.getBoundingClientRect().width)).toBeLessThan(1);
      if (width >= 1024) expect(Math.abs(confirm.getBoundingClientRect().right - (bounds.right - 24))).toBeLessThan(1);
      const top = footer.getBoundingClientRect().top;
      header.scrollTop = header.scrollHeight;
      expect(header.scrollTop).toBeGreaterThan(0);
      expect(footer.getBoundingClientRect().top).toBe(top);
      expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(765);
      expect(getComputedStyle(dialog).borderRadius).toBe("12px");
      const light = getComputedStyle(dialog).backgroundColor;
      document.documentElement.classList.add("dark");
      expect(getComputedStyle(dialog).backgroundColor).not.toBe(light);
      document.documentElement.classList.remove("dark");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect.poll(dialogElement).toBeNull();
    }
  } finally { cleanup(); document.documentElement.classList.remove("dark"); await page.viewport(viewport.width, viewport.height); }
});
