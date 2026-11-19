import { expect, test, type Page } from "@playwright/test";

async function expectCanvasPath(page: Page, path: string) {
  await expect.poll(() => new URL(page.url()).searchParams.get("path")).toBe(path);
}

function workbenchSelect(page: Page, label: string) {
  return page.getByRole("combobox", { name: label });
}

async function expectWorkbenchSelectValue(page: Page, label: string, value: string) {
  await expect(workbenchSelect(page, label)).toHaveAttribute("data-value", value);
}

async function chooseWorkbenchOption(page: Page, label: string, option: string) {
  await workbenchSelect(page, label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function seedTestDirection(page: Page) {
  await page.addInitScript((direction) => {
    if (window.top === window) {
      localStorage.setItem("yami-design-system:drafts:v1", JSON.stringify([direction]));
    }
  }, {
    schemaVersion: 1,
    id: "test-direction",
    name: "Test Direction",
    extends: "current",
    pages: {
      home: {
        sections: [{ id: "trending-products", kind: "products", props: { title: "Test Selection" } }],
        tokenOverrides: { "--surface-secondary": "#f2eee6" },
      },
    },
  });
}

for (const presentation of ["text", "images"] as const) {
  test(`opens the ${presentation} category prototype from its direct link`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`/preview/ecommerce-home?locale=zh${presentation === "images" ? "&categoryMenu=images" : ""}`);
    const trigger = page.locator('[data-category-id="beauty"]');
    await trigger.hover();
    const menu = page.locator('[data-slot="header-category-menu"]');
    await expect(menu).toHaveAttribute("data-presentation", presentation);
    await expect(menu.locator('[data-level="2"]')).toBeVisible();
    const images = menu.locator('[data-level="2"] img');
    if (presentation === "images") await expect(images.first()).toBeVisible();
    else await expect(images).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    if (presentation === "images") {
      await expect(page.locator('[data-slot="header-brand"]')).toHaveAttribute("href", /categoryMenu=images/);
    }
  });
}

