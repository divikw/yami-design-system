import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { Button } from "../../../packages/design-system/components/Button/Button";
import { Input } from "../../../packages/design-system/components/Input/Input";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/styles/base.css";

test("Korean system typography follows nested language boundaries and existing component tokens", async () => {
  const viewport = { width: innerWidth, height: innerHeight };
  const documentLocale = document.documentElement.lang;
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    for (const width of [375, 1024]) {
      await page.viewport(width, 844);
      for (const hostLocale of ["en", "zh", "ko"]) {
        document.documentElement.lang = hostLocale;
        flushSync(() => root.render(
          <section lang={hostLocale}>
            <div lang="ko-KR" data-scope="ko">
              <h2>내 혜택 미리 계산해보기</h2>
              <p data-body>주문 금액 $30.00</p>
              <Button variant="secondary" size="md" htmlType="button">혜택 확인</Button>
              <Input label="주문 금액" defaultValue="30.00" />
              <strong lang="en-US" data-scope="en">Welcome $30.00</strong>
              <div lang="zh-CN" data-scope="zh">
                <h3>首单优惠 $30.00</h3>
                <p lang="ko" data-scope="nested-ko"><strong>웰컴 혜택 $30.00</strong></p>
              </div>
              <p lang="ko" data-serif style={{ fontFamily: "var(--font-family-serif)", fontWeight: "var(--font-weight-semibold)" }}>Serif 600</p>
            </div>
          </section>,
        ));
        for (const selector of ['[data-scope="ko"]', "h2", "[data-body]", "button", "input", '[data-scope="nested-ko"] strong']) {
          const element = container.querySelector<HTMLElement>(selector)!;
          const style = getComputedStyle(element);
          expect(style.fontFamily.startsWith('"GT Walsheim"')).toBe(true);
          expect(style.fontFamily).toContain("Apple SD Gothic Neo");
          expect(style.fontFamily).toContain("Malgun Gothic");
          expect(style.fontFamily).not.toContain("PingFang SC");
          for (const token of ["ios", "android", "win"]) {
            expect(style.getPropertyValue(`--font-family-${token}`)).toContain("Apple SD Gothic Neo");
          }
        }
        expect(getComputedStyle(container.querySelector("h2")!).fontWeight).toBe("600");
        expect(getComputedStyle(container.querySelector("button")!).fontWeight).toBe("600");
        expect(getComputedStyle(container.querySelector("[data-body]")!).fontWeight).toBe("400");
        for (const [scope, weight] of [["en", "500"], ["zh", "600"]]) {
          const element = container.querySelector<HTMLElement>(`[data-scope="${scope}"]`)!;
          expect(getComputedStyle(element).fontFamily).toContain("PingFang SC");
          expect(getComputedStyle(element).fontFamily).not.toContain("Apple SD Gothic Neo");
          expect(getComputedStyle(scope === "zh" ? element.querySelector("h3")! : element).fontWeight).toBe(weight);
        }
        expect(getComputedStyle(container.querySelector("[data-serif]")!).fontFamily).toContain("Source Serif 4 Variable");
        expect(getComputedStyle(container.querySelector("[data-serif]")!).fontWeight).toBe("600");
      }
    }
    expect([...document.fonts].some((font) => /Apple SD Gothic Neo|Malgun Gothic|Noto Sans (?:CJK )?KR/.test(font.family))).toBe(false);
  } finally {
    flushSync(() => root.unmount());
    container.remove();
    document.documentElement.lang = documentLocale;
    await page.viewport(viewport.width, viewport.height);
  }
});
