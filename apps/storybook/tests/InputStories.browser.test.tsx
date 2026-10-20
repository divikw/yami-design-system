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

test("Input exports Showcase, Playground, Compact and the inline action example beside automatic Docs", () => {
  expect(Object.keys(stories).filter((name) => name !== "default").sort()).toEqual(["Compact", "Playground", "Showcase", "WithAction"]);
});

for (const locale of ["zh", "en"]) {
  test(`${locale} Showcase preserves all states and merged boundary examples at 288px`, async () => {
    const Story = composeStory(stories.Showcase, stories.default, { initialGlobals: { locale } });
    container.style.width = "288px";
    flushSync(() => root.render(<Story />));
    const states = new Set(Array.from(container.querySelectorAll<HTMLElement>('[data-slot="input"]'), (field) => field.dataset.state));
    for (const state of ["default", "focused", "typing", "complete", "disabled-filled", "disabled-empty", "error"]) {
      expect(states.has(state)).toBe(true);
    }
    const boundaries = container.querySelector<HTMLElement>("[data-input-boundaries]")!;
    expect(boundaries).not.toBeNull();
    expect(boundaries.textContent).toContain(locale === "zh" ? "边界情况" : "Validation edges");
    const disabled = Array.from(boundaries.querySelectorAll<HTMLInputElement>("input:disabled"));
    expect(disabled).toHaveLength(2);
    for (const input of disabled) expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(new Set(disabled.map((input) => input.closest('[data-slot="input"]')!.getAttribute("data-density")))).toEqual(new Set(["default", "compact"]));
    const longMessages = Array.from(boundaries.querySelectorAll<HTMLElement>('span[class*="helperText"], span[class*="errorText"]')).filter((element) => element.textContent!.startsWith("https://example.com/"));
    expect(longMessages).toHaveLength(2);
    for (const message of longMessages) expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
    for (const field of container.querySelectorAll('[data-slot="input"]')) {
      expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(container.getBoundingClientRect().right + 0.5);
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
