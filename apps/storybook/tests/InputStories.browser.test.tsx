import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { composeStory } from "@storybook/react-vite";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as stories from "../../../packages/design-system/components/Input/Input.stories";
import "@yami/design-system/tokens.css";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  root.unmount();
  container.remove();
});

test("Input provides PC and Mobile previews alongside the examples embedded in Docs", () => {
  expect(Object.keys(stories).filter((name) => name !== "default").sort()).toEqual(["Compact", "CompactStates", "ExternalValidation", "MobilePreview", "PCPreview", "Playground", "Showcase", "Specifications", "WithAction"]);
});

for (const locale of ["zh", "en"]) {
  test(`${locale} Showcase displays all states and validation edges at each density at 288px`, async () => {
    const Story = composeStory(stories.Showcase, stories.default, { initialGlobals: { locale } });
    container.style.width = "288px";
    flushSync(() => root.render(<Story />));
    for (const density of ["default", "compact"]) {
      const panel = container.querySelector<HTMLElement>(`[data-input-state-density="${density}"]`)!;
      const fields = [...panel.querySelectorAll<HTMLElement>('[data-slot="input"]')];
      const states = new Set(fields.map(field => field.dataset.state));
      for (const state of ["default", "focused", "typing", "complete", "disabled-filled", "disabled-empty", "error"]) {
        expect(states.has(state)).toBe(true);
      }
      for (const field of fields) {
        expect(field.dataset.density).toBe(density);
        expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(container.getBoundingClientRect().right + 0.5);
      }
      expect(panel.querySelector('input[readonly]')).not.toBeNull();
      const boundaries = panel.querySelector<HTMLElement>("[data-input-boundaries]")!;
      expect(boundaries.textContent).toContain(locale === "zh" ? "边界情况" : "Validation edges");
      const disabled = boundaries.querySelector<HTMLInputElement>("input:disabled");
      expect(disabled?.getAttribute("aria-invalid")).toBe("true");
      const longMessages = Array.from(boundaries.querySelectorAll<HTMLElement>('span[class*="helperText"], span[class*="errorText"]')).filter((element) => element.textContent!.includes("https://example.com/"));
      expect(longMessages).toHaveLength(2);
      for (const message of longMessages) {
        const style = getComputedStyle(message);
        expect(style.fontSize).toBe("12px");
        expect(style.lineHeight).toBe("14px");
        expect(style.marginBlockStart).toBe("4px");
        expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
      }
    }
  });

  test(`${locale} Playground has one input with a localized label and operation hint`, async () => {
    const Story = composeStory(stories.Playground, stories.default, { initialGlobals: { locale } });
    flushSync(() => root.render(<Story />));
    const english = locale === "en";
    const section = container.querySelector("[data-input-controls]")!;
    expect(section.children[0].textContent).toBe(english ? "Try the input" : "试用输入框");
    expect(section.children[1].textContent).toBe(english ? "Change properties in the Controls panel below to see how this input responds." : "在下方 Controls 中调整属性，查看这个输入框的变化。");
    await expect.element(page.elementLocator(section.querySelector("input")!)).toHaveAccessibleName(english ? "Name" : "姓名");
    expect(container.querySelectorAll('[data-slot="input"]')).toHaveLength(1);
    expect(container.querySelector('button[type="reset"]')).toBeNull();
  });

  test(`${locale} Playground applies Controls props and clearing to its single input`, async () => {
    const Story = composeStory(stories.Playground, stories.default, { initialGlobals: { locale } });
    const render = (clearable: boolean, disabled = false) => flushSync(() => root.render(<Story label="Custom label" defaultValue="Keep me" clearable={clearable} disabled={disabled} density="compact" />));
    render(false);
    expect(container.querySelectorAll("input")).toHaveLength(1);
    const primary = container.querySelector<HTMLInputElement>("[data-input-controls] input")!;
    expect(primary).not.toBeNull();
    await expect.element(page.elementLocator(primary)).toHaveAccessibleName("Custom label");
    expect(primary.closest('[data-slot="input"]')!.getAttribute("data-density")).toBe("compact");
    await userEvent.click(primary);
    expect(container.querySelector('button[aria-label="Clear input"]')).toBeNull();
    render(true);
    expect(primary.value).toBe("Keep me");
    await userEvent.click(container.querySelector('button[aria-label="Clear input"]')!);
    expect(primary.value).toBe("");
    expect(document.activeElement).toBe(primary);
    render(true, true);
    expect(primary.disabled).toBe(true);
    expect(container.querySelector('button[aria-label="Clear input"]')).toBeNull();
  });
}
