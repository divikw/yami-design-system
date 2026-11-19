import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { createToastManager, Toaster, type ToastPosition } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test.each([375, 1440])("positions an existing toast stack at %ipx", async width => {
  const original = { width: innerWidth, height: innerHeight };
  const host = document.body.appendChild(document.createElement("div"));
  const root = createRoot(host);
  const manager = createToastManager();
  const render = (position?: ToastPosition) => flushSync(() => root.render(
    <Toaster toastManager={manager} position={position} timeout={0} container={host} />,
  ));
  try {
    await page.viewport(width, 812);
    render();
    manager.add({ title: "First" });
    manager.add({ title: "Second" });
    await vi.waitFor(() => expect(host.querySelectorAll('[data-slot="toast"]')).toHaveLength(2));
    const [front, behind] = host.querySelectorAll<HTMLElement>('[data-slot="toast"]');
    const initial = front.getBoundingClientRect();
    expect(initial.bottom).toBeCloseTo(innerHeight - 16);
    expect(initial.right).toBeCloseTo(width - 16);
    expect(initial.width).toBeCloseTo(width === 375 ? width - 32 : 384);

    for (const vertical of ["top", "bottom"] as const) {
      for (const horizontal of ["left", "center", "right"] as const) {
        render(`${vertical}-${horizontal}`);
        await vi.waitFor(() => {
          const rect = front.getBoundingClientRect();
          expect(rect.top).toBeCloseTo(vertical === "top" ? 16 : innerHeight - 16 - rect.height);
          const expectedLeft = { left: 16, center: (width - rect.width) / 2, right: width - 16 - rect.width };
          expect(rect.left).toBeCloseTo(expectedLeft[horizontal]);
          const offset = behind.getBoundingClientRect().top - rect.top;
          expect(vertical === "top" ? offset : -offset).toBeGreaterThan(0);
        });
      }
    }
    render();
    await vi.waitFor(() => expect(front.getBoundingClientRect().toJSON()).toEqual(initial.toJSON()));
  } finally {
    root.unmount();
    host.remove();
    await page.viewport(original.width, original.height);
  }
});
