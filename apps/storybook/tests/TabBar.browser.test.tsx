import { createRef } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { TabBar } from "@yami/design-system";
import { tabBarExampleItems } from "../../../packages/design-system/components/TabBar/examples";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

for (const locale of ["zh", "en"] as const) for (const dark of [false, true]) {
  test(`TabBar keeps usable targets, links, counts and keyboard actions in ${locale}/${dark ? "dark" : "light"}`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const theme = document.documentElement.className;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const ref = createRef<HTMLElement>();
    const action = vi.fn();
    const navigation = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const labels = locale === "zh" ? ["分类", "购物车"] : ["Shop", "Cart"];
    const items = tabBarExampleItems(locale, 123).map((item) => item.value === "cart"
      ? { value: item.value, label: item.label, icon: item.icon, badgeCount: 123, onClick: action }
      : { ...item, href: `/${item.value}`, onClick: navigation });
    try {
      await page.viewport(320, 812);
      document.documentElement.classList.toggle("dark", dark);
      flushSync(() => root.render(<TabBar ref={ref} lang={locale} aria-label="App navigation" value="cart" items={items} />));
      const nav = ref.current!;
      expect(nav.getBoundingClientRect().height).toBe(49);
      expect([...nav.querySelectorAll("a, button")].every(el => el.getBoundingClientRect().height >= 48 && el.getBoundingClientRect().width >= 48)).toBe(true);
      expect(nav.scrollWidth).toBeLessThanOrEqual(320);
      await expect.poll(() => [...nav.querySelectorAll("img")].every(img => img.complete && img.naturalWidth > 0)).toBe(true);
      expect(nav.querySelector('[data-slot="badge"]')!.textContent).toBe("99+");
      const cart = page.getByRole("button", { name: `${labels[1]} 123`, exact: true });
      await expect.element(cart).toHaveAttribute("aria-current", "page");
      await page.getByRole("link", { name: labels[0], exact: true }).click();
      expect(navigation).toHaveBeenCalledOnce();
      await userEvent.tab();
      await userEvent.tab();
      await expect.element(cart).toHaveFocus();
      expect(getComputedStyle(cart.element()).outlineWidth).toBe("2px");
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard(" ");
      expect(action).toHaveBeenCalledTimes(2);
      // Host state remains the only source of current destination and badges.
      flushSync(() => root.render(<TabBar ref={ref} aria-label="App navigation" value="shop" items={tabBarExampleItems(locale, 0)} />));
      expect(nav.querySelector('[aria-current="page"]')!.textContent).toBe(labels[0]);
      expect(nav.querySelector('[data-slot="badge"]')!.textContent).toBe("0");
      flushSync(() => root.render(<TabBar hidden aria-label="App navigation" value="cart" items={items} />));
      expect(nav.getBoundingClientRect().height).toBe(0);
      flushSync(() => root.render(<TabBar aria-label="App navigation" value="cart" items={[]} />));
      expect(container.children.length).toBe(0);
    } finally {
      root.unmount(); container.remove();
      document.documentElement.className = theme;
      await page.viewport(viewport.width, viewport.height);
    }
  });
}
