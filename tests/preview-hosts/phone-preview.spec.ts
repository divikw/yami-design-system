import { expect, test, type Page } from "@playwright/test";

test("matches the phone status bar to the V2 header while the storefront switcher is open", async ({ page }) => {
  for (const mode of ["app", "h5"]) {
    await page.goto(`/design?project=global-navigation&variant=h5-v2&viewport=360&previewMode=${mode}`);
    await expectSafariFrame(page);
    const frame = page.frameLocator("#canvas-preview");
    const header = frame.locator('[data-slot="sticky-storefront-header"] > header');
    const trigger = header.getByRole("button", { name: "Switch storefront" });
    const switcher = frame.getByRole("dialog", { name: "Switch storefront" });
    await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
    const navigation = frame.locator('[data-slot="tab-bar-container"]');
    await expect(navigation).toBeVisible();
    await expect(navigation).toHaveCSS("bottom", "86px");
    for (const scrollY of [0, 220]) {
      await frame.locator("html").evaluate((_, y) => window.scrollTo(0, y), scrollY);
      await expect.poll(() => header.evaluate((element) => getComputedStyle(element, "::before").content)).toBe("none");
      await trigger.click();
      await expect(switcher).toBeVisible();
      await expect.poll(() => header.evaluate((element) => {
        const surface = getComputedStyle(element, "::before");
        return surface.content === '""' && surface.height === "62px"
          && surface.backgroundColor === getComputedStyle(element).backgroundColor;
      })).toBe(true);
      await frame.getByRole("dialog", { name: "Switch storefront" }).press("Escape");
      await expect(switcher).toBeHidden();
      await expect.poll(() => header.evaluate((element) => getComputedStyle(element, "::before").content)).toBe("none");
    }
  }
});

