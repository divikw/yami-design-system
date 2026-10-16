import { useState } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Input } from "@yami/design-system";
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

test("inline action submits by click and Enter and inherits disabled without losing field semantics", async () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const render = (disabled = false) => flushSync(() => root.render(<>
    <form id="action-input-form" onSubmit={submit} />
    <Input form="action-input-form" density="compact" aria-label="Promo code" defaultValue="SAVE10" disabled={disabled}
      error="Check this code" action={{ label: "Redeem", htmlType: "submit" }} />
  </>));
  render();
  const input = container.querySelector("input")!;
  const action = page.getByRole("button", { name: "Redeem", exact: true });
  expect(input.closest('[data-slot="input"]')!.contains(action.element())).toBe(true);
  await expect.element(page.elementLocator(input)).toHaveAccessibleName("Promo code");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(document.getElementById(input.getAttribute("aria-describedby")!)!.textContent).toBe("Check this code");
  await action.click();
  expect(submit).toHaveBeenCalledTimes(1);
  await page.elementLocator(input).click();
  await userEvent.keyboard("{Enter}");
  expect(submit).toHaveBeenCalledTimes(2);
  render(true);
  await expect.element(action).toBeDisabled();
  expect(input.disabled).toBe(true);
});

test.each(["default", "compact"] as const)("%s native reset follows the current form association", async (density) => {
  const render = (form: string) => flushSync(() => root.render(<>
    <form id="first-form"><button type="reset">Reset first</button></form>
    <form id="second-form"><button type="reset">Reset second</button></form>
    <Input density={density} label="Email" form={form} clearable />
  </>));
  render("first-form");
  const input = container.querySelector("input")!;
  const fieldRoot = input.closest('[data-slot="input"]')!;
  await userEvent.click(container.querySelector("label")!);
  await userEvent.keyboard("draft");
  render("second-form");
  expect(input.form!.id).toBe("second-form");
  await page.elementLocator(container.querySelector('#first-form button')!).click();
  expect(input.value).toBe("draft");
  expect(fieldRoot.getAttribute("data-filled")).toBe("true");
  await page.elementLocator(container.querySelector('#second-form button')!).click();
  expect(input.value).toBe("");
  await expect.poll(() => fieldRoot.getAttribute("data-filled")).toBeNull();
  expect(fieldRoot.getAttribute("data-state")).toBe("default");
  await userEvent.click(container.querySelector("label")!);
  expect(container.querySelector('button[aria-label="Clear input"]')).toBeNull();
});

test("native reset works when the associated form mounts later and respects canceled resets", async () => {
  const render = (mounted: boolean, canceled = false) => flushSync(() => root.render(<>
    <Input label="Email" form="late-form" clearable />
    {mounted && <form id="late-form" onReset={(event) => { if (canceled) event.preventDefault(); }}><button type="reset">Reset</button></form>}
  </>));
  render(false);
  const input = container.querySelector("input")!;
  const fieldRoot = input.closest('[data-slot="input"]')!;
  await userEvent.click(container.querySelector("label")!);
  await userEvent.keyboard("draft");
  render(true, true);
  await page.elementLocator(container.querySelector('button[type="reset"]')!).click();
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  expect(input.value).toBe("draft");
  expect(fieldRoot.getAttribute("data-filled")).toBe("true");
  render(true);
  await page.elementLocator(container.querySelector('button[type="reset"]')!).click();
  expect(input.value).toBe("");
  await expect.poll(() => fieldRoot.getAttribute("data-filled")).toBeNull();
});

function contrastRatio(foreground: string, background: string) {
  const color = foreground.match(/[\d.]+/g)!.map(Number);
  const surface = background.match(/[\d.]+/g)!.map(Number).slice(0, 3);
  const alpha = color[3] ?? 1;
  const blended = surface.map((channel, index) => alpha * color[index] + (1 - alpha) * channel);
  const luminance = (channels: number[]) => channels.map((channel) => {
    const n = channel / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, index) => sum + n * [0.2126, 0.7152, 0.0722][index], 0);
  const values = [luminance(surface), luminance(blended)].sort((a, b) => a - b);
  return (values[1] + 0.05) / (values[0] + 0.05);
}

