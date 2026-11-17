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
  test.each([375, 1280])(`${theme} selection controls reserve 40px targets and accept edge clicks at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const container = document.createElement("div");
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
      </>));
      const controls = Array.from(container.querySelectorAll<HTMLElement>('[role="checkbox"], [role="radio"]'));
      for (const control of controls) {
        const bounds = control.getBoundingClientRect();
        const surface = getComputedStyle(control, "::before");
        expect([bounds.width, bounds.height]).toEqual([40, 40]);
        expect([surface.width, surface.height, surface.inset]).toEqual(["20px", "20px", "10px"]);
        for (const [x, y] of [[2, 2], [38, 2], [2, 38], [38, 38]]) {
          expect(document.elementFromPoint(bounds.left + x, bounds.top + y)).toBe(control);
        }
        control.focus();
        await userEvent.keyboard("{Shift}");
        expect(getComputedStyle(control, "::before").outlineWidth).toBe("2px");
        expect(getComputedStyle(control).outlineWidth).toBe("0px");
      }
      const [checkbox, standard, express] = controls;
      expect(standard.getBoundingClientRect().bottom).toBeLessThanOrEqual(express.getBoundingClientRect().top);
      await page.elementLocator(checkbox).click({ position: { x: 2, y: 2 } });
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
      await page.elementLocator(express).click({ position: { x: 38, y: 38 } });
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
