import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { ProductDetailPage } from "../../../packages/prototypes/pages/ProductDetailPage/ProductDetailPage";
import { createFoodProductDetailPageFixture } from "../../../packages/prototypes/pages/ProductDetailPage/food-fixtures";
import "@yami/design-system/tokens.css";

test("English PC PDP uses the new share popover and moves favorites out of the purchase panel", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    await page.viewport(1440, 900);
    const fixture = createFoodProductDetailPageFixture("en");
    flushSync(() => root.render(<ProductDetailPage {...fixture} />));

    const shareTrigger = page.getByRole("button", { name: fixture.copy.share, exact: true });
    const headerFavorite = container.querySelector('[data-pdp-header-action="favorite"]');
    const purchaseFavorite = container.querySelector('[data-pdp-purchase-action="favorite"]');
    expect(headerFavorite).not.toBeNull();
    expect(purchaseFavorite).toBeNull();

    await shareTrigger.click();
    await expect.element(page.getByRole("button", { name: "Share on WhatsApp", exact: true })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Copy product link", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Share on WeChat", exact: true }).click();
    await expect.element(page.getByText("Scan to Share with WeChat", { exact: true })).toBeVisible();

    const zhFixture = createFoodProductDetailPageFixture("zh");
    flushSync(() => root.render(<ProductDetailPage {...zhFixture} />));
    expect(container.querySelector('[data-pdp-share-trigger="true"]')).not.toBeNull();
    expect(container.querySelector('[data-pdp-purchase-action="favorite"]')).toBeNull();

    await page.getByRole("button", { name: zhFixture.copy.share, exact: true }).click();
    await expect.element(page.getByRole("heading", { name: "微信分享", exact: true })).toBeVisible();
    await expect.element(page.getByRole("heading", { name: "更多分享方式", exact: true })).toBeVisible();
    await expect.element(page.getByRole("img", { name: "微信分享二维码", exact: true })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "分享到微博", exact: true })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "复制商品链接", exact: true })).toBeVisible();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
