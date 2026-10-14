/// <reference types="node" />
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandHref, calculateSavings, campaignProducts, createAppDownloadBanners, featuredProducts, productHref } from "./fixtures";
import socialTrends from "./social-trends.json";
import storyBanners from "./story-banners.json";
import bannerManifest from "./assets/story-banners/manifest.json";

describe("app-download campaign calculation", () => {
  it("includes the hidden 10% perk with the $10 welcome discount", () => {
    expect(calculateSavings("welcome", 30)).toMatchObject({ discount: 13, shipping: 5.99, total: 22.99 });
    expect(calculateSavings("welcome", 12)).toMatchObject({ discount: 11.2, total: 6.79 });
  });
  it("uses the discounted subtotal for the $49 free-shipping threshold", () => {
    expect(calculateSavings("welcome", 65)).toMatchObject({ freeShipping: false, total: 54.49 });
    expect(calculateSavings("welcome", 66)).toMatchObject({ freeShipping: true, total: 49.4 });
    expect(calculateSavings("welcome", 100).total).toBe(80);
  });
  it("charges nothing with no selected items and sums actual app prices", () => {
    expect(calculateSavings("app", 0)).toMatchObject({ subtotal: 0, shipping: 0, total: 0 });
    expect(calculateSavings("app", 0, [featuredProducts[0]])).toMatchObject({ subtotal: 738.58, discount: 73.86, total: 664.72, saved: 79.85 });
    const bottle = featuredProducts.find((p) => p.sku === "1029335121")!;
    const containers = featuredProducts.find((p) => p.sku === "1029225801")!;
    expect(calculateSavings("app", 0, [bottle])).toMatchObject({ shipping: 5.99, total: 50.08 });
    expect(calculateSavings("app", 0, [bottle, containers])).toMatchObject({ shipping: 0, total: 80.08 });
  });
  it("preserves the complete captured catalog and unique featured products", () => {
    expect(campaignProducts).toHaveLength(75);
    expect(new Set(campaignProducts.map((p) => p.sku)).size).toBe(75);
    expect(featuredProducts).toHaveLength(12);
  });
  it("links every product brand to its localized brand page", () => {
    for (const locale of ["ko", "en"] as const) {
      for (const product of campaignProducts) {
        expect(brandHref(product, locale)).toMatch(`https://www.yami.com/us/${locale}/b/`);
        expect(brandHref(product, locale)).not.toBe(productHref(product, locale));
      }
    }
  });
  it("bundles every story banner image so slow CDN requests cannot hold up video playback", () => {
    const banners = createAppDownloadBanners();
    const images = banners.flatMap((banner) => [banner.image!.src, ...banner.products.map((product) => product.src)]);
    expect(images).toHaveLength(32);
    const sourceImages = storyBanners.items.flatMap((item) => [item.image.src, ...item.products.map((product) => product.src)]);
    expect(bannerManifest.map(({ url }) => url)).toEqual(sourceImages);
    for (const [index, source] of images.entries()) {
      const url = new URL(typeof source === "string" ? source : source.src);
      expect(url.protocol).toBe("file:");
      expect(url.pathname).toContain("/AppDownloadPageV2/assets/story-banners/");
      expect(decodeURIComponent(url.pathname.split("/").pop()!)).toBe(bannerManifest[index].file);
      const bytes = readFileSync(url);
      expect(bytes.byteLength).toBe(bannerManifest[index].bytes);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(bannerManifest[index].sha256);
    }
  });
});

describe("app-download social source identities", () => {
  it("keeps the verified platform and account paired with each source video", () => {
    expect(socialTrends.cards).toHaveLength(9);
    expect(socialTrends.cards.slice(0, 6).map(({ id, username, platformIcon }) => [id, username, platformIcon])).toEqual([
      ["117", "@yamibuy", "instagram.png"],
      ["1271", "@yamibuy", "instagram.png"],
      ["1283", "@yamibuy", "instagram.png"],
      ["1318", "@winterabbyy", "instagram.png"],
      ["672", "@yamibuy", "instagram.png"],
      ["1521", "@yami.official", "tiktok.png"],
    ]);
    for (const card of socialTrends.cards) {
      const sourceId = card.id.replace("-repeat", "");
      expect(card.video).toBe(`scraper_${sourceId}_480.mp4`);
      expect(card.sourcePoster).toContain(`/scraper_${sourceId}.0000000.jpg`);
    }
    for (const [index, card] of socialTrends.cards.slice(6).entries()) {
      expect(card).toEqual({ ...socialTrends.cards[index], id: `${socialTrends.cards[index].id}-repeat` });
    }
  });

  it("preserves the official lash post caption without inventing product associations", () => {
    const lashPost = socialTrends.cards.find(({ id }) => id === "1521")!;
    expect(lashPost.products).toEqual([]);
    expect(lashPost.caption).toContain("The easiest lash routine yet");
  });
});
