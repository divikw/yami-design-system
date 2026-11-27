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
    await page.viewport(375, 812);
    host.style.width = "375px";
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    flushSync(() => root.render(<ServiceCommitment mobileCarousel locale={locale} />));
    const list = host.querySelector("ul")!;
    const count = locale === "zh" ? 5 : 4;
    expect(list.clientHeight).toBe(36);
    const items = Array.from(list.querySelectorAll("li:not([aria-hidden])"));
    expect(items).toHaveLength(count);
    const rows = new Set(items.map(item => item.getBoundingClientRect().top)).size;
    expect(rows).toBeGreaterThan(1);
    if (locale === "zh") expect(rows).toBeLessThan(count);
    expect(list.scrollHeight).toBe(rows * list.clientHeight);
    await expect.poll(() => list.tabIndex).toBe(0);
    list.focus();
    vi.advanceTimersByTime(3000);
    expect(list.scrollTop).toBe(0);
    list.blur();
    for (let step = 1; step <= rows + 1; step++) {
      vi.advanceTimersByTime(3000);
      expect(list.scrollTop).toBe((step % rows) * list.clientHeight);
    }
    await page.viewport(1000, 812);
    host.style.width = "100%";
    await expect.poll(() => list.hasAttribute("tabindex")).toBe(false);
    vi.advanceTimersByTime(6000);
    expect(list.scrollHeight).toBe(list.clientHeight);
    expect(list.scrollTop).toBe(0);
    host.style.width = "320px";
    await expect.poll(() => list.tabIndex).toBe(0);
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
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
