import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxInput,
  ComboboxItem, ComboboxList, ComboboxValue, Field, FieldError, Input, Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue, type FieldDensity,
} from "@yami/design-system";
import "@yami/design-system/tokens.css";

const methods = [{ value: "standard", label: "Standard" }, { value: "express", label: "Express" }];
const cities = ["Tokyo", "Seoul", "Shanghai"];

function textInset(control: Element, label: Element) {
  const range = document.createRange();
  range.selectNodeContents(label);
  return range.getBoundingClientRect().left - control.getBoundingClientRect().left;
}

test.each([375, 1280])("Field sets form control height and label placement at %ipx", async width => {
  const viewport = { width: innerWidth, height: innerHeight };
  const form = document.createElement("form");
  document.body.append(form);
  const root = createRoot(form);
  try {
    await page.viewport(width, 900);
    const render = (density: FieldDensity) => flushSync(() => root.render(<>
      <Field density={density} name="recipient"><Input label="Recipient" placeholder="Enter a name" /></Field>
      <Field density={density} name="city">
        <Combobox items={cities}>
          <ComboboxInput label="City" placeholder="Search cities" />
          <ComboboxContent>
            <ComboboxList>{(city: string) => <ComboboxItem key={city} value={city}>{city}</ComboboxItem>}</ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field density={density} name="shipping" invalid>
        <Select items={methods}>
          <SelectTrigger label="Shipping method"><SelectValue placeholder="Choose a shipping method" /></SelectTrigger>
          <SelectContent>
            {methods.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
        <FieldError match={true}>Choose a shipping method.</FieldError>
      </Field>
      <Field density={density}><Input density="compact" label="Override" /></Field>
    </>));

    render("default");
    const recipient = page.getByRole("textbox", { name: "Recipient" });
    const city = page.getByRole("combobox", { name: "City" });
    const shipping = page.getByRole("combobox", { name: "Shipping method" });
    await expect.element(shipping).toHaveAccessibleDescription("Choose a shipping method.");
    await userEvent.click(page.getByText("Recipient", { exact: true }));
    await expect.element(recipient).toHaveFocus();
    await userEvent.fill(recipient, "Yami");
    await userEvent.click(page.getByText("City", { exact: true }));
    await expect.element(city).toHaveFocus();
    await userEvent.fill(city, "Seo");
    await userEvent.click(page.getByRole("option", { name: "Seoul" }));
    await userEvent.click(shipping);
    expect(textInset(shipping.element(), page.getByText("Shipping method", { exact: true }).element())).toBe(12);
    expect(textInset(shipping.element(), page.getByText("Choose a shipping method", { exact: true }).element())).toBe(12);
    await userEvent.click(page.getByRole("option", { name: "Express" }));
    expect(Object.fromEntries(new FormData(form))).toEqual({ recipient: "Yami", city: "Seoul", shipping: "express" });

    const controls = () => {
      const recipientInput = recipient.element() as HTMLInputElement;
      return [
        [recipientInput.parentElement!.parentElement!.parentElement!, recipientInput.labels![0]!],
        [city.element().closest("[data-density]")!, page.getByText("City", { exact: true }).element()],
        [shipping.element(), page.getByText("Shipping method", { exact: true }).element()],
      ] as const;
    };
    for (const [control, label] of controls()) {
      expect(control.getBoundingClientRect().height).toBe(56);
      expect(control.contains(label)).toBe(true);
      expect(textInset(control, label)).toBe(12);
    }
    const override = page.getByRole("textbox", { name: "Override" }).element();
    expect(override.parentElement!.parentElement!.parentElement!.getBoundingClientRect().height).toBe(40);

    render("compact");
    for (const [control, label] of controls()) {
      const bounds = control.getBoundingClientRect();
      expect(bounds.height).toBe(40);
      expect(label.getBoundingClientRect().bottom).toBeLessThan(bounds.top);
    }
    expect(Object.fromEntries(new FormData(form))).toEqual({ recipient: "Yami", city: "Seoul", shipping: "express" });
  } finally {
    root.unmount();
    form.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("multi-select keeps the label above the control and grows as chips wrap at either density", async () => {
  const container = document.createElement("div");
  container.style.width = "160px";
  document.body.append(container);
  const root = createRoot(container);
  const selections = ["San Francisco", "Los Angeles", "New York", "Washington"];
  try {
    for (const density of ["default", "compact"] as const) {
      const render = (value: string[]) => flushSync(() => root.render(<Combobox multiple items={selections} value={value}>
        <ComboboxChips density={density} label="Delivery cities">
          <ComboboxValue>{(items: string[]) => items.map(item => <ComboboxChip key={item}>{item}</ComboboxChip>)}</ComboboxValue>
          <ComboboxChipsInput />
        </ComboboxChips>
      </Combobox>));
      render([]);
      const chips = container.querySelector('[data-slot="combobox-chips"]')!;
      const height = density === "default" ? 56 : 40;
      const input = page.getByRole("combobox", { name: "Delivery cities" });
      const label = page.getByText("Delivery cities", { exact: true }).element();
      await expect.element(input).toBeInTheDocument();
      expect(label.getBoundingClientRect().bottom).toBeLessThan(chips.getBoundingClientRect().top);
      expect(chips.getBoundingClientRect().height).toBe(height);
      render(selections);
      expect(label.getBoundingClientRect().bottom).toBeLessThan(chips.getBoundingClientRect().top);
      expect(chips.getBoundingClientRect().height).toBeGreaterThan(height);
      expect(chips.scrollWidth).toBeLessThanOrEqual(chips.clientWidth);
      const chip = chips.querySelector("[data-combobox-chip]")!;
      const padding = density === "default" ? "4px" : "0px";
      expect(getComputedStyle(chip).paddingBlock).toBe(padding);
      expect(getComputedStyle(chip).paddingInlineEnd).toBe(density === "default" ? "4px" : "2px");
    }
  } finally {
    root.unmount();
    container.remove();
  }
});
