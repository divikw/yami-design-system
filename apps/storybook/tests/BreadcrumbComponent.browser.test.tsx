import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { composeStory } from "@storybook/react-vite";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";

import { Breadcrumb } from "../../../packages/design-system/components/Breadcrumb";
import { CollapsedBreadcrumb } from "../../../packages/design-system/components/Breadcrumb/examples";
import * as stories from "../../../packages/design-system/components/Breadcrumb/Breadcrumb.stories";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

for (const locale of ["zh", "en"] as const) for (const dark of [false, true]) for (const inverse of [false, true]) {
  test(`${locale}/${dark ? "dark" : "light"}/${inverse ? "inverse" : "default"}: native focus, target sizes and current-page semantics`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const originalClass = document.documentElement.className;
    const container = document.createElement("div");
    container.style.padding = "16px";
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(1280, 800);
      document.documentElement.classList.toggle("dark", dark);
      flushSync(() => root.render(<Breadcrumb locale={locale} inverse={inverse} items={[
        { label: locale === "zh" ? "文档" : "Documentation", href: `/${locale}/docs/getting-started` },
        { label: locale === "zh" ? "组件" : "Components", href: `/${locale}/docs/browse-components` },
        { label: locale === "zh" ? "面包屑" : "Breadcrumb", current: true },
      ]} />));
      const nav = container.querySelector("nav")!;
      expect(nav).toHaveAccessibleName(locale === "zh" ? "面包屑导航" : "Breadcrumb");
      expect(nav).toHaveAttribute("lang", locale);
      expect(nav.querySelectorAll("ol > li")).toHaveLength(3);
      const list = nav.querySelector("ol")!;
      const first = list.firstElementChild!.getBoundingClientRect();
      const last = list.lastElementChild!.getBoundingClientRect();
      expect(list.getBoundingClientRect().width).toBeCloseTo(last.right - first.left, 0);
      expect(nav.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
      expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
      expect(nav.querySelector('[aria-current="page"]')).not.toHaveAttribute("tabindex");
      expect(nav.querySelector(":focus-visible")).toBeNull();
      const links = [...nav.querySelectorAll("a")];
      await userEvent.tab();
      expect(links[0]).toHaveFocus();
      await userEvent.tab();
      expect(links[1]).toHaveFocus();
      await userEvent.tab({ shift: true });
      expect(links[0]).toHaveFocus();
      for (const link of links) {
        link.focus();
        const style = getComputedStyle(link);
        expect(link.getBoundingClientRect().height).toBe(24);
        expect(link.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
        expect(style.outlineWidth).toBe("2px");
        expect(style.outlineOffset).toBe("2px");
        expect(style.outlineColor).toBe(dark !== inverse ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
        const box = link.getBoundingClientRect();
        const navBox = nav.getBoundingClientRect();
        expect(box.left - 4).toBeGreaterThanOrEqual(navBox.left);
        expect(box.right + 4).toBeLessThanOrEqual(navBox.right);
        expect(box.top - 4).toBeGreaterThanOrEqual(navBox.top);
        expect(box.bottom + 4).toBeLessThanOrEqual(navBox.bottom);
      }
      await page.viewport(375, 812);
      expect(nav).toBeVisible();
      for (const link of links) {
        expect(link.getBoundingClientRect().height).toBe(44);
        expect(link.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      }
      expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
    } finally {
      root.unmount();
      container.remove();
      document.documentElement.className = originalClass;
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("separators have equal space to adjacent link and current-page text on desktop and mobile", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const textBounds = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  try {
    flushSync(() => root.render(<Breadcrumb locale="zh" items={[
      { label: "美妆护肤", href: "/beauty" },
      { label: "面膜", href: "/masks" },
      { label: "贴片面膜", current: true },
    ]} />));
    await document.fonts.ready;
    for (const width of [1024, 375]) {
      await page.viewport(width, 800);
      for (const item of [...host.querySelectorAll("li")].slice(1)) {
        const before = textBounds(item.previousElementSibling!.lastElementChild!);
        const slash = textBounds(item.firstElementChild!);
        const after = textBounds(item.lastElementChild!);
        expect(slash.left - before.right).toBeCloseTo(8, 1);
        expect(after.left - slash.right).toBeCloseTo(8, 1);
      }
    }
  } finally {
    root.unmount();
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("links show an underline only on mouse hover when enabled", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const items = [{ label: "Beauty", href: "/beauty" }, { label: "Masks", current: true }];
  try {
    flushSync(() => root.render(<Breadcrumb items={items} />));
    const link = container.querySelector("a")!;
    const current = container.querySelector('[aria-current="page"]')!;
    const decoration = () => getComputedStyle(link).textDecorationLine;
    await page.elementLocator(current).hover();
    await expect.poll(decoration).toBe("none");
    await page.elementLocator(link).hover();
    await expect.poll(decoration).toBe("underline");
    await page.elementLocator(current).hover();
    await expect.poll(decoration).toBe("none");
    expect(getComputedStyle(current).textDecorationLine).toBe("none");
    flushSync(() => root.render(<Breadcrumb items={items} underline={false} />));
    await page.elementLocator(link).hover();
    await expect.poll(decoration).toBe("none");
  } finally {
    root.unmount();
    container.remove();
  }
});

test.each(["zh", "en"] as const)("collapsed %s trail exposes the omitted levels and tabs between the remaining links", async (locale) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<CollapsedBreadcrumb locale={locale} />));
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(4);
    const marker = items[1].querySelector('[role="img"]')!;
    expect(marker).toHaveAccessibleName(locale === "zh" ? "已省略中间层级" : "Omitted levels");
    expect(items[3].querySelector('[aria-current="page"]')).not.toBeNull();
    await userEvent.tab();
    expect(items[0].querySelector("a")).toHaveFocus();
    await userEvent.tab();
    expect(items[2].querySelector("a")).toHaveFocus();
  } finally {
    root.unmount();
    container.remove();
  }
});

test("static categories are not current pages; empty and single paths expose no extra controls", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<Breadcrumb items={[{ label: "Blog", href: "/en/blog" }, { label: "Engineering" }]} />));
    expect(container.querySelector('[aria-current]')).toBeNull();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    flushSync(() => root.render(<Breadcrumb aria-label="Article location" items={[{ label: "Article", current: true }]} />));
    expect(container.querySelector("nav")).toHaveAccessibleName("Article location");
    expect(container.querySelector('[aria-current="page"]')).toHaveTextContent("Article");
    expect(container.querySelector("a, button, [aria-hidden]")).toBeNull();
    flushSync(() => root.render(<Breadcrumb items={[]} />));
    expect(container.querySelector("nav")).toBeNull();
  } finally {
    root.unmount();
    container.remove();
  }
});

