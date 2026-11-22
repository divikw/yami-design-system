import type { ContextType } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, ButtonLink, Input, Pagination, ProductList } from "@yami/design-system";
import { DialogExample } from "../../../packages/design-system/components/Dialog/examples";
import { DrawerExample } from "../../../packages/design-system/components/Drawer/examples";
import componentCatalog from "../../../packages/design-system/generated/catalog.json";
import { AlertDocsPage } from "../.storybook/alert-docs";
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
import { ComboboxDocsPage } from "../.storybook/combobox-docs";
import { DividerDocsPage } from "../.storybook/divider-docs";
import { ComponentDocsPreview } from "../.storybook/component-docs-preview";
import { ComponentPropertiesPage } from "../.storybook/component-properties";
import { headerProperties } from "../.storybook/header-properties";
import { createHeaderCategories } from "../../../packages/design-system/components/Header/fixtures";
import { alertDialogProperties } from "../.storybook/properties-examples";
import { productCardProperties, productListProperties } from "../.storybook/product-display-properties";
import { componentDocsName } from "../.storybook/component-docs-names";
import { CodeBlock, DocsExampleCard } from "../.storybook/component-docs-template";
import docsStyles from "../.storybook/component-docs-template.module.css";
import "@yami/design-system/tokens.css";
import "../.storybook/preview.css";

const propertiesGuides = [
  ["Accordion", AccordionDocsPage], ["Alert", AlertDocsPage], ["AlertDialog", AlertDialogDocsPage],
  ["AspectRatio", AspectRatioDocsPage], ["Avatar", AvatarDocsPage], ["Badge", BadgeDocsPage],
  ["Breadcrumb", BreadcrumbDocsPage], ["Button", ButtonDocsPage], ["ButtonGroup", ButtonGroupDocsPage],
  ["Card", CardDocsPage], ["Checkbox", CheckboxDocsPage], ["Combobox", ComboboxDocsPage],
  ["Dialog", DialogDocsPage], ["Divider", DividerDocsPage], ["Drawer", DrawerDocsPage],
  ["Radio Group", RadioGroupDocsPage],
] as const;

test("every catalog component has a Chinese Docs name", () => {
  const missing = componentCatalog.components
    .map(({ id }) => id)
    .filter(name => !/\p{Script=Han}/u.test(componentDocsName(name, "zh")));
  expect(missing).toEqual([]);
  expect(componentDocsName("Floating Bars", "zh")).toBe(componentDocsName("Billboard", "zh"));
  expect(componentDocsName("Floating Bars", "en")).toBe("Floating Bars");
});

