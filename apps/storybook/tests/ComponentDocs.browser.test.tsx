import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { describe, expect, test } from "vitest";
import { componentApiRows } from "../.storybook/component-docs-scope";
import { getPropertiesPreviewDevices } from "../.storybook/properties-preview-devices";

import {
  formatUsageMarkdown,
  loadUsageForTitle,
  UsageMarkdown,
} from "../.storybook/component-docs";

test("Properties offers the component's tagged App and H5 viewports in device order", () => {
  const options = {
    yamiDesktop: { styles: { width: "1024px", height: "768px" } },
    yamiMobile: { styles: { width: "375px", height: "812px" } },
  };
  const stories = [
    { name: "H5", viewport: "yamiMobile" },
    { name: "PC", viewport: "yamiDesktop" },
    { name: "APP", viewport: "yamiMobile" },
    { name: "Mobile", viewport: "yamiMobile" },
  ].map(({ name, viewport }) => ({
    name,
    tags: ["component-device"],
    storyGlobals: { viewport: { value: viewport } },
    parameters: { viewport: { options } },
  }));

  expect(getPropertiesPreviewDevices(stories)).toEqual([
    { name: "PC", width: "1024px" },
    { name: "App", width: "375px" },
    { name: "H5", width: "375px" },
  ]);
  expect(getPropertiesPreviewDevices(stories.filter(story => story.name === "PC" || story.name === "Mobile"))).toEqual([
    { name: "PC", width: "1024px" },
    { name: "Mobile", width: "375px" },
  ]);
});

