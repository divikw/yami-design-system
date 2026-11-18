import { StrictMode, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@yami/design-system";
import { DialogExample } from "../../../packages/design-system/components/Dialog/examples";
import "@yami/design-system/tokens.css";

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog
        open={open}
        title="Confirm settings"
        closeLabel="Close confirmation"
        onClose={() => setOpen(false)}
        footer={<><button>Cancel</button><button>Confirm</button></>}
      >
        <input aria-label="Name" />
        {Array.from({ length: 30 }, (_, index) => <p key={index}>Content {index}</p>)}
      </Dialog>
    </>
  );
}

function ConfirmationDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      title="Confirm settings"
      variant="confirmation"
      onClose={() => setOpen(false)}
      footer={<><button>Cancel</button><button>Confirm</button></>}
    >
      Apply the current settings?
    </Dialog>
  );
}

test("Dialog stays centered, scrolls its body, traps focus and restores the opener", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const originalOverflow = document.documentElement.style.overflow;
  try {
    flushSync(() => root.render(<StrictMode><Demo /></StrictMode>));
    for (const width of [375, 1023, 1024, 1440]) {
      await page.viewport(width, 812);
      await page.getByRole("button", { name: "Open dialog" }).click();
      const dialog = document.querySelector<HTMLElement>("[data-dialog]")!;
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      const bounds = dialog.getBoundingClientRect();
      expect(bounds.width).toBe(width === 375 ? 343 : 400);
      expect(Math.abs(bounds.left - (innerWidth - bounds.width) / 2)).toBeLessThan(1);
      expect(Math.abs(bounds.top - (innerHeight - bounds.height) / 2)).toBeLessThan(1);
      expect(bounds.top).toBeGreaterThanOrEqual(48);
      const header = dialog.querySelector<HTMLElement>('[data-slot="dialog-header"]')!;
      const title = dialog.querySelector<HTMLHeadingElement>("h2")!;
      expect(getComputedStyle(title).fontSize).toBe(width >= 1024 ? "24px" : "20px");
      expect(getComputedStyle(header).borderBottomWidth).toBe("0px");
      const close = dialog.querySelector<HTMLButtonElement>("button")!;
      const icon = close.querySelector<HTMLImageElement>("img")!;
      expect(close.getBoundingClientRect().width).toBe(24);
      expect(close.getBoundingClientRect().height).toBe(24);
      expect(icon.getBoundingClientRect().width).toBe(24);
      expect(icon.getBoundingClientRect().height).toBe(24);
      expect(title.getBoundingClientRect().top).toBeGreaterThan(close.getBoundingClientRect().bottom);
      expect(getComputedStyle(header).paddingTop).toBe("12px");
      expect(icon.getBoundingClientRect().top - bounds.top).toBe(12);
      expect(bounds.right - icon.getBoundingClientRect().right).toBe(width < 1024 ? 16 : 24);
      expect(getComputedStyle(close, "::before").width).toBe("44px");
      await expect.poll(() => document.activeElement).toBe(close);
      await userEvent.tab();
      expect(document.activeElement?.getAttribute("aria-label")).toBe("Name");
      await userEvent.tab();
      expect(document.activeElement?.textContent).toBe("Cancel");
      await userEvent.tab();
      expect(document.activeElement?.textContent).toBe("Confirm");
      await userEvent.tab();
      await expect.poll(() => document.activeElement).toBe(close);
      const content = dialog.querySelector<HTMLElement>("[data-dialog-content]")!;
      const footer = dialog.querySelector<HTMLElement>('[data-slot="dialog-footer"]')!;
      const inset = width >= 1024 ? "24px" : "16px";
      expect(getComputedStyle(header).paddingLeft).toBe(inset);
      expect(getComputedStyle(content).paddingInline).toBe(inset);
      expect(getComputedStyle(header).paddingBottom).toBe("8px");
      expect(getComputedStyle(content).paddingBlock).toBe("8px");
      expect(getComputedStyle(footer).paddingTop).toBe("16px");
      expect(getComputedStyle(footer).paddingBottom).toBe(width >= 1024 ? "20px" : "16px");
      const footerTop = footer.getBoundingClientRect().top;
      content.scrollTop = content.scrollHeight;
      expect(content.scrollTop).toBeGreaterThan(100);
      expect(footer.getBoundingClientRect().top).toBe(footerTop);
      expect(getComputedStyle(document.body).overflow).toBe("hidden");
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => document.querySelector("[data-dialog]")).toBeNull();
      await expect.poll(() => document.activeElement?.textContent).toBe("Open dialog");
      expect(document.documentElement.style.overflow).toBe(originalOverflow);
    }
  } finally {
    root.unmount();
    container.remove();
    document.documentElement.style.overflow = originalOverflow;
    await page.viewport(viewport.width, viewport.height);
  }
});