test.each([false, true])("readOnly preserves the value and excludes clear (controlled=%s)", async (controlled) => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  const value = controlled ? { value: "locked@example.com" } : { defaultValue: "locked@example.com" };
  flushSync(() => root.render(<Input label="Email" {...value} readOnly clearable onChange={onChange} onClear={onClear} />));
  await userEvent.click(container.querySelector("label")!);
  expect(container.querySelector("button")).toBeNull();
  expect(container.querySelector("input")!.value).toBe("locked@example.com");
  expect(onChange).not.toHaveBeenCalled();
  expect(onClear).not.toHaveBeenCalled();
});

test("changing a focused field to readOnly removes its clear action", async () => {
  const render = (readOnly: boolean) => flushSync(() => root.render(<Input label="Email" defaultValue="hello" readOnly={readOnly} clearable />));
  render(false);
  await userEvent.click(container.querySelector("label")!);
  expect(container.querySelector("button")).not.toBeNull();
  render(true);
  expect(container.querySelector("button")).toBeNull();
  expect(container.querySelector("input")!.value).toBe("hello");
});

test.each([true, false, "true", "false", "grammar", "spelling"] as const)("preserves external aria-invalid=%s", (invalid) => {
  flushSync(() => root.render(<Input label="Email" aria-invalid={invalid} />));
  expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe(String(invalid));
});

test("internal errors take precedence and retain external descriptions", () => {
  flushSync(() => root.render(<><span id="hint">Use your account email</span><Input id="email" label="Email" aria-invalid={false} aria-describedby="hint" error="Enter a valid email" /></>));
  const input = container.querySelector("input")!;
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe("hint email-error");
  expect(container.querySelector('[role="alert"]')!.textContent).toBe("Enter a valid email");
});

