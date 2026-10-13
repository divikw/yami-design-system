import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { composeStory } from "@storybook/react-vite";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import "@yami/design-system/tokens.css";
import * as ButtonStories from "../../../packages/design-system/components/Button/Button.stories";
import * as InputStories from "../../../packages/design-system/components/Input/Input.stories";
import * as CheckboxStories from "../../../packages/design-system/components/Checkbox/Checkbox.stories";
import * as RadioGroupStories from "../../../packages/design-system/components/RadioGroup/RadioGroup.stories";
import * as CardStories from "../../../packages/design-system/components/Card/Card.stories";
import * as FilterChipStories from "../../../packages/design-system/components/FilterChip/FilterChip.stories";
import * as ProductCardStories from "../../../packages/design-system/components/ProductCard/ProductCard.stories";
import * as ProductMediaGalleryStories from "../../../packages/design-system/components/ProductMediaGallery/ProductMediaGallery.stories";
import * as ShortcutRailStories from "../../../packages/design-system/components/ShortcutRail/ShortcutRail.stories";
import * as HeaderStories from "../../../packages/design-system/components/Header/Header.stories";
import * as FooterStories from "../../../packages/design-system/components/Footer/Footer.stories";
import * as SocialMediaGalleryStories from "../../../packages/design-system/components/SocialMediaGallery/SocialMediaGallery.stories";
import * as ProductListStories from "../../../packages/design-system/components/ProductList/ProductList.stories";
import * as BrandProductRailStories from "../../../packages/design-system/components/BrandProductRail/BrandProductRail.stories";
import * as ThemeProductListStories from "../../../packages/design-system/components/ThemeProductList/ThemeProductList.stories";
import * as HeroBannerStories from "../../../packages/design-system/components/HeroBanner/HeroBanner.stories";
import * as BillboardStories from "../../../packages/design-system/components/Billboard/Billboard.stories";
import * as ReviewListStories from "../../../packages/design-system/components/ReviewList/ReviewList.stories";
import * as ProductReviewSectionStories from "../../../packages/design-system/components/ProductReviewSection/ProductReviewSection.stories";
import * as TrendingSearchesStories from "../../../packages/design-system/components/TrendingSearches/TrendingSearches.stories";
import * as ThemeHeroStories from "../../../packages/design-system/components/ThemeHero/ThemeHero.stories";

import * as ButtonGroupStories from "../../../packages/design-system/components/ButtonGroup/ButtonGroup.stories";
import * as HorizontalScrollListStories from "../../../packages/design-system/components/HorizontalScrollList/HorizontalScrollList.stories";
import * as ActivityPageHeaderStories from "../../../packages/design-system/components/ActivityPageHeader/ActivityPageHeader.stories";
import * as SectionBannerStories from "../../../packages/design-system/components/SectionBanner/SectionBanner.stories";
import * as DialogStories from "../../../packages/design-system/components/Dialog/Dialog.stories";
import * as SheetStories from "../../../packages/design-system/components/Sheet/Sheet.stories";

const fixtures = [
  { name: "ButtonGroup", Story: composeStory(ButtonGroupStories.Showcase, ButtonGroupStories.default) },
  { name: "HorizontalScrollList", Story: composeStory(HorizontalScrollListStories.Showcase, HorizontalScrollListStories.default) },
  { name: "ActivityPageHeader", Story: composeStory(ActivityPageHeaderStories.Showcase, ActivityPageHeaderStories.default) },
  { name: "SectionBanner", Story: composeStory(SectionBannerStories.Showcase, SectionBannerStories.default) },
  { name: "Dialog", Story: composeStory(DialogStories.Showcase, { ...DialogStories.default, args: { ...DialogStories.default.args, open: true } }) },
  { name: "Sheet", Story: composeStory(SheetStories.ChildView, { ...SheetStories.default, args: { ...SheetStories.default.args, open: true } }) },
  { name: "Button", Story: composeStory(ButtonStories.Showcase, ButtonStories.default) },
  { name: "Input", Story: composeStory(InputStories.Showcase, InputStories.default) },
  { name: "Checkbox", Story: composeStory(CheckboxStories.Showcase, CheckboxStories.default) },
  { name: "RadioGroup", Story: composeStory(RadioGroupStories.Showcase, RadioGroupStories.default) },
  { name: "Card", Story: composeStory(CardStories.InteractionStates, CardStories.default) },
  { name: "FilterChip", Story: composeStory(FilterChipStories.Showcase, FilterChipStories.default) },
  { name: "ProductCard", Story: composeStory(ProductCardStories.Showcase, ProductCardStories.default) },
  { name: "ProductMediaGallery", Story: composeStory(ProductMediaGalleryStories.Showcase, ProductMediaGalleryStories.default) },
  { name: "ShortcutRail", Story: composeStory(ShortcutRailStories.Showcase, ShortcutRailStories.default) },
  { name: "Header", Story: composeStory(HeaderStories.Showcase, HeaderStories.default) },
  { name: "Footer", Story: composeStory(FooterStories.Showcase, FooterStories.default) },
  { name: "SocialMediaGallery", Story: composeStory(SocialMediaGalleryStories.Showcase, SocialMediaGalleryStories.default) },
  { name: "ProductList", Story: composeStory(ProductListStories.Showcase, ProductListStories.default) },
  { name: "BrandProductRail", Story: composeStory(BrandProductRailStories.Showcase, BrandProductRailStories.default) },
  { name: "ThemeProductList", Story: composeStory(ThemeProductListStories.Showcase, ThemeProductListStories.default) },
  { name: "HeroBanner", Story: composeStory(HeroBannerStories.Showcase, HeroBannerStories.default) },
  { name: "Billboard", Story: composeStory(BillboardStories.Showcase, BillboardStories.default) },
  { name: "ReviewList", Story: composeStory(ReviewListStories.Showcase, ReviewListStories.default) },
  { name: "ProductReviewSection", Story: composeStory(ProductReviewSectionStories.Showcase, ProductReviewSectionStories.default) },
  { name: "TrendingSearches", Story: composeStory(TrendingSearchesStories.Showcase, TrendingSearchesStories.default) },
  { name: "ThemeHero", Story: composeStory(ThemeHeroStories.PC, ThemeHeroStories.default) },
];