test("groups standalone prototype routes under the Preview Module", async ({ page, request }) => {
  const redirects = [
    ["/", "/preview?locale=en"],
    ["/en", "/preview?locale=en"],
    ["/zh", "/preview?locale=zh"],
    ["/ecommerce-home", "/preview/ecommerce-home"],
    ["/topic", "/preview/topic"],
    ["/brand", "/preview/brand"],
  ] as const;

  for (const [legacyPath, canonicalPath] of redirects) {
    const response = await request.get(legacyPath, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    const location = new URL(response.headers().location, "http://localhost:3200");
    expect(`${location.pathname}${location.search}`).toBe(canonicalPath);
  }

  const localizedResponse = await request.get("/en?path=%2Fbrands%2Fanua&direction=draft&theme=dark", { maxRedirects: 0 });
  const localizedLocation = new URL(localizedResponse.headers().location, "http://localhost:3200");
  expect(localizedLocation.pathname).toBe("/preview");
  expect(localizedLocation.searchParams.get("path")).toBe("/brands/anua");
  expect(localizedLocation.searchParams.get("direction")).toBe("draft");
  expect(localizedLocation.searchParams.get("theme")).toBe("dark");
  expect(localizedLocation.searchParams.get("locale")).toBe("en");

  await page.goto("/preview/ecommerce-home?locale=zh&theme=dark");
  await expect(page.locator(".prototype-root")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: "热销榜单" })).toBeVisible();

  await page.goto("/preview/topic?locale=en");
  await expect(page.locator('[data-slot="topic-landing-page"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Matcha, from first whisk to favorite treat" })).toBeVisible();

  await page.goto("/preview/brand?locale=en");
  await expect(page.locator('[data-slot="topic-landing-page"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anua: Gentle yet Effective Korean Skincare" })).toBeVisible();

  await page.goto("/preview/search?data=snapshot&locale=zh&theme=dark");
  const homeLink = page.locator('[data-slot="header-brand"]');
  await expect(homeLink).toHaveAttribute("href", "/preview/ecommerce-home?locale=zh&theme=dark");
  await homeLink.click();
  await expect(page).toHaveURL(/\/preview\/ecommerce-home\?locale=zh&theme=dark$/);
  await expect(page.getByRole("heading", { name: "热销榜单" })).toBeVisible();

  const searchField = page.getByRole("combobox", { name: "搜索" });
  await searchField.click();
  const searchPanel = page.locator('[data-slot="header-search-panel"]');
  await expect(searchPanel).toBeVisible();
  await expect(searchPanel.getByRole("heading", { name: "最近搜索" })).toBeVisible();
  await expect(searchPanel.getByRole("heading", { name: "热门搜索" })).toBeVisible();
  await expect(searchPanel.getByRole("heading", { name: "热门优惠" })).toBeVisible();
  await expect(searchPanel.locator('[data-slot="header-search-tag-image"]')).toHaveCount(10);
  await expect(searchPanel.getByRole("link", { name: "抹茶", exact: true }))
    .toHaveAttribute("href", "/preview/search?data=live&locale=zh&theme=dark&q=%E6%8A%B9%E8%8C%B6");

  await searchField.fill("抹茶");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page).toHaveURL(/\/preview\/search\?data=live&locale=zh&theme=dark&q=%E6%8A%B9%E8%8C%B6$/);
  await expect(page.getByRole("heading", { name: /搜索结果：“抹茶”/ })).toBeVisible();
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`hydrates the workbench without warnings with reduced motion ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text())) hydrationErrors.push(message.text());
    });
    page.on("pageerror", (error) => hydrationErrors.push(error.message));

    await page.goto("/design?path=%2F&direction=current&locale=zh&theme=light&viewport=1440");
    const panel = page.locator(".control-panel");
    await expect(panel).toHaveCSS("opacity", "1");
    await expect(panel).toHaveCSS("transform", "none");
    await expect(page.frameLocator('iframe[title="YAMI 原型预览"]').getByRole("heading", { name: "热销榜单" })).toBeVisible();
    if (reducedMotion === "reduce") await expect(panel).toHaveCSS("animation-duration", "0s");
    expect(hydrationErrors).toEqual([]);
  });
}

test("renders Ecommerce Home and routes iframe links through parent history", async ({ page }) => {
  await page.goto("/design?path=%2F&direction=current&locale=zh&theme=light&viewport=1440");
  await expect(page.getByText("PROTOTYPE", { exact: true })).toBeVisible();
  await expect(page.getByText("LIVE PROTOTYPE", { exact: true })).toHaveCount(0);
  await expect(page.getByText("AI 设计工作台", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Yami" })).toHaveCount(0);
  await expect(page.locator(".canvas-header")).toHaveCSS("height", "56px");
  await expect(page.locator(".canvas-header")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".control-panel")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".control-panel")).toHaveCSS("width", "280px");
  await expect(page.locator(".canvas-grid")).toHaveCSS("background-color", "rgb(235, 235, 235)");
  await expect(page.locator(".canvas-header").getByRole("button", { name: "返回上一步" })).toHaveCount(0);
  const backButton = page.getByRole("button", { name: "返回上一步" });
  await expect(backButton).toBeDisabled();
  await expect(page.getByText("当前路径", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "从 Storybook 预览", exact: true })).toHaveCount(0);
  const storybookLink = page.locator("#workbench-sidebar").getByRole("link", { name: "Storybook", exact: true });
  await expect(storybookLink).toBeVisible();
  await expect(storybookLink).toHaveCSS("height", "32px");
  await expect(storybookLink).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(storybookLink).toHaveAttribute("target", "_blank");
  await expect(page.locator(".canvas-header").getByRole("link", { name: "Storybook", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "导入 AI 方案", exact: true })).toHaveCount(0);
  await expect(page.getByText("AI 设计工作流", { exact: true })).toHaveCount(0);
  await expect(workbenchSelect(page, "设计方案")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "导出" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重命名" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "删除" })).toHaveCount(0);
  const preview = page.frameLocator('iframe[title="YAMI 原型预览"]');
  await expect(preview.getByRole("heading", { name: "热销榜单" })).toBeVisible();
  await preview
    .locator(
      '[data-slot="product-card-title-link"][href="/products/product-featured-1"]'
    )
    .click();
  await expect(page).toHaveURL(/path=%2Fproducts%2Fproduct-featured-1/);
  await expect(backButton).toBeVisible();
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
  await page.evaluate(() => history.back());
  await expectCanvasPath(page, "/");
  await expect(backButton).toBeDisabled();
});

test("shows the preview first on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/design");
  const sidebarToggle = page.getByRole("button", { name: "展开侧边栏" });
  await expect(sidebarToggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#canvas-preview")).toBeInViewport({ ratio: 0.8 });
  await expect(page.getByRole("combobox", { name: "设计方案" })).toBeHidden();
  const storybookLink = page.getByRole("link", { name: "Storybook", exact: true });
  await expect(storybookLink).toBeHidden();
  await sidebarToggle.click();
  await expect(page.getByRole("combobox", { name: "设计方案" })).toBeVisible();
  await expect(storybookLink).toBeVisible();
});

test("switches and remembers the workbench theme independently of the preview", async ({ page }) => {
  await page.goto("/design?project=global-navigation&variant=current&viewport=402&previewMode=h5&theme=light");
  const canvas = page.locator(".canvas-shell");
  const header = page.locator(".canvas-header");
  const frame = page.locator("#canvas-preview");
  const preview = frame.contentFrame().locator(".prototype-root");
  const phone = page.locator("[data-phone-preview-shell]");
  const standalone = page.getByRole("link", { name: "独立预览" });
  const previewSrc = await frame.getAttribute("src");
  const standaloneHref = await standalone.getAttribute("href");
  const workbenchUrl = page.url();
  const frameElement = await frame.elementHandle();

  await expect(canvas).toHaveAttribute("data-workbench-theme", "light");
  await expect(preview).toHaveAttribute("data-theme", "light");
  await expect(phone).toHaveAttribute("data-theme", "light");
  await header.getByRole("button", { name: "切换到深色模式" }).press("Enter");
  await expect(canvas).toHaveAttribute("data-workbench-theme", "dark");
  await expect(header).toHaveCSS("background-color", "rgb(34, 34, 34)");
  await expect(page.locator("#workbench-sidebar")).toHaveCSS("background-color", "rgb(34, 34, 34)");
  await expect(page).toHaveURL(workbenchUrl);
  await expect(frame).toHaveAttribute("src", previewSrc!);
  expect(await frame.evaluate((element, previous) => element === previous, frameElement)).toBe(true);
  await expect(standalone).toHaveAttribute("href", standaloneHref!);
  await expect(preview).toHaveAttribute("data-theme", "light");
  await expect(phone).toHaveAttribute("data-theme", "light");

  await workbenchSelect(page, "项目方案").click();
  await expect(page.getByRole("listbox").locator("..")).toHaveCSS("background-color", "rgb(34, 34, 34)");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(canvas).toHaveAttribute("data-workbench-theme", "dark");
  await header.getByRole("button", { name: "切换到浅色模式" }).click();
  await expect(canvas).toHaveAttribute("data-workbench-theme", "light");
  await expect(header).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("renders accessible workbench controls and switches device by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/design?path=%2F&direction=current&locale=en&theme=light&viewport=402");
  await expect(page).toHaveURL(/viewport=402/);
  await expect(page.locator("#canvas-preview")).toHaveCSS("width", "402px");
  await page.getByRole("button", { name: "展开侧边栏" }).press("Enter");
  await expect(page.getByRole("spinbutton", { name: "宽度（px）" })).toHaveValue("402");
  await expect(page.locator("#workbench-sidebar")).toHaveCSS("padding", "16px");
  await expect(page.locator("#workbench-sidebar")).toHaveCSS("row-gap", "16px");

  await expectWorkbenchSelectValue(page, "页面", "/");
  await expectWorkbenchSelectValue(page, "语言", "en");
  await expect(workbenchSelect(page, "主题")).toHaveCount(0);
  const pageSelect = workbenchSelect(page, "页面");
  await expect(pageSelect).toHaveCSS("min-height", "40px");
  await expect(pageSelect).toHaveCSS("font-size", "14px");
  await expect(pageSelect).toHaveCSS("line-height", "20px");
  const arrow = pageSelect.locator("svg");
  const offset = await arrow.evaluate((icon) => {
    const arrowBox = icon.getBoundingClientRect();
    const triggerBox = icon.closest("button")!.getBoundingClientRect();
    return arrowBox.y + arrowBox.height / 2 - triggerBox.y - triggerBox.height / 2;
  });
  expect(Math.abs(offset)).toBeLessThan(0.5);
  await pageSelect.press("Enter");
  const home = page.getByRole("option", { name: "Ecommerce Home", exact: true });
  await expect(home).toBeVisible();
  await expect(home).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Escape");
  await expect(home).toBeHidden();
  await pageSelect.focus();
  await page.keyboard.press("Tab");
  await expect(workbenchSelect(page, "语言")).toBeFocused();
  await expect(workbenchSelect(page, "语言")).toHaveCSS("outline-width", "2px");

  const mode = page.getByRole("radiogroup", { name: "预览模式" });
  const app = mode.getByRole("radio", { name: "App" });
  await app.press("ArrowLeft");
  await expect(mode.getByRole("radio", { name: "H5" })).toBeChecked();
  await expect(page).toHaveURL(/previewMode=h5/);

  const device = page.getByRole("radiogroup", { name: "设备" });
  const mobile = device.getByRole("radio", { name: "手机" });
  const tablet = device.getByRole("radio", { name: "平板" });
  const desktop = device.getByRole("radio", { name: "桌面" });
  await expect(mobile).toBeChecked();
  await mobile.press("ArrowRight");
  await expect(tablet).toBeFocused();
  await expect(tablet).toBeChecked();
  await expect(page).toHaveURL(/viewport=768/);
  await expect(page.getByRole("spinbutton", { name: "宽度（px）" })).toHaveValue("768");
  await expect(mode).toBeHidden();

  await desktop.click();
  await expect(desktop).toBeChecked();
  await expect(page).toHaveURL(/viewport=1440/);
  await expect(mode).toBeHidden();

  await mobile.click();
  await expect(mode.getByRole("radio", { name: "H5" })).toBeChecked();

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("opens the localized Anua Topic Landing Page from the Canvas page control", async ({ page }) => {
  await page.goto("/design?path=%2F&direction=current&locale=zh&theme=light&viewport=1440");
  const preview = page.frameLocator('iframe[title="YAMI 原型预览"]');
  await expect(preview.getByRole("heading", { name: "热销榜单" })).toBeVisible();

  await chooseWorkbenchOption(page, "页面", "Anua Topic Landing");
  await expectCanvasPath(page, "/brands/anua");

  await expect(preview.locator('[data-slot="topic-landing-page"]')).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Anua：温和有效的韩系护肤" })).toBeVisible();

  await preview.locator('a[href="#explore-more-cleanse-peel"]').click();
  await expect.poll(() => page.frames().find((frame) => frame.url().includes("/preview?"))?.url()).toContain("#explore-more-cleanse-peel");
  await expectCanvasPath(page, "/brands/anua");

  await chooseWorkbenchOption(page, "语言", "English");
  await expect(preview.getByRole("heading", { name: "Anua: Gentle yet Effective Korean Skincare" })).toBeVisible();
});

test("renders the Anua Topic Landing Page for its storefront brand deep link", async ({ page }) => {
  await page.goto("/design?path=%2Fbrands%2F11712&direction=current&locale=en&theme=light&viewport=1440");

  const preview = page.frameLocator('iframe[title="YAMI 原型预览"]');
  await expect(preview.locator('[data-slot="topic-landing-page"]')).toBeVisible();
  await expect(preview.getByRole("heading", { name: "Anua: Gentle yet Effective Korean Skincare" })).toBeVisible();
});

test("scopes Ecommerce Home direction colors to Ecommerce Home", async ({ page }) => {
  await seedTestDirection(page);
  await page.setViewportSize({ width: 402, height: 800 });
  await page.goto("/preview?path=%2F&direction=test-direction&locale=en&theme=light&viewport=402&transition=none");
  await expect(page.locator(".prototype-root")).toHaveCSS("--surface-secondary", "#f2eee6");

  await page.goto("/preview?path=%2Fbrands%2Fanua&direction=test-direction&locale=en&theme=light&viewport=402&transition=none");

  const shortcutSurface = page.locator('[data-slot="shortcut-rail-surface"]');
  await expect(shortcutSurface).toBeVisible();
  await expect(shortcutSurface).toHaveCSS("background-color", "rgb(245, 245, 245)");
});

test("preserves a legacy direction deep link without exposing direction controls", async ({ page }) => {
  await seedTestDirection(page);
  await page.goto("/design?path=%2F&direction=test-direction&locale=zh&theme=dark&viewport=402");
  await expect(page).toHaveURL(/direction=test-direction/);
  await expect(page).toHaveURL(/theme=dark/);
  await expect(page).toHaveURL(/viewport=402/);
  await expect(page.frameLocator('iframe[title="YAMI 原型预览"]').getByRole("heading", { name: "Test Selection" })).toBeVisible();
  await expect(workbenchSelect(page, "设计方案")).toHaveCount(0);
});

test("routes cart, category, account and search destinations into prototype shells", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto("/design?path=%2F&direction=current&locale=zh&theme=light&viewport=1440");
  const preview = page.frameLocator('iframe[title="YAMI 原型预览"]');

  await preview.locator('a[href="/cart"]:visible').click();
  await expect(page).toHaveURL(/path=%2Fcart/);
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
  const backButton = page.getByRole("button", { name: "返回上一步" });
  await expect(backButton).toBeVisible();
  await backButton.click();
  await expectCanvasPath(page, "/");
  await expect(backButton).toBeDisabled();

  await preview.locator('a[href^="/categories/"]:visible').first().click();
  await expect(page).toHaveURL(/path=%2Fcategories%2F/);
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
  await page.evaluate(() => history.back());
  await expectCanvasPath(page, "/");
  await expect(preview.getByRole("heading", { name: "热销榜单" })).toBeVisible();

  await preview.locator('a[href="/account"]:visible').click();
  await expect(page).toHaveURL(/path=%2Faccount/);
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
  await page.evaluate(() => history.back());
  await expectCanvasPath(page, "/");
  await expect(preview.getByRole("heading", { name: "热销榜单" })).toBeVisible();

  const search = preview.locator('input[type="search"]:visible').first();
  await search.fill("matcha powder");
  await search.press("Enter");
  await expect(page).toHaveURL(/path=%2Fsearch%2Fmatcha%2520powder/);
  await page.reload();
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
});

test("rejects rogue and unknown messages while rapid iframe navigation settles safely", async ({ page }) => {
  await page.goto("/design?path=%2F&direction=current&locale=zh&theme=light&viewport=1440");
  const initialUrl = page.url();

  await page.evaluate(() => window.postMessage({ type: "yami-design-system:v1:navigate", path: "/cart" }, window.location.origin));
  await page.waitForTimeout(100);
  expect(page.url()).toBe(initialUrl);

  await page.evaluate(() => new Promise<void>((resolve) => {
    const rogue = document.createElement("iframe");
    rogue.src = `data:text/html,${encodeURIComponent("<script>parent.postMessage({type:'yami-design-system:v1:navigate',path:'/account'},'*')</script>")}`;
    rogue.onload = () => setTimeout(() => { rogue.remove(); resolve(); }, 50);
    document.body.append(rogue);
  }));
  expect(page.url()).toBe(initialUrl);

  const previewFrame = page.frames().find((frame) => frame.url().includes("/preview?"));
  if (!previewFrame) throw new Error("Preview frame not found");
  await previewFrame.evaluate(() => {
    window.parent.postMessage({ type: "yami-design-system:v0:navigate", path: "/account" }, window.location.origin);
    window.parent.postMessage({ type: "yami-design-system:v1:navigate", path: "/products/first" }, window.location.origin);
    window.parent.postMessage({ type: "yami-design-system:v1:navigate", path: "/products/second" }, window.location.origin);
  });
  await expect(page).toHaveURL(/path=%2Fproducts%2Fsecond/);
  await page.goBack();
  await expectCanvasPath(page, "/");
});

test("opens a Storybook page by direct link and returns to an ordinary preview page", async ({ page }) => {
  await page.route("http://localhost:6006/index.json", (route) => route.fulfill({
    contentType: "application/json",
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      v: 5,
      entries: {
        "yami-pages-topic-landing-page-topic--pc": { id: "yami-pages-topic-landing-page-topic--pc", type: "story", title: "YAMI/Pages/Topic Landing Page/Topic", name: "Topic — PC" },
      },
    }),
  }));
  await page.route("http://localhost:6006/iframe.html*", (route) => route.fulfill({
    contentType: "text/html",
    body: "<!doctype html><html><body><main><h1>Imported Topic Page</h1></main></body></html>",
  }));

  await page.goto("/design?story=yami-pages-topic-landing-page-topic--pc&direction=current&locale=en&theme=light&viewport=402");
  await expectWorkbenchSelectValue(page, "页面", "storybook:yami-pages-topic-landing-page-topic--pc");
  await expect(workbenchSelect(page, "页面")).toHaveText("Topic Landing Page / Topic");
  await expect(page.getByText("yami-pages-topic-landing-page-topic--pc", { exact: true })).toBeVisible();
  await expect(page.frameLocator('iframe[title="YAMI 原型预览"]').getByRole("heading", { name: "Imported Topic Page" })).toBeVisible();

  await chooseWorkbenchOption(page, "页面", "Ecommerce Home");
  await expectCanvasPath(page, "/");
  await expect.poll(() => new URL(page.url()).searchParams.get("story")).toBeNull();
});

test("uses the complete iframe state on first render and after deep-link refresh", async ({ page }) => {
  await seedTestDirection(page);
  await page.goto("/design?path=%2F&direction=test-direction&locale=en&theme=dark&viewport=768");
  await expect(page.getByRole("spinbutton", { name: "宽度（px）" })).toHaveValue("768");
  const preview = page.frameLocator('iframe[title="YAMI 原型预览"]');
  await expect(preview.locator(".prototype-root")).toHaveAttribute("data-theme", "dark");
  await expect(preview.getByRole("heading", { name: "Test Selection" })).toBeVisible();

  await page.goto("/design?path=%2Fcart&direction=test-direction&locale=en&theme=dark&viewport=768");
  await page.reload();
  await expectCanvasPath(page, "/cart");
  await expect(preview.getByText("YAMI PROTOTYPE ROUTE")).toBeVisible();
});