test("component Docs cap the reading column and show the directory only when it fits", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  host.className = "sbdocs-wrapper";
  Object.assign(host.style, { display: "flex", flexDirection: "row-reverse", justifyContent: "center" });
  host.innerHTML = '<aside class="sbdocs-toc--custom"></aside><div class="sbdocs-content" style="flex: 1"><div><article data-component-docs></article></div></div>';
  document.body.append(host);
  const content = host.querySelector(".sbdocs-content")!;
  const directory = host.querySelector("aside")!;

  try {
    for (const [width, columnWidth, directoryWidth] of [[1280, 880, 160], [1279, 880, 0], [820, 772, 0], [390, 358, 0]]) {
      await page.viewport(width, 720);
      const column = content.getBoundingClientRect();
      const toc = directory.getBoundingClientRect();
      expect(column.width).toBe(columnWidth);
      expect(toc.width).toBe(directoryWidth);
      if (directoryWidth) expect(toc.left - column.right).toBe(32);
      expect(column.left).toBeCloseTo(width - (directoryWidth ? toc.right : column.right), 0);
    }
  } finally {
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

for (const locale of ["zh", "en"] as const) {
  test.each(propertiesGuides)(`%s shares the docs layout and code disclosure in ${locale}`, async (name, Guide) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const context = {
      componentStories: () => [{}], getStoryContext: () => ({ globals: { locale, theme: "light" } }),
      channel: { on: vi.fn(), off: vi.fn() },
    } as unknown as ContextType<typeof DocsContext>;
    try {
      flushSync(() => root.render(<ThemeProvider theme={convert(themes.light)}><DocsContext.Provider value={context}><Guide locale={locale} /></DocsContext.Provider></ThemeProvider>));
      expect(host.querySelector("article[data-component-docs]")).not.toBeNull();
      const title = host.querySelector("h1")!;
      expect(title.textContent).toBe(componentDocsName(name, locale));
      expect(getComputedStyle(title).fontSize).toBe("32px");
      const intro = host.querySelector("header p")!;
      expect(getComputedStyle(intro).fontSize).toBe("16px");
      expect(intro.getBoundingClientRect().width).toBeCloseTo(intro.closest("header")!.getBoundingClientRect().width);
      const previous = host.querySelector('header a[aria-label^="上一个"], header a[aria-label^="Previous"]');
      const previousPaths = { "Radio Group": "yami-components-data-display-progress", Drawer: "yami-components-layout-divider", Checkbox: "yami-components-layout-card", Combobox: "yami-components-forms-checkbox", Divider: "yami-components-layout-dialog", Card: "yami-components-actions-button-group", Breadcrumb: "yami-components-data-display-badge", Button: "yami-components-navigation-breadcrumb", ButtonGroup: "yami-components-actions-button", Dialog: "yami-components-forms-combobox", Alert: "yami-components-layout-accordion", AlertDialog: "yami-components-data-display-alert", AspectRatio: "yami-components-layout-alert-dialog", Avatar: "yami-components-layout-aspectratio", Badge: "yami-components-data-display-avatar" };
      if (name === "Accordion") expect(previous).toBeNull();
      else expect(previous?.getAttribute("href")).toBe(`/?path=/docs/${previousPaths[name]}--docs${locale === "en" ? "&globals=locale:en" : ""}`);
      const headings = [...host.querySelectorAll("article[data-component-docs] > section > h2[id], article[data-component-docs] > section > section > h3[id]")];
      const chapterTitles = headings.filter(heading => heading.tagName === "H2").map(heading => heading.textContent);
      const zh = locale === "zh";
      expect(chapterTitles[0]).toBe(zh ? "用法" : "Usage");
      expect(chapterTitles).not.toContain(zh ? "安装" : "Installation");
      expect(chapterTitles).toContain(zh ? "API 参考" : "API Reference");
      {
        expect(chapterTitles).toEqual(zh ? ["用法", "组合结构", "使用建议", "示例", "API 参考", "无障碍"]
          : ["Usage", "Anatomy", "Best Practices", "Examples", "API Reference", "Accessibility"]);
        const guidance = page.getByRole("table", { name: zh ? "使用建议" : "Best Practices" });
        expect(guidance.getByRole("cell", { name: zh ? "推荐" : "Do", exact: true }).all().length).toBeGreaterThan(0);
        expect(guidance.getByRole("cell", { name: zh ? "避免" : "Avoid", exact: true }).all().length).toBeGreaterThan(0);
      }
      if (name === "Button") expect(host.querySelector("h3#button-variants")).not.toBeNull();
      expect(new Set(headings.map((h) => h.id)).size).toBe(headings.length);
      expect(host.textContent).not.toContain("RTL");
      if (locale === "en") expect(host.textContent).not.toMatch(/[\u4e00-\u9fff]/u);
      const example = host.querySelector<HTMLElement>("[data-example]")!;
      if (name === "Breadcrumb") {
        const frame = example.querySelector("iframe")!;
        const items = () => frame.contentDocument?.querySelectorAll('[data-slot="breadcrumb"] ol > li');
        await expect.poll(() => items()?.length).toBe(2);
        const [first, second] = Array.from(items()!, item => item.getBoundingClientRect());
        expect(first.top + first.height / 2).toBeCloseTo(second.top + second.height / 2, 0);
      }
      const exampleButtons = [...host.querySelectorAll("[data-example] button")];
      expect(exampleButtons.some(button => ["PC", "Mobile"].includes(button.textContent?.trim() ?? ""))).toBe(false);
      const copyLabel = locale === "zh" ? "复制代码" : "Copy code";
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).toBeNull();
      const collapsedCode = example.querySelector('[data-expanded="false"]')!;
      const disclosure = collapsedCode.querySelector("button")!;
      expect(collapsedCode.getBoundingClientRect().bottom - disclosure.getBoundingClientRect().bottom).toBe(12);
      expect(getComputedStyle(disclosure).backgroundColor).toBe("rgb(255, 255, 255)");
      await page.getByRole("button", { name: locale === "zh" ? "查看代码" : "View Code", exact: true }).first().click();
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).not.toBeNull();
      expect(example.querySelector('[aria-expanded="true"]')).not.toBeNull();
      await page.getByRole("button", { name: locale === "zh" ? "收起代码" : "Hide Code", exact: true }).click();
      expect(example.querySelector(`[aria-label="${copyLabel}"]`)).toBeNull();
      const usage = headings[0].closest("section")!;
      await expect.poll(() => usage.querySelector("pre")?.textContent).toContain("@yami/design-system");
      await expect.poll(() => usage.querySelectorAll("pre")[1]?.textContent).toMatch(/<\w/);
      for (const svg of host.querySelectorAll("header svg")) {
        expect(svg.getAttribute("width")).toBe("16");
        expect(svg.getAttribute("stroke-width")).toBe("2");
      }
    } finally { root.unmount(); host.remove(); }
  });
}

