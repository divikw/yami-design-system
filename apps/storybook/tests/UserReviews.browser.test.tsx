import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { expect, test } from "vitest";
import { UserReviews, type UserReviewsProps } from "@yami/design-system/components/UserReviews";
import { userReviewsExamples } from "@yami/design-system/components/UserReviews/fixtures";
import "@yami/design-system/tokens.css";

test("applies the mobile download and PC review layouts at their container breakpoints", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    flushSync(() => root.render(<UserReviews {...userReviewsExamples.zh} />));
    const section = container.querySelector('[data-slot="user-reviews"]')!;
    const panel = section.querySelector('[data-slot="user-reviews-container"]')!.firstElementChild!;
    const download = panel.firstElementChild!;
    const title = download.querySelector("h2")!;
    const benefits = download.querySelector("header p")!;
    const downloadOptions = download.lastElementChild!;
    const qr = downloadOptions.querySelector('[aria-label="下载亚米 App"]')!;
    const qrImage = qr.querySelector("img")!;
    const appStore = downloadOptions.querySelector(`a[href="${userReviewsExamples.zh.download.appStore.href}"]`)!;
    const caption = downloadOptions.querySelector("p")!;
    const stores = appStore.parentElement!;
    const downloadCopy = [benefits, caption];
    const storeLinks = Array.from(stores.querySelectorAll("a"));
    const storeDetails = stores.parentElement!;
    const reviews = section.querySelector('[aria-label="用户评价"]')!;
    const reviewCards = Array.from(reviews.querySelectorAll('[data-slot="card"]'));
    const [reviewCard, nextReviewCard] = reviewCards;

    expect(storeDetails.parentElement).toBe(downloadOptions);
    expect(caption.parentElement).toBe(storeDetails);

    for (const width of [343, 459, 639]) {
      container.style.width = `${width}px`;
      const column = download.getBoundingClientRect();
      const center = column.left + column.width / 2;
      for (const element of [title, benefits, qr, caption]) {
        const bounds = element.getBoundingClientRect();
        expect(bounds.left + bounds.width / 2).toBeCloseTo(center, 0);
      }
      const [firstStore, secondStore] = storeLinks.map((link) => link.getBoundingClientRect());
      expect((firstStore.left + secondStore.right) / 2).toBeCloseTo(center, 0);
      expect(getComputedStyle(caption).textAlign).toBe("center");
      expect(getComputedStyle(title).fontSize).toBe("20px");
      expect(getComputedStyle(title).lineHeight).toBe("28px");
      expect(reviews.getClientRects()).toHaveLength(0);
      expect(getComputedStyle(panel).padding).toBe("16px");
      expect(getComputedStyle(download).padding).toBe("8px 0px");
      expect(qr.getBoundingClientRect().top - title.closest("header")!.getBoundingClientRect().bottom).toBeCloseTo(16);
      expect(new Set([...downloadCopy, ...storeLinks].map((element) => getComputedStyle(element).fontSize))).toEqual(new Set(["14px"]));
      expect(getComputedStyle(qr).borderRadius).toBe("8px");
      expect(getComputedStyle(qr).padding).toBe("8px");
      expect(qrImage.getBoundingClientRect().width).toBe(80);
      expect(qrImage.getBoundingClientRect().height).toBe(80);
      expect(qr.getBoundingClientRect().bottom).toBeLessThan(appStore.getBoundingClientRect().top);
      expect(caption.getBoundingClientRect().top - stores.getBoundingClientRect().bottom).toBeCloseTo(8);
      expect(storeDetails.getBoundingClientRect().width).toBeCloseTo(download.getBoundingClientRect().width);
      const links = Array.from(section.querySelectorAll("a")).filter((link) => link.getClientRects().length > 0);
      expect(links).toHaveLength(3);
    }

    for (const [width, columns] of [[640, 1], [900, 1], [927, 1], [928, 2], [1183, 2], [1184, 3]] as const) {
      container.style.width = `${width}px`;
      const columnBounds = Array.from(reviews.querySelectorAll("ul"), (list) => list.getBoundingClientRect());
      const columnPositions = new Set(columnBounds.map((bounds) => bounds.left));
      expect(columnPositions.size).toBe(columns);
      expect(getComputedStyle(reviews).overflow).toBe("clip");
      reviews.scrollTop = 32;
      expect(reviews.scrollTop).toBe(0);
      for (let index = 1; index < columns; index++) {
        expect(columnBounds[index].left - columnBounds[index - 1].right).toBeCloseTo(16);
      }
      expect(nextReviewCard.getBoundingClientRect().top - reviewCard.getBoundingClientRect().bottom).toBeCloseTo(8);
      expect(reviews.getBoundingClientRect().left).toBeGreaterThan(download.getBoundingClientRect().right);
      expect(getComputedStyle(panel).padding).toBe("24px");
      expect(new Set(downloadCopy.map((element) => getComputedStyle(element).fontSize))).toEqual(new Set(["14px"]));
      expect(new Set(storeLinks.map((element) => getComputedStyle(element).fontSize))).toEqual(new Set([width >= 928 ? "16px" : "14px"]));
      expect(getComputedStyle(qr).borderRadius).toBe("8px");
      expect(getComputedStyle(qr).padding).toBe("8px");
      const qrSize = width >= 928 ? 100 : 80;
      expect(qrImage.getBoundingClientRect().width).toBe(qrSize);
      expect(qrImage.getBoundingClientRect().height).toBe(qrSize);
      expect(qr.getBoundingClientRect().bottom).toBeLessThan(appStore.getBoundingClientRect().top);
      expect(caption.getBoundingClientRect().top - stores.getBoundingClientRect().bottom).toBeCloseTo(8);
      expect(storeDetails.getBoundingClientRect().width).toBeCloseTo(downloadOptions.getBoundingClientRect().width);
      expect(getComputedStyle(reviewCard).padding).toBe(width >= 928 ? "12px" : "16px");
      expect(new Set(reviewCards.map((card) => getComputedStyle(card).borderRadius))).toEqual(new Set(["16px"]));

      if (width >= 928) {
        const column = download.getBoundingClientRect();
        const options = downloadOptions.getBoundingClientRect();
        expect(panel.getBoundingClientRect().height).toBe(360);
        expect(getComputedStyle(download).padding).toBe("0px");
        expect(column.bottom).toBeCloseTo(reviews.getBoundingClientRect().bottom);
        expect(options.width).toBeCloseTo(column.width);
        expect(options.bottom).toBeCloseTo(column.bottom);
        expect(caption.getBoundingClientRect().bottom).toBeCloseTo(options.bottom);
        expect(downloadOptions.firstElementChild!.getBoundingClientRect().top).toBeGreaterThan(options.top);
      }
    }

    for (const [width, before, after] of [[343, 16, 8], [1184, 2, 2]] as const) {
      container.style.width = `${width}px`;
      for (const link of storeLinks) {
        const bounds = link.getBoundingClientRect();
        const x = bounds.left + bounds.width / 2;
        expect(bounds.height).toBe(20);
        expect(document.elementFromPoint(x, bounds.top - before + 0.5)).toBe(link);
        expect(document.elementFromPoint(x, bounds.bottom + after - 0.5)).toBe(link);
      }
    }
  } finally {
    root.unmount();
    container.remove();
  }
});

