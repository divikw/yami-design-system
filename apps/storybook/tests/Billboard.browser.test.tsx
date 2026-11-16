import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { Billboard } from "@yami/design-system/components/Billboard";
import { billboardCopy } from "../../../packages/design-system/components/Billboard/fixtures";
import { createEcommerceHomeFixture } from "../../../packages/prototypes/pages/EcommerceHome/fixtures";
import "@yami/design-system/tokens.css";

for (const locale of ["zh", "en"] as const) {
  test(`${locale}: homepage billboard switches artwork and accessible names`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const section = createEcommerceHomeFixture(locale).sections.find(
      (item) => item.kind === "billboard",
    );
    if (!section || section.kind !== "billboard") throw new Error("Missing billboard");
    try {
      await page.viewport(375, 812);
      flushSync(() => root.render(<Billboard {...section.props} />));
      const image = host.querySelector<HTMLImageElement>("img")!;
      const link = host.querySelector("a")!;
      const mobileHeight = locale === "zh" ? 375 : 376;
      for (const width of [360, 375, 402]) {
        await page.viewport(width, 812);
        await expect.poll(() => image.complete && image.naturalWidth > 0).toBe(true);
        await expect.poll(() => image.currentSrc).toContain(`new-user-offer-${locale}-mobile`);
        await expect.poll(() => link.getAttribute("aria-label")).toBe(billboardCopy[locale].mobileLabel);
        await expect.poll(() => image.getAttribute("data-image-state")).toBe("loaded");
        expect(host.querySelector('[data-slot="billboard-mobile-text"]')).toBeNull();
        expect(image.naturalWidth).toBe(1500);
        expect(image.naturalHeight).toBe(mobileHeight);
        const box = image.getBoundingClientRect();
        expect(Math.abs(box.height - box.width * mobileHeight / 1500)).toBeLessThan(1);
        expect(box.height).toBeGreaterThan(44);
      }
      await page.viewport(1440, 900);
      await expect.poll(() => image.currentSrc).toContain(
        locale === "zh" ? "weekly-picks-zh-desktop" : "new-user-offer-",
      );
      await expect.poll(() => image.currentSrc.includes("mobile")).toBe(false);
      await expect.poll(() => link.getAttribute("aria-label")).toBe(billboardCopy[locale].label);
      expect(link.getAttribute("href")).toBe(section.props.href);
    } finally {
      flushSync(() => root.unmount());
      host.remove();
      await page.viewport(viewport.width, viewport.height);
    }
  });
}
