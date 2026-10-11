import { createRef } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { Avatar } from "../../../packages/design-system/components/Avatar";
import "@yami/design-system/tokens.css";

const validImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6C7sAAAAASUVORK5CYII=";
const invalidImage = "data:image/png;base64,aW52YWxpZA==";

test("image failure and source replacement never generate text or leave a broken image", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const ref = createRef<HTMLSpanElement>();
  try {
    flushSync(() => root.render(<Avatar alt="Alex Morgan" src={invalidImage} membershipTier="gold" ref={ref} />));
    expect(ref.current).toBe(container.firstElementChild);
    await expect.poll(() => container.querySelector("img")?.naturalWidth ?? 0).toBe(512);
    expect(container.querySelector("img")?.src).toContain("default-avatar.png");
    expect(container.textContent).toBe("");
    expect(container.querySelector('[data-slot="avatar-membership"]')).not.toBeNull();

    flushSync(() => root.render(<Avatar alt="陈小米" src={validImage} />));
    await expect.poll(() => container.querySelector("img")?.naturalWidth ?? 0).toBe(1);
    await expect.poll(() => container.querySelector('[data-slot="avatar-fallback"]')).toBeNull();
    expect(container.firstElementChild?.getAttribute("aria-label")).toBe("陈小米");
    expect(container.querySelector("img")?.alt).toBe("");

    flushSync(() => root.render(<Avatar alt="Jamie Chen" src={invalidImage} />));
    await expect.poll(() => container.querySelector("img")?.naturalWidth ?? 0).toBe(512);
    expect(container.querySelector("img")?.src).toContain("default-avatar.png");
    expect(container.textContent).toBe("");

    flushSync(() => root.render(<Avatar alt="Sam" />));
    expect(container.textContent).toBe("");
    await expect.poll(() => container.querySelector("img")?.naturalWidth ?? 0).toBe(512);
    expect(container.querySelector("img")?.src).toContain("default-avatar.png");
  } finally {
    root.unmount();
    container.remove();
  }
});

test.each([375, 1280])("membership rings and icons stay aligned in both themes at %ipx", async (width) => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const tiers = ["ruby-0", "ruby", "silver", "gold"] as const;
  const sizes = ["sm", "md", "lg"] as const;
  const colors = ["rgb(153, 153, 153)", "rgb(255, 97, 85)", "rgb(81, 150, 255)", "rgb(253, 167, 0)"];
  const backgrounds = ["rgb(245, 245, 245)", "rgb(251, 241, 239)", "rgb(240, 243, 250)", "rgb(254, 247, 230)"];
  try {
    await page.viewport(width, 900);
    for (const theme of ["light", "dark"]) {
      container.className = theme === "dark" ? "dark" : "";
      flushSync(() => root.render(<>{sizes.flatMap((size) => tiers.map((tier) => (
        <Avatar key={`${size}-${tier}`} alt="Alex Morgan" size={size} membershipTier={tier} />
      )))}</>));
      await expect.poll(() => container.querySelectorAll('[data-slot="avatar-image"]').length).toBe(12);
      await expect.poll(() => [...container.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0)).toBe(true);
      for (const [index, avatar] of [...container.querySelectorAll<HTMLElement>('[data-slot="avatar"]')].entries()) {
        const sizeIndex = Math.floor(index / 4);
        const box = avatar.getBoundingClientRect();
        const marker = avatar.querySelector<HTMLElement>('[data-slot="avatar-membership"]')!;
        const corner = marker.getBoundingClientRect();
        const icon = marker.querySelector('[data-slot="membership-icon"]')!;
        expect(box.width).toBe([32, 40, 48][sizeIndex]);
        expect(box.height).toBe(box.width);
        expect(getComputedStyle(avatar).borderWidth).toBe("2px");
        expect(getComputedStyle(avatar).borderColor).toBe(colors[index % 4]);
        expect(getComputedStyle(avatar).padding).toBe("2px");
        expect(getComputedStyle(avatar).backgroundColor).toBe("rgb(255, 255, 255)");
        expect(corner.width).toBe([14, 18, 22][sizeIndex]);
        expect(corner.right).toBeCloseTo(box.right + 2, 1);
        expect(corner.bottom).toBeCloseTo(box.bottom + 2, 1);
        expect(icon.getBoundingClientRect().width).toBeCloseTo(corner.width - 4, 1);
        expect(icon.getBoundingClientRect().top).toBeCloseTo(corner.top + 2, 1);
        expect(icon.getBoundingClientRect().left).toBeCloseTo(corner.left + 2, 1);
        expect(getComputedStyle(marker).borderWidth).toBe("1px");
        expect(getComputedStyle(marker).borderColor).toBe(colors[index % 4]);
        expect(getComputedStyle(marker).borderRadius).toBe("9999px");
        expect(getComputedStyle(marker).backgroundColor).toBe(backgrounds[index % 4]);
        expect(getComputedStyle(avatar).overflow).toBe("visible");
        const image = avatar.querySelector('[data-slot="avatar-image"]')!.getBoundingClientRect();
        expect(image.width).toBe(box.width - 8);
        expect(image.height).toBe(image.width);
        expect(image.left).toBeCloseTo(box.left + 4, 1);
        expect(image.top).toBeCloseTo(box.top + 4, 1);
        expect(marker.getAttribute("aria-hidden")).toBe("true");
        expect(avatar.getAttribute("aria-label")).toContain("member");
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});

test.each([375, 1280])("image crops and circular sizes stay consistent in both themes at %ipx", async (width) => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    for (const theme of ["light", "dark"]) {
      container.className = theme === "dark" ? "dark" : "";
      flushSync(() => root.render(<><Avatar alt="Alex Morgan" src={validImage} size="sm" /><Avatar alt="陈小米" src={validImage} /><Avatar alt="Sam" src={validImage} size="lg" /></>));
      await expect.poll(() => container.querySelectorAll('[data-slot="avatar-image"]').length).toBe(3);
      const avatars = [...container.querySelectorAll<HTMLElement>('[data-slot="avatar"]')];
      for (const [index, avatar] of avatars.entries()) {
        const style = getComputedStyle(avatar);
        expect(avatar.getBoundingClientRect().width).toBe([32, 40, 48][index]);
        expect(avatar.getBoundingClientRect().height).toBe([32, 40, 48][index]);
        expect(style.borderRadius).toBe("9999px");
        expect(avatar.tabIndex).toBe(-1);
        expect(avatar.textContent).toBe("");
        expect(getComputedStyle(avatar.querySelector("img")!).objectFit).toBe("cover");
      }
    }
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(viewport.width, viewport.height);
  }
});
