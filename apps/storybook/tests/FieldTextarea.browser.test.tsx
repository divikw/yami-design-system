import { createRef, useState } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Field, FieldDescription, FieldError, FieldLabel, Textarea } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test("Textarea shows the focus ring for Tab, and hides it for pointer editing and label clicks", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<>
      <button>Before notes</button>
      <Field><FieldLabel>Order notes</FieldLabel><Textarea /></Field>
    </>));
    const notes = page.getByRole("textbox", { name: "Order notes" });
    const outline = () => getComputedStyle(notes.element()).outlineStyle;
    const stroke = () => getComputedStyle(notes.element()).boxShadow;
    expect(stroke()).toContain("0px 0px 0px 1px");
    await page.getByRole("button", { name: "Before notes" }).click();
    await page.getByText("Order notes", { exact: true }).click();
    await expect.element(notes).toHaveFocus();
    expect(outline()).toBe("none");
    expect(stroke()).toContain("0px 0px 0px 2px");
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}{Tab}");
    await expect.element(notes).toHaveFocus();
    expect(outline()).toBe("solid");
    expect(stroke()).toContain("0px 0px 0px 2px");
    await notes.click();
    await userEvent.keyboard("a");
    await expect.element(notes).toHaveFocus();
    expect(outline()).toBe("none");
  } finally {
    root.unmount();
    container.remove();
  }
});

test("Textarea preserves its native ref, described-by IDs, submission and reset inside Field", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLTextAreaElement>();
  const submitted: Record<string, FormDataEntryValue>[] = [];

  try {
    flushSync(() => root.render(
      <form onSubmit={(event) => {
        event.preventDefault();
        submitted.push(Object.fromEntries(new FormData(event.currentTarget)));
      }}>
        <p id="field-external-hint">Use the order language.</p>
        <Field name="deliveryNotes">
          <FieldLabel>Delivery notes</FieldLabel>
          <Textarea ref={ref} name="overridden" aria-describedby="field-external-hint" defaultValue="Front desk" />
          <FieldDescription>Use a location the driver can access.</FieldDescription>
        </Field>
        <Field name="internalNotes" disabled>
          <FieldLabel>Internal notes</FieldLabel>
          <Textarea defaultValue="Unavailable" />
        </Field>
        <Textarea name="readOnlyNotes" aria-label="Locked notes" readOnly defaultValue="Leave at the door" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>,
    ));

    const notes = page.getByRole("textbox", { name: "Delivery notes" });
    await expect.element(notes).toHaveAccessibleDescription("Use the order language. Use a location the driver can access.");
    expect(ref.current).toBe(notes.element());
    expect(ref.current?.rows).toBe(3);
    await expect.element(page.getByRole("textbox", { name: "Internal notes" })).toBeDisabled();
    await userEvent.fill(notes, "Side door\nSecond floor");
    await userEvent.click(page.getByRole("button", { name: "Submit" }));
    expect(submitted).toEqual([{ deliveryNotes: "Side door\nSecond floor", readOnlyNotes: "Leave at the door" }]);
    await userEvent.click(page.getByRole("button", { name: "Reset" }));
    await expect.element(notes).toHaveValue("Front desk");
  } finally {
    root.unmount();
    container.remove();
  }
});

function ControlledNotes() {
  const [value, setValue] = useState("");
  return <Field validationMode="onChange" validate={(notes) => notes === "!" ? "Enter a delivery instruction." : null}>
    <FieldLabel>Delivery notes</FieldLabel>
    <Textarea value={value} onChange={(event) => setValue(event.currentTarget.value)} />
    <FieldError />
  </Field>;
}

test("Field validates the latest controlled Textarea value and clears its error", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    flushSync(() => root.render(<ControlledNotes />));
    const notes = page.getByRole("textbox", { name: "Delivery notes" });
    await userEvent.fill(notes, "!");
    await expect.element(page.getByRole("alert")).toHaveTextContent("Enter a delivery instruction.");
    await expect.element(notes).toHaveAttribute("aria-invalid", "true");
    await userEvent.fill(notes, "Reception");
    await expect.element(notes).toHaveValue("Reception");
    await expect.element(notes).not.toHaveAttribute("aria-invalid");
    await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
  } finally {
    root.unmount();
    container.remove();
  }
});

test("FieldError associates distinct external messages and clears the association when they are removed", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const render = (messages: string[]) => flushSync(() => root.render(
    <Field invalid={messages.length > 0}>
      <FieldLabel>Delivery notes</FieldLabel>
      <Textarea />
      <FieldError errors={messages.map(message => ({ message }))} />
    </Field>,
  ));

  try {
    render(["Enter a note", "Use fewer characters", "Enter a note", ""]);
    const notes = page.getByRole("textbox", { name: "Delivery notes" });
    const alert = page.getByRole("alert");
    expect(Array.from(alert.element().querySelectorAll("li"), item => item.textContent))
      .toEqual(["Enter a note", "Use fewer characters"]);
    await expect.element(notes).toHaveAttribute("aria-describedby", alert.element().id);
    render([]);
    await expect.element(alert).not.toBeInTheDocument();
    await expect.element(notes).not.toHaveAttribute("aria-describedby");
  } finally {
    root.unmount();
    container.remove();
  }
});
