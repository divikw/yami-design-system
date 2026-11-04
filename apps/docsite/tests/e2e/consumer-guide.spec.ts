import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const locale of ["zh", "en"] as const) {
  for (const width of [375, 1440]) {
    test(`${locale} consumers can find installation, project AI setup and rollback at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/docs/getting-started`);
      const title = locale === "zh" ? "在现有项目使用 YAMI" : "Use YAMI in an existing project";
      if (width === 375) await page.getByRole("button", { name: locale === "zh" ? "菜单" : "Menu", exact: true }).click();
      const navigation = page.getByRole("navigation", { name: locale === "zh" ? "YAMI 文档" : "YAMI Docs", exact: true });
      await navigation.getByRole("link", { name: title, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/docs/consume-package$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      const article = page.locator("article");
      for (const id of ["install-and-lock-the-artifacts", "let-codex-discover-the-packaged-skill", "configure-project-read-only-mcp", "upgrade-and-roll-back", "troubleshoot-common-problems"]) await expect(article.locator(`#${id}`)).toBeAttached();
      await expect(article.locator("pre").filter({ hasText: "[mcp_servers.yami_design_system]" })).toHaveCount(1);
      await expect(article.locator("pre").filter({ hasText: "name: yami-consumer" })).toHaveCount(1);
      await expect(article).toContainText("UPGRADE.json");
      await expect(article).toContainText("lockfile");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}
