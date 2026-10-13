import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, Input, FilterChip, Tabs, TabsList, TabsTrigger } from "@yami/design-system";
import "@yami/design-system/tokens.css";
import emailStyles from "../../../packages/prototypes/pages/EmailTemplates/EmailAppDownload.module.css";
import downloadStyles from "../../../packages/prototypes/pages/AppDownloadPageV2/AppDownloadPageV2.module.css";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  root.unmount();
  container.remove();
});

function luminance(color: string) {
  const [r, g, b] = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((c) => {
    const channel = c / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r! * 0.2126 + g! * 0.7152 + b! * 0.0722;
}

for (const dark of [false, true]) {
  for (const inverse of [false, true]) {
    test(`${dark ? "dark" : "light"} / ${inverse ? "inverse" : "default"} keyboard rings contrast with their background`, async () => {
      container.className = dark ? "dark" : "";
      container.style.backgroundColor = inverse ? "var(--surface-inverse)" : "var(--surface-primary)";
      container.style.padding = "16px";
      const expected = dark !== inverse ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)";
      flushSync(() => root.render(<>
        <Button inverse={inverse}>Continue</Button>
        {(["a", "b", "secondary", "tertiary"] as const).map((variant) => <Tabs key={variant} defaultValue="one">
          <TabsList inverse={inverse} variant={variant === "a" || variant === "b" ? "primary" : variant} styleVariant={variant === "b" ? "b" : "a"} aria-label={variant}>
            <TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
        </Tabs>)}
      </>));
      const targets = container.querySelectorAll<HTMLElement>('button[tabindex="0"], button:not([role="tab"])');
      for (const target of targets) {
        await userEvent.tab();
        expect(target).toHaveFocus();
        const segmented = target.closest('[data-variant="primary"][data-style="b"]');
        const style = getComputedStyle(target, segmented ? "::before" : null);
        expect(style.outlineColor).toBe(expected);
        expect(style.outlineWidth).toBe("2px");
        const list = target.closest<HTMLElement>('[role="tablist"]');
        if (list) {
          const bounds = target.getBoundingClientRect();
          const clip = list.getBoundingClientRect();
          const expansion = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
          const topInset = segmented ? Number.parseFloat(style.top) : 0;
          const bottomInset = segmented ? Number.parseFloat(style.bottom) : 0;
          expect(bounds.top + topInset - expansion).toBeGreaterThanOrEqual(clip.top);
          expect(bounds.bottom - bottomInset + expansion).toBeLessThanOrEqual(clip.bottom);
          expect(bounds.left - expansion).toBeGreaterThanOrEqual(clip.left);
          expect(bounds.right + expansion).toBeLessThanOrEqual(clip.right);
        }
        const colors = [luminance(style.outlineColor), luminance(getComputedStyle(container).backgroundColor)].sort((a, b) => a - b);
        expect((colors[1]! + 0.05) / (colors[0]! + 0.05)).toBeGreaterThanOrEqual(3);
      }
    });
  }

  test(`${dark ? "dark" : "light"} state borders and selected strokes remain neutral beside blue focus rings`, async () => {
    container.className = dark ? "dark" : "";
    container.style.padding = "16px";
    flushSync(() => root.render(<><FilterChip selected>Selected</FilterChip><Input label="Email" defaultValue="hello" state="focused" /></>));
    // Keep the independent selected-hover stroke out of this keyboard-only comparison.
    await page.elementLocator(container).hover({ position: { x: 1, y: 1 } });
    const chip = container.querySelector<HTMLElement>('[data-slot="filter-chip"]')!;
    const input = container.querySelector<HTMLInputElement>("input")!;
    const field = input.closest('[data-slot="input"]')!.querySelector<HTMLElement>('div[class*="field"]')!;
    const initialChipStroke = getComputedStyle(chip).boxShadow;
    const initialInputBorder = getComputedStyle(field).boxShadow;
    await userEvent.tab();
    expect(chip).toHaveFocus();
    expect(getComputedStyle(chip).outlineColor).toBe(dark ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
    expect(getComputedStyle(chip).boxShadow).toBe(initialChipStroke);
    await userEvent.tab();
    expect(input).toHaveFocus();
    expect(getComputedStyle(field).outlineColor).toBe(dark ? "rgb(102, 161, 255)" : "rgb(0, 102, 235)");
    expect(getComputedStyle(field).boxShadow).toBe(initialInputBorder);
    expect(initialInputBorder).toContain(dark ? "rgb(255, 255, 255)" : "rgba(0, 0, 0, 0.87)");
  });
}

for (const dark of [false, true]) {
  test(`${dark ? "dark" : "light"} fixed promotional backgrounds retain contrasting blue focus`, async () => {
    container.className = dark ? "dark" : "";
    flushSync(() => root.render(<>
      <div className={emailStyles.root}><a href="#download" className={emailStyles.appButton}>Download</a></div>
      <div className={downloadStyles.root}><div className={downloadStyles.coupon}><div className={downloadStyles.couponCode}><button>Copy</button></div></div></div>
    </>));
    const link = container.querySelector("a")!;
    await userEvent.tab();
    expect(link).toHaveFocus();
    expect(getComputedStyle(link).outlineColor).toBe("rgb(102, 161, 255)");
    expect(getComputedStyle(link).outlineOffset).toBe("-2px");
    const colors = [luminance(getComputedStyle(link).outlineColor), luminance(getComputedStyle(link).backgroundColor)].sort((a, b) => a - b);
    expect((colors[1]! + 0.05) / (colors[0]! + 0.05)).toBeGreaterThanOrEqual(3);
    const copy = container.querySelector("button")!;
    await userEvent.tab();
    expect(copy).toHaveFocus();
    expect(getComputedStyle(copy).outlineColor).toBe("rgb(0, 102, 235)");
    expect(getComputedStyle(copy).boxShadow).toBe("rgb(255, 255, 255) 0px 0px 0px 2px");
  });
}
