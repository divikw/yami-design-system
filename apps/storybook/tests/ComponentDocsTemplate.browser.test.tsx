import type { ContextType } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { Button, ButtonLink, Input } from "@yami/design-system";
import { DialogExample } from "../../../packages/design-system/components/Dialog/examples";
import { DrawerExample } from "../../../packages/design-system/components/Drawer/examples";
import { AlertDialogDocsPage } from "../.storybook/alert-dialog-docs";
import { AccordionDocsPage } from "../.storybook/accordion-docs";
import { AspectRatioDocsPage } from "../.storybook/aspect-ratio-docs";
import { AvatarDocsPage } from "../.storybook/avatar-docs";
import { DrawerDocsPage } from "../.storybook/drawer-docs";
import { DialogDocsPage } from "../.storybook/dialog-docs";
import { BadgeDocsPage } from "../.storybook/badge-docs";
import { BreadcrumbDocsPage } from "../.storybook/breadcrumb-docs";
import { ButtonDocsPage } from "../.storybook/button-docs";
import { ButtonGroupDocsPage } from "../.storybook/button-group-docs";
import { CardDocsPage } from "../.storybook/card-docs";
import { RadioGroupDocsPage } from "../.storybook/radio-group-docs";
import { CheckboxDocsPage } from "../.storybook/checkbox-docs";
import { ComponentDocsPreview } from "../.storybook/component-docs-preview";
import { CodeBlock } from "../.storybook/component-docs-template";
import "@yami/design-system/tokens.css";

const guides = [
  ["Accordion", AccordionDocsPage], ["AlertDialog", AlertDialogDocsPage], ["AspectRatio", AspectRatioDocsPage],
  ["Avatar", AvatarDocsPage], ["Badge", BadgeDocsPage], ["Dialog", DialogDocsPage], ["Drawer", DrawerDocsPage],
  ["Breadcrumb", BreadcrumbDocsPage], ["Button", ButtonDocsPage], ["ButtonGroup", ButtonGroupDocsPage], ["Card", CardDocsPage], ["Checkbox", CheckboxDocsPage], ["Radio Group", RadioGroupDocsPage],
] as const;

for (const locale of ["zh", "en"] as const) {
  test.each(guides)(`%s shares the docs layout and code disclosure in ${locale}`, async (name, Guide) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const context = {
      componentStories: () => [{}], getStoryContext: () => ({ globals: { locale, theme: "light" } }),
      channel: { on: vi.fn(), off: vi.fn() },
    } as unknown as ContextType<typeof DocsContext>;
    try {
      flushSync(() => root.render(<ThemeProvider theme={convert(themes.light)}><DocsContext.Provider value={context}><Guide locale={locale} /></DocsContext.Provider></ThemeProvider>));
      const title = host.querySelector("h1")!;
      expect(title.textContent).toBe(name);
      expect(getComputedStyle(title).fontSize).toBe("32px");
      const previous = host.querySelector('header a[aria-label^="上一个"], header a[aria-label^="Previous"]');
      const previousPaths = { "Radio Group": "yami-components-data-display-progress", Drawer: "yami-components-layout-divider", Checkbox: "yami-components-layout-card", Card: "yami-components-actions-button-group", Breadcrumb: "yami-components-data-display-badge", Button: "yami-components-navigation-breadcrumb", ButtonGroup: "yami-components-actions-button", Dialog: "yami-components-forms-combobox", AlertDialog: "yami-components-data-display-alert", AspectRatio: "yami-components-layout-alert-dialog", Avatar: "yami-components-layout-aspectratio", Badge: "yami-components-data-display-avatar" };
      if (name === "Accordion") expect(previous).toBeNull();
      else expect(previous?.getAttribute("href")).toBe(`/?path=/docs/${previousPaths[name]}--docs`);
      const headings = [...host.querySelectorAll("h2")];
      expect(headings.map((h) => h.textContent)).toContain(locale === "zh" ? "API 参考" : "API Reference");
      expect(new Set(headings.map((h) => h.id)).size).toBe(headings.length);
      expect(host.textContent).not.toContain("RTL");
      if (locale === "en") expect(host.textContent).not.toMatch(/[\u4e00-\u9fff]/u);
      const example = host.querySelector<HTMLElement>("[data-example]")!;
      const exampleButtons = [...host.querySelectorAll("[data-example] button")];
      expect(exampleButtons.some(button => ["PC", "Mobile"].includes(button.textContent?.trim() ?? ""))).toBe(false);
      const copyLabel = locale === "zh" ? "复制代码" : "Copy code";
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).toBeNull();
      await page.getByRole("button", { name: locale === "zh" ? "查看代码" : "View Code", exact: true }).first().click();
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).not.toBeNull();
      expect(example.querySelector('[aria-expanded="true"]')).not.toBeNull();
      await page.getByRole("button", { name: locale === "zh" ? "收起代码" : "Hide Code", exact: true }).click();
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).toBeNull();
      await page.getByRole("button", { name: locale === "zh" ? "手动" : "Manual", exact: true }).click();
      expect(host.textContent).toContain('"dependencies"');
      for (const svg of host.querySelectorAll("header svg")) {
        expect(svg.getAttribute("width")).toBe("16");
        expect(svg.getAttribute("stroke-width")).toBe("2");
      }
    } finally { root.unmount(); host.remove(); }
  });
}