for (const theme of ["light", "dark"]) {
  for (const width of [375, 1280]) {
    for (const fixture of fixtures) {
      if (fixture.name === "Footer" && width < 1024) continue; // Footer is desktop-only.
      test(`${theme} ${fixture.name} keyboard outline geometry at ${width}px`, async () => {
        const viewport = { width: innerWidth, height: innerHeight };
        const container = document.createElement("div");
        container.className = theme === "dark" ? "dark" : "";
        container.style.width = "100%";
        container.style.padding = "16px";
        container.style.boxSizing = "border-box";
        document.body.append(container);
        const root = createRoot(container);
        try {
          await page.viewport(width, 900);
          flushSync(() => root.render(<fixture.Story />));
          await document.fonts.ready;
          await userEvent.keyboard("{Tab}");
          const groups = new Map<string, HTMLElement[]>();
          for (const el of container.querySelectorAll<HTMLElement>('a[href],button,input,[tabindex="0"],[role="checkbox"],[role="radio"]')) {
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height || el.matches(':disabled,[aria-disabled="true"],[aria-hidden="true"]')) continue;
            const key = el.dataset.slot ?? el.className ?? el.tagName;
            const group = groups.get(key) ?? [];
            group.push(el);
            groups.set(key, group);
          }
          expect(groups.size).toBeGreaterThan(0);
          const failures: string[] = [];
          for (const [key, group] of groups) {
            for (const target of new Set([group[0]!, group.at(-1)!])) {
              for (let parent = target.parentElement; parent; parent = parent.parentElement) parent.style.scrollBehavior = "auto";
              target.focus();
              await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
              if (document.activeElement !== target) continue;
              let indicator = target;
              let style = getComputedStyle(indicator);
              let usesPseudo = false;
              while ((style.outlineStyle === "none" || Number.parseFloat(style.outlineWidth) === 0) && indicator.parentElement && indicator !== container) {
                const pseudo = getComputedStyle(indicator, "::before");
                if (pseudo.outlineStyle !== "none" && Number.parseFloat(pseudo.outlineWidth) > 0) {
                  style = pseudo;
                  usesPseudo = true;
                  break;
                }
                indicator = indicator.parentElement;
                style = getComputedStyle(indicator);
              }
              if (style.outlineStyle === "none" || Number.parseFloat(style.outlineWidth) === 0) continue;
              const bounds = indicator.getBoundingClientRect();
              const rect = {
                left: bounds.left + (usesPseudo ? Number.parseFloat(style.left) || 0 : 0),
                right: bounds.right - (usesPseudo ? Number.parseFloat(style.right) || 0 : 0),
                top: bounds.top + (usesPseudo ? Number.parseFloat(style.top) || 0 : 0),
                bottom: bounds.bottom - (usesPseudo ? Number.parseFloat(style.bottom) || 0 : 0),
              };
              const expansion = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
              for (let ancestor = indicator.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
                const clipStyle = getComputedStyle(ancestor);
                const box = ancestor.getBoundingClientRect();
                const left = box.left + ancestor.clientLeft;
                const top = box.top + ancestor.clientTop;
                const right = left + ancestor.clientWidth;
                const bottom = top + ancestor.clientHeight;
                if (rect.left < left - 1 || rect.right > right + 1 || rect.top < top - 1 || rect.bottom > bottom + 1) continue;
                const clipped = [];
                if (clipStyle.overflowX !== "visible") {
                  if (rect.left - expansion < left - 1) clipped.push("left");
                  if (rect.right + expansion > right + 1) clipped.push("right");
                }
                if (clipStyle.overflowY !== "visible") {
                  if (rect.top - expansion < top - 1) clipped.push("top");
                  if (rect.bottom + expansion > bottom + 1) clipped.push("bottom");
                }
                if (clipStyle.overflowX !== "visible" || clipStyle.overflowY !== "visible") {
                  for (const [corner, x, y, cornerX, cornerY] of [
                    ["TopLeft", rect.left, rect.top, left, top],
                    ["TopRight", rect.right, rect.top, right, top],
                    ["BottomLeft", rect.left, rect.bottom, left, bottom],
                    ["BottomRight", rect.right, rect.bottom, right, bottom],
                  ] as const) {
                    const property = `border${corner}Radius` as "borderTopLeftRadius";
                    if (Math.abs(x - cornerX) <= 1 && Math.abs(y - cornerY) <= 1 &&
                        Number.parseFloat(style[property]) < Number.parseFloat(clipStyle[property]) - 1) clipped.push(`${corner} corner`);
                  }
                }
                if (clipped.length) failures.push(`${key} (${target.textContent?.trim().slice(0, 24)}) clipped ${clipped.join("/")} by ${ancestor.dataset.slot ?? ancestor.className}`);
              }
            }
          }
          expect([...new Set(failures)]).toEqual([]);
        } finally {
          root.unmount();
          container.remove();
          await page.viewport(viewport.width, viewport.height);
        }
      }, 15000);
    }
  }
}
