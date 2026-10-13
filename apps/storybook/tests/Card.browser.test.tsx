import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import type { FormEvent } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cdp, page, userEvent } from "vitest/browser";
import { Button, ButtonGroup, ButtonLink, Card, ProductCard } from "@yami/design-system";
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

const states = ["light", "dark"].flatMap((theme) =>
  (["primary", "secondary", "inverse"] as const).map((surface) => ({ theme, surface })),
);

test.each(states)("$theme / $surface preserves its text and changes surface on hover and press", async ({ theme, surface }) => {
  container.className = theme === "dark" ? "dark" : "";
  flushSync(() => root.render(<Card as="button" surface={surface}>View order</Card>));
  const card = container.querySelector("button")!;
  card.style.transitionDuration = "0ms";
  const background = getComputedStyle(card).backgroundColor;
  const color = getComputedStyle(card).color;
  const rect = card.getBoundingClientRect();
  await page.elementLocator(card).hover();
  const hover = getComputedStyle(card).backgroundColor;
  expect(hover).not.toBe(background);
  expect(getComputedStyle(card).color).toBe(color);
  // Opposite-polarity surfaces must keep their polarity while interacting.
  const probe = document.createElement("span");
  probe.style.backgroundColor = "var(--surface-secondary)";
  container.append(probe);
  if (surface === "inverse") expect(hover).not.toBe(getComputedStyle(probe).backgroundColor);
  const session = cdp();
  try {
    await session.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x + 10, y: rect.y + 10, button: "left", clickCount: 1 });
    expect(getComputedStyle(card).backgroundColor).not.toBe(hover);
    expect(getComputedStyle(card).color).toBe(color);
    expect(getComputedStyle(card).boxShadow).toBe("none");
    expect(card.getBoundingClientRect().width).toBe(rect.width);
    expect(card.getBoundingClientRect().height).toBe(rect.height);
  } finally {
    await session.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x + 10, y: rect.y + 10, button: "left", clickCount: 1 });
  }
});

test.each(states.flatMap((state) => [undefined, false].map((interactive) => ({ ...state, interactive }))))("$theme / $surface disabled buttons stay inactive without opacity (interactive=$interactive)", async ({ theme, surface, interactive }) => {
  container.className = theme === "dark" ? "dark" : "";
  const click = vi.fn();
  flushSync(() => root.render(<Card as="button" surface={surface} interactive={interactive} disabled onClick={click}>Unavailable</Card>));
  const card = container.querySelector("button")!;
  card.style.transitionDuration = "0ms";
  const background = getComputedStyle(card).backgroundColor;
  await page.elementLocator(card).hover();
  expect(getComputedStyle(card).backgroundColor).toBe(background);
  expect(getComputedStyle(card).cursor).toBe("not-allowed");
  const probe = document.createElement("span");
  probe.style.color = surface === "inverse" ? "var(--text-disabled-inverse)" : "var(--text-disabled)";
  container.append(probe);
  expect(getComputedStyle(card).color).toBe(getComputedStyle(probe).color);
  expect(getComputedStyle(card).opacity).toBe("1");
  card.click();
  expect(click).not.toHaveBeenCalled();
  expect(card).toBeDisabled();
});

test("an empty href retains native link interaction while an absent href stays static", async () => {
  flushSync(() => root.render(<>
    <Card as="a" href="" padding="none">Current page</Card>
    <Card as="a" padding="none">No destination</Card>
    <Card as="a" href="" interactive={false} padding="none">Feedback off</Card>
  </>));
  const [link, staticCard, feedbackOff] = container.querySelectorAll("a");
  expect(link).toHaveRole("link");
  expect(getComputedStyle(link).minHeight).toBe("44px");
  expect(getComputedStyle(link).cursor).toBe("pointer");
  expect(staticCard).not.toHaveRole("link");
  expect(getComputedStyle(staticCard).minHeight).toBe("0px");
  expect(getComputedStyle(feedbackOff).minHeight).toBe("0px");
  await userEvent.tab();
  expect(link).toHaveFocus();
  expect(getComputedStyle(link).outlineWidth).toBe("2px");
  await userEvent.tab();
  expect(feedbackOff).toHaveFocus();
  expect(getComputedStyle(feedbackOff).outlineWidth).toBe("2px");
});

