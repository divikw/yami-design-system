import { composeStories } from "@storybook/react-vite";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import * as stories from "../../../packages/design-system/components/Badge/Badge.stories";
import { Badge } from "../../../packages/design-system/components/Badge";
import "@yami/design-system/tokens.css";

const { Showcase, Sale, New, Hot, Discount, BestSellers, TypeWithOverride } = composeStories(stories);

test("named stories retain semantic presets and intentional overrides", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<><Sale /><New /><Hot /><Discount /><BestSellers /><TypeWithOverride /></>));
    const badges = [...container.querySelectorAll<HTMLElement>('[data-slot="badge"]')];
    expect(badges.map((badge) => [badge.dataset.color, badge.dataset.emphasis])).toEqual([
      ["red", "secondary"],
      ["purple", "secondary"],
      ["purple", "secondary"],
      ["red", "secondary"],
      ["yellow", "secondary"],
      ["green", "secondary"],
    ]);
  } finally {
    root.unmount();
    container.remove();
  }
});

function composite(color: string, background: number[]): number[] {
  const [r, g, b, alpha = 1] = color.match(/[\d.]+/g)!.map(Number);
  return [r, g, b].map((channel, index) => channel * alpha + background[index] * (1 - alpha));
}

test("yellow never renders a solid treatment, including explicit and type overrides", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<>{([undefined, "primary", "secondary"] as const).flatMap((emphasis) => [
      <Badge key={`color-${emphasis}`} color="yellow" emphasis={emphasis}>Limited</Badge>,
      <Badge key={`type-${emphasis}`} type="best-sellers" emphasis={emphasis}>Best Sellers</Badge>,
      <Badge key={`override-${emphasis}`} type="sale" color="yellow" emphasis={emphasis}>Sale</Badge>,
    ])}</>));
    const badges = [...container.querySelectorAll<HTMLElement>('[data-slot="badge"]')];
    expect(badges).toHaveLength(9);
    expect(badges.every((badge) => badge.dataset.color === "yellow" && badge.dataset.emphasis === "secondary")).toBe(true);
  } finally {
    root.unmount();
    container.remove();
  }
});

function luminance(rgb: number[]): number {
  return rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

test.each([375, 1280])("Showcase keeps design foregrounds, contrast checks, and fixed sizes in both themes at %ipx", async (width) => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    for (const theme of ["light", "dark"]) {
      container.className = theme === "dark" ? "dark" : "";
      container.style.background = "var(--surface-primary)";
      flushSync(() => root.render(<Showcase />));
      const badges = [...container.querySelectorAll<HTMLElement>('[data-slot="badge"]')];
      expect(badges.length).toBeGreaterThan(0);
      expect(container.querySelector('[data-slot="badge"][data-color="yellow"][data-emphasis="primary"]')).toBeNull();
      expect(container.querySelector('[data-slot="badge"][data-color="yellow"][data-emphasis="secondary"]')).not.toBeNull();
      for (const badge of badges) {
        const ancestors: Element[] = [];
        for (let element: Element | null = badge; element; element = element.parentElement) ancestors.unshift(element);
        const background = ancestors.reduce((rgb, element) => composite(getComputedStyle(element).backgroundColor, rgb), [255, 255, 255]);
        const style = getComputedStyle(badge);
        expect(style.paddingLeft).toBe(badge.dataset.flag ? "0px" : "4px");
        expect(style.paddingRight).toBe("4px");
        const foreground = composite(style.color, background);
        const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
        const ratio = (values[1] + 0.05) / (values[0] + 0.05);
        if (theme === "light" && badge.dataset.emphasis === "primary" && badge.dataset.color === "green") {
          expect(style.color).toBe("rgb(255, 255, 255)");
        }
        expect(ratio, `${theme}: ${badge.textContent} contrast`).toBeGreaterThanOrEqual(4.5);
        expect(style.height).toBe(badge.dataset.size === "md" ? "24px" : "20px");
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
