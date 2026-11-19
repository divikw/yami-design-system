import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Combobox, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, Field, FieldLabel } from "@yami/design-system";
import { CityPopup } from "../.storybook/combobox-examples/popup";
import "@yami/design-system/tokens.css";

test("a labeled Combobox submits its selected object value and restores the default on native reset", async () => {
  const cities = [{ label: "Tokyo", value: "TYO" }, { label: "Seoul", value: "SEL" }];
  const form = document.createElement("form");
  document.body.append(form);
  const root = createRoot(form);
  try {
    flushSync(() => root.render(<Field name="city">
      <FieldLabel>City</FieldLabel>
      <Combobox items={cities} defaultValue={cities[0]}>
        <ComboboxInput />
        <ComboboxContent><ComboboxList>{(city: typeof cities[number]) =>
          <ComboboxItem key={city.value} value={city}>{city.label}</ComboboxItem>
        }</ComboboxList></ComboboxContent>
      </Combobox>
      <button type="reset">Reset</button>
    </Field>));
    const input = page.getByRole("combobox", { name: "City" });
    await expect.element(input).toHaveValue("Tokyo");
    await userEvent.fill(input, "Seo");
    await userEvent.click(page.getByRole("option", { name: "Seoul" }));
    expect(new FormData(form).get("city")).toBe("SEL");
    await userEvent.click(page.getByRole("button", { name: "Reset" }));
    await expect.element(input).toHaveValue("Tokyo");
    expect(new FormData(form).get("city")).toBe("TYO");
  } finally {
    root.unmount();
    form.remove();
  }
});

test("single and multiple inputs use the 2px active stroke without moving their content", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<>
      <button type="button">Before</button>
      <Combobox items={["Tokyo"]}><ComboboxInput aria-label="City" /></Combobox>
      <Combobox multiple items={["Tokyo"]}>
        <ComboboxChips><ComboboxChipsInput aria-label="Cities" /></ComboboxChips>
      </Combobox>
    </>));
    for (const name of ["City", "Cities"]) {
      const input = page.getByRole("combobox", { name, exact: true });
      const element = input.element();
      const control = element.parentElement!;
      expect(getComputedStyle(control).paddingLeft).toBe("8px");
      expect(getComputedStyle(control).paddingRight).toBe("8px");
      const left = element.getBoundingClientRect().left;
      const height = control.getBoundingClientRect().height;
      expect(getComputedStyle(control).boxShadow).toContain("0px 0px 0px 1px");
      await userEvent.click(input);
      expect(getComputedStyle(control).boxShadow).toContain("0px 0px 0px 2px");
      expect(getComputedStyle(control).outlineStyle).toBe("none");
      expect(element.getBoundingClientRect().left).toBe(left);
      expect(control.getBoundingClientRect().height).toBe(height);
      await userEvent.click(page.getByRole("button", { name: "Before" }));
      expect(getComputedStyle(control).boxShadow).toContain("0px 0px 0px 1px");
    }
    await userEvent.tab();
    const control = page.getByRole("combobox", { name: "City", exact: true }).element().parentElement!;
    expect(getComputedStyle(control).outlineStyle).toBe("solid");
    expect(getComputedStyle(control).boxShadow).toContain("0px 0px 0px 2px");
  } finally {
    root.unmount();
    host.remove();
  }
});

test("popup search shows the keyboard ring only when opened with the keyboard", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<CityPopup en />));
    const trigger = page.getByRole("combobox", { name: "Choose a city" });
    const search = page.getByPlaceholder("Search cities");
    await userEvent.click(trigger);
    await expect.element(search).toHaveFocus();
    expect(getComputedStyle(search.element().parentElement!).outlineStyle).toBe("none");
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(search).toHaveFocus();
    expect(getComputedStyle(search.element().parentElement!).outlineStyle).toBe("solid");
  } finally {
    root.unmount();
    host.remove();
  }
});