test("Dialog dismisses the backdrop and supports alertdialog semantics", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(
      <Dialog open title="Delete item" closeLabel="Close warning" onClose={() => root.render(null)} role="alertdialog">
        This action cannot be undone.
      </Dialog>
    ));
    const dialog = document.querySelector<HTMLElement>("[data-dialog]")!;
    expect(dialog.getAttribute("role")).toBe("alertdialog");
    await userEvent.click(dialog.parentElement!, { position: { x: 4, y: 4 } });
    await expect.poll(() => document.querySelector("[data-dialog]")).toBeNull();
  } finally {
    root.unmount();
    container.remove();
  }
});

test("Confirmation dialog centers its title, omits Close and focuses the first action", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<ConfirmationDemo />));
    const dialog = document.querySelector<HTMLElement>('[data-dialog][data-variant="confirmation"]')!;
    const body = dialog.querySelector<HTMLElement>('[data-slot="dialog-body"]')!;
    const content = body.querySelector<HTMLElement>("[data-dialog-content]")!;
    const footer = dialog.querySelector<HTMLElement>('[data-slot="dialog-footer"]')!;
    const title = dialog.querySelector("h2")!;
    expect(getComputedStyle(title).fontSize).toBe("16px");
    expect(getComputedStyle(title).textAlign).toBe("center");
    expect(body.querySelector('[data-slot="dialog-header"]')).not.toBeNull();
    expect(getComputedStyle(content).textAlign).toBe("center");
    expect(getComputedStyle(body).gap).toBe("8px");
    expect(getComputedStyle(body).paddingRight).toBe("12px");
    expect(getComputedStyle(body).paddingBottom).toBe("8px");
    expect(getComputedStyle(body).paddingLeft).toBe("12px");
    expect(getComputedStyle(footer).borderTopWidth).toBe("0px");
    expect(getComputedStyle(footer).paddingTop).toBe("12px");
    expect(getComputedStyle(footer).paddingRight).toBe("12px");
    expect(getComputedStyle(footer).paddingBottom).toBe("12px");
    expect(getComputedStyle(footer).paddingLeft).toBe("12px");
    expect(dialog.querySelector('[data-slot="dialog-header"] button')).toBeNull();
    await expect.poll(() => document.activeElement?.textContent).toBe("Cancel");
  } finally {
    root.unmount();
    container.remove();
  }
});

