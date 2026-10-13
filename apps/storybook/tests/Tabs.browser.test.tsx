import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@yami/design-system/components/Tabs";
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

function visibleBackgroundHeight(trigger: HTMLElement) {
  const triggerHeight = trigger.getBoundingClientRect().height;
  const background = getComputedStyle(trigger, "::before");
  return (
    triggerHeight -
    Number.parseFloat(background.top) -
    Number.parseFloat(background.bottom)
  );
}

test("switches filled Tab density at the shared 1024px desktop breakpoint", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  try {
    flushSync(() =>
      root.render(
        <div>
          <Tabs defaultValue="one">
            <TabsList variant="primary" styleVariant="b">
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one">One</TabsContent>
            <TabsContent value="two">Two</TabsContent>
          </Tabs>
          <Tabs defaultValue="one">
            <TabsList variant="tertiary">
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one">One</TabsContent>
            <TabsContent value="two">Two</TabsContent>
          </Tabs>
        </div>,
      ),
    );

    const activeTriggers = container.querySelectorAll<HTMLElement>(
      '[role="tab"][data-state="active"]',
    );
    expect(activeTriggers).toHaveLength(2);

    for (const [width, expectedHeight] of [
      [375, 32],
      [768, 32],
      [1024, 36],
    ] as const) {
      await page.viewport(width, 812);
      expect(
        Array.from(activeTriggers, visibleBackgroundHeight),
        `${width}px viewport`,
      ).toEqual([expectedHeight, expectedHeight]);
    }
  } finally {
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([false, true])("segmented tabs keep equal background insets (inverse: %s)", async (inverse) => {
  const viewport = { width: innerWidth, height: innerHeight };
  try {
    flushSync(() => root.render(
      <Tabs defaultValue="one">
        <TabsList variant="primary" styleVariant="b" inverse={inverse}>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
      </Tabs>,
    ));
    const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const track = tabs[0]!.parentElement!;
    for (const width of [375, 768, 1024, 1280]) {
      await page.viewport(width, 812);
      const background = getComputedStyle(track, "::before");
      for (const [index, tab] of Array.from(tabs).entries()) {
        await userEvent.click(tab);
        const trackRect = track.getBoundingClientRect();
        const rect = tab.getBoundingClientRect();
        const fill = getComputedStyle(tab, "::before");
        const top = rect.top + Number.parseFloat(fill.top) - trackRect.top - Number.parseFloat(background.top);
        const bottom = trackRect.bottom - Number.parseFloat(background.bottom) - rect.bottom + Number.parseFloat(fill.bottom);
        const edge = index === 0
          ? rect.left + Number.parseFloat(fill.left) - trackRect.left - Number.parseFloat(background.left)
          : trackRect.right - Number.parseFloat(background.right) - rect.right + Number.parseFloat(fill.right);
        expect([top, bottom, edge], `${width}px, tab ${index + 1}`).toEqual([2, 2, 2]);
      }
    }
  } finally {
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([false, true])("secondary underlines match primary without clipping (inverse: %s)", async (inverse) => {
  const viewport = { width: innerWidth, height: innerHeight };
  try {
    flushSync(() => root.render(
      <div>
        {(["primary", "secondary"] as const).map((variant) => (
          <Tabs key={variant} defaultValue="one">
            <TabsList variant={variant} inverse={inverse} aria-label={variant}>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
          </Tabs>
        ))}
      </div>,
    ));
    for (const width of [375, 1280]) {
      await page.viewport(width, 812);
      const lists = container.querySelectorAll<HTMLElement>('[role="tablist"]');
      const visibleHeights = Array.from(lists, (list) => {
        const active = list.querySelector<HTMLElement>('[aria-selected="true"]')!;
        const underline = getComputedStyle(active, "::after");
        const bottom = active.getBoundingClientRect().bottom - Number.parseFloat(underline.bottom);
        const top = bottom - Number.parseFloat(underline.height);
        const clipTop = list.getBoundingClientRect().top + list.clientTop;
        return Math.min(bottom, clipTop + list.clientHeight) - Math.max(top, clipTop);
      });
      expect(visibleHeights, `${width}px viewport`).toEqual([2, 2]);
      for (const list of lists) expect(list.scrollHeight).toBe(list.clientHeight);
    }
  } finally {
    await page.viewport(viewport.width, viewport.height);
  }
});

test("keeps localized and similar values linked to distinct panels", () => {
  const values = ["食品", "美妆", "a b", "a-b", "News", "news", "a%20b", ""];
  flushSync(() => root.render(
    <Tabs defaultValue={values[0]}>
      <TabsList aria-label="Categories">
        {values.map((value) => <TabsTrigger key={value} value={value}>{value || "Empty"}</TabsTrigger>)}
      </TabsList>
      {values.map((value) => <TabsContent key={value} value={value}>{value || "Empty"} content</TabsContent>)}
    </Tabs>,
  ));
  const tabs = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'));
  const panels = Array.from(container.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  expect(new Set([...tabs, ...panels].map((item) => item.id)).size).toBe(values.length * 2);
  tabs.forEach((tab, index) => {
    expect(document.getElementById(tab.getAttribute("aria-controls")!)).toBe(panels[index]);
    expect(document.getElementById(panels[index]!.getAttribute("aria-labelledby")!)).toBe(tab);
  });
});

test("offers one enabled tab stop before a selection and skips disabled tabs", async () => {
  flushSync(() => root.render(
    <Tabs>
      <TabsList aria-label="Categories">
        <TabsTrigger value="disabled" disabled>Coming soon</TabsTrigger>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">One content</TabsContent>
      <TabsContent value="two">Two content</TabsContent>
    </Tabs>,
  ));
  const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(Array.from(tabs, (tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  await userEvent.tab();
  expect(tabs[1]).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  expect(tabs[2]).toHaveFocus();
  expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{ArrowRight}");
  expect(tabs[1]).toHaveFocus();
  await userEvent.keyboard("{End}");
  expect(tabs[2]).toHaveFocus();
  await userEvent.keyboard("{Home}");
  expect(tabs[1]).toHaveFocus();
  await userEvent.tab();
  expect(container.querySelector('[role="tabpanel"]:not([hidden])')).toHaveFocus();
});

test.each(["{Enter}", " "])("manual activation separates focus from selection until %s", async (key) => {
  const change = vi.fn();
  flushSync(() => root.render(
    <>
      <button>Before tabs</button>
      <Tabs defaultValue="one" activationMode="manual" onValueChange={change}>
        <TabsList aria-label="Categories">
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">One content</TabsContent>
        <TabsContent value="two">Two content</TabsContent>
      </Tabs>
    </>,
  ));
  const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  tabs[0]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(tabs[2]).toHaveFocus();
  expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  expect(Array.from(tabs, (tab) => tab.tabIndex)).toEqual([-1, -1, 0]);
  expect(change).not.toHaveBeenCalled();
  await userEvent.tab({ shift: true });
  expect(container.querySelector("button")).toHaveFocus();
  await userEvent.tab();
  expect(tabs[2]).toHaveFocus();
  await userEvent.keyboard(key);
  expect(tabs[2]).toHaveAttribute("aria-selected", "true");
  expect(change).toHaveBeenCalledWith("two");
});

test("controlled state follows its owner and supports external panels", async () => {
  const change = vi.fn();
  const render = (value: string) => flushSync(() => root.render(
    <Tabs value={value} onValueChange={change}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="one" controls="external-one">One</TabsTrigger>
        <TabsTrigger value="two" controls="external-two">Two</TabsTrigger>
      </TabsList>
      <section id="external-one">One section</section>
      <section id="external-two">Two section</section>
    </Tabs>,
  ));
  render("one");
  const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(tabs[0]!.matches(":focus-visible")).toBe(false);
  await page.elementLocator(tabs[1]!).click();
  expect(tabs[1]!.matches(":focus-visible")).toBe(false);
  expect(change).toHaveBeenCalledWith("two");
  expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  expect(tabs[1]).toHaveAttribute("aria-controls", "external-two");
  render("two");
  expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{ArrowLeft}");
  expect(tabs[0]).toHaveFocus();
  expect(tabs[0]!.matches(":focus-visible")).toBe(true);
  expect(getComputedStyle(tabs[0]!).outlineStyle).toBe("solid");
  expect(getComputedStyle(tabs[0]!).outlineWidth).toBe("2px");
});

test.each([
  { variant: "primary", verticalHeight: 44, horizontalHeight: 56, horizontalGap: 24 },
  { variant: "secondary", verticalHeight: 40, horizontalHeight: 40, horizontalGap: 16 },
] as const)("vertical $variant tabs use compact spacing while preserving horizontal geometry", async ({ variant, verticalHeight, horizontalHeight, horizontalGap }) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const render = (orientation: "horizontal" | "vertical") => flushSync(() => root.render(
    <Tabs defaultValue="one" orientation={orientation}>
      <TabsList variant={variant} aria-label="Sections">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">One content</TabsContent>
      <TabsContent value="two">Two content</TabsContent>
    </Tabs>,
  ));
  try {
    for (const width of [375, 1280]) {
      await page.viewport(width, 812);
      render("vertical");
      const [one, two] = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      expect(one!.getBoundingClientRect().height).toBe(verticalHeight);
      expect(two!.getBoundingClientRect().top - one!.getBoundingClientRect().bottom).toBe(4);
      if (variant === "primary") {
        const marker = getComputedStyle(one!, "::after");
        const markerTop = one!.getBoundingClientRect().bottom - Number.parseFloat(marker.bottom) - Number.parseFloat(marker.height);
        expect(markerTop - one!.querySelector("span")!.getBoundingClientRect().bottom).toBe(4);
      }
      one!.focus();
      await userEvent.keyboard("{ArrowDown}");
      expect(two).toHaveFocus();
      expect(two).toHaveAttribute("aria-selected", "true");
      render("horizontal");
      expect(one!.getBoundingClientRect().height).toBe(horizontalHeight);
      expect(two!.getBoundingClientRect().left - one!.getBoundingClientRect().right).toBe(horizontalGap);
    }
  } finally {
    await page.viewport(viewport.width, viewport.height);
  }
});

test("vertical segmented tabs stack and use only vertical arrow keys", async () => {
  flushSync(() => root.render(
    <Tabs defaultValue="one" orientation="vertical">
      <TabsList variant="primary" styleVariant="b" aria-label="Sections">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">One content</TabsContent>
      <TabsContent value="two">Two content</TabsContent>
    </Tabs>,
  ));
  const [one, two] = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(two!.getBoundingClientRect().top).toBeGreaterThanOrEqual(one!.getBoundingClientRect().bottom);
  one!.focus();
  await userEvent.keyboard("{ArrowRight}");
  expect(one).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  expect(two).toHaveFocus();
  expect(two).toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{ArrowUp}");
  expect(one).toHaveFocus();
});

test("full-width segmented tabs distribute short labels and retain overflow for long labels", () => {
  container.style.width = "400px";
  const render = (long: boolean) => flushSync(() => root.render(
    <Tabs defaultValue="one">
      <TabsList variant="primary" styleVariant="b" fullWidth aria-label="Sections">
        <TabsTrigger value="one">{long ? "A very long first section label" : "One"}</TabsTrigger>
        <TabsTrigger value="two">{long ? "A very long second section label" : "Two"}</TabsTrigger>
      </TabsList>
    </Tabs>,
  ));
  render(false);
  const list = container.querySelector<HTMLElement>('[role="tablist"]')!;
  const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');
  expect(tabs[0]!.getBoundingClientRect().width).toBeGreaterThan(180);
  expect(tabs[0]!.getBoundingClientRect().width).toBeCloseTo(tabs[1]!.getBoundingClientRect().width);
  container.style.width = "240px";
  render(true);
  expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
});

test.each([false, true].flatMap((dark) => [false, true].map((inverse) => ({ dark, inverse }))))(
  "disabled colors win across every variant (dark=$dark, inverse=$inverse)",
  ({ dark, inverse }) => {
    container.className = dark ? "dark" : "";
    const change = vi.fn();
    flushSync(() => root.render(
      <>
        {(["primary", "secondary", "tertiary"] as const).map((variant) =>
          (variant === "primary" ? ["a", "b"] as const : ["a"] as const).map((styleVariant) => (
            <Tabs key={`${variant}-${styleVariant}`} defaultValue="one" onValueChange={change}>
              <TabsList variant={variant} styleVariant={styleVariant} inverse={inverse} aria-label={`${variant} ${styleVariant}`}>
                <TabsTrigger value="one">One</TabsTrigger>
                <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
              </TabsList>
            </Tabs>
          )),
        )}
      </>,
    ));
    const probe = document.createElement("span");
    probe.style.color = inverse ? "var(--text-disabled-inverse)" : "var(--text-disabled)";
    container.append(probe);
    for (const tab of container.querySelectorAll<HTMLElement>('[role="tab"][aria-disabled="true"]')) {
      expect(getComputedStyle(tab).color).toBe(getComputedStyle(probe).color);
      expect(getComputedStyle(tab).opacity).toBe("1");
      expect(tab.tabIndex).toBe(-1);
      tab.click();
    }
    expect(change).not.toHaveBeenCalled();
  },
);

test("skeleton lists expose no interactive tabs", () => {
  flushSync(() => root.render(
    <Tabs>
      <TabsList skeleton skeletonCount={3} aria-label="Loading categories">
        <TabsTrigger value="one">One</TabsTrigger>
      </TabsList>
    </Tabs>,
  ));
  const skeleton = container.querySelector('[data-skeleton="true"]')!;
  expect(skeleton).toHaveAttribute("aria-hidden", "true");
  expect(skeleton.children).toHaveLength(3);
  expect(container.querySelector('[role="tab"]')).toBeNull();
});

for (const dark of [false, true]) {
  for (const inverse of [false, true]) {
    test(`Primary B focus follows the visible capsule in ${dark ? "dark" : "light"} / ${inverse ? "inverse" : "default"}`, async () => {
      const viewport = { width: innerWidth, height: innerHeight };
      container.className = dark ? "dark" : "";
      try {
        for (const width of [375, 1280]) {
          await page.viewport(width, 812);
          for (const orientation of ["horizontal", "vertical"] as const) {
            flushSync(() => root.render(<Tabs key={`${width}-${orientation}`} defaultValue="one" orientation={orientation}>
              <TabsList variant="primary" styleVariant="b" inverse={inverse} aria-label="Sections">
                <TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger>
              </TabsList>
            </Tabs>));
            const [one, two] = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
            one!.focus();
            await userEvent.keyboard(orientation === "horizontal" ? "{ArrowRight}" : "{ArrowDown}");
            expect(two).toHaveFocus();
            const trigger = getComputedStyle(two!);
            const capsule = getComputedStyle(two!, "::before");
            const rect = two!.getBoundingClientRect();
            const capsuleHeight = rect.height - Number.parseFloat(capsule.top) - Number.parseFloat(capsule.bottom);
            expect(rect.height).toBe(44);
            expect(capsuleHeight).toBe(width >= 1024 && orientation === "horizontal" ? 36 : 32);
            expect(trigger.outlineStyle).toBe("none");
            expect(capsule.outlineStyle).toBe("solid");
            expect(capsule.outlineWidth).toBe("2px");
            expect(capsule.outlineOffset).toBe("2px");
            expect(capsule.borderRadius).toBe(trigger.borderRadius);
            expect(capsule.outlineColor).toBe(dark !== inverse ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
            const expandedHeight = capsuleHeight + 2 * (Number.parseFloat(capsule.outlineWidth) + Number.parseFloat(capsule.outlineOffset));
            expect(expandedHeight).toBe(width >= 1024 && orientation === "horizontal" ? 44 : 40);
          }
        }
      } finally {
        await page.viewport(viewport.width, viewport.height);
      }
    });
  }
}
