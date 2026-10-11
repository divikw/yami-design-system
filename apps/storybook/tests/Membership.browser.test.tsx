import { createRef } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { MembershipBadge } from "../../../packages/design-system/components/MembershipBadge";
import { MembershipIcon } from "../../../packages/design-system/components/MembershipIcon";
import "@yami/design-system/tokens.css";

const tiers = ["ruby-0", "ruby", "silver", "gold"] as const;
const iconGeometry = [
  [20.5726, 16, 4],
  [22.0002, 17.1104, 3.4448],
  [20.5709, 18, 3],
  [21, 17.2941, 3],
];

test.each([375, 1280])("membership artwork matches Figma geometry in both themes at %ipx", async (width) => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLSpanElement>();
  try {
    await page.viewport(width, 900);
    for (const theme of ["light", "dark"]) {
      container.className = theme === "dark" ? "dark" : "";
      flushSync(() => root.render(
        <>
          {tiers.map((tier) => <MembershipIcon key={`icon-${tier}`} tier={tier} />)}
          {tiers.map((tier) => <MembershipBadge key={`badge-${tier}`} tier={tier} />)}
          <MembershipBadge tier="gold" alt="" ref={ref} />
        </>,
      ));
      const images = [...container.querySelectorAll("img")];
      await expect.poll(() => images.every((image) => image.complete && image.naturalWidth > 0)).toBe(true);
      expect(images).toHaveLength(9);
      expect(ref.current?.getAttribute("aria-hidden")).toBe("true");
      expect(ref.current?.getAttribute("aria-label")).toBeNull();

      const icons = [...container.querySelectorAll<HTMLElement>('[data-slot="membership-icon"]')];
      for (const [index, icon] of icons.entries()) {
        const box = icon.getBoundingClientRect();
        const image = icon.querySelector("img")!;
        const art = image.getBoundingClientRect();
        const [artWidth, artHeight, top] = iconGeometry[index];
        expect(box.width).toBe(24);
        expect(box.height).toBe(24);
        expect(art.width).toBeCloseTo(artWidth, 1);
        expect(art.height).toBeCloseTo(artHeight, 1);
        expect(art.left - box.left).toBeCloseTo((24 - artWidth) / 2, 1);
        expect(art.top - box.top).toBeCloseTo(top, 1);
        expect(icon.getAttribute("aria-label")).toBeTruthy();
        expect(image.getAttribute("aria-hidden")).toBe("true");
        expect(icon.tabIndex).toBe(-1);
      }

      for (const badge of container.querySelectorAll<HTMLElement>('[data-slot="membership-badge"]')) {
        const box = badge.getBoundingClientRect();
        const image = badge.querySelector("img")!;
        expect(box.width).toBe(56);
        expect(box.height).toBe(20);
        expect(image.getBoundingClientRect().width).toBe(56);
        expect(image.getBoundingClientRect().height).toBe(20);
        expect(badge.tabIndex).toBe(-1);
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