test("project H5 mode preserves the basket and browser chrome across reloads and navigation", async ({ page }) => {
  await page.goto("/design?project=global-navigation&variant=h5-v1&path=%2F&viewport=374&locale=en");
  const frame = page.frameLocator("#canvas-preview");
  await expect(page.getByRole("spinbutton", { name: "宽度（px）" })).toHaveValue("374");
  await expectSafariFrame(page);
  await expect(frame.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  const navigation = frame.locator('[data-slot="tab-bar-container"]');
  await expect(navigation).toBeVisible();
  await expect(navigation).toHaveCSS("bottom", "86px");
  await expect(navigation.locator('[data-slot="tab-bar"]')).toHaveAttribute("inert", "");
  await expect(navigation.locator("a")).toHaveCount(4);
  await expect(navigation.getByText("Community", { exact: true })).toHaveCount(0);
  await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
  await expect(frame.locator('[data-slot="sticky-storefront-header"]')).toHaveCSS("top", "62px");
  const shareHref = await page.getByRole("link", { name: "独立预览" }).getAttribute("href");
  const shared = new URL(shareHref!, page.url());
  expect(Object.fromEntries(shared.searchParams)).toMatchObject({ previewMode: "h5", variant: "h5-v1", viewport: "374", locale: "en", path: "/" });
  await frame.getByRole("button", { name: "Add to cart", exact: true }).first().click();
  await expect(frame.getByRole("status")).toHaveText(/Added to demo cart/);
  await page.reload();
  await expect(page.getByRole("radio", { name: "H5", exact: true })).toBeChecked();
  await expect(page.getByRole("radio", { name: "App", exact: true })).toBeDisabled();
  await frame.locator(".prototype-root").evaluate(() => {
    window.parent.postMessage({ type: "yami-design-system:v1:navigate", path: "/cart" }, window.location.origin);
  });
  await expect(page).toHaveURL(/path=%2Fcart/);
  await expect(frame.locator('[data-slot="cart-item"]')).toHaveCount(1);
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(frame.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "86px");
  await page.getByRole('button', { name: 'Safari 返回上一页' }).click();
  await expect(frame.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await page.setViewportSize({ width: 374, height: 812 });
  await page.goto(shared.href);
  await expect(page.locator('[data-slot="ecommerce-home"]')).toBeVisible();
  await expect(page.locator('[data-slot="tab-bar-container"]')).toBeVisible();
  await expect(page.locator('[data-slot="tab-bar-container"]')).toHaveCSS("bottom", "0px");
  await page.getByRole("link", { name: "购物车", exact: true }).click();
  await expect(page).toHaveURL(/previewMode=h5/);
  await expect(page.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(page.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "0px");
});

test("H5 mode also adapts imported cart pages without affecting standalone Storybook", async ({ page }) => {
  await page.goto("/design?story=yami-pages-cart--mobile&viewport=402&locale=en&previewMode=h5");
  const frame = page.frameLocator("#canvas-preview");
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeHidden();
  await expect(frame.locator('[data-slot="cart-checkout-bar"]')).toHaveCSS("bottom", "86px");
  await expectSafariFrame(page);
  await page.getByRole("radio", { name: "App", exact: true }).click();
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(frame.locator('[data-slot="cart-app-navigation"]')).toBeVisible();
});

test("the V1 navigation drawer extends behind both Safari safe areas", async ({ page }) => {
  await page.goto("/design?project=global-navigation&variant=h5-v1&viewport=402&locale=en");
  await expectSafariFrame(page);
  const frame = page.frameLocator("#canvas-preview");
  const trigger = frame.getByRole("button", { name: "Open navigation menu" });
  await trigger.click();
  const drawer = frame.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await expect.poll(() => drawer.evaluate((element) => {
    const panel = element.getBoundingClientRect();
    const header = element.querySelector('[data-slot="drawer-header"]')!.getBoundingClientRect();
    const content = element.querySelector('[data-drawer-content]')!.getBoundingClientRect();
    return {
      top: panel.top,
      bottomInset: window.innerHeight - panel.bottom,
      headerTop: header.top,
      contentBottomInset: window.innerHeight - content.bottom,
    };
  })).toEqual({ top: 0, bottomInset: 0, headerTop: 62, contentBottomInset: 86 });
  await drawer.getByRole("button", { name: "Close navigation menu" }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(frame.locator('[data-slot="tab-bar-container"]')).toBeVisible();
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
  await page.goto(`/design?project=global-navigation&variant=current&path=%2Fcart&viewport=402&locale=en&previewMode=h5&theme=${theme}`);
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
  for (const value of [360, 374, 402, 562]) {
    await width.fill(String(value)); await width.press('Enter');
    await expectSafariFrame(page);
    await expect.poll(() => toolbar.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await page.getByRole('radio', { name: '平板', exact: true }).click();
  await expect(page.locator('[data-phone-preview-shell]')).toHaveCount(0);
  await expect(frame.locator('html')).not.toHaveCSS('scrollbar-width', 'none');
});

test("H5 extends fixed TabBar colors and clears them when hidden or removed", async ({ page }) => {
  await page.goto('/design?project=global-navigation&variant=current&path=%2F&viewport=402&locale=en&previewMode=h5');
  await expectSafariFrame(page);
  const frame = page.frameLocator('#canvas-preview');
  const navigation = frame.locator('[data-slot="tab-bar-container"]');
  await expect(navigation).toHaveAttribute('data-phone-preview-bottom-bar', '');
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
  await expect(frame.locator('[data-phone-preview-bottom-bar]')).toHaveCount(1);
});

test("PROTOTYPE reserves phone chrome without covering the imported App cart navigation", async ({ page }) => {
  await page.goto("/design?story=yami-pages-cart--mobile&viewport=402&locale=en&previewMode=app");
  await expectPhoneFrame(page, "#canvas-preview");
  const frame = page.frameLocator("#canvas-preview");
  const navigation = frame.locator('[data-slot="cart-app-navigation"]');
  await expect(frame.locator('[data-slot="cart-page"]')).toBeVisible();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveAttribute("aria-hidden", "true");
  // The full viewport is visible behind chrome; fixed controls respect safe areas.
  const frameHeight = await page.locator("#canvas-preview").evaluate((element) => element.clientHeight);
  await expect.poll(() => frame.locator("html").evaluate(() => window.innerHeight)).toBe(frameHeight);
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

for (const mode of ["app", "h5"]) test(`PROTOTYPE matches the navigation background for a V1 ${mode} link`, async ({ page }) => {
  await page.goto(`/design?project=global-navigation&variant=current&path=%2F&viewport=402&locale=en&previewMode=${mode}`);
  await expectSafariFrame(page);
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
  const navigation = frame.getByRole("navigation", { name: "App navigation" });
  await expect(navigation.getByRole("link")).toHaveCount(5);
  await expect(navigation.getByRole("link", { name: "YAMI", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Cart 2", exact: true })).toHaveAttribute("href", /id=yami-pages-cart--mobile/);
  await expect(navigation.locator("..")).toHaveCSS("position", "fixed");
  await expect.poll(() => navigation.evaluate((element) => Math.round(window.innerHeight - element.getBoundingClientRect().bottom))).toBe(0);
  await expect.poll(() => frame.locator('[data-slot="ecommerce-home"]').evaluate((element) => {
    // Lazy-loaded content can extend the page after the first scroll.
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    const bar = document.querySelector('[data-slot="tab-bar"]')!;
    return element.getBoundingClientRect().bottom <= bar.getBoundingClientRect().top + 1;
  })).toBe(true);
  await page.goto("http://localhost:6006/?path=/story/yami-components-commerce-billboard--mobile-card&globals=locale:en");
  await expect(frame.locator('[data-slot="billboard"]')).toBeVisible();
  await expect(page.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(frame.locator("html")).not.toHaveAttribute("data-phone-preview-content");
});

test("imported Storybook pages receive only the PROTOTYPE shell", async ({ page }) => {
  await page.goto("/design?story=yami-pages-ecommerce-home--mobile&viewport=375&locale=en&theme=dark");
  const frame = page.frameLocator("#canvas-preview");
  await expectPhoneFrame(page, "#canvas-preview");
  await expect(page.locator("[data-phone-preview-shell]")).toHaveAttribute("data-theme", "dark");
  await expect(frame.locator("[data-phone-preview-shell]")).toHaveCount(0);
  await expect(frame.locator("html")).toHaveAttribute("data-phone-preview-content", "");
  const navigation = frame.getByRole("navigation", { name: "App navigation" });
  await expect(navigation).toBeVisible();
  await expect(navigation).toHaveCSS("padding-bottom", "34px");
  await page.getByRole("radio", { name: "H5", exact: true }).click();
  await expectSafariFrame(page);
  await expect(navigation).toBeHidden();
});


test("phone status content stays anchored to the edges when widened and fits narrow screens", async ({ page }) => {
  await page.goto("/design?viewport=402&locale=en");
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
  for (const value of [375, 367, 360]) {
    await width.fill(String(value));
    await width.press("Enter");
    await expect.poll(async () => (await measure()).width).toBe(value);
    const narrow = await measure();
    expect(narrow.centered && narrow.fits).toBe(true);
  }
});