test("Docs navigation stays beside the title on narrow screens without a page copy action", async () => {
  const originalViewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const context = {
    componentStories: () => [{}], getStoryContext: () => ({ globals: { locale: "zh", theme: "light" } }),
    channel: { on: vi.fn(), off: vi.fn() },
  } as unknown as ContextType<typeof DocsContext>;
  try {
    await page.viewport(375, 720);
    flushSync(() => root.render(<ThemeProvider theme={convert(themes.light)}><DocsContext.Provider value={context}><AlertDocsPage locale="zh" /></DocsContext.Provider></ThemeProvider>));
    const header = host.querySelector("header")!;
    const heading = header.querySelector("h1")!;
    expect(heading.textContent).toBe("页面内提示");
    expect(getComputedStyle(heading).fontSize).toBe("32px");
    const title = heading.getBoundingClientRect();
    const links = [...header.querySelectorAll("a")];
    expect(links).toHaveLength(2);
    expect(links.map(link => link.getAttribute("aria-label"))).toEqual(["上一个组件：折叠面板", "下一个组件：确认对话框"]);
    for (const link of links) {
      const bounds = link.getBoundingClientRect();
      const icon = link.querySelector("svg")!.getBoundingClientRect();
      expect(link).toHaveAttribute("data-slot", "button-link");
      expect([bounds.width, bounds.height]).toEqual([32, 32]);
      expect(getComputedStyle(link, "::before").width).toBe("40px");
      expect(bounds.left).toBeGreaterThanOrEqual(title.right);
      expect(bounds.top + bounds.height / 2).toBeCloseTo(title.top + title.height / 2, 0);
      expect(icon.top + icon.height / 2).toBeCloseTo(bounds.top + bounds.height / 2, 0);
    }
    expect(links[1].getBoundingClientRect().left - links[0].getBoundingClientRect().right).toBe(8);
    expect(header.querySelector("button")).toBeNull();
  } finally { root.unmount(); host.remove(); await page.viewport(originalViewport.width, originalViewport.height); }
});

test("a single-line snippet uses the caption scale and distinct syntax colors", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(
      <ThemeProvider theme={convert(themes.light)}>
        <CodeBlock code={'const link = <a href="/">Link</a>'} locale="en" collapsible />
      </ThemeProvider>,
    ));
    const collapsed = host.querySelector('[data-expanded="false"]')!.getBoundingClientRect();
    const disclosure = host.querySelector("button")!.getBoundingClientRect();
    expect(collapsed.height).toBe(120);
    expect(disclosure.top - collapsed.top).toBeGreaterThanOrEqual(16);
    await expect.poll(() => host.querySelector("pre .token.attr-value")).not.toBeNull();
    const snippet = host.querySelector("pre")!;
    const code = getComputedStyle(snippet);
    expect(code.fontSize).toBe("14px");
    expect(code.lineHeight).toBe("20px");
    const colors = [".keyword", ".attr-name", ".attr-value:not(.punctuation)", ".tag:not(.attr-name, .attr-value, .punctuation)"]
      .map(selector => getComputedStyle(snippet.querySelector(`.token${selector}`)!).color);
    expect(new Set([code.color, ...colors]).size).toBe(5);
  } finally { root.unmount(); host.remove(); }
});

