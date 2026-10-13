import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { composeStory } from "@storybook/react-vite";

import { Pagination } from "../../../packages/design-system/components/Pagination";
import * as stories from "../../../packages/design-system/components/Pagination/Pagination.stories";
import "@yami/design-system/tokens.css";

function textContrast(foreground: string, background: string) {
  const bg = background.match(/[\d.]+/g)!.map(Number);
  const fg = foreground.match(/[\d.]+/g)!.map(Number);
  const alpha = fg[3] ?? 1;
  const luminance = (channels: number[]) => channels.slice(0, 3).reduce((sum, value, index) => {
    const channel = value / 255;
    const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
  const text = luminance(fg.slice(0, 3).map((value, index) => value * alpha + bg[index] * (1 - alpha)));
  const fill = luminance(bg);
  return (Math.max(text, fill) + 0.05) / (Math.min(text, fill) + 0.05);
}

for (const locale of ["zh", "en"] as const) for (const theme of ["light", "dark"] as const) {
  for (const [name, story] of Object.entries({ Overview: stories.Showcase, Playground: stories.Playground, Links: stories.Links, States: stories.Disabled })) {
    test(`${name} ${locale}/${theme}: actual example selection, disabled controls and focus geometry`, async () => {
      const viewport = { width: innerWidth, height: innerHeight };
      const originalClass = document.documentElement.className;
      const originalLang = document.documentElement.lang;
      const container = document.createElement("div");
      container.style.padding = "16px";
      document.body.append(container);
      const root = createRoot(container);
      const Story = composeStory(story, stories.default, { initialGlobals: { locale, theme } });
      try {
        await page.viewport(1280, 900);
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.lang = locale;
        flushSync(() => root.render(<Story />));
        const navs = [...container.querySelectorAll<HTMLElement>('[data-slot="pagination"]')];
        expect(navs).toHaveLength(name === "Overview" ? 3 : name === "States" ? 2 : 1);
        expect(container.querySelector(":focus-visible")).toBeNull();
        for (const nav of navs) {
          expect(nav).toHaveAccessibleName(locale === "zh" ? "分页导航" : "Pagination");
          const selected = nav.querySelector<HTMLElement>('[aria-current="page"]')!;
          const style = getComputedStyle(selected);
          expect(textContrast(style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
        }
        const controls = [...container.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')];
        await userEvent.tab();
        expect(controls[0]).toHaveFocus();
        // A narrow embedded PC specimen must wrap without clipping the outline.
        container.style.width = "420px";
        for (const control of controls) {
          control.focus();
          expect(control).toHaveFocus();
          const nav = control.closest<HTMLElement>('[data-slot="pagination"]')!;
          const list = control.closest("ul")!;
          const style = getComputedStyle(control);
          const inverse = nav.dataset.inverse === "true";
          const lightSurface = (theme === "light") !== inverse;
          expect(style.outlineWidth).toBe("2px");
          expect(style.outlineOffset).toBe("2px");
          expect(style.outlineColor).toBe(lightSurface ? "rgb(0, 102, 235)" : "rgb(102, 161, 255)");
          const box = control.getBoundingClientRect();
          const listBox = list.getBoundingClientRect();
          expect(box.left - 4).toBeGreaterThanOrEqual(listBox.left);
          expect(box.right + 4).toBeLessThanOrEqual(listBox.right);
          expect(box.top - 4).toBeGreaterThanOrEqual(listBox.top);
          expect(box.bottom + 4).toBeLessThanOrEqual(listBox.bottom);
          const selected = nav.querySelector<HTMLElement>('[aria-current="page"]')!;
          const selectedStyle = getComputedStyle(selected);
          expect(textContrast(selectedStyle.color, selectedStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
        }
        expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
        if (name === "States") {
          const disabled = navs[0];
          expect(disabled.querySelectorAll("button:not(:disabled)")).toHaveLength(0);
          expect(disabled.querySelector(":focus-visible")).toBeNull();
        }
      } finally {
        root.unmount();
        container.remove();
        document.documentElement.className = originalClass;
        document.documentElement.lang = originalLang;
        await page.viewport(viewport.width, viewport.height);
      }
    });
  }
}

for (const dark of [false, true]) for (const inverse of [false, true]) for (const mode of ["callback", "link"] as const) {
  test(`disabled selected page remains readable in ${dark ? "dark" : "light"}/${inverse ? "inverse" : "default"}/${mode}`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const originalClass = document.documentElement.className;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const change = vi.fn();
    try {
      await page.viewport(1280, 800);
      document.documentElement.classList.toggle("dark", dark);
      flushSync(() => root.render(mode === "callback"
        ? <Pagination page={3} pageCount={25} inverse={inverse} disabled onPageChange={change} />
        : <Pagination page={3} pageCount={25} inverse={inverse} disabled getPageHref={(page) => `/search?page=${page}`} />));
      const selected = container.querySelector<HTMLElement>('[aria-current="page"]')!;
      const selectedStyle = getComputedStyle(selected);
      expect(textContrast(selectedStyle.color, selectedStyle.backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(selectedStyle.opacity).toBe("1");
      expect(selectedStyle.cursor).toBe("default");
      expect(container.querySelectorAll("a, button:not(:disabled)")).toHaveLength(0);
      expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
      if (mode === "callback") {
        selected.click();
        expect(change).not.toHaveBeenCalled();
      }
    } finally {
      root.unmount();
      container.remove();
      document.documentElement.className = originalClass;
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

for (const locale of ["zh", "en"] as const) for (const dark of [false, true]) for (const inverse of [false, true]) {
  test(`${locale}/${dark ? "dark" : "light"}/${inverse ? "inverse" : "default"}: compact PC geometry and keyboard focus`, async () => {
    const viewport = { width: innerWidth, height: innerHeight };
    const originalClass = document.documentElement.className;
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await page.viewport(1280, 800);
      document.documentElement.classList.toggle("dark", dark);
      container.style.background = inverse ? "var(--surface-inverse)" : "var(--surface-primary)";
      flushSync(() => root.render(<Pagination page={8} pageCount={25} locale={locale} inverse={inverse} onPageChange={() => {}} />));
      const nav = container.querySelector("nav")!;
      expect(nav).toHaveAccessibleName(locale === "zh" ? "分页导航" : "Pagination");
      expect(nav).toHaveAttribute("lang", locale);
      expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
      expect(nav.querySelector(":focus-visible")).toBeNull();
      const selected = nav.querySelector<HTMLButtonElement>('[aria-current="page"]')!;
      const list = nav.querySelector("ul")!;
      const selectedStyle = getComputedStyle(selected);
      const outlineColor = dark !== inverse ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)";
      expect(selected.getBoundingClientRect().height).toBe(32);
      expect(selected.getBoundingClientRect().width).toBeGreaterThanOrEqual(32);
      expect(getComputedStyle(list).gap).toBe("4px");
      const background = selectedStyle.backgroundColor;
      await userEvent.tab();
      selected.focus();
      expect(selected).toHaveFocus();
      expect(selectedStyle.outlineWidth).toBe("2px");
      expect(selectedStyle.outlineOffset).toBe("2px");
      expect(selectedStyle.outlineColor).toBe(outlineColor);
      expect(selectedStyle.backgroundColor).toBe(background);
      for (const button of nav.querySelectorAll<HTMLButtonElement>("button")) {
        const box = button.getBoundingClientRect();
        const listBox = list.getBoundingClientRect();
        expect(box.left - 4).toBeGreaterThanOrEqual(listBox.left);
        expect(box.right + 4).toBeLessThanOrEqual(listBox.right);
        expect(box.top - 4).toBeGreaterThanOrEqual(listBox.top);
        expect(box.bottom + 4).toBeLessThanOrEqual(listBox.bottom);
      }
      await page.viewport(1023, 800);
      await expect.poll(() => nav.getBoundingClientRect().height).toBe(0);
      await page.viewport(375, 812);
      expect(nav.getBoundingClientRect().height).toBe(0);
      await page.viewport(1024, 800);
      await expect.poll(() => nav.getBoundingClientRect().height).toBeGreaterThan(0);
    } finally {
      root.unmount();
      container.remove();
      document.documentElement.className = originalClass;
      await page.viewport(viewport.width, viewport.height);
    }
  });
}

test("callback pagination has numbered pages only, gaps, keyboard activation, disabled and empty states", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const change = vi.fn();
  const render = (current: number, count = 25, disabled = false) => flushSync(() => root.render(
    <Pagination page={current} pageCount={count} onPageChange={change} disabled={disabled} />,
  ));
  try {
    await page.viewport(1280, 800);
    render(1);
    expect([...container.querySelectorAll("button")].every(button => /^\d+$/.test(button.textContent!))).toBe(true);
    expect([...container.querySelectorAll("button")].map(button => button.textContent)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "25",
    ]);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    await userEvent.click(container.querySelector<HTMLButtonElement>('[aria-label="Page 2"]')!);
    expect(change).toHaveBeenLastCalledWith(2);
    render(2);
    await userEvent.tab();
    container.querySelector<HTMLButtonElement>('[aria-label="Page 1"]')!.focus();
    await userEvent.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith(1);
    render(13);
    const pageNames = [...container.querySelectorAll('[aria-label^="Page "]')].map(el => el.getAttribute("aria-label"));
    expect(pageNames).toEqual(["Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "Page 6", "Page 7", "Page 8", "Page 9", "Page 25"]);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
    expect(container.querySelector('[aria-current="page"]')).toBeNull();
    render(5);
    expect(container.querySelector('[aria-label="Page 3"]')).not.toBeNull();
    render(25);
    expect(container.querySelector('[aria-current="page"]')).toHaveTextContent("25");
    expect(container.querySelectorAll('[aria-label="Previous page"], [aria-label="Next page"]')).toHaveLength(0);
    render(1, 1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    change.mockClear();
    await userEvent.click(container.querySelector<HTMLButtonElement>('[aria-current="page"]')!);
    expect(change).not.toHaveBeenCalled();
    render(1, 13);
    expect([...container.querySelectorAll("button")].map(button => button.textContent)).toEqual([
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "13",
    ]);
    render(1, 10);
    expect(container.querySelectorAll("button")).toHaveLength(10);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    render(3, 25, true);
    expect(container.querySelectorAll("button:not(:disabled)")).toHaveLength(0);
    render(1, 0);
    expect(container.querySelector("nav")).toBeNull();
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test("link mode preserves numbered destinations and disabled semantics", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(1280, 800);
    flushSync(() => root.render(<Pagination page={1} pageCount={10} getPageHref={(page) => `/search?page=${page}`} />));
    expect([...container.querySelectorAll("a")].every(link => /^\d+$/.test(link.textContent!))).toBe(true);
    expect(container.querySelector('[aria-label="Page 2"]')).toHaveAttribute("href", "/search?page=2");
    expect(container.querySelector('[aria-current="page"]')).toHaveAttribute("href", "/search?page=1");
    expect(container.querySelectorAll("button")).toHaveLength(0);
    flushSync(() => root.render(<Pagination page={3} pageCount={10} getPageHref={(page) => `/search?page=${page}`} disabled />));
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