test.each(states)("$theme / $surface keyboard focus and button activation work without submitting by default", async ({ theme, surface }) => {
  container.className = theme === "dark" ? "dark" : "";
  const click = vi.fn();
  const submit = vi.fn((event: FormEvent) => event.preventDefault());
  container.style.backgroundColor = "var(--surface-primary)";
  container.style.padding = "8px";
  flushSync(() => root.render(<form onSubmit={submit}><Card as="button" surface={surface} onClick={click}>Open settings</Card></form>));
  const card = container.querySelector("button")!;
  await userEvent.tab();
  expect(card).toHaveFocus();
  expect(card).toHaveAccessibleName("Open settings");
  expect(getComputedStyle(card).outlineWidth).toBe("2px");
  expect(getComputedStyle(card).outlineOffset).toBe("2px");
  const probe = document.createElement("span");
  probe.style.color = "var(--focus-ring)";
  container.append(probe);
  expect(getComputedStyle(card).outlineColor).toBe(getComputedStyle(probe).color);
  await userEvent.keyboard("{Enter}");
  await userEvent.keyboard(" ");
  expect(click).toHaveBeenCalledTimes(2);
  expect(submit).not.toHaveBeenCalled();
  flushSync(() => root.render(<form onSubmit={submit}><Card as="button" type="submit">Save settings</Card></form>));
  container.querySelector("button")!.click();
  expect(submit).toHaveBeenCalledTimes(1);
});

test.each([240, 375, 1024])("link cards and long content fit a %ipx container with every padding", (width) => {
  container.style.width = `${width}px`;
  flushSync(() => root.render(<>
    {(["none", "sm", "md", "lg"] as const).map((padding) => <Card key={padding} as="a" href="#order" padding={padding}>Order details {"long-reference-".repeat(40)}</Card>)}
    <Card>Static content</Card>
  </>));
  const links = container.querySelectorAll("a");
  for (const [index, link] of links.entries()) {
    expect(link).toHaveRole("link");
    expect(getComputedStyle(link).display).toBe("flow-root");
    expect(getComputedStyle(link).paddingTop).toBe(["0px", "12px", "16px", "24px"][index]);
    expect(getComputedStyle(link).textDecorationLine).toBe("none");
    expect(link.getBoundingClientRect().width).toBe(width);
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth);
  }
  const staticCard = container.querySelector<HTMLElement>('div[data-slot="card"]')!;
  expect(staticCard.tabIndex).toBe(-1);
  expect(staticCard).not.toHaveRole("group");
});

test("coarse pointers keep press feedback without hover, and reduced motion stops transitions", async () => {
  const session = cdp();
  try {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    flushSync(() => root.render(<Card as="button">Open order</Card>));
    const card = container.querySelector("button")!;
    expect(matchMedia("(hover: none) and (pointer: coarse)").matches).toBe(true);
    expect(getComputedStyle(card).transitionDuration).toBe("0s");
    const background = getComputedStyle(card).backgroundColor;
    await page.elementLocator(card).hover();
    expect(getComputedStyle(card).backgroundColor).toBe(background);
    const rect = card.getBoundingClientRect();
    await session.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x + 10, y: rect.y + 10, button: "left", clickCount: 1 });
    expect(getComputedStyle(card).backgroundColor).not.toBe(background);
    await session.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x + 10, y: rect.y + 10, button: "left", clickCount: 1 });
    expect(getComputedStyle(card).backgroundColor).toBe(background);
  } finally {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await session.send("Emulation.setEmulatedMedia", { features: [] });
  }
});

test.each([240, 375])("wide content stays inside a %ipx card and scrolls with the keyboard", async (width) => {
  container.style.width = `${width}px`;
  flushSync(() => root.render(
    <Card>
      <h3>Order record</h3>
      <div role="region" aria-label="Order record code" tabIndex={0} style={{ maxWidth: "100%", overflowX: "auto" }}>
        <pre>{'items: ["noodles", "tea", "rice", "snacks", "sauce", "coffee"]'}</pre>
      </div>
    </Card>,
  ));
  const card = container.querySelector<HTMLElement>('[data-slot="card"]')!;
  const region = container.querySelector<HTMLElement>('[role="region"]')!;
  expect(card.getBoundingClientRect().width).toBe(width);
  expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  await userEvent.tab();
  expect(region).toHaveFocus();
  expect(region).toHaveAccessibleName("Order record code");
  await userEvent.keyboard("{ArrowRight}");
  await expect.poll(() => region.scrollLeft).toBeGreaterThan(0);
});