test("code line numbers stay fixed from the first pixel of horizontal scrolling", async () => {
  const host = document.createElement("div");
  host.style.width = "280px";
  document.body.append(host);
  const root = createRoot(host);
  const code = `const first = "${"long line ".repeat(12)}";\nconst second = "short";`;
  try {
    flushSync(() => root.render(
      <ThemeProvider theme={convert(themes.light)}>
        <CodeBlock code={code} locale="en" />
      </ThemeProvider>,
    ));
    await expect.poll(() => host.querySelectorAll(".linenumber").length).toBe(2);
    const viewport = host.querySelector<HTMLElement>("[data-radix-scroll-area-viewport]")!;
    const numbers = [...viewport.querySelectorAll(".linenumber")];
    const keyword = viewport.querySelector(".token.keyword")!;
    const positions = numbers.map(number => number.getBoundingClientRect().left);
    const keywordStart = keyword.getBoundingClientRect().left;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    expect(maxScroll).toBeGreaterThan(100);
    for (const offset of [1, 12, maxScroll]) {
      viewport.scrollLeft = offset;
      expect(viewport.scrollLeft).toBe(offset);
      expect(numbers.map(number => number.getBoundingClientRect().left)).toEqual(positions);
      expect(keywordStart - keyword.getBoundingClientRect().left).toBeCloseTo(offset, 1);
    }
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

test("Docs underline spacing applies to prose while previews keep their own link styles", async () => {
  const host = document.createElement("div");
  host.className = docsStyles.page;
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<>
      <p><a id="prose-link" href="#usage">Usage guide</a></p>
      <DocsExampleCard locale="en"><a id="story-link" href="#details">Story link</a></DocsExampleCard>
      <ComponentDocsPreview locale="en" mode="document">
        <div style={{ textUnderlineOffset: "2px" }}><a id="document-link" href="#details">Document preview link</a></div>
      </ComponentDocsPreview>
      <ComponentDocsPreview locale="en">
        <a href="#details"><span>Iframe preview link</span></a>
      </ComponentDocsPreview>
    </>));
    const frame = host.querySelector("iframe")!;
    const frameText = () => frame.contentDocument?.querySelector("a span");
    await expect.poll(() => frameText()).toBeTruthy();
    expect(getComputedStyle(host.querySelector("#prose-link")!).textUnderlineOffset).toBe("4px");
    expect(getComputedStyle(host.querySelector("#story-link")!).textUnderlineOffset).toBe("auto");
    expect(getComputedStyle(host.querySelector("#document-link")!).textUnderlineOffset).toBe("2px");
    expect(getComputedStyle(frameText()!).textUnderlineOffset).toBe("auto");
  } finally { root.unmount(); host.remove(); }
});

test("a ProductList heading keeps its desktop typography inside a Docs preview", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(
      <ComponentDocsPreview locale="en" viewportWidth="1024px">
        <ProductList title="Products" products={[]} />
      </ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe")!;
    const title = () => frame.contentDocument?.querySelector('[data-slot="product-list-title"]');
    await expect.poll(title).toBeTruthy();
    const style = getComputedStyle(title()!);
    expect(style.fontSize).toBe("24px");
    expect(style.lineHeight).toBe("32px");
    expect(style.marginBlockEnd).toBe("0px");
  } finally { root.unmount(); host.remove(); }
});

