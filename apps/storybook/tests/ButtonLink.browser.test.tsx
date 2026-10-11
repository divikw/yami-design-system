import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, ButtonLink, ButtonGroup } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test("ButtonLink preserves native link props, focus order, and keyboard activation", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLAnchorElement>();
  const navigate = vi.fn((event: React.MouseEvent) => event.preventDefault());
  const action = vi.fn();
  try {
    flushSync(() => root.render(
      <ButtonGroup aria-label="订单操作">
        <ButtonLink ref={ref} href="/orders/123" target="_blank" rel="noopener" download="receipt.pdf" onClick={navigate}>查看订单</ButtonLink>
        <Button variant="secondary" onClick={action}>下载收据</Button>
      </ButtonGroup>,
    ));
    const link = container.querySelector("a")!;
    const button = container.querySelector("button")!;
    expect(ref.current).toBe(link);
    expect(link).toHaveRole("link");
    expect(link).toHaveAccessibleName("查看订单");
    expect(link).toHaveAttribute("href", "/orders/123");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveAttribute("download", "receipt.pdf");
    link.focus();
    await userEvent.keyboard(" ");
    expect(navigate).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
    expect(getComputedStyle(link).outlineStyle).toBe("solid");
    expect(getComputedStyle(link).outlineWidth).toBe("2px");
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    await userEvent.keyboard(" ");
    expect(action).toHaveBeenCalledTimes(1);
  } finally {
    root.unmount();
    container.remove();
  }
});

test.each([375, 1024])("ButtonLink shares Button geometry, typography, and colors at %ipx", async (width) => {
  const original = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<>
      {[false, true].flatMap((dark) => (["primary", "secondary", "tertiary", "emphasis"] as const).flatMap((variant) =>
        (["sm", "md", "lg"] as const).flatMap((size) => (["inline", "full"] as const).flatMap((form) =>
          [false, true].map((inverse) => <div key={`${dark}-${variant}-${size}-${form}-${inverse}`} className={dark ? "dark" : undefined}>
            <ButtonGroup full={form === "full"} aria-label="Order actions">
              <ButtonLink href="/orders/123" variant={variant} size={size} form={form} inverse={inverse}>View order</ButtonLink>
              <Button variant={variant} size={size} form={form} inverse={inverse}>View order</Button>
            </ButtonGroup>
          </div>),
        )),
      ))}
    </>));
    for (const group of container.querySelectorAll('[role="group"]')) {
      const link = group.querySelector("a")!;
      const button = group.querySelector("button")!;
      const linkStyle = getComputedStyle(link);
      const buttonStyle = getComputedStyle(button);
      for (const property of ["height", "font-size", "line-height", "border-radius", "color", "background-color", "padding-inline"]) {
        expect(linkStyle.getPropertyValue(property)).toBe(buttonStyle.getPropertyValue(property));
      }
      expect(link.getBoundingClientRect().width).toBeCloseTo(button.getBoundingClientRect().width, 1);
      expect(getComputedStyle(group).gap).toBe("8px");
      expect(linkStyle.textDecorationLine).toBe("none");
      if (linkStyle.height !== "48px" && linkStyle.height !== "56px") {
        expect(parseFloat(getComputedStyle(link, "::before").height)).toBeGreaterThanOrEqual(44);
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(original.width, original.height);
  }
});

test("mixed button groups wrap and truncate long labels within narrow containers", () => {
  const container = document.createElement("div");
  container.style.width = "160px";
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(
      <ButtonGroup aria-label="Order actions">
        <ButtonLink href="/orders/123" leftIcon={<svg width="20" height="20" aria-hidden="true" />}>查看此订单的所有配送详情 / View all delivery details</ButtonLink>
        <Button>下载收据</Button>
      </ButtonGroup>,
    ));
    const link = container.querySelector("a")!;
    const button = container.querySelector("button")!;
    expect(link.getBoundingClientRect().width).toBeLessThanOrEqual(160);
    expect(link.querySelector("svg")!.getBoundingClientRect().width).toBe(20);
    const label = link.lastElementChild!;
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    expect(button.getBoundingClientRect().top - link.getBoundingClientRect().bottom).toBe(8);
    expect(container.scrollWidth).toBeLessThanOrEqual(160);
  } finally {
    root.unmount();
    container.remove();
  }
});