describe("component docs usage content", () => {
  test("uses the public Pagination contract without marking mutually exclusive props as always required", () => {
    const rows = new Map(componentApiRows("pagination", "YAMI/Components/Pagination", "en"));
    expect(rows.get("page")).toContain(" · Required · ");
    expect(rows.get("onPageChange")).not.toContain(" · Required · ");
    expect(rows.get("getPageHref")).not.toContain(" · Required · ");
    expect(rows.get("disabled")).toContain("Default false");
    expect(rows.has("opener")).toBe(false);
  });

  test("loads Radio Group usage in the selected language", async () => {
    const title = "YAMI/Components/Radio Group";
    expect(await loadUsageForTitle(title, "zh")).toContain("## 键盘与无障碍");
    expect(await loadUsageForTitle(title, "en")).toContain("## Accessibility");
  });

  test("loads Pagination guidance in Chinese and English", async () => {
    const title = "YAMI/Components/Navigation/Pagination";
    const chinese = await loadUsageForTitle(title, "zh");
    const english = await loadUsageForTitle(title, "en");
    expect(chinese).toContain("# Pagination — 使用说明");
    expect(chinese).toContain("1024px");
    expect(chinese).not.toContain("## When to use");
    expect(english).toContain("# Pagination — Usage");
    expect(english).toContain("getPageHref");
    expect(english).not.toMatch(/[\u4e00-\u9fff]/u);
  });

  test("resolves a spaced Storybook title to its component usage guide", async () => {
    const usage = await loadUsageForTitle(
      "YAMI/Modules/Commerce/Product Card",
    );

    expect(usage).toContain("# ProductCard — 使用说明");
    expect(usage).toContain("## 使用场景");
  });

  test("loads Card usage in Chinese by default and English when selected", async () => {
    const chinese = await loadUsageForTitle("YAMI/Components/Layout/Card");
    const english = await loadUsageForTitle("YAMI/Components/Layout/Card", "en");
    expect(chinese).toContain("# Card — 使用说明");
    expect(chinese).toContain("## 交互行为");
    expect(chinese).toContain("### 内边距选择");
    expect(chinese).toContain("### 圆角归属");
    expect(chinese).toContain("## 窄屏与内容溢出");
    expect(chinese).not.toContain("## When to use");
    expect(english).toContain("# Card — Usage");
    expect(english).toContain("## Interaction");
    expect(english).toContain("### Choosing padding");
    expect(english).toContain("### Radius ownership");
    expect(english).toContain("## Narrow layouts and overflow");
    expect(english).not.toContain("## 使用场景");
  });

  test("loads Tabs guidance in the selected language without mixing sections", async () => {
    const chinese = await loadUsageForTitle("YAMI/Components/Navigation/Tabs");
    const english = await loadUsageForTitle("YAMI/Components/Navigation/Tabs", "en");
    expect(chinese).toContain("# Tabs — 使用说明");
    expect(chinese).toContain("## 键盘与 ARIA");
    expect(chinese).toContain("## 可滚动分区导航");
    expect(chinese).not.toContain("## When to use");
    expect(english).toContain("# Tabs — Usage");
    expect(english).toContain("## Keyboard and ARIA");
    expect(english).toContain("## Scrollable section navigation");
    expect(english).not.toMatch(/[\u4e00-\u9fff]/u);
    for (const usage of [chinese, english]) {
      expect(usage).toContain('activationMode="manual"');
      expect(usage).toContain("onValueChange={setValue}");
      expect(usage).toContain("centerActiveTab");
    }
  });

  test("keeps existing single-language guides available in either locale", async () => {
    const title = "YAMI/Modules/Commerce/Product Card";
    expect(await loadUsageForTitle(title, "en")).toBe(await loadUsageForTitle(title, "zh"));
  });

  test.each(["Button", "ButtonGroup"])("loads %s guidance in the selected language", async (component) => {
    const title = `YAMI/Components/Actions/${component}`;
    const chinese = await loadUsageForTitle(title, "zh");
    const english = await loadUsageForTitle(title, "en");
    expect(chinese).toContain("## 使用场景");
    expect(chinese).toContain("ButtonLink");
    expect(chinese).not.toContain("## When to use");
    expect(english).toContain("## When to use");
    expect(english).toContain("ButtonLink");
    expect(english).not.toContain("## 使用场景");
    expect(chinese).toContain("焦点框");
    expect(english).toContain("focus outlines");
  });

  test("resolves renamed modules and draft groups to their source usage guides", async () => {
    expect(await loadUsageForTitle("YAMI/Modules/Commerce/Floating Bars")).toContain("# ");
    expect(await loadUsageForTitle("YAMI/Modules/Commerce/Product Review Section/Draft")).toContain("# ProductReviewSection");
    expect(await loadUsageForTitle("YAMI/Modules/Commerce/Product Media Gallery/Draft")).toContain("# ProductMediaGallery");
  });

  test.each([
    "YAMI/Modules/Commerce/Product Review Section/Draft",
    "YAMI/Modules/Commerce/Product Media Gallery/Draft",
  ])("preserves the full usage content for lowercase index title %s", async (title) => {
    const original = await loadUsageForTitle(title);
    expect(original).toContain("# ");
    expect(await loadUsageForTitle(title.toLowerCase())).toBe(original);
  });

  test("nests usage headings below the component title and preserves fenced samples", () => {
    const code = "\n\n```sh\n# Example comment\n```";
    expect(formatUsageMarkdown("# Button — Usage\n\n## When to use" + code)).toBe(
      "## Button — Usage\n\n### When to use" + code,
    );
  });

  test.each([
    { locale: "zh", title: "圆角归属" },
    { locale: "en", title: "Radius ownership" },
  ])("$locale headings have stable, unique anchors including duplicates and punctuation", ({ title }) => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      const markdown = `# Card\n\n## ${title}\n\n## ${title}\n\n### Default behavior (rule: \`card-no-border\`)\n\n## !!!`;
      const render = () => flushSync(() => root.render(<ThemeProvider theme={convert(themes.light)}><UsageMarkdown>{markdown}</UsageMarkdown></ThemeProvider>));
      render();
      const headings = [...container.querySelectorAll("h2, h3, h4")];
      const ids = headings.map((heading) => heading.id);
      expect(ids.every(Boolean)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids[3]).toBe("default-behavior-rule-card-no-border");
      for (const heading of headings) {
        expect(document.getElementById(heading.id)).toBe(heading);
        expect(heading.querySelector("a")?.getAttribute("href")).toBe(`#${heading.id}`);
      }
      render();
      expect([...container.querySelectorAll("h2, h3, h4")].map((heading) => heading.id)).toEqual(ids);
    } finally {
      root.unmount();
      container.remove();
    }
  });
});
