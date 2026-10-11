import { composeStories } from "@storybook/react-vite";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { Divider } from "@yami/design-system";
import * as stories from "../../../packages/design-system/components/Divider/Divider.stories";
import * as examples from "../../../packages/design-system/components/Divider/examples";
import "@yami/design-system/tokens.css";

const { Playground } = composeStories(stories);

test.each(["light", "dark"])("Divider preserves geometry, theme colors, and semantics in %s", (theme) => {
  const container = document.createElement("div");
  container.className = theme === "dark" ? "dark" : "";
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const orientation of ["horizontal", "vertical"] as const) {
      for (const strength of ["default", "emphasis"] as const) {
        for (const inverse of [false, true]) {
          flushSync(() => root.render(
            <div style={{ display: "flex", width: 240, height: 48 }}>
              <Divider orientation={orientation} strength={strength} inverse={inverse} aria-label="Section boundary" />
              <span style={{ backgroundColor: `var(--divider-${strength}${inverse ? "-inverse" : ""})` }} />
            </div>,
          ));
          const divider = container.querySelector<HTMLElement>('[data-slot="divider"]')!;
          const rect = divider.getBoundingClientRect();
          expect(orientation === "horizontal" ? rect.height : rect.width).toBe(strength === "default" ? 1 : 2);
          expect(orientation === "horizontal" ? rect.width : rect.height).toBe(orientation === "horizontal" ? 240 : 48);
          expect(getComputedStyle(divider).backgroundColor).toBe(getComputedStyle(container.querySelector("span:last-child")!).backgroundColor);
          expect(divider.tabIndex).toBe(-1);
          if (orientation === "horizontal") {
            expect(divider.tagName).toBe("HR");
            expect(divider).toHaveRole("separator");
            expect(divider).toHaveAccessibleName("Section boundary");
          } else {
            expect(divider.tagName).toBe("SPAN");
            expect(divider).toHaveAttribute("aria-hidden", "true");
            expect(divider).not.toHaveRole("separator");
          }
        }
      }
    }
  } finally {
    root.unmount();
    container.remove();
  }
});

test("vertical Playground fills its container for both polarities", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const inverse of [false, true]) {
      flushSync(() => root.render(<Playground orientation="vertical" inverse={inverse} />));
      const divider = container.querySelector<HTMLElement>('[data-slot="divider"]')!;
      const parent = divider.parentElement!;
      const style = getComputedStyle(parent);
      expect(divider.getBoundingClientRect().height).toBeCloseTo(parent.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom), 1);
    }
  } finally {
    root.unmount();
    container.remove();
  }
});

test("canonical examples render visible dividers", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<>{Object.entries(examples).map(([name, Example]) => <Example key={name} />)}</>));
    for (const divider of container.querySelectorAll<HTMLElement>('[data-slot="divider"]')) {
      expect(getComputedStyle(divider).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(divider.getBoundingClientRect().height).toBeGreaterThan(0);
    }
  } finally {
    root.unmount();
    container.remove();
  }
});
