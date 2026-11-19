import { useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Checkbox, RadioGroup, RadioGroupItem } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";

test("Base UI adapters preserve mixed selection, cancellation, form values and reset", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const changes: boolean[] = [];
  function Form() {
    const [mixed, setMixed] = useState(true);
    const [checked, setChecked] = useState(false);
    return <form>
      <Checkbox aria-label="Mixed" name="mixed" checked={checked} indeterminate={mixed}
        onCheckedChange={(value) => { changes.push(value); setMixed(false); setChecked(value); }} />
      <Checkbox aria-label="Saved" name="saved" value="yes" defaultChecked />
      <Checkbox aria-label="Canceled" name="canceled" onCheckedChange={(_, details) => details.cancel()} />
      <Checkbox aria-label="Read only" name="readonly" defaultChecked readOnly />
      <Checkbox aria-label="Disabled" name="disabled" defaultChecked disabled />
      <RadioGroup aria-label="Shipping" name="shipping" defaultValue="standard">
        <label htmlFor="shipping-standard">Standard delivery</label>
        <RadioGroupItem id="shipping-standard" aria-label="Standard" value="standard" />
        <RadioGroupItem aria-label="Unavailable" value="unavailable" disabled />
        <label htmlFor="shipping-express">Express delivery</label>
        <RadioGroupItem id="shipping-express" aria-label="Express" value="express" />
      </RadioGroup>
    </form>;
  }
  try {
    flushSync(() => root.render(<Form />));
    expect(container.querySelectorAll('[data-slot="radio-group-item"]')).toHaveLength(3);
    const form = container.querySelector("form")!;
    const data = () => Object.fromEntries(new FormData(form));
    const mixed = page.getByRole("checkbox", { name: "Mixed", exact: true });
    await expect.element(mixed).toHaveAttribute("aria-checked", "mixed");
    expect(data()).toEqual({ saved: "yes", readonly: "on", shipping: "standard" });
    await mixed.click();
    expect(changes).toEqual([true]);
    await expect.element(mixed).toHaveAttribute("aria-checked", "true");
    await page.getByRole("checkbox", { name: "Canceled", exact: true }).click();
    await page.getByRole("checkbox", { name: "Read only", exact: true }).click();
    expect(data()).toEqual({ mixed: "on", saved: "yes", readonly: "on", shipping: "standard" });
    await page.getByRole("checkbox", { name: "Saved", exact: true }).click();
    await page.getByText("Express delivery", { exact: true }).click();
    expect(data().shipping).toBe("express");
    await userEvent.keyboard("{ArrowUp}");
    expect(data().shipping).toBe("standard");
    await userEvent.keyboard("{ArrowUp}");
    expect(data().shipping).toBe("express");
    form.reset();
    await expect.poll(data).toEqual({ saved: "yes", readonly: "on", shipping: "standard" });
  } finally {
    root.unmount(); container.remove();
  }
});

for (const theme of ["light", "dark"]) {
  test.each([375, 1280])(`${theme} selection controls keep default and compact pointer targets and accept edge clicks at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
    container.style.cssText = "display:grid; justify-items:start; padding:24px; gap:24px";
    container.className = theme === "dark" ? "dark" : "";
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(width, 812);
      flushSync(() => root.render(<>
        <label><Checkbox aria-label="Select item" /><span>Select item label</span></label>
        <RadioGroup aria-label="Delivery" defaultValue="standard">
          <RadioGroupItem value="standard" aria-label="Standard" />
          <RadioGroupItem value="express" aria-label="Express" />
        </RadioGroup>
        <Checkbox density="compact" aria-label="Select table row" />
      </>));
      const controls = Array.from(container.querySelectorAll<HTMLElement>('[role="checkbox"], [role="radio"]'));
      for (const control of controls) {
        const bounds = control.getBoundingClientRect();
        const surface = getComputedStyle(control, "::before");
        const target = width >= 1024 ? 32 : 40;
        const extension = (target - 20) / 2;
        expect([bounds.width, bounds.height]).toEqual([20, 20]);
        expect([surface.width, surface.height, surface.inset]).toEqual(["18px", "18px", "1px"]);
        const hit = getComputedStyle(control, "::after");
        expect([hit.width, hit.height]).toEqual([`${target}px`, `${target}px`]);
        for (const [x, y] of [[2, 2], [target - 2, 2], [2, target - 2], [target - 2, target - 2]]) {
          expect(document.elementFromPoint(bounds.left - extension + x, bounds.top - extension + y)).toBe(control);
        }
        control.focus();
        await userEvent.keyboard("{Shift}");
        expect(getComputedStyle(control, "::before").outlineWidth).toBe("2px");
        expect(getComputedStyle(control).outlineWidth).toBe("0px");
      }
      const [checkbox, standard, express] = controls;
      expect(standard.getBoundingClientRect().bottom).toBeLessThanOrEqual(express.getBoundingClientRect().top);
      const bounds = checkbox.getBoundingClientRect();
      await page.elementLocator(container).click({ position: {
        x: bounds.left - container.getBoundingClientRect().left - 4,
        y: bounds.top - container.getBoundingClientRect().top - 4,
      } });
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
      expect(getComputedStyle(checkbox, "::before").outlineStyle).toBe("none");
      await userEvent.keyboard("{Space}");
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
      expect(getComputedStyle(checkbox, "::before").outlineStyle).toBe("solid");
      await page.elementLocator(checkbox).click();
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
      expect(getComputedStyle(checkbox, "::before").outlineStyle).toBe("none");
      await userEvent.keyboard("{Space}");
      expect(getComputedStyle(checkbox, "::before").outlineStyle).toBe("solid");
      await page.getByText("Select item label", { exact: true }).click();
      expect(checkbox.getAttribute("aria-checked")).toBe("true");
      expect(getComputedStyle(checkbox, "::before").outlineStyle).toBe("none");
      const radioBounds = express.getBoundingClientRect();
      await page.elementLocator(container).click({ position: {
        x: radioBounds.right - container.getBoundingClientRect().left + 3,
        y: radioBounds.bottom - container.getBoundingClientRect().top + 3,
      } });
      expect(express.getAttribute("aria-checked")).toBe("true");
      expect(standard.getAttribute("aria-checked")).toBe("false");
      await userEvent.keyboard("{ArrowUp}");
      expect(standard.getAttribute("aria-checked")).toBe("true");
      expect(express.getAttribute("aria-checked")).toBe("false");
    } finally {
      root.unmount(); container.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}
