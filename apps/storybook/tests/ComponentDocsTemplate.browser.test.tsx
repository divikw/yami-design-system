import type { ContextType } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { Button } from "@yami/design-system";
import { AccordionDocsPage } from "../.storybook/accordion-docs";
import { AspectRatioDocsPage } from "../.storybook/aspect-ratio-docs";
import { AvatarDocsPage } from "../.storybook/avatar-docs";
import { BadgeDocsPage } from "../.storybook/badge-docs";
import { ButtonDocsPage } from "../.storybook/button-docs";
import { ButtonGroupDocsPage } from "../.storybook/button-group-docs";
import { ComponentDocsPreview } from "../.storybook/component-docs-preview";
import { CodeBlock } from "../.storybook/component-docs-template";
import "@yami/design-system/tokens.css";

const guides = [
  ["Accordion", AccordionDocsPage], ["AspectRatio", AspectRatioDocsPage],
  ["Avatar", AvatarDocsPage], ["Badge", BadgeDocsPage],
  ["Button", ButtonDocsPage], ["ButtonGroup", ButtonGroupDocsPage],
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
      expect(host.querySelector("h1")?.textContent).toBe(name);
      const previous = host.querySelector('header a[aria-label^="上一个"], header a[aria-label^="Previous"]');
      const previousPaths = {
        AspectRatio: "yami-components-layout-accordion",
        Avatar: "yami-components-layout-aspectratio",
        Badge: "yami-components-data-display-avatar",
        Button: "yami-components-navigation-breadcrumb",
        ButtonGroup: "yami-components-actions-button",
      };
      if (name === "Accordion") expect(previous).toBeNull();
      else expect(previous?.getAttribute("href")).toBe(`/?path=/docs/${previousPaths[name]}--docs`);
      const headings = [...host.querySelectorAll("h2")];
      expect(headings.map((h) => h.textContent)).toContain(locale === "zh" ? "API 参考" : "API Reference");
      expect(new Set(headings.map((h) => h.id)).size).toBe(headings.length);
      expect(host.textContent).not.toContain("RTL");
      if (locale === "en") expect(host.textContent).not.toMatch(/[\u4e00-\u9fff]/u);
      const example = host.querySelector<HTMLElement>("[data-example]")!;
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

test("switching a preview changes its viewport and keeps the docs and other previews in place", async () => {
  const host = document.createElement("div");
  host.style.width = "300px";
  document.body.append(host);
  const root = createRoot(host);
  const originalTheme = document.documentElement.getAttribute("data-theme");
  try {
    flushSync(() => root.render(
      <>
        <ComponentDocsPreview name="first" locale="en"><Button form="full">Continue</Button></ComponentDocsPreview>
        <ComponentDocsPreview name="second" locale="en"><Button form="full">Save</Button></ComponentDocsPreview>
      </>,
    ));
    const [first, second] = host.querySelectorAll("iframe");
    const buttonHeight = (frame: HTMLIFrameElement) => frame.contentDocument?.querySelector("button")?.getBoundingClientRect().height;
    await expect.poll(() => buttonHeight(first)).toBe(48);
    expect(first.contentWindow?.innerWidth).toBe(1024);
    await page.getByRole("button", { name: "Mobile", exact: true }).first().click();
    await expect.poll(() => buttonHeight(first)).toBe(40);
    expect(first.contentWindow?.innerWidth).toBe(375);
    expect(second.contentWindow?.innerWidth).toBe(1024);
    expect(host.getBoundingClientRect().width).toBe(300);
    document.documentElement.dataset.theme = "dark";
    await expect.poll(() => first.contentDocument?.documentElement.dataset.theme).toBe("dark");
  } finally {
    if (originalTheme === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = originalTheme;
    root.unmount();
    host.remove();
  }
});
