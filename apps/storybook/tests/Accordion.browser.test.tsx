import { createRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";

function StatefulContent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
}

test("Accordion uses Base UI's controlled values and change details", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const onValueChange = vi.fn();
  const render = (value: string[]) => flushSync(() => root.render(
    <Accordion multiple value={value} onValueChange={onValueChange}>
      <AccordionItem value="specifications">
        <AccordionTrigger>Specifications</AccordionTrigger>
        <AccordionContent>Pack size</AccordionContent>
      </AccordionItem>
      <AccordionItem value="ingredients">
        <AccordionTrigger>Ingredients</AccordionTrigger>
        <AccordionContent className={(state) => state.open ? "open-panel" : undefined}>Ingredient list</AccordionContent>
      </AccordionItem>
    </Accordion>,
  ));

  try {
    render(["specifications"]);
    const first = page.getByRole("button", { name: "Specifications", exact: true });
    const second = page.getByRole("button", { name: "Ingredients", exact: true });
    expect(container.querySelectorAll('[data-slot="accordion-content"]')).toHaveLength(1);
    await second.click();
    expect(onValueChange).toHaveBeenCalledWith(
      ["specifications", "ingredients"],
      expect.objectContaining({ reason: "trigger-press" }),
    );
    await expect.element(second).toHaveAttribute("aria-expanded", "false");

    render(["specifications", "ingredients"]);
    await expect.element(first).toHaveAttribute("aria-expanded", "true");
    await expect.element(second).toHaveAttribute("aria-expanded", "true");
    await expect.element(page.getByRole("region", { name: "Ingredients" })).toHaveClass("open-panel");
  } finally {
    root.unmount();
    container.remove();
  }
});

for (const theme of ["light", "dark"]) {
  test.each([375, 1440])(`${theme} Accordion preserves geometry, root props and mounted content at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    const wasDark = document.documentElement.classList.contains("dark");
    const container = document.createElement("div");
    document.body.append(container);
    document.documentElement.classList.toggle("dark", theme === "dark");
    const root = createRoot(container);
    const ref = createRef<HTMLDivElement>();
    try {
      await page.viewport(width, 900);
      flushSync(() => root.render(<>
        <Accordion id="details" ref={ref} className="consumer-class" style={{ maxWidth: 656 }} data-consumer="retained" multiple defaultValue={["specifications", "disabled"]} keepMounted>
          <AccordionItem value="specifications" id="specifications">
            <AccordionTrigger id="specifications-trigger">Specifications</AccordionTrigger>
            <AccordionContent id="specifications-content"><StatefulContent /></AccordionContent>
          </AccordionItem>
          <AccordionItem value="disabled" disabled>
            <AccordionTrigger>Disabled open</AccordionTrigger>
            <AccordionContent>Still visible</AccordionContent>
          </AccordionItem>
        </Accordion>
        <button>After panels</button>
      </>));
      const element = ref.current!;
      const trigger = page.getByRole("button", { name: "Specifications", exact: true });
      const panel = container.querySelector<HTMLElement>("#specifications-content")!;
      expect(element).toBe(container.firstElementChild);
      const item = element.firstElementChild!;
      expect(item.children.length).toBe(2);
      expect(item.firstElementChild?.tagName).toBe("H3");
      expect(element.classList.contains("consumer-class")).toBe(true);
      expect(element.dataset.consumer).toBe("retained");
      expect(element.style.maxWidth).toBe("656px");
      expect(trigger.element().id).toBe("specifications-trigger");
      await expect.element(trigger).toHaveAttribute("aria-controls", panel.id);
      expect(panel.getAttribute("aria-labelledby")).toBe(trigger.element().id);
      expect(trigger.element().getBoundingClientRect().height).toBe(44);
      expect(getComputedStyle(item.firstElementChild!).fontSize).toBe("16px");
      expect(getComputedStyle(item).paddingTop).toBe(width < 1024 ? "0px" : "4px");
      expect(getComputedStyle(panel).paddingBottom).toBe(width < 1024 ? "0px" : "12px");
      expect(getComputedStyle(panel).marginBottom).toBe(width < 1024 ? "12px" : "0px");
      expect(getComputedStyle(item.nextElementSibling!).borderTopWidth).toBe("1px");
      expect(getComputedStyle(element.querySelector('[data-slot="accordion-icon"]')!).width).toBe("16px");
      await page.getByRole("button", { name: "Count 0", exact: true }).click();
      await trigger.click();
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
      expect(item.hasAttribute("data-open")).toBe(false);
      expect(panel.hidden).toBe(true);
      expect(panel.textContent).toBe("Count 1");
      await userEvent.tab();
      await expect.element(page.getByRole("button", { name: "After panels", exact: true })).toHaveFocus();
      await trigger.click();
      await expect.element(page.getByRole("button", { name: "Count 1", exact: true })).toBeVisible();
      const disabled = page.getByRole("button", { name: "Disabled open", exact: true });
      await expect.element(disabled).toBeDisabled();
      expect(getComputedStyle(disabled.element()).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      await expect.element(page.getByRole("region", { name: "Disabled open", exact: true })).toBeVisible();
    } finally {
      root.unmount();
      container.remove();
      document.documentElement.classList.toggle("dark", wasDark);
      await page.viewport(viewport.width, viewport.height);
    }
  });
}