test.each(["none", "sm", "md", "lg"] as const)("%s padding preserves child focus outlines and extended button hit areas", async (padding) => {
  container.style.padding = "24px";
  container.style.width = "240px";
  for (const size of ["sm", "md"] as const) {
    const click = vi.fn();
    flushSync(() => root.render(<div style={{ display: "grid", gap: 24 }}>
      <Card padding={padding}><Button size={size} onClick={click}>下载收据</Button></Card>
      <Card padding={padding}><ButtonLink href="#order" size={size} onClick={(event) => { event.preventDefault(); click(); }}>查看订单</ButtonLink></Card>
      <Card padding={padding}><Button size={size} form="icon" aria-label="更多操作" onClick={click}>+</Button></Card>
    </div>));
    for (const control of container.querySelectorAll<HTMLElement>("a,button")) {
      control.focus();
      await userEvent.keyboard("{Shift}");
      expect(control).toHaveFocus();
      const style = getComputedStyle(control);
      expect(style.outlineWidth).toBe("2px");
      expect(style.outlineOffset).toBe("2px");
      const card = control.closest<HTMLElement>('[data-slot="card"]')!;
      const rect = control.getBoundingClientRect();
      const extension = (44 - rect.height) / 2;
      const points = [
        { x: rect.x + rect.width / 2, y: rect.top - extension + 1 },
        { x: rect.x + rect.width / 2, y: rect.bottom + extension - 1 },
        ...(control.getAttribute("aria-label") ? [
          { x: rect.left - extension + 1, y: rect.y + rect.height / 2 },
          { x: rect.right + extension - 1, y: rect.y + rect.height / 2 },
        ] : []),
      ];
      for (const point of points) {
        expect(document.elementFromPoint(point.x, point.y)).toBe(control);
        const before = click.mock.calls.length;
        await page.elementLocator(control).click({ position: { x: point.x - rect.x, y: point.y - rect.y } });
        expect(click).toHaveBeenCalledTimes(before + 1);
      }
      if (padding === "none") {
        expect(getComputedStyle(card).overflowX).toBe("visible");
        expect(getComputedStyle(card).overflowY).toBe("visible");
      }
    }
  }
});

test("zero-padding cards contain margins and floats while mixed groups retain their edge targets", async () => {
  container.style.padding = "24px";
  container.style.width = "240px";
  const click = vi.fn();
  flushSync(() => root.render(<>
    <Card padding="none" data-test="layout"><h3 style={{ margin: "16px 0" }}>订单</h3><div style={{ float: "left", height: 80 }}>浮动内容</div></Card>
    <Card padding="none"><ButtonGroup full aria-label="订单操作">
      <ButtonLink form="full" href="#order">查看订单</ButtonLink>
      <Button form="full" onClick={click}>下载收据</Button>
    </ButtonGroup></Card>
  </>));
  const layout = container.querySelector<HTMLElement>('[data-test="layout"]')!;
  expect(layout.getBoundingClientRect().top).toBe(container.getBoundingClientRect().top + 24);
  expect(layout.getBoundingClientRect().bottom).toBeGreaterThanOrEqual(layout.querySelector("h3")!.nextElementSibling!.getBoundingClientRect().bottom);
  const group = container.querySelector<HTMLElement>('[role="group"]')!;
  const button = group.querySelector("button")!;
  expect(group.scrollWidth).toBe(group.clientWidth);
  await page.elementLocator(button).click({ position: { x: button.clientWidth / 2, y: -1 } });
  expect(click).toHaveBeenCalledTimes(1);
});

test("ProductCard keeps its media crop and compact radius independent of Card overflow", () => {
  container.style.width = "240px";
  flushSync(() => root.render(<ProductCard title="面条" priceCurrent="$3.99" href="/product/noodles" />));
  const card = container.querySelector<HTMLElement>('[data-slot="card"]')!;
  const media = container.querySelector<HTMLElement>('[data-slot="product-card-image"]')!;
  expect(getComputedStyle(card).borderRadius).toBe("8px");
  expect(getComputedStyle(media).overflow).toBe("hidden");
  expect(getComputedStyle(media).borderRadius).toBe("8px");
  expect(media.getBoundingClientRect().width).toBe(media.getBoundingClientRect().height);
  expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
});
