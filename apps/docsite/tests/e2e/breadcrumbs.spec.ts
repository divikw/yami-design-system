import { expect, test } from "@playwright/test";

for (const kind of ["docs", "blog"] as const) for (const locale of ["zh", "en"] as const) for (const theme of ["light", "dark"] as const) {
  test(`${kind} breadcrumb has localized semantics and responsive focus geometry in ${locale}/${theme}`, async ({ page }) => {
    const slug = kind === "docs" ? "browse-components" : "build-test-document-components-with-storybook";
    await page.addInitScript(value => localStorage.setItem("yami-docsite-theme", value), theme);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}/${kind}/${slug}`);
    const nav = page.locator("article header nav");
    await expect(nav).toHaveAccessibleName(locale === "zh" ? "面包屑导航" : "Breadcrumb");
    await expect(nav.locator('[aria-hidden="true"]')).toHaveText("/");
    if (kind === "docs") {
      await expect(nav.locator('[aria-current="page"]')).toHaveText(locale === "zh" ? "查看组件与页面" : "Explore components and pages");
    } else {
      await expect(nav.locator('[aria-current]')).toHaveCount(0);
      await expect(nav).toContainText(locale === "zh" ? "工程" : "Engineering");
    }
    const link = nav.getByRole("link");
    await expect(link).toHaveAttribute("href", `/${locale}/${kind === "docs" ? "docs/getting-started" : "blog"}`);
    await page.keyboard.press("Tab");
    await link.focus();
    await expect(link).toHaveCSS("outline-width", "2px");
    await expect(link).toHaveCSS("outline-offset", "2px");
    await expect(link).toHaveCSS("outline-color", theme === "dark" ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
    const rect = await link.boundingBox();
    expect(rect!.height).toBe(24);
    expect(rect!.width).toBeGreaterThanOrEqual(24);
    const navRect = await nav.boundingBox();
    expect(rect!.x - 4).toBeGreaterThanOrEqual(navRect!.x);
    expect(rect!.y - 4).toBeGreaterThanOrEqual(navRect!.y);
    expect(rect!.y + rect!.height + 4).toBeLessThanOrEqual(navRect!.y + navRect!.height);
    await page.keyboard.press("Tab");
    await expect(link).not.toBeFocused();
    await page.setViewportSize({ width: 375, height: 812 });
    if (kind === "docs") await expect(nav).toBeHidden();
    else {
      await expect(link).toHaveCSS("min-height", "44px");
      await expect(link).toHaveCSS("min-width", "44px");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("link", { name: locale === "zh" ? "English" : "中文", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale === "zh" ? "en" : "zh"}/${kind}/${slug}$`));
    await expect(nav).toHaveAccessibleName(locale === "zh" ? "Breadcrumb" : "面包屑导航");
    const nextLocale = locale === "zh" ? "en" : "zh";
    await nav.getByRole("link").press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${nextLocale}/${kind === "docs" ? "docs/getting-started" : "blog"}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
