import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const corePages = [
  "/zh",
  "/en/docs/getting-started",
  "/zh/blog/introducing-yami-design-system",
];

for (const pathname of corePages) {
  test(`has no automatically detectable accessibility violations on ${pathname}`, async ({ page }) => {
    // 审计稳定呈现的颜色，避免捕获入场动画的中间透明度。
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pathname);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("search Sheet and mobile menu have no automatically detectable violations", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/zh");

  await page.getByRole("button", { name: "搜索" }).click();
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "菜单" }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
