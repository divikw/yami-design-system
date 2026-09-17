import { describe, expect, test } from "vitest";

import {
  formatUsageMarkdown,
  loadUsageForTitle,
} from "../.storybook/component-docs";

describe("component docs usage content", () => {
  test("resolves a spaced Storybook title to its component usage guide", async () => {
    const usage = await loadUsageForTitle(
      "YAMI/Components/Commerce/Product Card",
    );

    expect(usage).toContain("# ProductCard — 使用说明");
    expect(usage).toContain("## 使用场景");
  });

  test("resolves Card, which previously had no Storybook docs entry", async () => {
    expect(await loadUsageForTitle("YAMI/Components/Layout/Card")).toContain(
      "# Card — Usage",
    );
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
});