test("framework link adapters retain native destinations, keyboard activation and current semantics", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const click = vi.fn();
  try {
    flushSync(() => root.render(<Breadcrumb underline={false} size="md"
      items={[{ label: "Documentation", href: "/en/docs/getting-started", current: true }]}
      renderLink={(props) => <a {...props} data-framework-link onClick={(event) => { event.preventDefault(); click(); }} />} />));
    const link = container.querySelector("a")!;
    expect(link).toHaveRole("link");
    expect(link).toHaveAttribute("data-framework-link");
    expect(link).toHaveAttribute("href", "/en/docs/getting-started");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(getComputedStyle(link).textDecorationLine).toBe("none");
    await userEvent.tab();
    expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalledOnce();
    expect(getComputedStyle(link).outlineWidth).toBe("2px");
  } finally {
    root.unmount();
    container.remove();
  }
});

test.each(["zh", "en"] as const)("long %s paths wrap without clipping their links or focus gutters", async (locale) => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  container.style.cssText = "width:200px;padding:16px";
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(375, 812);
    const longLabel = locale === "zh" ? "低分子玻尿酸深层补水贴片面膜产品使用说明".repeat(3) : "Long-unbroken-product-category-label-".repeat(3);
    flushSync(() => root.render(<Breadcrumb locale={locale} items={[
      { label: longLabel, href: "/category" },
      { label: longLabel, current: true },
    ]} />));
    const nav = container.querySelector("nav")!;
    const link = nav.querySelector("a")!;
    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
    expect(link.getBoundingClientRect().height).toBeGreaterThan(44);
    await userEvent.tab();
    expect(link).toHaveFocus();
    const box = link.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    expect(box.left - 4).toBeGreaterThanOrEqual(navBox.left);
    expect(box.right + 4).toBeLessThanOrEqual(navBox.right);
    expect(box.bottom + 4).toBeLessThanOrEqual(navBox.bottom);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each(["zh", "en"] as const)("actual Storybook examples follow the %s toolbar and preserve initial state", (locale) => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const [name, story] of Object.entries({ Overview: stories.Showcase, Playground: stories.Playground, LongLabels: stories.LongLabels, States: stories.States })) {
      const Story = composeStory(story, stories.default, { initialGlobals: { locale } });
      flushSync(() => root.render(<Story />));
      const navs = container.querySelectorAll("nav");
      expect(navs).toHaveLength(name === "Overview" ? 3 : 1);
      const names = name === "Overview"
        ? locale === "zh" ? ["商品分类路径", "文档路径", "反色商品分类路径"] : ["Product category path", "Documentation path", "Inverse product category path"]
        : [locale === "zh" ? "面包屑导航" : "Breadcrumb"];
      for (const [index, nav] of [...navs].entries()) {
        expect(nav).toHaveAccessibleName(names[index]);
        expect(nav.querySelector(":focus-visible")).toBeNull();
      }
      expect(container.textContent).toContain(locale === "zh" ? name === "States" ? "首页" : "面膜" : name === "States" ? "Home" : "Masks");
    }
  } finally {
    root.unmount();
    container.remove();
  }
});
