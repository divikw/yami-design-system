import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { Button } from "@yami/design-system/components/Button";
import "@yami/design-system/tokens.css";

test("warns when an icon button has no accessible label in the Vite browser runtime", () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(
        <Button form="icon">
          <span aria-hidden="true">+</span>
        </Button>,
      );
    });

    expect(warning).toHaveBeenCalledWith(expect.stringContaining("rendered without aria-label"));
  } finally {
    root.unmount();
    container.remove();
    warning.mockRestore();
  }
});

test.each([375, 1023, 1024, 1440, 1920])(
  "keeps Button size and typography contracts at %ipx",
  async (width) => {
    const originalViewport = { width: window.innerWidth, height: window.innerHeight };
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);

    try {
      await page.viewport(width, 900);
      flushSync(() => {
        root.render(
          <>
            {(["emphasis", "primary", "secondary", "tertiary"] as const).flatMap((variant) =>
              (["full", "inline", "icon"] as const).flatMap((form) =>
                (["sm", "md", "lg"] as const).flatMap((size) =>
                  [false, true].map((inverse) => (
                    <Button
                      key={`${variant}-${form}-${size}-${inverse}`}
                      variant={variant}
                      form={form}
                      size={size}
                      inverse={inverse}
                      aria-label={form === "icon" ? "Favorite" : undefined}
                      data-size={size}
                      data-form={form}
                    >
                      {form === "icon" ? <span aria-hidden="true">+</span> : "加入购物车 / Add to Cart"}
                    </Button>
                  )),
                ),
              ),
            )}
          </>,
        );
      });

      for (const button of container.querySelectorAll<HTMLButtonElement>("button")) {
        const large = button.dataset.size === "lg";
        const desktopTextLarge = large && button.dataset.form !== "icon" && width >= 1024;
        const styles = getComputedStyle(button);
        expect(styles.height).toBe(large ? (desktopTextLarge ? "56px" : "48px") : button.dataset.size === "sm" ? "32px" : "40px");
        expect(styles.fontSize).toBe(large ? (desktopTextLarge ? "18px" : "16px") : "14px");
        expect(styles.lineHeight).toBe("20px");
        if (button.dataset.form !== "icon") {
          const radiusToken = button.dataset.form === "full" ? "--radius-component-default" : "--radius-button-primary";
          expect(styles.borderRadius).toBe(styles.getPropertyValue(radiusToken).trim());
        }
      }
    } finally {
      root.unmount();
      container.remove();
      await page.viewport(originalViewport.width, originalViewport.height);
    }
  },
);

test.each([false, true])("inverse disabled/loading uses disabled tokens (dark=%s)", (dark) => {
  const container = document.createElement("div");
  if (dark) container.classList.add("dark");
  document.body.append(container);
  const root = createRoot(container);
  const onClick = vi.fn();
  try {
    flushSync(() => root.render(
      <>
        <span data-reference style={{ backgroundColor: "var(--button-disabled-inverse)", color: "var(--text-disabled-inverse)" }} />
        {(["emphasis", "primary", "secondary", "tertiary"] as const).flatMap((variant) =>
          [false, true].map((loading) => (
            <Button key={`${variant}-${loading}`} variant={variant} inverse disabled={!loading} loading={loading} onClick={onClick}>Save</Button>
          )),
        )}
      </>,
    ));
    const expected = getComputedStyle(container.querySelector("[data-reference]")!);
    for (const button of container.querySelectorAll("button")) {
      const styles = getComputedStyle(button);
      expect(styles.backgroundColor).toBe(expected.backgroundColor);
      expect(styles.color).toBe(expected.color);
      expect(button.getAttribute("aria-disabled")).toBe("true");
      button.click();
    }
    expect(onClick).not.toHaveBeenCalled();
  } finally {
    root.unmount();
    container.remove();
  }
});

test("short text labels reserve a 44px target without changing compact icon geometry", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(
      <>
        {(["sm", "md"] as const).flatMap((size) =>
          ["好", "I"].map((label) => <Button key={`${size}-${label}`} size={size}>{label}</Button>),
        )}
        <Button form="icon" size="sm" aria-label="Add">+</Button>
      </>,
    ));
    for (const button of container.querySelectorAll("button:not([aria-label])")) {
      expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      expect(parseFloat(getComputedStyle(button, "::before").height)).toBeGreaterThanOrEqual(44);
    }
    expect(container.querySelector('[aria-label="Add"]')!.getBoundingClientRect().width).toBe(32);
  } finally {
    root.unmount();
    container.remove();
  }
});

test.each(["inline", "full"] as const)("%s long labels fit the container without shrinking icons", (form) => {
  const container = document.createElement("div");
  container.style.width = "180px";
  document.body.append(container);
  const root = createRoot(container);
  const label = "收藏商品并在补货时通知我 / Notify me when this item is back in stock";
  try {
    flushSync(() => root.render(
      <Button form={form} leftIcon={<svg width="20" height="20" aria-hidden="true" />} rightIcon={<svg width="20" height="20" aria-hidden="true" />}>{label}</Button>,
    ));
    const button = container.querySelector("button")!;
    const text = [...button.querySelectorAll("span")].find(node => node.textContent === label)!;
    expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(180);
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
    expect(button).toHaveAccessibleName(label);
    for (const icon of button.querySelectorAll("svg")) expect(icon.getBoundingClientRect().width).toBe(20);
  } finally {
    root.unmount();
    container.remove();
  }
});

test("delayed loading keeps its name and geometry, cancels fast spinners, and resets between requests", () => {
  vi.useFakeTimers();
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const render = (loading: boolean, delay = 150) => flushSync(() => root.render(<Button loading={loading} loadingDelay={delay}>保存设置</Button>));
  const spinner = () => container.querySelector('[aria-hidden="true"]');
  try {
    render(false);
    const button = container.querySelector("button")!;
    const width = button.getBoundingClientRect().width;
    button.focus();
    render(true);
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(spinner()).toBeNull();
    flushSync(() => vi.advanceTimersByTime(80));
    render(false);
    flushSync(() => vi.advanceTimersByTime(200));
    expect(spinner()).toBeNull();
    render(true);
    flushSync(() => vi.advanceTimersByTime(149));
    expect(spinner()).toBeNull();
    flushSync(() => vi.advanceTimersByTime(1));
    expect(spinner()).not.toBeNull();
    expect(button.getBoundingClientRect().width).toBe(width);
    expect(button).toHaveAccessibleName("保存设置");
    expect(document.activeElement).toBe(button);
    render(false);
    render(true);
    expect(spinner()).toBeNull();
    render(true, 0);
    expect(spinner()).not.toBeNull();
    render(false);
    render(true);
    root.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    root.unmount();
    container.remove();
    vi.useRealTimers();
  }
});

test("loading blocks repeated mouse and keyboard activation while preserving focus", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const save = vi.fn(() => render(true));
  const render = (loading: boolean) => flushSync(() => root.render(<Button loading={loading} loadingDelay={5000} onClick={save}>保存设置</Button>));
  try {
    render(false);
    const button = container.querySelector("button")!;
    button.focus();
    button.click();
    button.click();
    button.click();
    await userEvent.keyboard("{Enter} ");
    expect(save).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(button);
    render(false);
    await userEvent.keyboard("{Enter}");
    expect(save).toHaveBeenCalledTimes(2);
  } finally {
    root.unmount();
    container.remove();
  }
});
