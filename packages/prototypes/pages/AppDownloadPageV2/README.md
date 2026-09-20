# App Download Page V2

> **Draft · 草稿**：当前页面及全部预览内容尚未定稿或完成 review。

Starts from V1 with the same content, styles, and behavior. Component, CSS, fixtures, and reference data are owned by this version so they can evolve independently. Images, video, and store badges reuse `../AppDownloadPage/assets/`.

Visible stories: PC and Mobile under `YAMI/Pages/App Download/V2`, both initially in Korean with an in-page language switch. Interactions, SectionNavigation, and ContentWidth remain test-only stories, hidden from browsing.

Preview: http://localhost:6006/?path=/story/yami-pages-app-download-v2--pc

A centered SectionBanner appears immediately before Why Yami, after the savings calculator. Its eight cards use the source order, artwork, titles, descriptions, product thumbnails, and story destinations captured from https://yami-app-download.vercel.app/#story-carousel in `story-banners.json`. The source keeps card copy and story destinations in English in both locales; the module title and description use the requested English source copy in both locales. Product destinations are retained in the snapshot for reference; the existing SectionBanner interaction remains one story link per card. Component UI, sizing, navigation, and contentMaxWidth are unchanged.

Validation: `pnpm validate`; `pnpm --filter @yami/storybook exec vitest run --project storybook AppDownloadPage`.

V2 adds Social Trends after the calculator, using SocialMediaGallery with a centered heading and the same poster cards as EcommerceHome. The six videos, seven product images, product links, and Korean/English headings come from https://yami-app-download.vercel.app/#sns-trend (captured 2026-09-15). Media and extracted poster frames are bundled in `assets/social/`; source content is recorded in `social-trends.json`. Videos autoplay muted and loop inline in the same card layout. Clicking a video opens its bundled file. The source does not identify creator accounts, so these cards omit the creator overlay.

Customer Reviews follows Social Trends and uses all nine reviews from the reference page, recorded in `customer-reviews.json`. English and Korean section headings follow the source language switch; the review text stays in its original language (two Korean, seven English). No product association is supplied by the reference, so these cards omit product footers.

Why Yami appears between the calculator and Social Trends, with a centered heading, the reference brand video, 35 brand logos in a horizontal rail, and seven service strengths. Both lists loop automatically in a single row at 32 CSS pixels per second, without navigation buttons. Hover or keyboard focus pauses the row; reduced motion leaves a manually scrollable single copy. `brand-special.json` records the source English/Korean copy; `assets/brand-special/` bundles its original media. The video plays muted when visible, pauses offscreen, and offers native controls. Reduced-motion preferences disable automatic playback. The reference's English `50만+` value is preserved.

Each section accepts the homepage divider contract through `sectionDividers`: `dividerPosition` is `top`, `bottom`, or `none`; `dividerVariant` is `gray` (1px) or `black` (2px). Keys are `hero`, `welcome-coupon`, `discount-products`, `coupon-guide`, `savings-calculator`, `brand-special`, `sns-trend`, `reviews`, and `bottom-cta-section`. Unspecified settings preserve current defaults. The bottom download section defaults to a top gray divider. Shared components retain their mobile surface behavior (inset cards omit dividers).

```tsx
<AppDownloadPageV2 sectionDividers={{
  "brand-special": { dividerPosition: "bottom", dividerVariant: "gray" },
  "sns-trend": { dividerPosition: "top", dividerVariant: "black" },
  reviews: { dividerPosition: "none" },
}} />
```

V2 section padding is 64px above and below on desktop (1024px and wider) and 32px on mobile, including Why Yami, Social Trends, and Customer Reviews. Horizontal insets retain their responsive values.

The six module title/description groups (products, coupon guide, calculator, Why Yami, social videos, reviews) share SectionHeading with `align="center"`: desktop title 24px, mobile title 20px, description 14px, a 4px title/description gap, and 16px bottom padding on the heading copy area.

Store download links use the shared StoreDownloadButtons component: catalog Apple/Google Play icons plus HTML text, with the original store destinations.

Social Trends uses all six videos and seven linked products from the reference page in source order, then repeats the first three videos with their associated products to provide the requested nine-card preview. Six is the desktop visible count at 1440px, not a data limit: additional cards remain in the horizontal rail. Desktop controls page through the rail; mobile uses native horizontal scrolling without buttons. Hidden overflow stories repeat two source cards only for eight-video pagination and playback tests.