test("the ProductList PC preview adapts its rail to the available width at actual size", async () => {
  const host = document.createElement("div");
  host.style.width = "640px";
  document.body.append(host);
  const root = createRoot(host);
  try {
    const values = productListProperties.initialValues("en");
    const { preview } = productListProperties.example(values, "en", "PC");
    flushSync(() => root.render(
      <ComponentDocsPreview locale="en" fullWidth={productListProperties.fullWidth}>
        {preview}
      </ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe")!;
    const rail = () => frame.contentDocument?.querySelector('[data-slot="product-list-items"]');
    await expect.poll(rail).toBeTruthy();
    for (const [width, columns] of [[880, 4], [640, 3], [400, 2], [320, 1]]) {
      host.style.width = `${width}px`;
      await expect.poll(() => frame.contentWindow?.innerWidth).toBe(width);
      expect(frame.getBoundingClientRect().width).toBe(width);
      await expect.poll(() => {
        const list = frame.contentDocument!.querySelector('[data-slot="product-list"]')!;
        const { top, bottom } = list.getBoundingClientRect();
        return Math.abs(top - (frame.clientHeight - bottom));
      }).toBeLessThan(1);
      const railBounds = rail()!.getBoundingClientRect();
      const cards = [...rail()!.querySelectorAll('[data-slot="product-list-item"]')];
      expect(cards.filter(card => card.getBoundingClientRect().right <= railBounds.right + 0.5)).toHaveLength(columns);
      const link = cards[0].querySelector<HTMLElement>('[data-slot="product-card-media-link"]')!;
      expect(Math.abs(link.getBoundingClientRect().width - link.offsetWidth)).toBeLessThan(0.5);
      expect(link.getBoundingClientRect()).toEqual(link.parentElement!.querySelector("img")!.getBoundingClientRect());
      const next = frame.contentDocument!.querySelector<HTMLElement>('button[data-direction="right"]');
      expect(next?.checkVisibility()).toBe(true);
    }
  } finally { root.unmount(); host.remove(); }
});

test("ProductCard Properties keeps the preview and focused fields visible while scrolling", async () => {
  const host = document.createElement("div");
  Object.assign(host.style, { height: "540px", overflowY: "auto" });
  document.body.append(host);
  const root = createRoot(host);
  const context = {
    componentStories: () => [{ title: "YAMI/ProductCard", tags: [], parameters: {} }],
    getStoryContext: () => ({ userGlobals: { locale: "en" }, globals: { locale: "en" } }),
    channel: { on: vi.fn(), off: vi.fn() },
  } as unknown as ContextType<typeof DocsContext>;
  try {
    flushSync(() => root.render(<DocsContext.Provider value={context}><ComponentPropertiesPage definition={productCardProperties} /></DocsContext.Provider>));
    const frame = host.querySelector("iframe")!;
    const addButton = () => frame.contentDocument?.querySelector<HTMLButtonElement>('[data-slot="product-card-add-button"]');
    await expect.poll(addButton).toBeTruthy();
    host.scrollTop = host.scrollHeight;
    const card = host.querySelector('[data-example="productcard-properties-preview"]')!;
    expect(card.getBoundingClientRect().top).toBeCloseTo(host.getBoundingClientRect().top);
    const availability = page.getByRole("combobox", { name: "Availability" });
    await availability.click();
    await page.getByRole("option", { name: "Sold out", exact: true }).click();
    await expect.poll(addButton).toBeNull();
    await availability.click();
    await page.getByRole("option", { name: "Available", exact: true }).click();
    await expect.poll(addButton).toBeTruthy();

    const price = () => frame.contentDocument?.querySelector('[data-slot="product-card-price"]');
    const onSale = page.getByRole("switch", { name: "On sale" });
    const required = host.querySelector('#productcard-properties-required + dl')!;
    const original = page.getByRole("textbox", { name: "Original price" });
    expect(required.contains(onSale.element())).toBe(true);
    expect(required.contains(original.element())).toBe(true);
    await expect.element(original).toBeRequired();
    await expect.poll(() => price()?.childElementCount).toBe(2);
    const saleColor = getComputedStyle(price()!.firstElementChild!).color;
    await onSale.click();
    await expect.poll(() => price()?.childElementCount).toBe(1);
    await expect.element(original).not.toBeInTheDocument();
    expect(getComputedStyle(price()!.firstElementChild!).color).not.toBe(saleColor);
    expect(frame.contentDocument?.querySelector('[data-slot="product-card-badges"]')).toBeNull();
    await onSale.click();
    await expect.poll(() => price()?.childElementCount).toBe(2);
    expect(getComputedStyle(price()!.firstElementChild!).color).toBe(saleColor);

    const firstField = page.getByRole("textbox", { name: "Brand name" }).element() as HTMLElement;
    firstField.focus({ preventScroll: true });
    expect(firstField.getBoundingClientRect().top).toBeGreaterThanOrEqual(card.getBoundingClientRect().bottom);
    expect(firstField.getBoundingClientRect().bottom).toBeLessThanOrEqual(host.getBoundingClientRect().bottom);
  } finally { root.unmount(); host.remove(); }
});

test("a Button on an inverse Docs surface keeps its inverse keyboard focus ring", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const originalTheme = document.documentElement.getAttribute("data-theme");
  const wasDark = document.documentElement.classList.contains("dark");
  document.documentElement.dataset.theme = "dark";
  document.documentElement.classList.add("dark");
  try {
    flushSync(() => root.render(
      <ComponentDocsPreview locale="en" previewBackground="var(--surface-inverse)">
        <Button inverse>Continue</Button>
      </ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe")!;
    await expect.poll(() => frame.contentDocument?.querySelector("button")).toBeTruthy();
    await userEvent.tab();
    const button = frame.contentDocument!.querySelector("button")!;
    button.focus();
    expect(button.matches(":focus-visible")).toBe(true);
    expect(getComputedStyle(button).outlineColor).toBe("rgb(0, 102, 235)");
  } finally {
    root.unmount();
    host.remove();
    if (originalTheme === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = originalTheme;
    document.documentElement.classList.toggle("dark", wasDark);
  }
});

test.each(["viewport", "document"] as const)("%s Docs previews center controls and preserve full-width layouts", async (mode) => {
  const host = document.createElement("div");
  host.style.width = "640px";
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(
      <ComponentDocsPreview mode={mode} locale="en">
        <Input density="compact" aria-label="Delivery address" />
        <Button form="full">Continue</Button>
      </ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe");
    const input = () => (frame?.contentDocument ?? host).querySelector('[data-slot="input"]');
    await expect.poll(() => input()?.getBoundingClientRect().width).toBe(320);
    const surface = getComputedStyle(host.firstElementChild!).backgroundColor;
    expect(surface).toBe("color(srgb 0.980392 0.980392 0.980392)");
    if (frame) expect(getComputedStyle(frame.contentDocument!.body).backgroundColor).toBe(surface);
    const area = input()!.parentElement!;
    const bounds = area.getBoundingClientRect();
    const field = input()!.getBoundingClientRect();
    expect(field.left + field.width / 2).toBeCloseTo(bounds.left + bounds.width / 2);
    expect(area.querySelector("button")!.getBoundingClientRect().width).toBe(bounds.width);
  } finally {
    root.unmount();
    host.remove();
  }
});

test("the Header preview fits the desktop layout and handles category keys in its iframe", async () => {
  const originalViewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  host.style.width = "640px";
  document.body.append(host);
  const root = createRoot(host);
  try {
    const { preview } = headerProperties.example({ ...headerProperties.initialValues("en"), categoryMenu: true }, "en", "PC");
    flushSync(() => root.render(
      <ComponentDocsPreview locale="en" viewportWidth="1024px" fullWidth>{preview}</ComponentDocsPreview>,
    ));
    const frame = host.querySelector("iframe")!;
    await expect.poll(() => frame.contentDocument?.querySelector('[data-slot="header-utility"]')?.checkVisibility()).toBe(true);
    await expect.poll(() => frame.getBoundingClientRect().width).toBeCloseTo(640);
    expect(frame.contentWindow?.innerWidth).toBe(1024);
    const header = frame.contentDocument!.querySelector('[data-slot="header"]')!;
    expect(header.getBoundingClientRect().width).toBe(1024);
    const rail = header.querySelector('[data-slot="header-categories-list"]')!;
    expect([...rail.querySelectorAll("[data-category-id]")].map((item) => item.getAttribute("data-category-id")))
      .toEqual(createHeaderCategories("en").map(({ id }) => id));
    expect(rail.querySelector('[data-category-id="summer-picks"] img')?.getAttribute("src"))
      .toBe("./assets/header-categories/summer-picks.png");
    expect([...rail.querySelectorAll('[data-slot="header-category-badges"]')].map((element) => element.textContent).join())
      .toContain("999+");
    const trigger = header.querySelector<HTMLButtonElement>("[data-category-trigger]")!;
    const menu = () => header.querySelector('[data-slot="header-category-menu"]');
    const keyboard = (key: string) => new frame.contentDocument!.defaultView!.KeyboardEvent("keydown", { key, bubbles: true });
    flushSync(() => trigger.dispatchEvent(keyboard("ArrowDown")));
    await expect.poll(menu).toBeTruthy();
    const item = menu()!.querySelector("button")!;
    await expect.poll(() => frame.contentDocument?.activeElement).toBe(item);
    flushSync(() => item.dispatchEvent(keyboard("Escape")));
    await expect.poll(menu).toBeNull();
    expect(frame.contentDocument?.activeElement).toBe(trigger);

    await page.viewport(900, 720);
    flushSync(() => root.render(<ComponentDocsPreview locale="en" fullWidth>{preview}</ComponentDocsPreview>));
    await expect.poll(() => frame.contentWindow?.innerWidth).toBe(402);
    await expect.poll(() => frame.getBoundingClientRect().width).toBeCloseTo(402);
    host.style.width = "330px";
    await expect.poll(() => frame.getBoundingClientRect().width).toBeCloseTo(330);
    expect(frame.contentWindow?.innerWidth).toBe(402);
  } finally {
    root.unmount();
    host.remove();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test("automatic Docs previews follow the Storybook window and fixed previews follow their device width", async () => {
  const originalViewport = { width: innerWidth, height: innerHeight };
  const docsFrame = document.createElement("iframe");
  docsFrame.id = "storybook-preview-iframe";
  docsFrame.style.width = "600px";
  docsFrame.style.height = "600px";
  document.body.append(docsFrame);
  const docs = docsFrame.contentDocument!;
  docs.head.append(...Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'), node => node.cloneNode(true)));
  const root = createRoot(docs.body);
  try {
    const pages = <Pagination page={1} pageCount={5} onPageChange={() => {}} />;
    flushSync(() => root.render(<>
      <ComponentDocsPreview locale="en">{pages}</ComponentDocsPreview>
      <ComponentDocsPreview locale="en" viewportWidth="375px">{pages}</ComponentDocsPreview>
    </>));
    const [automatic, fixed] = docs.querySelectorAll("iframe");
    const isPaginationVisible = (frame: HTMLIFrameElement) => frame.contentDocument?.querySelector('[data-slot="pagination"]')?.checkVisibility();
    await page.viewport(1023, 720);
    await expect.poll(() => isPaginationVisible(automatic)).toBe(false);
    await expect.poll(() => automatic.contentWindow?.innerWidth).toBe(1023);
    await page.viewport(1024, 720);
    await expect.poll(() => isPaginationVisible(automatic)).toBe(true);
    expect(automatic.contentWindow?.innerWidth).toBe(1024);
    expect(docsFrame.contentWindow?.innerWidth).toBe(600);
    expect(fixed.contentWindow?.innerWidth).toBe(375);
    await expect.poll(() => isPaginationVisible(fixed)).toBe(false);
  } finally {
    root.unmount();
    docsFrame.remove();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test("viewport previews keep unstyled content hidden while styles load", async () => {
  const host = document.createElement("div");
  const source = document.createElement("link");
  source.rel = "stylesheet";
  source.href = "data:text/css,.preview-style-test%7Bcolor%3Ared%7D";
  document.head.append(source);
  document.body.append(host);
  const root = createRoot(host);
  const clone = source.cloneNode(true) as HTMLLinkElement;
  clone.removeAttribute("href");
  const cloneStyle = vi.spyOn(source, "cloneNode").mockReturnValue(clone);

  try {
    flushSync(() => root.render(<ComponentDocsPreview locale="en">
      <span className="preview-style-test">Preview</span>
    </ComponentDocsPreview>));
    const frame = host.querySelector("iframe")!;
    await expect.poll(() => clone.isConnected).toBe(true);
    expect(getComputedStyle(frame).visibility).toBe("hidden");
    expect(host.querySelector('[data-slot="skeleton"]')).not.toBeNull();

    clone.href = source.href;
    await expect.poll(() => getComputedStyle(frame).visibility).toBe("visible");
    const example = frame.contentDocument!.querySelector(".preview-style-test")!;
    expect(getComputedStyle(example).color).toBe("rgb(255, 0, 0)");
    expect(host.querySelector('[data-slot="skeleton"]')).toBeNull();
  } finally {
    cloneStyle.mockRestore();
    root.unmount();
    source.remove();
    host.remove();
  }
});

test("standalone previews follow the Docs viewport while keeping their content inside the example", async () => {
  const host = document.createElement("div");
  const originalViewport = { width: innerWidth, height: innerHeight };
  host.style.width = "300px";
  document.body.append(host);
  const root = createRoot(host);
  const originalTheme = document.documentElement.getAttribute("data-theme");
  const wasDark = document.documentElement.classList.contains("dark");
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
    expect(canvasColor(second)).toBe("color(srgb 0.980392 0.980392 0.980392)");
    expect(canvasColor(first)).not.toBe(canvasColor(second));
    expect(second.contentWindow?.innerWidth).toBe(375);
    expect(host.getBoundingClientRect().width).toBe(300);
    const inputBounds = second.contentDocument!.querySelector('[data-slot="input"]')!.getBoundingClientRect();
    expect(inputBounds.width).toBeLessThanOrEqual(300 - 2 * 16);
    expect(inputBounds.left + inputBounds.width / 2).toBeCloseTo(375 / 2, 0);
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
    await expect.poll(() => first.contentDocument?.documentElement.dataset.theme).toBe("dark");
    await expect.poll(() => canvasColor(second)).toBe("rgb(57, 57, 57)");
    expect(canvasColor(first)).toBe(getComputedStyle(first.parentElement!).backgroundColor);
    expect(canvasColor(first)).not.toBe(canvasColor(second));
  } finally {
    if (originalTheme === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = originalTheme;
    document.documentElement.classList.toggle("dark", wasDark);
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

test("AlertDialog Properties covers the full document viewport and restores focus", async () => {
  const originalViewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  host.style.width = "320px";
  document.body.append(host);
  const root = createRoot(host);
  const story = {
    title: "YAMI/components/AlertDialog",
    tags: ["component-device"],
    parameters: { viewport: { options: {
      yamiDesktop: { styles: { width: "1024px", height: "768px" } },
      yamiMobile: { styles: { width: "375px", height: "812px" } },
    } } },
  };
  const context = {
    componentStories: () => [
      { ...story, name: "PC", storyGlobals: { viewport: { value: "yamiDesktop" } } },
      { ...story, name: "Mobile", storyGlobals: { viewport: { value: "yamiMobile" } } },
    ],
    getStoryContext: () => ({ userGlobals: { locale: "en" }, globals: { locale: "en", theme: "light" } }),
    channel: { on: vi.fn(), off: vi.fn() },
  } as unknown as ContextType<typeof DocsContext>;
  try {
    flushSync(() => root.render(<DocsContext.Provider value={context}><ComponentPropertiesPage definition={alertDialogProperties} /></DocsContext.Provider>));
    expect(host.querySelector("iframe")).toBeNull();
    expect(host.querySelector('[role="tablist"]')).toBeNull();
    await page.getByRole("textbox", { name: "Dialog title" }).fill("Confirm address change");
    const trigger = page.getByRole("button", { name: "Review changes", exact: true });
    for (const [viewportWidth, dialogWidth] of [[1280, 480], [375, 343]]) {
      await page.viewport(viewportWidth, 720);
      await trigger.click();
      const locator = page.getByRole("alertdialog", { name: "Confirm address change" });
      await expect.element(locator).toBeVisible();
      const dialog = locator.element();
      expect(host.contains(dialog)).toBe(false);
      expect(dialog.getBoundingClientRect().width).toBe(dialogWidth);
      const scrim = dialog.parentElement!.previousElementSibling!;
      const bounds = scrim.getBoundingClientRect();
      expect([bounds.x, bounds.y, bounds.width, bounds.height]).toEqual([0, 0, viewportWidth, 720]);
      await expect.element(page.getByRole("button", { name: "Cancel", exact: true })).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.element(locator).not.toBeInTheDocument();
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