test("routes the QR download links to the corresponding language", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  try {
    const sources = [];
    for (const [locale, label] of [["zh", "下载亚米 App"], ["en", "Download the Yami app"]] as const) {
      flushSync(() => root.render(<UserReviews {...userReviewsExamples[locale]} />));
      const link = container.querySelector<HTMLAnchorElement>(`a[aria-label="${label}"]`)!;
      const image = link.querySelector("img")!;
      expect(link.href).toBe(`https://www.yami.com/us/${locale}/download`);
      await image.decode();
      sources.push(image.src);
    }
    expect(new Set(sources).size).toBe(2);
  } finally {
    root.unmount();
    container.remove();
  }
});

test("supports the shared section divider positions and treatments", () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const cases: [Partial<UserReviewsProps>, string, string][] = [
    [{}, "1px", "0px"],
    [{ dividerPosition: "bottom", dividerVariant: "black" }, "0px", "2px"],
    [{ dividerPosition: "none" }, "0px", "0px"],
  ];

  try {
    for (const [divider, startWidth, endWidth] of cases) {
      flushSync(() => root.render(<UserReviews {...userReviewsExamples.zh} {...divider} />));
      const style = getComputedStyle(container.firstElementChild!);
      expect(style.borderBlockStartWidth).toBe(startWidth);
      expect(style.borderBlockEndWidth).toBe(endWidth);
    }
  } finally {
    root.unmount();
    container.remove();
  }
});
