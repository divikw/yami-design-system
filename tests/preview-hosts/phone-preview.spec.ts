import { expect, test, type Page } from "@playwright/test";

test("H5 and App modes preserve context and control home navigation and chrome", async ({ page }) => {
  await page.goto("/workbench?project=global-navigation&variant=image-categories&path=%2F&viewport=374&locale=en");
  const frame = page.frameLocator("#canvas-preview");
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(frame.locator('.prototype-home-navigation')).toBeVisible();
  await frame.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await expect(frame.locator('.prototype-home-navigation').getByRole("link", { name: "Cart 1", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "H5", exact: true }).click();
  await expect(page).toHaveURL(/previewMode=h5/);
  await expect(page.getByRole("spinbutton", { name: "宽度（px）" })).toHaveValue("374");
  await expectSafariFrame(page);
  await expect(frame.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await expect(frame.locator('.prototype-home-navigation')).toHaveCount(0);
  await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
  await expect(frame.locator('[data-slot="sticky-storefront-header"]')).toHaveCSS("top", "62px");
  const shareHref = await page.getByRole("link", { name: "独立预览" }).getAttribute("href");
  const shared = new URL(shareHref!, page.url());
  expect(Object.fromEntries(shared.searchParams)).toMatchObject({ previewMode: "h5", variant: "image-categories", viewport: "374", locale: "en", path: "/" });
  await page.reload();
  await expect(page.getByRole("radio", { name: "H5", exact: true })).toBeChecked();
  await expect(frame.locator('.prototype-home-navigation')).toHaveCount(0);
  await page.getByRole("radio", { name: "App", exact: true }).click();
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(frame.locator('.prototype-home-navigation')).toBeVisible();
  await frame.locator('.prototype-home-navigation').getByRole("link", { name: "Cart 1", exact: true }).click();
  await expect(page).toHaveURL(/previewMode=app/);
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeVisible();
  await page.getByRole("radio", { name: "H5", exact: true }).click();
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(frame.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "86px");
  await page.getByRole('button', { name: 'Safari 返回上一页' }).click();
  await expect(frame.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await page.setViewportSize({ width: 374, height: 812 });
  await page.goto(shared.href);
  await expect(page.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await expect(page.locator('.prototype-home-navigation')).toHaveCount(0);
  await page.getByRole("link", { name: "购物车", exact: true }).click();
  await expect(page).toHaveURL(/previewMode=h5/);
  await expect(page.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(page.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "0px");
});

test("H5 mode also adapts imported cart pages without affecting standalone Storybook", async ({ page }) => {
  await page.goto("/workbench?story=yami-pages-cart--mobile&viewport=402&locale=en&previewMode=h5");
  const frame = page.frameLocator("#canvas-preview");
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(frame.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "86px");
  await expectSafariFrame(page);
  await page.getByRole("radio", { name: "App", exact: true }).click();
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeVisible();
});

async function expectPhoneFrame(page: Page, selector: string) {
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(1);
  await expect(page.locator("[data-phone-preview-status]")).toContainText("9:41");
  await expect.poll(() => page.locator("[data-phone-preview-levels] img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator("[data-phone-preview-island]")).toHaveCSS("width", "95px");
  await expect(page.locator("[data-phone-preview-host]")).toHaveCSS("border-radius", "40px");
  await expect(page.locator(selector)).toHaveCSS("clip-path", "inset(0px round 40px)");
  await expect.poll(() => page.locator(selector).evaluate((frame) => {
    const bounds = frame.getBoundingClientRect();
    return document.elementFromPoint(bounds.left + 2, bounds.top + 2) !== frame
      && document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + 2) === frame;
  })).toBe(true);
  await expect.poll(() => page.locator("[data-phone-preview-island]").evaluate((element) => {
    const capsule = getComputedStyle(element, "::after");
    const status = element.closest("[data-phone-preview-status]")!.getBoundingClientRect();
    return {
      height: Math.round(parseFloat(capsule.height) * 10) / 10,
      top: element.getBoundingClientRect().top - status.top + parseFloat(getComputedStyle(element).paddingTop),
    };
  })).toEqual({ height: 36.7, top: 14 });
  await expect.poll(() => page.locator(selector).evaluate((frame) => {
    const host = frame.parentElement;
    if (!host) return null;
    const bounds = host.getBoundingClientRect();
    const content = frame.getBoundingClientRect();
    return { top: Math.round(content.top - bounds.top - host.clientTop), bottom: Math.round(bounds.bottom - content.bottom - host.clientTop) };
  })).toEqual({ top: 0, bottom: 0 });
}

async function expectSafariFrame(page: Page) {
  await expect(page.locator('[data-phone-preview-shell][data-phone-preview-mode="h5"]')).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Safari 预览工具栏" })).toBeVisible();
  await expect(page.locator('[data-safari-preview-toolbar]')).toHaveCSS("height", "86px");
  await expect(page.locator('[data-safari-preview-toolbar]')).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect.poll(() => page.locator('[data-safari-preview-toolbar]').evaluate((element) => getComputedStyle(element, '::before').content)).toBe('none');
  await expect(page.locator('[data-phone-preview-status]')).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator('[data-phone-preview-host]')).toHaveCSS("border-radius", "40px");
  await expect.poll(() => page.locator('#canvas-preview').evaluate((frame) => {
    const host = frame.parentElement;
    if (!host) return null;
    const content = frame.getBoundingClientRect();
    const bounds = host.getBoundingClientRect();
    return { top: Math.round(content.top - bounds.top - host.clientTop), bottom: Math.round(bounds.bottom - content.bottom - host.clientTop) };
  })).toEqual({ top: 0, bottom: 0 });
  await expect.poll(() => page.locator('[data-safari-preview-toolbar] img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
}

for (const theme of ["light", "dark"]) test(`Safari has fixed controls, native icon sizes and usable narrow layouts (${theme})`, async ({ page }) => {
  await page.goto(`/workbench?project=global-navigation&variant=current&path=%2Fcart&viewport=402&locale=en&previewMode=h5&theme=${theme}`);
  await expectSafariFrame(page);
  const frame = page.frameLocator('#canvas-preview');
  const toolbar = page.getByRole("navigation", { name: "Safari 预览工具栏" });
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  const checkoutBar = frame.locator('[data-slot="cart-checkout-bar"]').first();
  await expect(checkoutBar).toHaveAttribute('data-phone-preview-bottom-bar', '');
  await expect.poll(() => checkoutBar.evaluate((element) => {
    const bar = getComputedStyle(element);
    const extension = getComputedStyle(element, '::after');
    return { matches: extension.backgroundColor === bar.backgroundColor, height: extension.height };
  })).toEqual({ matches: true, height: '86px' });
  await expect.poll(async () => {
    const checkout = await frame.locator('[data-slot="cart-checkout-bar"]').boundingBox();
    const bar = await toolbar.boundingBox();
    return Math.round(checkout!.y + checkout!.height - bar!.y);
  }).toBe(0);
  await checkoutBar.getByRole('button', { name: /^Details/ }).click();
  const details = frame.getByRole('dialog', { name: /order details/i });
  await expect(details).toBeVisible();
  await expect.poll(async () => {
    const panel = await details.boundingBox();
    const chrome = await toolbar.boundingBox();
    return Math.round(panel!.y + panel!.height - chrome!.y);
  }).toBe(0);
  await expect.poll(() => details.locator('[data-slot="cart-checkout-bar"]').evaluate((bar) => {
    const footer = bar.closest('[data-slot="drawer-footer"]')!;
    return Math.round(footer.getBoundingClientRect().bottom - bar.getBoundingClientRect().bottom);
  })).toBe(0);
  await expect(details.getByRole('button', { name: /^Checkout/ })).toBeInViewport();
  await details.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(details).toBeHidden();
  const initial = await toolbar.boundingBox();
  await frame.locator('html').evaluate(() => window.scrollTo(0, 300));
  await expect.poll(() => toolbar.boundingBox()).toEqual(initial);
  await expect(frame.locator('html')).toHaveCSS('scrollbar-width', 'none');
  await expect.poll(() => toolbar.locator('img').evaluateAll((images) => images.map((image) => {
    const bounds = image.getBoundingClientRect();
    return [Math.round(bounds.width * 10) / 10, Math.round(bounds.height * 10) / 10];
  }))).toEqual([[11, 19], [15.4, 18], [15, 19], [20, 4]]);
  await page.getByRole('button', { name: 'Safari 刷新页面' }).click();
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  await expectSafariFrame(page);
  await toolbar.locator('summary').click();
  await expect(toolbar.getByRole('link', { name: '在新窗口打开' })).toHaveAttribute('href', /previewMode=h5/);
  await toolbar.locator('summary').click();
  const width = page.getByRole('spinbutton', { name: '宽度（px）' });
  for (const value of [320, 374, 402, 562]) {
    await width.fill(String(value)); await width.press('Enter');
    await expectSafariFrame(page);
    await expect.poll(() => toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.getByRole('radio', { name: '平板', exact: true }).click();
  await expect(page.locator('[data-phone-preview-shell]')).toHaveCount(0);
  await expect(frame.locator('html')).not.toHaveCSS('scrollbar-width', 'none');
});

test("H5 extends fixed TabBar colors and clears them when hidden or removed", async ({ page }) => {
  await page.goto('/workbench?project=global-navigation&variant=current&path=%2F&viewport=402&locale=en&previewMode=h5');
  await expectSafariFrame(page);
  const frame = page.frameLocator('#canvas-preview');
  await expect(frame.locator('[data-phone-preview-bottom-bar]')).toHaveCount(0);
  // Exercise the shared TabBar slot with a colored fixed-bar fixture. Inline
  // instances must not gain a preview background or positioning.
  await frame.locator('body').evaluate((body) => {
    const bar = document.createElement('nav');
    bar.dataset.slot = 'tab-bar';
    bar.setAttribute('aria-label', 'Preview test navigation');
    bar.style.cssText = 'height:49px;background:rgb(25, 70, 110);left:0;right:0;z-index:20';
    body.append(bar);
  });
  const bar = frame.getByRole('navigation', { name: 'Preview test navigation', includeHidden: true });
  await expect(bar).not.toHaveAttribute('data-phone-preview-bottom-bar');
  await bar.evaluate((element) => { (element as HTMLElement).style.position = 'fixed'; });
  await expect(bar).toHaveAttribute('data-phone-preview-bottom-bar', '');
  await expect(bar).toHaveCSS('bottom', '86px');
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element, '::after').backgroundColor)).toBe('rgb(25, 70, 110)');
  await bar.evaluate((element) => { (element as HTMLElement).style.backgroundColor = 'rgb(110, 40, 60)'; });
  await expect.poll(() => bar.evaluate((element) => getComputedStyle(element, '::after').backgroundColor)).toBe('rgb(110, 40, 60)');
  await expect.poll(() => bar.evaluate((element) => element.getBoundingClientRect().bottom + parseFloat(getComputedStyle(element, '::after').height) - window.innerHeight)).toBe(0);
  await bar.evaluate((element) => { (element as HTMLElement).hidden = true; });
  await expect(bar).toBeHidden();
  await expect.poll(() => bar.evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
  await bar.evaluate((element) => element.remove());
  await expect(frame.locator('[data-phone-preview-bottom-bar]')).toHaveCount(0);
});

test("PROTOTYPE reserves phone chrome without covering fixed cart navigation", async ({ page }) => {
  await page.goto("/workbench?project=global-navigation&variant=current&path=%2Fcart&viewport=402&locale=en");
  await expectPhoneFrame(page, "#canvas-preview");
  const frame = page.frameLocator("#canvas-preview");
  const navigation = frame.locator('[data-slot="cart-app-navigation"]');
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveAttribute("aria-hidden", "true");
  // The full viewport is visible behind chrome; fixed controls respect safe areas.
  await expect.poll(() => page.locator("#canvas-preview").evaluate((node) => {
    const iframe = node as HTMLIFrameElement;
    return iframe.contentWindow!.innerHeight === iframe.clientHeight;
  })).toBe(true);
  await expect(navigation).toBeVisible();
  await expect.poll(() => navigation.evaluate((element) => Math.round(window.innerHeight - element.getBoundingClientRect().bottom))).toBe(34);
  await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
  await page.getByRole("radio", { name: "平板", exact: true }).click();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(page.locator(".preview-frame-wrap")).toHaveCSS("border-radius", "0px");
  await expect(page.locator("#canvas-preview")).toHaveCSS("clip-path", "none");
  await expect(frame.locator("html")).not.toHaveCSS("scrollbar-width", "none");
  await page.getByRole("radio", { name: "桌面", exact: true }).click();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(page.locator(".preview-frame-wrap")).toHaveCSS("border-radius", "0px");
  await page.getByRole("radio", { name: "手机", exact: true }).click();
  await expectPhoneFrame(page, "#canvas-preview");
});

for (const mode of ["app", "h5"]) test(`PROTOTYPE matches the navigation background when scrolled and clears it at the top (${mode})`, async ({ page }) => {
  await page.goto(`/workbench?project=global-navigation&variant=current&path=%2F&viewport=402&locale=en&previewMode=${mode}`);
  await expectPhoneFrame(page, "#canvas-preview");
  const frame = page.frameLocator("#canvas-preview");
  await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
  await expect(frame.locator("html")).toHaveCSS("scrollbar-width", "none");
  await expect.poll(() => frame.locator('[data-slot="sticky-storefront-header"]').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(62);
  const surface = frame.locator("[data-phone-preview-status-surface]");
  await expect(surface).toHaveCount(0);
  await frame.locator("html").evaluate(() => window.scrollTo(0, 220));
  await expect.poll(() => frame.locator("html").evaluate(() => window.scrollY)).toBe(220);
  await expect(surface).toBeVisible();
  const navigationColor = await frame.locator('[data-slot="sticky-storefront-header"]').evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(surface).toHaveCSS("background-color", navigationColor);
  await expect.poll(() => surface.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, width: bounds.width };
  })).toEqual({ top: 0, bottom: 62, width: 402 });
  await expect(page.locator("[data-phone-preview-home]")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await frame.locator("html").evaluate(() => window.scrollTo(0, 0));
  await expect(surface).toHaveCount(0);
});

test("Storybook pages and standalone components have no phone chrome or insets", async ({ page }) => {
  await page.goto("http://localhost:6006/?path=/story/yami-pages-ecommerce-home--mobile&globals=locale:en");
  const frame = page.frameLocator("#storybook-preview-iframe");
  await expect(frame.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(frame.locator("html")).not.toHaveAttribute("data-phone-preview-content");
  await expect.poll(() => frame.locator('[data-slot="sticky-storefront-header"]').evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(0);
  await page.goto("http://localhost:6006/?path=/story/yami-components-commerce-billboard--mobile-card&globals=locale:en");
  await expect(frame.locator('[data-slot="billboard"]')).toBeVisible();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(frame.locator("html")).not.toHaveAttribute("data-phone-preview-content");
});

test("imported Storybook pages receive only the PROTOTYPE shell", async ({ page }) => {
  await page.goto("/workbench?story=yami-pages-ecommerce-home--mobile&viewport=375&locale=en&theme=dark");
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(page.locator("[data-phone-preview-shell]")).toHaveAttribute("data-theme", "dark");
  await expect(page.frameLocator("#canvas-preview").locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(page.frameLocator("#canvas-preview").locator("html")).toHaveAttribute("data-phone-preview-content", "");
});


test("phone status content stays anchored to the edges when widened and fits narrow screens", async ({ page }) => {
  await page.goto("/workbench?viewport=402&locale=en");
  await expectPhoneFrame(page, "#canvas-preview");
  const measure = () => page.locator("[data-phone-preview-status]").evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(element.querySelector("[data-phone-preview-time]")!);
    const time = text.getBoundingClientRect();
    const island = element.querySelector("[data-phone-preview-island]")!.getBoundingClientRect();
    const cellular = element.querySelector("[data-phone-preview-cellular]")!.getBoundingClientRect();
    const battery = element.querySelector("[data-phone-preview-levels] img:last-child")!.getBoundingClientRect();
    return {
      width: bounds.width,
      left: time.left - bounds.left,
      right: bounds.right - battery.right,
      centered: Math.abs((island.left + island.right) / 2 - (bounds.left + bounds.right) / 2) < 1,
      fits: time.left >= bounds.left && time.right <= island.left && cellular.left >= island.right && battery.right <= bounds.right,
    };
  });
  const original = await measure();
  const resizeHandle = page.getByRole("separator", { name: "调整预览宽度" });
  await expect(resizeHandle).toBeVisible();
  await resizeHandle.click();
  await resizeHandle.press("ArrowRight");
  await expect.poll(async () => (await measure()).width).toBe(403);
  const width = page.getByRole("spinbutton", { name: "宽度（px）" });
  await width.fill("562");
  await width.press("Enter");
  await expect.poll(async () => (await measure()).width).toBe(562);
  const wide = await measure();
  expect(wide.left).toBeCloseTo(original.left, 1);
  expect(wide.right).toBeCloseTo(original.right, 1);
  expect(wide.centered && wide.fits).toBe(true);
  for (const value of [375, 367, 320]) {
    await width.fill(String(value));
    await width.press("Enter");
    await expect.poll(async () => (await measure()).width).toBe(value);
    const narrow = await measure();
    expect(narrow.centered && narrow.fits).toBe(true);
  }
});
