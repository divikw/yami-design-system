import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { Button, ButtonGroup } from "@yami/design-system";
import "@yami/design-system/tokens.css";

test.each([375, 1024, 1440])("equal-width groups keep two or three long labels within narrow and desktop containers at %ipx", async (width) => {
  const originalViewport = { width: window.innerWidth, height: window.innerHeight };
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await page.viewport(width, 900);
    flushSync(() => root.render(<>
      {[240, 800].flatMap((available) => [2, 3].map((count) =>
        <div key={`${available}-${count}`} style={{ width: available, maxWidth: "100%" }}>
          <ButtonGroup full aria-label={`${available}px ${count} actions`}>
            {Array.from({ length: count }, (_, i) => <Button key={i} form="full" size="lg">保存此订单的所有配送设置 / Save all delivery settings</Button>)}
          </ButtonGroup>
        </div>,
      ))}
    </>));
    for (const group of container.querySelectorAll<HTMLElement>('[role="group"]')) {
      const rect = group.getBoundingClientRect();
      expect(rect.width).toBeCloseTo(Math.min(480, group.parentElement!.getBoundingClientRect().width), 1);
      const buttons = [...group.querySelectorAll("button")];
      buttons.forEach((button, index) => {
        const buttonRect = button.getBoundingClientRect();
        expect(buttonRect.width).toBeCloseTo((rect.width - (buttons.length - 1) * 8) / buttons.length, 1);
        expect(buttonRect.height).toBe(width >= 1024 ? 56 : 48);
        expect(buttonRect.top).toBe(rect.top);
        expect(buttonRect.right).toBeLessThanOrEqual(rect.right + 0.1);
        expect(button).toHaveAccessibleName("保存此订单的所有配送设置 / Save all delivery settings");
        if (index > 0) expect(buttonRect.left - buttons[index - 1].getBoundingClientRect().right).toBeCloseTo(8, 1);
      });
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(width);
  } finally {
    root.unmount();
    container.remove();
    await page.viewport(originalViewport.width, originalViewport.height);
  }
});

test("content-width groups wrap without changing Button height or touch targets", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    flushSync(() => root.render(<div style={{ width: 180 }}>
      <ButtonGroup aria-label="设置操作">
        <Button>保存设置</Button><Button>另存为草稿</Button><Button>取消</Button>
      </ButtonGroup>
    </div>));
    const group = container.querySelector('[role="group"]')!;
    expect(group).toHaveAccessibleName("设置操作");
    expect(group).not.toHaveAttribute("tabindex");
    const buttons = [...group.querySelectorAll("button")];
    expect(buttons[1].getBoundingClientRect().top).toBeGreaterThan(buttons[0].getBoundingClientRect().bottom);
    for (const button of buttons) {
      expect(button.getBoundingClientRect().height).toBe(40);
      expect(parseFloat(getComputedStyle(button, "::before").height)).toBeGreaterThanOrEqual(44);
      expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(group.getBoundingClientRect().right);
    }
  } finally {
    root.unmount();
    container.remove();
  }
});
