import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { convert, ThemeProvider, themes } from "storybook/theming";
import { describe, expect, test } from "vitest";

import {
  formatUsageMarkdown,
  loadUsageForTitle,
  UsageMarkdown,
} from "../.storybook/component-docs";

describe("component docs usage content", () => {
  test("resolves a spaced Storybook title to its component usage guide", async () => {
    const usage = await loadUsageForTitle(
      "YAMI/Components/Commerce/Product Card",
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

  test("keeps existing single-language guides available in either locale", async () => {
    const title = "YAMI/Components/Commerce/Product Card";
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
    expect(await loadUsageForTitle("YAMI/Components/Commerce/Product Media Gallery/Draft")).toContain("# ProductMediaGallery");
  });

  test("demotes the usage title below the component page title", () => {
    expect(formatUsageMarkdown("# Button — Usage\n\n## When to use")).toBe(
      "## Button — Usage\n\n## When to use",
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
      const headings = [...container.querySelectorAll("h2, h3")];
      const ids = headings.map((heading) => heading.id);
      expect(ids.every(Boolean)).toBe(true);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids[3]).toBe("default-behavior-rule-card-no-border");
      for (const heading of headings) {
        expect(document.getElementById(heading.id)).toBe(heading);
        expect(heading.querySelector("a")?.getAttribute("href")).toBe(`#${heading.id}`);
      }
      render();
      expect([...container.querySelectorAll("h2, h3")].map((heading) => heading.id)).toEqual(ids);
    } finally {
      root.unmount();
      container.remove();
    }
  });
});
