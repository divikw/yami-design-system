import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const [, , baseUrl = "http://127.0.0.1:6006", docsId] = process.argv;
const output = new URL("../.storybook/docs-loading-heights.json", import.meta.url);
const { entries } = await fetch(new URL("/index.json", baseUrl)).then((response) => response.json());
const jobs = Object.values(entries)
  .filter(({ type, name, title, id }) => type === "docs" && name === "docs" && (docsId
    ? id === docsId
    : title.startsWith("YAMI/components/") || title.startsWith("YAMI/modules/product display/") ||
      id === "yami-components-commerce-coupon--docs"))
  .flatMap(({ id }) => ["zh", "en"].map((locale) => ({ id, locale })));
if (docsId && jobs.length === 0) throw new Error(`No Docs entry found for ${docsId}`);

const firstWidth = 320;
const lastWidth = 600;
const checkpoints = [...new Set([
  ...Array.from({ length: (lastWidth - firstWidth) / 8 + 1 }, (_, i) => firstWidth + i * 8),
  360, 375, 390, 402, 414, 430, 480,
])].sort((a, b) => a - b);
const defaultSize = "1,2,252";

const browser = await chromium.launch();
const profiles = new Map(docsId ? Object.entries(JSON.parse(await readFile(output, "utf8"))) : []);
if (docsId) profiles.delete(docsId);

async function measure({ id, locale }) {
  const page = await browser.newPage({ viewport: { width: firstWidth, height: 900 }, reducedMotion: "reduce" });
  try {
    const url = new URL("/iframe.html", baseUrl);
    url.search = new URLSearchParams({ id, viewMode: "docs", globals: `locale:${locale}` });
    await page.goto(url.href, { waitUntil: "commit" });
    const lead = page.locator('[data-component-docs] [data-example="lead"]');
    await lead.waitFor({ timeout: 20000 });
    const previewFrame = lead.locator("iframe");
    if (await previewFrame.count()) {
      await previewFrame.contentFrame().locator("body > div").first().waitFor({ timeout: 10000 });
    }
    await page.evaluate(async () => {
      // Measure natural layout, even when the last profile is already installed.
      document.documentElement.removeAttribute("data-yami-docs-id");
      await document.fonts.ready;
      const preview = document.querySelector('[data-example="lead"] iframe');
      await preview?.contentDocument?.fonts.ready;
    });

    const sizes = new Map();
    async function sample(width) {
      await page.setViewportSize({ width, height: 900 });
      const size = await lead.evaluate(async (card) => {
        const header = card.closest("[data-component-docs]").querySelector("header");
        const title = header.querySelector("h1");
        const intro = header.querySelector("p");
        const lineCount = (element) => Math.round(element.offsetHeight / parseFloat(getComputedStyle(element).lineHeight));
        const measureSize = () => [lineCount(title), lineCount(intro), Math.round(card.firstElementChild.getBoundingClientRect().height)];
        let previous = "";
        for (let stable = 0, frame = 0; stable < 2 && frame < 12; frame++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          const current = measureSize().join(",");
          stable = current === previous ? stable + 1 : 0;
          previous = current;
        }
        return measureSize();
      });
      sizes.set(width, size);
    }

    // Locate the exact width of each change between nearby measurements.
    async function narrowChange(lower, upper) {
      if (upper - lower <= 1 || sizes.get(lower).join() === sizes.get(upper).join()) return;
      const middle = Math.floor((lower + upper) / 2);
      await sample(middle);
      await narrowChange(lower, middle);
      await narrowChange(middle, upper);
    }

    for (const width of checkpoints) await sample(width);
    for (const [index, width] of checkpoints.slice(1).entries()) {
      await narrowChange(checkpoints[index], width);
    }

    let previous = "";
    return [...sizes].sort(([a], [b]) => a - b).flatMap(([width, size]) => {
      const current = size.join();
      if (current === previous) return [];
      previous = current;
      return [[width, ...size]];
    });
  } finally {
    await page.close();
  }
}

try {
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (jobs.length) {
      const { id, locale } = jobs.shift();
      const rows = await measure({ id, locale });
      if (rows.length !== 1 || rows[0].slice(1).join() !== defaultSize) {
        const profile = profiles.get(id) ?? {};
        profile[locale] = rows;
        profiles.set(id, profile);
      }
    }
  }));
  const sorted = [...profiles].sort(([a], [b]) => a.localeCompare(b));
  const lines = sorted.map(([id, locales]) => {
    const values = Object.entries(locales).sort(([a], [b]) => a.localeCompare(b));
    return `  "${id}": {\n${values.map(([locale, rows]) =>
      `    "${locale}": ${JSON.stringify(rows)}`).join(",\n")}\n  }`;
  });
  await writeFile(output, `{\n${lines.join(",\n")}\n}\n`);
  console.log(`Measured responsive Docs layouts from ${firstWidth} to ${lastWidth}px for ${docsId ?? `${profiles.size} components`}.`);
} finally {
  await browser.close();
}