test("a single-line snippet leaves room above the code disclosure button", () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(
      <ThemeProvider theme={convert(themes.light)}>
        <CodeBlock code={'<a href="/">Link</a>'} locale="en" collapsible />
      </ThemeProvider>,
    ));
    const collapsed = host.querySelector('[data-expanded="false"]')!.getBoundingClientRect();
    const disclosure = host.querySelector("button")!.getBoundingClientRect();
    expect(collapsed.height).toBe(120);
    expect(disclosure.top - collapsed.top).toBeGreaterThanOrEqual(16);
  } finally { root.unmount(); host.remove(); }
});

test("a primary ButtonLink keeps its button text color inside a docs preview", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(
      <ComponentDocsPreview locale="en">
        <Button>Save</Button>
        <ButtonLink href="#details">Details</ButtonLink>
      </ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe")!;
    await expect.poll(() => frame.contentDocument?.querySelector("a")).toBeTruthy();
    const doc = frame.contentDocument!;
    expect(getComputedStyle(doc.querySelector("a")!).color).toBe(getComputedStyle(doc.querySelector("button")!).color);
  } finally { root.unmount(); host.remove(); }
});

test("previews follow the Docs viewport while keeping their content inside the example", async () => {
  const host = document.createElement("div");
  const originalViewport = { width: innerWidth, height: innerHeight };
  host.style.width = "300px";
  document.body.append(host);
  const root = createRoot(host);
  const originalTheme = document.documentElement.getAttribute("data-theme");
  try {
    flushSync(() => root.render(
      <>
        <ComponentDocsPreview name="first" locale="en" previewBackground="var(--surface-inverse)"><Button form="full" inverse>Continue</Button></ComponentDocsPreview>
        <ComponentDocsPreview name="second" locale="en"><Input density="compact" aria-label="Search" placeholder="Search" /></ComponentDocsPreview>
      </>,
    ));
    const [first, second] = host.querySelectorAll("iframe");
    const buttonHeight = (frame: HTMLIFrameElement) => frame.contentDocument?.querySelector("button")?.getBoundingClientRect().height;
    await page.viewport(1024, 720);
    await expect.poll(() => buttonHeight(first)).toBe(48);
    expect(first.contentWindow?.innerWidth).toBe(1024);
    await page.viewport(375, 720);
    await expect.poll(() => buttonHeight(first)).toBe(40);
    expect(first.contentWindow?.innerWidth).toBe(375);
    const canvasColor = (frame: HTMLIFrameElement) => getComputedStyle(frame.contentDocument!.body).backgroundColor;
    expect(canvasColor(first)).toBe(getComputedStyle(first.parentElement!).backgroundColor);
    expect(canvasColor(first)).not.toBe(canvasColor(second));
    expect(second.contentWindow?.innerWidth).toBe(375);
    expect(host.getBoundingClientRect().width).toBe(300);
    const inputBounds = second.contentDocument!.querySelector('[data-slot="input"]')!.getBoundingClientRect();
    expect(inputBounds.width).toBeLessThanOrEqual(300 - 2 * 16);
    expect(inputBounds.left + inputBounds.width / 2).toBeCloseTo(375 / 2, 0);
    document.documentElement.dataset.theme = "dark";
    await expect.poll(() => first.contentDocument?.documentElement.dataset.theme).toBe("dark");
  } finally {
    if (originalTheme === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = originalTheme;
    root.unmount();
    host.remove();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test("AlertDialog Docs follows the responsive layout and covers the full document viewport", async () => {
  const originalViewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  host.style.width = "320px";
  document.body.append(host);
  const root = createRoot(host);
  const context = {
    componentStories: () => [{}], getStoryContext: () => ({ globals: { locale: "en", theme: "light" } }),
    channel: { on: vi.fn(), off: vi.fn() },
  } as unknown as ContextType<typeof DocsContext>;
  try {
    flushSync(() => root.render(<ThemeProvider theme={convert(themes.light)}><DocsContext.Provider value={context}><AlertDialogDocsPage locale="en" /></DocsContext.Provider></ThemeProvider>));
    const popup = () => document.querySelector<HTMLElement>('[role="alertdialog"]');
    const lead = host.querySelector('[data-example="lead"]')!;
    expect(lead.querySelector("iframe")).toBeNull();

    for (const [viewportWidth, popupWidth, alignment] of [[1280, 480, "start"], [375, 343, "center"]] as const) {
      await page.viewport(viewportWidth, 720);
      const trigger = page.getByRole("button", { name: "Confirm changes", exact: true }).first();
      await trigger.click();
      await expect.poll(popup).toBeTruthy();
      const dialog = popup()!;
      expect(host.contains(dialog)).toBe(false);
      expect(getComputedStyle(dialog.querySelector('[data-slot="alert-dialog-header"]')!).textAlign).toBe(alignment);
      const bounds = dialog.getBoundingClientRect();
      expect(bounds.width).toBe(popupWidth);
      expect(Math.abs(bounds.left + bounds.width / 2 - viewportWidth / 2)).toBeLessThan(1);
      const scrim = dialog.parentElement!.previousElementSibling!;
      const scrimBounds = scrim.getBoundingClientRect();
      expect([scrimBounds.x, scrimBounds.y, scrimBounds.width, scrimBounds.height]).toEqual([0, 0, viewportWidth, 720]);
      const cancel = page.getByRole("button", { name: "Cancel", exact: true });
      await expect.element(cancel).toHaveFocus();
      await cancel.click();
      await expect.poll(popup).toBeNull();
      await expect.element(trigger).toHaveFocus();
    }
  } finally { root.unmount(); host.remove(); await page.viewport(originalViewport.width, originalViewport.height); }
});

test.each(["Dialog", "Drawer"] as const)("%s opens outside the docs example without clipping its content", async (name) => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const example = name === "Dialog" ? <DialogExample locale="en" /> : <DrawerExample locale="en" />;
  try {
    flushSync(() => root.render(<ComponentDocsPreview mode="document" locale="en">{example}</ComponentDocsPreview>));
    expect(host.querySelector("iframe")).toBeNull();
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    trigger.focus();
    trigger.click();
    const selector = '[role="dialog"]';
    await expect.poll(() => document.querySelector(selector)).not.toBeNull();
    const popup = document.querySelector<HTMLElement>(selector)!;
    expect(host.contains(popup)).toBe(false);
    if (name === "Dialog") {
      const input = popup.querySelector("input")!;
      const rect = input.getBoundingClientRect();
      const footer = popup.querySelector('[data-slot="dialog-footer"]')!.getBoundingClientRect();
      expect(rect.height).toBeGreaterThan(0);
      expect(rect.bottom).toBeLessThanOrEqual(footer.top);
    }
    popup.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    await expect.poll(() => document.querySelector(selector)).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger);
  } finally { root.unmount(); host.remove(); }
});
