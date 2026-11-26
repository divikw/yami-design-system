import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { ServiceCommitment } from "@yami/design-system/components/ServiceCommitment";
import "@yami/design-system/tokens.css";

test.each(["zh", "en"] as const)("cycles %s benefits on mobile and pauses for keyboard reading", async locale => {
  const viewport = { width: innerWidth, height: innerHeight };
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  try {
    await page.viewport(516, 812);
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    flushSync(() => root.render(<ServiceCommitment mobileCarousel locale={locale} />));
    const list = host.querySelector("ul")!;
    const count = locale === "zh" ? 5 : 4;
    expect(list.clientHeight).toBe(36);
    expect(list.querySelectorAll("li:not([aria-hidden])")).toHaveLength(count);
    list.focus();
    vi.advanceTimersByTime(3000);
    expect(list.scrollTop).toBe(0);
    list.blur();
    for (let step = 1; step <= count + 1; step++) {
      vi.advanceTimersByTime(3000);
      expect(list.scrollTop).toBe((step <= count ? step : 1) * list.clientHeight);
    }
    await page.viewport(1400, 812);
    await expect.poll(() => list.hasAttribute("tabindex")).toBe(false);
    expect(list.scrollHeight).toBe(list.clientHeight);
  } finally {
    root.unmount();
    vi.useRealTimers();
    host.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
