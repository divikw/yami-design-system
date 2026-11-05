import assert from "node:assert/strict";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";

export async function verifyHomepage({ browser, url, reportDir, host }) {
  const states = {};
  for (const [view, width, height] of [["desktop", 1440, 900], ["mobile", 402, 844]]) {
    const mobile = view === "mobile";
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: mobile, isMobile: mobile, reducedMotion: "reduce" });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on("requestfailed", (request) => {
        if (request.failure()?.errorText !== "net::ERR_ABORTED") errors.push(`${request.failure()?.errorText} ${request.url()}`);
      });
      const home = `${url}/homepage-pilot`;
      await page.goto(home);
      const slot = (name) => page.locator(`[data-slot="${name}"]`);
      const header = slot("sticky-storefront-header");
      const hero = slot("hero-banner-list");
      const banner = slot("billboard-image");
      const artwork = hero.locator('[data-slot="hero-banner-item"] > img').first();
      await expect(header).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("margin", "0px");
      const headerBounds = await header.boundingBox();
      assert.deepEqual([headerBounds.x, headerBounds.y, headerBounds.width], [0, 0, width],
        "The host reset must allow full-width storefront chrome");
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Best sellers", exact: true })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (mobile) {
        await expect(slot("shortcut-rail")).toHaveAttribute("data-lines", "1");
        const [shortcuts, ...cards] = await Promise.all(["shortcut-rail-container", "billboard", "billboard-link", "product-list"].map(
          (name) => slot(name).evaluate((element) => {
            const { left, right } = element.getBoundingClientRect();
            return [left, right];
          }),
        ));
        assert.ok(shortcuts[0] > 0 && shortcuts[0] === width - shortcuts[1], "Mobile cards need equal viewport gutters");
        for (const edges of cards) assert.deepEqual(edges, shortcuts, "Mobile shortcut rail, Billboard and product list must share both edges");
        const heroBounds = await slot("hero-banner").boundingBox();
        const shortcutBounds = await slot("shortcut-rail-container").boundingBox();
        assert.equal(shortcutBounds.y - heroBounds.y - heroBounds.height, 8, "Mobile hero and shortcuts must have an 8px gap");
      }
      const crop = await artwork.evaluate(async (image) => {
        await image.decode();
        const card = image.closest('[data-slot="hero-banner-item"]');
        return { imageHeight: image.clientHeight, cardHeight: card.clientHeight, ratio: image.naturalWidth / image.naturalHeight };
      });
      assert.equal(crop.imageHeight, crop.cardHeight, "Campaign artwork must use the entire card, including behind the copy");
      assert.equal(crop.ratio, 8 / 9, "Pilot artwork must match the campaign card aspect ratio");
      assert.equal(await banner.evaluate(async (image) => { await image.decode(); return image.naturalWidth; }), mobile ? 386 : 1344);
      if (mobile) {
        const firstProductImage = slot("product-list-item").first().locator('[data-slot="product-card-media"] img');
        await expect(firstProductImage).toBeInViewport();
        await firstProductImage.evaluate((image) => image.decode());
      } else {
        await expect(banner).toBeInViewport({ ratio: 1 });
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const links = page.locator('[data-slot="hero-banner-item"]:not([inert] *), [data-slot="shortcut-rail-link"], [data-slot="billboard-link"]');
      const destinations = await links.evaluateAll((nodes) => nodes.map((node) => [node.hash, document.getElementById(node.hash.slice(1))?.querySelector("h2")?.textContent]));
      assert.equal(new Set(destinations.map(([hash]) => hash)).size, destinations.length);
      assert.ok(destinations.every(([hash, title]) => hash && title), "Each homepage entrance needs a real, named destination");
      const scan = async () => {
        const { violations } = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })), [], `${host} homepage ${view} accessibility`);
        return violations.length;
      };
      const axeViolations = await scan();
      const screenshot = `${host}-homepage-${view}.png`;
      await page.screenshot({ path: path.join(reportDir, screenshot) });
      if (mobile) {
        const shell = page.locator("#pilot-home");
        const color = () => shell.evaluate((element) => element.style.getPropertyValue("--homepage-pilot-atmosphere"));
        const gradient = () => shell.evaluate((element) => getComputedStyle(element, "::before").backgroundImage);
        await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect.poll(color).toBe("rgb(238, 244, 231)");
        const initialGradient = await gradient();
        assert.ok(initialGradient.startsWith("linear-gradient("));
        await hero.evaluate((rail) => {
          const [first, second] = rail.querySelectorAll('[data-slot="hero-banner-item"]');
          rail.scrollLeft = second.offsetLeft - first.offsetLeft;
        });
        await expect.poll(color).toBe("rgb(245, 236, 229)");
        const activeGradient = await gradient();
        assert.ok(activeGradient.startsWith("linear-gradient(") && activeGradient !== initialGradient,
          "The mobile backdrop must follow the active campaign");
        await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await page.goto(home);
      } else {
        await expect(header.getByRole("link", { name: "Pantry", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Next campaigns" }).click();
        await expect.poll(() => hero.evaluate((rail) => rail.scrollLeft)).toBeGreaterThan(0);
        await page.getByRole("button", { name: "Previous campaigns" }).click();
      }
      for (const [name, hash, title] of [
        [/Pantry essentials/, "#campaign-0", "Pantry essentials"],
        ["New arrivals", "#collection-0", "New arrivals"],
        ["Weekly offer", "#weekly-offer", "Weekly offer details"],
      ]) {
        const link = page.getByRole("link", { name }).and(links);
        await expect(link).toHaveAttribute("href", hash);
        if (mobile) await link.tap();
        else { await link.focus(); await link.press("Enter"); }
        await expect(page).toHaveURL(`${home}${hash}`);
        await expect(page.locator(hash).getByRole("heading", { name: title, exact: true })).toBeInViewport();
        await page.goto(home);
      }

      await page.evaluate(() => window.scrollTo(0, 750));
      await expect(header).toHaveAttribute("data-scrolled", "");
      assert.equal((await header.boundingBox()).y, 0);
      if (mobile) {
        const solidSurface = await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor);
        await expect(header).toHaveCSS("background-color", solidSurface);
      }
      const field = mobile
        ? header.getByRole("link", { name: "Search the shop: Jasmine tea" })
        : header.getByRole("searchbox", { name: "Search the shop" });
      await expect(field).toBeInViewport();
      const fieldBounds = await field.boundingBox();
      assert.ok(fieldBounds.y >= 0 && fieldBounds.y + fieldBounds.height <= (await header.boundingBox()).height,
        "Search must stay within the sticky header after scrolling");
      if (mobile) await page.keyboard.press("Tab");
      await field.focus();
      await expect(field).toBeFocused();
      await expect(page).toHaveURL(home);
      if (mobile) {
        const search = header.getByRole("search", { name: "Search the shop" });
        await expect(search.getByText("Jasmine tea", { exact: true })).toBeVisible();
        await expect(search).toHaveCSS("outline-width", "2px");
        await expect(field).toHaveCSS("outline-style", "none");
        await expect(header.locator('[data-slot="header-mobile-brand"]')).toBeHidden();
        await expect(header.locator('[data-slot="header-mobile-search-row"]')).toHaveCSS("animation-name", "none");
        await field.press("Enter");
        await expect(page).toHaveURL(`${home}#pilot-search`);
        await expect(page.getByRole("heading", { name: "Find products" })).toBeInViewport();
        await page.getByRole("searchbox", { name: "Keyword" }).fill("jasmine");
        await page.getByRole("button", { name: "Find", exact: true }).tap();
      } else {
        await field.fill("jasmine");
        await field.press("Enter");
      }
      await expect(page.locator("#pilot-search").getByRole("status")).toHaveText("jasmine: 1 results");
      await expect(page.getByRole("heading", { name: "Find products" })).toBeFocused();
      assert.deepEqual(errors, [], `${host} homepage ${view} browser errors`);
      states[view] = { width, height, crop, searchAfterScrollY: fieldBounds.y, destinations: destinations.length, axeViolations, screenshot };
    } finally {
      await context.close();
    }
  }
  return { status: "pass", states };
}
