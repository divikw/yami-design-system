import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Checkbox, RadioGroup, RadioGroupItem } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";

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
        <Checkbox aria-label="Select item" />
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
      await userEvent.keyboard("{Space}");
      expect(checkbox.getAttribute("aria-checked")).toBe("false");
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