test("controlled close requests do not dismiss until the host updates open", async () => {
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  let requests = 0;
  try {
    flushSync(() => root.render(<Dialog open title="Pending save" closeLabel="Close" onClose={() => { requests += 1; }}>Saving</Dialog>));
    await page.getByRole("button", { name: "Close", exact: true }).click();
    expect(requests).toBe(1);
    await expect.element(page.getByRole("dialog", { name: "Pending save" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    expect(requests).toBe(2);
    await expect.element(page.getByRole("dialog", { name: "Pending save" })).toBeVisible();
  } finally { root.unmount(); container.remove(); }
});

function NestedDialogs() {
  const [outer, setOuter] = useState(false);
  const [inner, setInner] = useState(false);
  return <>
    <button onClick={() => setOuter(true)}>Open outer</button>
    <Dialog open={outer} title="Outer" closeLabel="Close outer" onClose={() => setOuter(false)}>
      <button onClick={() => setInner(true)}>Open inner</button>
      <Dialog open={inner} title="Inner" closeLabel="Close inner" onClose={() => setInner(false)}>Nested content</Dialog>
    </Dialog>
  </>;
}

test("nested dialogs dismiss only the top layer and restore focus through both layers", async () => {
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<NestedDialogs />));
    await page.getByRole("button", { name: "Open outer", exact: true }).click();
    await page.getByRole("button", { name: "Open inner", exact: true }).click();
    await expect.element(page.getByRole("dialog", { name: "Inner", exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelectorAll('[data-dialog]').length).toBe(1);
    await expect.poll(() => document.activeElement?.textContent).toBe("Open inner");
    expect(getComputedStyle(document.body).overflow).toBe("hidden");
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector('[data-dialog]')).toBeNull();
    await expect.poll(() => document.activeElement?.textContent).toBe("Open outer");
  } finally { root.unmount(); container.remove(); }
});


test("Dialog example uses 40px pill actions with equal mobile widths and right-aligned desktop actions", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<DialogExample locale="en" />));
    for (const width of [375, 1024]) {
      await page.viewport(width, 812);
      await page.getByRole("button", { name: "Edit nickname", exact: true }).click();
      const popup = document.querySelector<HTMLElement>("[data-dialog]")!;
      const group = popup.querySelector<HTMLElement>('[data-slot="button-group"]')!;
      const buttons = [...group.querySelectorAll<HTMLButtonElement>("button")];
      for (const button of buttons) {
        expect(button.getBoundingClientRect().height).toBe(40);
        expect(parseFloat(getComputedStyle(button).borderRadius)).toBeGreaterThanOrEqual(20);
      }
      const first = buttons[0].getBoundingClientRect();
      const last = buttons[1].getBoundingClientRect();
      expect(Math.abs(group.getBoundingClientRect().right - last.right)).toBeLessThan(1);
      if (width === 375) expect(Math.abs(first.width - last.width)).toBeLessThan(1);
      else expect(first.left).toBeGreaterThan(group.getBoundingClientRect().left);
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect.poll(() => document.querySelector("[data-dialog]")).toBeNull();
    }
  } finally { root.unmount(); container.remove(); await page.viewport(viewport.width, viewport.height); }
});

test("a composed dialog names and describes the popup, focuses the custom close action and restores its trigger", async () => {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  const changes: boolean[] = [];
  try {
    flushSync(() => root.render(
      <Dialog onOpenChange={(open) => changes.push(open)}>
        <DialogTrigger>Pickup information</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader><DialogTitle>Pickup</DialogTitle><DialogDescription>Bring your order number.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose render={<button />}>Done</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>,
    ));
    const trigger = page.getByRole("button", { name: "Pickup information" });
    await trigger.click();
    const popup = page.getByRole("dialog", { name: "Pickup" });
    await expect.element(popup).toHaveAccessibleDescription("Bring your order number.");
    expect(popup.element().querySelectorAll("button")).toHaveLength(1);
    expect(getComputedStyle(popup.element().querySelector("header")!).paddingTop).toBe("20px");
    const done = page.getByRole("button", { name: "Done" });
    await expect.element(done).toHaveFocus();
    await done.click();
    await expect.element(trigger).toHaveFocus();
    expect(changes).toEqual([true, false]);
  } finally { root.unmount(); host.remove(); }
});

test("defaultOpen and footer Close work without a state owner", async () => {
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<Dialog defaultOpen>
      <DialogContent closeLabel="Dismiss">
        <DialogHeader><DialogTitle>Delivery</DialogTitle></DialogHeader>
        <DialogFooter showCloseButton closeLabel="Return" />
      </DialogContent>
    </Dialog>));
    await expect.element(page.getByRole("button", { name: "Dismiss" })).toHaveFocus();
    await page.getByRole("button", { name: "Return" }).click();
    await expect.poll(() => document.querySelector("[data-dialog]")).toBeNull();
  } finally { root.unmount(); host.remove(); }
});
