import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { QuantitySelect } from "../../../packages/design-system/components/QuantitySelect";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

test("QuantitySelect matches the source cart pill while preserving its native target and keyboard focus", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const props = { value: 1, max: 10000, label: "Mask quantity", locale: "en" as const, onValueChange: () => {} };
  try {
    for (const width of [375, 1440]) {
      await page.viewport(width, 812);
      flushSync(() => root.render(<QuantitySelect key={width} {...props} />));
      const select = container.querySelector("select")!;
      const display = container.querySelector<HTMLElement>('[data-slot="quantity-select-display"]')!;
      const rect = display.getBoundingClientRect();
      const target = select.getBoundingClientRect();
      expect(rect.width).toBe(60);
      expect(rect.height).toBe(24);
      expect(target.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(rect.top + rect.height / 2 - target.top - target.height / 2)).toBeLessThan(1);
      expect(document.elementFromPoint(target.left + 2, target.top + 2)).toBe(select);
      expect(document.elementFromPoint(target.right - 2, target.bottom - 2)).toBe(select);
      expect(getComputedStyle(display).borderRadius).toBe("9999px");
      await userEvent.tab();
      await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toHaveFocus();
      expect(getComputedStyle(display).outlineWidth).toBe("2px");
      expect(getComputedStyle(display).outlineOffset).toBe("2px");
    }
    flushSync(() => root.render(<QuantitySelect {...props} value={10000} />));
    expect(container.querySelector('[data-slot="quantity-select-display"]')!.textContent).toBe("10000");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
    flushSync(() => root.render(<QuantitySelect {...props} disabled />));
    await expect.element(page.getByRole("combobox", { name: "Mask quantity" })).toBeDisabled();
    expect(getComputedStyle(container.querySelector('[data-slot="quantity-select-display"]')!).opacity).toBe("1");
  } finally {
    root.unmount(); container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
