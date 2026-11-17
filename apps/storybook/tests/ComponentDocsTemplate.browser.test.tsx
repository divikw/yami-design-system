import type { ContextType } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { AccordionDocsPage } from "../.storybook/accordion-docs";
import { AspectRatioDocsPage } from "../.storybook/aspect-ratio-docs";
import { AvatarDocsPage } from "../.storybook/avatar-docs";
import { BadgeDocsPage } from "../.storybook/badge-docs";
import "@yami/design-system/tokens.css";

const guides = [
  ["Accordion", AccordionDocsPage], ["AspectRatio", AspectRatioDocsPage],
  ["Avatar", AvatarDocsPage], ["Badge", BadgeDocsPage],
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
      const previousPaths = { AspectRatio: "yami-components-layout-accordion", Avatar: "yami-components-layout-aspectratio", Badge: "yami-components-data-display-avatar" };
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