test("clicking a trailing SVG preserves button focus and fires its action once", async () => {
  const onClick = vi.fn();
  flushSync(() => root.render(<Input label="Search" trailingIcon={<button aria-label="Search action" onClick={onClick}><svg width="20" height="20"><path d="M0 0H20V20H0Z" /></svg></button>} />));
  await userEvent.click(container.querySelector("path")!);
  expect(document.activeElement).toBe(container.querySelector("button"));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test.each([false, true])("error fields support keyboard clear and return focus (controlled=%s)", async (controlled) => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  function Example() {
    const [value, setValue] = useState("invalid");
    return <Input label="Email" {...(controlled ? { value } : { defaultValue: "invalid" })} error="Enter a valid email" clearable onChange={(event) => {
      onChange(event.currentTarget.value);
      if (controlled) setValue(event.currentTarget.value);
    }} onClear={onClear} />;
  }
  flushSync(() => root.render(<Example />));
  const input = container.querySelector("input")!;
  expect(container.querySelector("button")).toBeNull();
  await userEvent.click(input);
  const clear = container.querySelector("button");
  expect(clear).not.toBeNull();
  await userEvent.tab();
  expect(document.activeElement).toBe(clear);
  await userEvent.keyboard("{Space}");
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(onChange).toHaveBeenCalledExactlyOnceWith("");
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(container.querySelector("button")).toBeNull();
  expect(input.getAttribute("aria-invalid")).toBe("true");
});

for (const density of ["default", "compact"] as const) {
  test.each([375, 1280])(`${density} keeps 8px right padding with and without icon slots at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    try {
      await page.viewport(width, 812);
      for (const leading of [false, true]) {
        for (const trailing of [false, true]) {
          flushSync(() => root.render(<Input density={density} label="Search" defaultValue="Matcha" state="typing" clearable leadingIcon={leading ? <svg width="20" height="20" aria-hidden="true" /> : undefined} trailingIcon={trailing ? <span>USD</span> : undefined} />));
          const field = container.querySelector<HTMLElement>('div[class*="field"]')!;
          expect(getComputedStyle(field).paddingRight).toBe("8px");
          const end = field.lastElementChild!;
          expect(field.getBoundingClientRect().right - end.getBoundingClientRect().right).toBe(8);
        }
      }
    } finally {
      await page.viewport(viewport.width, viewport.height);
    }
  });

  test.each([false, true])(`${density} search exposes only the custom clear action (controlled=%s)`, async (controlled) => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    function Example() {
      const [value, setValue] = useState("Matcha");
      return <Input density={density} label="Search" type="search" {...(controlled ? { value } : { defaultValue: "Matcha" })} clearable onChange={(event) => {
        onChange(event.currentTarget.value);
        if (controlled) setValue(event.currentTarget.value);
      }} onClear={onClear} />;
    }
    flushSync(() => root.render(<Example />));
    const input = container.querySelector("input")!;
    await userEvent.click(container.querySelector("label")!);
    expect(input.type).toBe("search");
    const bounds = input.getBoundingClientRect();
    // Click the native cancel location: it must no longer clear beside the YAMI button.
    await page.elementLocator(input).click({ position: { x: bounds.width - 8, y: bounds.height / 2 } });
    expect(input.value).toBe("Matcha");
    expect(onChange).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
    const clear = container.querySelector<HTMLButtonElement>('button[aria-label="Clear input"]')!;
    expect(clear).not.toBeNull();
    if (controlled) {
      await userEvent.tab();
      expect(document.activeElement).toBe(clear);
      await userEvent.keyboard("{Space}");
    } else {
      await userEvent.click(clear);
    }
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(container.querySelector('button[aria-label="Clear input"]')).toBeNull();
  });

  test(`${density} search retains native cancel when the custom clear is unavailable`, async () => {
    const render = (clearable: boolean, trailing = false) => flushSync(() => root.render(
      <Input density={density} label="Search" type="search" defaultValue="Matcha" clearable={clearable} trailingIcon={trailing ? <span>Search</span> : undefined} />
    ));
    render(false);
    const input = container.querySelector("input")!;
    await userEvent.click(container.querySelector("label")!);
    expect(container.querySelector("button")).toBeNull();
    const clickNativeCancel = async () => {
      const bounds = input.getBoundingClientRect();
      await page.elementLocator(input).click({ position: { x: bounds.width - 8, y: bounds.height / 2 } });
    };
    await clickNativeCancel();
    expect(input.value).toBe("");
    await page.elementLocator(input).fill("Matcha");
    render(true);
    expect(container.querySelector('button[aria-label="Clear input"]')).not.toBeNull();
    await clickNativeCancel();
    expect(input.value).toBe("Matcha");
    render(false);
    await clickNativeCancel();
    expect(input.value).toBe("");
    await page.elementLocator(input).fill("Matcha");
    render(true, true);
    expect(container.querySelector("button")).toBeNull();
    await clickNativeCancel();
    expect(input.value).toBe("");
  });
}

for (const theme of ["light", "dark"]) {
  test.each(["default", "compact"] as const)(`${theme} %s active clear icon meets 3:1 contrast`, async (density) => {
    container.className = theme === "dark" ? "dark" : "";
    flushSync(() => root.render(<Input density={density} label="Email" defaultValue="hello" clearable />));
    await userEvent.click(container.querySelector("label")!);
    const clear = container.querySelector("button")!;
    expect(contrastRatio(getComputedStyle(clear).color, getComputedStyle(clear.parentElement!).backgroundColor)).toBeGreaterThanOrEqual(3);
    await userEvent.click(clear);
    expect(container.querySelector("input")!.value).toBe("");
  });

  test.each(["default", "compact"] as const)(`${theme} %s disabled error preserves the disabled surface and error semantics`, async (density) => {
    container.className = theme === "dark" ? "dark" : "";
    const render = (error?: string) => flushSync(() => root.render(<Input id="disabled-email" density={density} label="Email" defaultValue="invalid" disabled error={error} clearable />));
    render();
    const input = container.querySelector("input")!;
    const field = container.querySelector<HTMLElement>('div[class*="field"]')!;
    const label = container.querySelector("label")!;
    const background = getComputedStyle(field).backgroundColor;
    const labelColor = getComputedStyle(label).color;
    const neutralBorder = getComputedStyle(field).boxShadow;
    render("Invalid email");
    expect(input.disabled).toBe(true);
    expect(getComputedStyle(field).backgroundColor).toBe(background);
    expect(getComputedStyle(field).cursor).toBe("not-allowed");
    expect(getComputedStyle(label).color).toBe(labelColor);
    expect(getComputedStyle(field).boxShadow).not.toBe(neutralBorder);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("disabled-email-error");
    expect(container.querySelector('[role="alert"]')!.textContent).toBe("Invalid email");
    expect(container.querySelector("button")).toBeNull();
    label.click();
    input.focus();
    expect(document.activeElement).not.toBe(input);
  });

  for (const density of ["default", "compact"] as const) {
    test.each([375, 1280])(`${theme} ${density} wraps long helper and error content at %ipx`, async (width) => {
      const viewport = { width: innerWidth, height: innerHeight };
      try {
        await page.viewport(width, 812);
        container.className = theme === "dark" ? "dark" : "";
        container.style.width = "288px";
        const message = `https://example.com/${"a".repeat(100)}`;
        for (const error of [false, true]) {
          flushSync(() => root.render(<Input density={density} label="Email" {...(error ? { error: message } : { helperText: <a href="#hint">{message}</a> })} />));
          const fieldRoot = container.querySelector('[data-slot="input"]')!;
          const support = fieldRoot.lastElementChild!;
          expect(support.textContent).toBe(message);
          expect(support.scrollWidth).toBeLessThanOrEqual(support.clientWidth);
          expect(support.getBoundingClientRect().right).toBeLessThanOrEqual(container.getBoundingClientRect().right);
          expect(support.getBoundingClientRect().height).toBeGreaterThan(20);
        }
      } finally {
        container.style.width = "";
        await page.viewport(viewport.width, viewport.height);
      }
    });
  }

  test.each(["default", "compact"] as const)(`${theme} %s input distinguishes pointer focus from Tab and preserves clear return focus`, async (density) => {
    container.className = theme === "dark" ? "dark" : "";
    container.style.padding = "16px";
    flushSync(() => root.render(<><button>Before</button><Input density={density} label="Email" defaultValue="hello" clearable /><button>After</button></>));
    const input = container.querySelector("input")!;
    const field = container.querySelector<HTMLElement>('div[class*="field"]')!;
    const before = container.querySelector("button")!;
    await userEvent.click(container.querySelector("label")!);
    expect(document.activeElement).toBe(input);
    const border = getComputedStyle(field).boxShadow;
    expect(border).toContain(theme === "dark" ? "rgb(255, 255, 255)" : "rgba(0, 0, 0, 0.87)");
    expect(getComputedStyle(field).outlineStyle).toBe("none");
    await userEvent.keyboard("x");
    expect(getComputedStyle(field).outlineStyle).toBe("none");
    await userEvent.click(before);
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineWidth).toBe("2px");
    expect(getComputedStyle(field).outlineColor).toBe(theme === "dark" ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
    expect(getComputedStyle(field).boxShadow).toBe(border);
    await userEvent.click(input);
    expect(getComputedStyle(field).outlineStyle).toBe("none");
    await userEvent.tab();
    const clear = container.querySelector<HTMLButtonElement>('button[aria-label="Clear input"]')!;
    expect(document.activeElement).toBe(clear);
    expect(getComputedStyle(clear).outlineWidth).toBe("2px");
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineWidth).toBe("2px");
    await userEvent.tab();
    await userEvent.keyboard("{Space}");
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineWidth).toBe("2px");
    await page.elementLocator(input).fill("again");
    await userEvent.click(container.querySelector('button[aria-label="Clear input"]')!);
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineStyle).toBe("none");
  });

  test(`${theme} clicking an external label removes the input keyboard ring`, async () => {
    container.className = theme === "dark" ? "dark" : "";
    flushSync(() => root.render(<><button>Before</button><label htmlFor="external-email">Email</label><Input id="external-email" density="compact" /><button>After</button></>));
    const input = container.querySelector("input")!;
    const field = container.querySelector<HTMLElement>('div[class*="field"]')!;
    await userEvent.click(container.querySelector("button")!);
    await userEvent.tab();
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineWidth).toBe("2px");
    await userEvent.click(container.querySelector("label")!);
    expect(document.activeElement).toBe(input);
    expect(getComputedStyle(field).outlineStyle).toBe("none");
  });

  test.each([375, 1280])(`${theme} compact input keeps an external label, single value row and clear target at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    try {
      await page.viewport(width, 812);
      container.className = theme === "dark" ? "dark" : "";
      container.style.padding = "16px";
      flushSync(() => root.render(<Input density="compact" label="Promo code" placeholder="SAVE10" defaultValue="BAD" error="Invalid promo code" clearable />));
      const input = container.querySelector("input")!;
      const label = container.querySelector("label")!;
      const field = container.querySelector<HTMLElement>('div[class*="field"]')!;
      const bounds = field.getBoundingClientRect();
      expect(bounds.height).toBe(width < 1024 ? 48 : 40);
      expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(bounds.top - 4);
      expect(field.contains(label)).toBe(false);
      await expect.element(page.elementLocator(input)).toHaveAccessibleName("Promo code");
      expect(input.getBoundingClientRect().height).toBeGreaterThan(1);
      await userEvent.click(label);
      expect(document.activeElement).toBe(input);
      const clear = container.querySelector("button")!;
      const clearBounds = clear.getBoundingClientRect();
      expect([clearBounds.width, clearBounds.height]).toEqual([24, 24]);
      expect(bounds.right - clearBounds.right).toBe(8);
      expect(clearBounds.top + clearBounds.height / 2).toBe(bounds.top + bounds.height / 2);
      expect(clear.contains(document.elementFromPoint(clearBounds.left + 2, clearBounds.top + 2))).toBe(true);
      const outside = document.elementFromPoint(clearBounds.left + clearBounds.width / 2, clearBounds.top - 2)!;
      expect(clear.contains(outside)).toBe(false);
      await page.elementLocator(field).click({ position: { x: clearBounds.left + clearBounds.width / 2 - bounds.left, y: clearBounds.top - 2 - bounds.top } });
      expect(input.value).toBe("BAD");
      await userEvent.tab();
      expect(document.activeElement).toBe(clear);
      expect(getComputedStyle(clear).outlineWidth).toBe("2px");
      await page.elementLocator(clear).click({ position: { x: 2, y: 2 } });
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
      expect(getComputedStyle(input.parentElement!).opacity).toBe("1");
      expect(input.getAttribute("placeholder")).toBe("SAVE10");
      expect(container.querySelector('[role="alert"]')!.getBoundingClientRect().top).toBeGreaterThanOrEqual(bounds.bottom + 4);
      expect(field.getBoundingClientRect().top).toBe(bounds.top);
    } finally {
      container.style.padding = "";
      await page.viewport(viewport.width, viewport.height);
    }
  });

  test.each([375, 1280])(`${theme} clear has a 24px target inside the field at %ipx`, async (width) => {
    const viewport = { width: innerWidth, height: innerHeight };
    try {
      await page.viewport(width, 812);
      container.className = theme === "dark" ? "dark" : "";
      flushSync(() => root.render(<Input label="Email" defaultValue="hello" clearable />));
      await userEvent.click(container.querySelector("label")!);
      const clear = container.querySelector("button")!;
      const field = clear.parentElement!.getBoundingClientRect();
      const bounds = clear.getBoundingClientRect();
      expect([bounds.width, bounds.height]).toEqual([24, 24]);
      expect(field.right - bounds.right).toBe(8);
      expect(bounds.top).toBeGreaterThanOrEqual(field.top);
      expect(bounds.bottom).toBeLessThanOrEqual(field.bottom);
      expect(bounds.top + bounds.height / 2).toBe(field.top + field.height / 2);
      const outside = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top - 2)!;
      expect(clear.contains(outside)).toBe(false);
      await page.elementLocator(clear.parentElement!).click({ position: { x: bounds.left + bounds.width / 2 - field.left, y: bounds.top - 2 - field.top } });
      expect(container.querySelector("input")!.value).toBe("hello");
      expect(clear.querySelector("svg")!.getBoundingClientRect().width).toBe(20);
      await page.elementLocator(clear).click({ position: { x: 2, y: 2 } });
      expect(container.querySelector("input")!.value).toBe("");
    } finally {
      await page.viewport(viewport.width, viewport.height);
    }
  });
}
