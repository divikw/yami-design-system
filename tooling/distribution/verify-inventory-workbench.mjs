import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

export async function verifyInventoryWorkbench({ page, url, reportDir, host }) {
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };
  const narrow = { width: 320, height: 740 };
  const states = {};
  const main = page.getByRole("main");
  const inventory = main.getByRole("region", { name: "商品库存" });
  const table = inventory.getByRole("table", { name: "库存明细" });
  const draft = main.getByRole("complementary", { name: "采购清单" });
  const search = inventory.getByRole("searchbox", { name: "搜索商品" });
  const add = inventory.getByRole("button", { name: "加入 9 件，茉莉绿茶" });
  const exportLink = draft.getByRole("link", { name: "导出采购清单" });
  const noItems = draft.getByText("清单还没有商品。");

  async function capture(name) {
    const viewport = page.viewportSize();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(scrollWidth <= viewport.width, `${host} workbench ${name} overflows (${scrollWidth}/${viewport.width})`);
    const { violations } = await new AxeBuilder({ page }).analyze();
    assert.deepEqual(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), [], `${host} workbench ${name} accessibility`);
    const screenshot = `${host}-workbench-${name}.png`;
    await page.screenshot({ path: path.join(reportDir, screenshot) });
    states[name] = { viewport, scrollWidth, axeViolations: violations.length, screenshot };
  }

  await page.setViewportSize(desktop);
  await page.goto(`${url}/inventory-workbench`);
  await expect(main.getByRole("heading", { level: 1, name: "库存与补货" })).toBeVisible();
  await expect(noItems).toBeVisible();
  await expect(exportLink).toHaveCount(0);
  await expect(table.getByRole("rowheader")).toHaveCount(5);
  const inventoryBox = await inventory.boundingBox();
  const draftBox = await draft.boundingBox();
  assert.ok(inventoryBox.x + inventoryBox.width < draftBox.x, "Desktop inventory and summary must sit side by side");
  assert.ok(draftBox.width >= 288 && draftBox.width <= 320, "Desktop summary must fit its width budget");
  const firstAdd = await add.boundingBox();
  assert.ok(firstAdd.y >= 0 && firstAdd.y + firstAdd.height <= desktop.height, "First add must be in the desktop viewport");
  await expect(table.getByRole("columnheader", { name: "现有库存" })).toHaveCSS("text-align", "end");
  await capture("desktop-empty");
  Object.assign(states["desktop-empty"], { firstAddY: firstAdd.y, inventoryWidth: inventoryBox.width, summaryWidth: draftBox.width });

  const choose = draft.getByRole("link", { name: "选择商品" });
  await choose.focus();
  await choose.press("Enter");
  await expect(inventory.getByRole("heading", { name: "商品库存" })).toBeFocused();
  await search.fill("TEA-01");
  await expect(table.getByRole("rowheader")).toHaveCount(1);
  await search.fill("no-such-item");
  await expect(inventory.getByText("没有符合条件的商品。")).toBeVisible();
  await inventory.getByRole("button", { name: "清除搜索" }).click();
  await expect(search).toBeFocused();
  await expect(table.getByRole("rowheader")).toHaveCount(5);

  await add.focus();
  await page.keyboard.press("Enter");
  await expect(draft.getByText("1 款 · 9 件")).toBeVisible();
  await expect(main.getByRole("status")).toHaveText("茉莉绿茶，清单中 9 件");
  await draft.getByRole("button", { name: "增加茉莉绿茶数量" }).click();
  await expect(draft.getByText("1 款 · 10 件")).toBeVisible();
  await expect(draft.locator(".inventory-workbench__total")).toContainText("$239.00");
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 10_000 }),
    exportLink.click(),
  ]);
  assert.equal(download.suggestedFilename(), "restock.csv");
  assert.equal(await readFile(await download.path(), "utf8"), "\uFEFFSKU,商品,数量,单价USD\r\nTEA-01,茉莉绿茶,10,23.90");
  await page.evaluate(() => window.scrollTo(0, 0));
  await capture("desktop-filled");

  await page.setViewportSize(mobile);
  await page.evaluate(() => window.scrollTo(0, 0));
  const mobileAdd = await inventory.getByRole("button", { name: "再加 1 件，茉莉绿茶" }).boundingBox();
  assert.ok(mobileAdd.y >= 0 && mobileAdd.y + mobileAdd.height <= mobile.height, "First add must be in the mobile viewport");
  await expect(table.getByRole("rowheader")).toHaveCount(5);
  await expect(table.getByText("现有库存", { exact: true }).last()).toBeVisible();
  await capture("mobile-inventory");
  states["mobile-inventory"].firstAddY = mobileAdd.y;

  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await main.getByRole("link", { name: "查看采购清单" }).click();
  await expect(draft.getByRole("heading", { name: "采购清单" })).toBeFocused();
  await expect(exportLink).toBeInViewport();
  await capture("mobile-dark-draft");

  await page.setViewportSize(narrow);
  await expect(exportLink).toBeVisible();
  await capture("narrow-dark");
  const remove = draft.getByRole("button", { name: "移除茉莉绿茶" });
  await remove.focus();
  await remove.press("Enter");
  await expect(noItems).toBeVisible();
  await expect(draft.getByRole("heading", { name: "采购清单" })).toBeFocused();
  await expect(exportLink).toHaveCount(0);
  return { status: "pass", states, interactions: ["empty-draft-link", "search-and-clear", "keyboard-add", "adjust-quantity", "csv-download", "mobile-draft-link", "remove-and-return-focus"] };
}
