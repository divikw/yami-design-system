import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { AppDownloadPage } from "../../../packages/prototypes/pages/AppDownloadPage/AppDownloadPage";
import { AppDownloadPageV2 } from "../../../packages/prototypes/pages/AppDownloadPageV2/AppDownloadPageV2";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

function expectSingleLineAmounts(container: HTMLElement) {
  for (const element of container.querySelectorAll<HTMLElement>("*")) {
    if (!element.getClientRects().length) continue;
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      for (const match of (node.textContent ?? "").matchAll(/\$[\d,]+(?:\.\d+)?/g)) {
        const range = document.createRange();
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        expect(range.getClientRects().length, `${match[0]} in ${element.closest("section")?.id}`).toBe(1);
      }
    }
  }
}

for (const [version, Page] of [["V1", AppDownloadPage], ["V2", AppDownloadPageV2]] as const) {
  for (const locale of ["ko", "en"] as const) {
    test(`${version} ${locale} mobile amounts stay on one line without overflowing at the maximum selection`, async () => {
      const viewport = { width: innerWidth, height: innerHeight };
      const container = document.createElement("div");
      document.body.append(container);
      const root = createRoot(container);
      try {
        await page.viewport(320, 844);
        flushSync(() => root.render(<Page initialLocale={locale} />));
        await document.fonts.ready;
        expectSingleLineAmounts(container);
        flushSync(() => container.querySelector<HTMLButtonElement>("#calculator-tab-app")!.click());
        expectSingleLineAmounts(container);
        flushSync(() => {
          for (const checkbox of container.querySelectorAll<HTMLElement>('#calculator-panel-app [role="checkbox"]')) checkbox.click();
        });
        expect(container.querySelector('[data-testid="final-payment"]')!.textContent).toBe("$2919.34");
        for (const width of [320, 375, 402, 768]) {
          await page.viewport(width, 844);
          expectSingleLineAmounts(container);
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
          for (const amount of container.querySelectorAll<HTMLElement>('[data-testid="selected-items-total"], [data-testid="final-payment"]')) {
            const bounds = amount.getBoundingClientRect();
            const row = amount.parentElement!.getBoundingClientRect();
            expect(bounds.left).toBeGreaterThanOrEqual(row.left);
            expect(bounds.right).toBeLessThanOrEqual(row.right);
            expect(bounds.height).toBe(parseFloat(getComputedStyle(amount).lineHeight));
          }
          const reviewRail = container.querySelector<HTMLElement>('[data-slot="review-list-items"]');
          if (reviewRail) {
            const style = getComputedStyle(reviewRail);
            const availableWidth = reviewRail.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            for (const item of reviewRail.children) expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(availableWidth);
          }
        }
      } finally {
        flushSync(() => root.unmount());
        container.remove();
        await page.viewport(viewport.width, viewport.height);
      }
    });
  }
}
