import { userEvent, waitFor, within } from "storybook/test";

import { createCollectionFaq } from "./collectionFaq.fixture";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createRelatedCollections } from "./relatedCollections.fixture";
import { resolveTopicLandingScrollRoot } from "../TopicLandingPage/TopicLandingPage";
import type { TopicLandingPageRelatedKeywords } from "../TopicLandingPage/TopicLandingPage.types";
import brandMeta, {
  Pc as BrandPc,
  Mobile as BrandMobile,
  Chinese as BrandChinese,
  ChineseMobile as BrandChineseMobile,
  CustomContentWidth as BrandCustomContentWidth,
  SansTitles as BrandSansTitles,
} from "../TopicLandingPage/TopicLandingPage.stories";

const removedSections = {
  explore: "shortcuts",
  shop: "start-here",
  "popular-picks": "popular-picks",
} as const;
const soldOutProductIds = new Set([
  "1022446461",
  "3022589911",
  "1022281871",
]);
const faqByLocale = createCollectionFaq([
  {
    id: "selection",
    question: { en: "Which ANUA skincare products are featured here?", zh: "这里有哪些 ANUA 护肤品？" },
    answer: {
      en: "Editor’s Picks includes cleansers, toners and pads, serums, moisturizers, sunscreens and masks. Use Category to narrow the list.",
      zh: "「编辑精选」收录了洁面、爽肤水与棉片、精华、乳液与面霜、防晒和面膜等商品。可以用「分类」缩小浏览范围。",
    },
  },
  {
    id: "budget",
    question: { en: "How can I shop within my budget?", zh: "怎么按预算挑选商品？" },
    answer: {
      en: "Choose one or more ranges under Price, then use Sort by to order products by price in either direction.",
      zh: "用「价格」选择一个或多个价格区间，再通过「排序方式」按价格从低到高或从高到低浏览。",
    },
  },
  {
    id: "stock",
    question: { en: "Where can I find sold-out products?", zh: "在哪里查看售完的商品？" },
    answer: {
      en: "Turn off In Stock. With the default Featured sort, sold-out products appear at the end of the list. Select Notify me where available to set a restock alert.",
      zh: "关闭「仅看有货」后，在默认的「精选」排序下，售完商品会排在列表末尾。卡片上有「到货通知」时，可以点击设置提醒。",
    },
  },
  {
    id: "reviews",
    question: { en: "How do I know which product a review is about?", zh: "怎么知道评价说的是哪款商品？" },
    answer: {
      en: "The name and size appear below each customer review. Look there for the exact Heartleaf cleanser, soothing toner or niacinamide serum the customer reviewed.",
      zh: "「顾客评价」中的每条评价下方都标出了对应的商品名称和规格，例如鱼腥草洁面泡沫、舒缓爽肤水或烟酰胺精华。",
    },
  },
  {
    id: "heartleaf",
    question: { en: "Which Heartleaf cleansers can I compare?", zh: "鱼腥草系列有哪些洁面产品？" },
    answer: {
      en: "The collection includes the Heartleaf cleansing oil and Heartleaf cleansing foam.",
      zh: "可以在「清洁与去角质」里比较鱼腥草清洁卸妆油和鱼腥草洁面泡沫。",
    },
  },
]);

const relatedKeywordsByLocale = {
  zh: {
    title: "探索更多",
    items: [
      "ANUA 艾努雅", "韩系护肤", "鱼腥草护肤", "鱼腥草舒缓爽肤水", "鱼腥草清洁卸妆油",
      "深层清洁洁面泡沫", "烟酰胺 + 传明酸", "大米焕亮爽肤水", "玻尿酸补水", "神经酰胺护理",
      "PDRN 精华", "舒缓棉片", "日常防晒", "补水面膜", "肌肤屏障护理",
    ],
  },
  en: {
    title: "Explore More",
    items: [
      "ANUA", "Korean Skincare", "Heartleaf Skincare", "Heartleaf Toner", "Cleansing Oil",
      "Pore Cleansing Foam", "Niacinamide + TXA", "Rice Toner", "Hyaluronic Acid", "Ceramides",
      "PDRN Serum", "Toner Pads", "Daily Sunscreen", "Sheet Masks", "Barrier Care",
    ],
  },
} satisfies Record<"en" | "zh", TopicLandingPageRelatedKeywords>;

export default {
  ...brandMeta,
  id: "yami-pages-landing-page-collection-page-brand",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Anua",
  parameters: {
    ...brandMeta.parameters,
    createPageFixture: createCollectionPageFixture,
    createRelatedCollections,
    faqByLocale,
    relatedKeywordsByLocale,
    docs: {
      ...brandMeta.parameters.docs,
      description: {
        component:
          "This keyword collection uses Anua as its example, with a text introduction, a filterable product list, customer reviews, frequently asked questions, related collections and related keywords.",
      },
    },
  },
  args: {
    ...brandMeta.args,
    revealHeaderOnScrollUp: true,
    hero: {
      ...brandMeta.args.hero,
      image: undefined,
      tags: undefined,
      tagTone: undefined,
      style: {
        backgroundColor: "var(--background-secondary)",
        minHeight: "clamp(10rem, 16dvw, 15rem)",
      },
    },
    waterfall: {
      ...brandMeta.args.waterfall,
      catalogFilters: true,
      initialRows: 3,
      rowsPerPage: 6,
      products: brandMeta.args.waterfall.products.map((product) =>
        soldOutProductIds.has(product.id) ? { ...product, availability: "sold-out" as const } : product,
      ),
    },
    hiddenModules: Object.values(removedSections),
    reviewsAfterProducts: true,
    primaryTabs: {
      ...brandMeta.args.primaryTabs,
      items: [],
    },
  },
};

const play: typeof BrandPc.play = import.meta.env.MODE === "test" ? async ({ canvasElement, args, globals }) => {
  const main = canvasElement.querySelector<HTMLElement>('[data-slot="topic-landing-main"]');
  const hero = main?.querySelector('[data-slot="theme-hero"]');
  if (!main || !hero?.querySelector("h2") ||
      !hero.querySelector('[data-slot="theme-hero-description"]') ||
      hero.querySelector('img, [data-slot="theme-hero-tags"]')) {
    throw new Error("Brand collection must open with a title and description");
  }
  if (main.querySelector("#explore, #shop, #popular-picks")) {
    throw new Error("Brand collection must omit category shortcuts, the routine section, and Popular Picks");
  }
  const products = main.querySelector<HTMLElement>("#product-list");
  const coupons = hero.nextElementSibling;
  if (!products || coupons?.querySelectorAll('[data-slot="coupon"]').length !== 2 || coupons.nextElementSibling !== products || main.querySelector('[data-slot="topic-landing-tabs"]')) {
    throw new Error("The Brand introduction, coupons and product list must appear in order");
  }
  if (products.nextElementSibling?.id !== "reviews") {
    throw new Error("Customer reviews must follow the product list");
  }
  const header = canvasElement.querySelector<HTMLElement>('[data-slot="topic-landing-global-header"]')!;
  const headerHeight = header.offsetHeight;
  if (headerHeight) {
    const scroller = resolveTopicLandingScrollRoot(header);
    const top = scroller instanceof HTMLElement ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
    scroller.scrollTo({ top: headerHeight * 4, behavior: "instant" });
    await waitFor(() => {
      if (header.getBoundingClientRect().bottom > top + 1) throw new Error("Scrolling down must hide the PC header");
    });
    scroller.scrollTo({ top: headerHeight * 3, behavior: "instant" });
    await waitFor(() => {
      if (Math.abs(header.getBoundingClientRect().top - top) > 1) throw new Error("Scrolling back up must reveal the PC header");
    });
    scroller.scrollTo({ top: 0, behavior: "instant" });
  }
  const maxWidth = typeof args.contentMaxWidth === "number"
    ? `${args.contentMaxWidth}px`
    : (args.contentMaxWidth ?? "1440px");
  if (main.dataset.contentMaxWidth !== maxWidth ||
      main.dataset.titleFontFamily !== (args.titleFontFamily ?? "serif")) {
    throw new Error("Brand collection must apply the requested width and title font family");
  }

  const zh = globals.locale === "zh";
  if (zh && !within(main).getByRole("heading", { name: "顾客评价", level: 2 }).closest("#reviews")) {
    throw new Error("The Chinese review heading must read 顾客评价");
  }
  const faqCopy = faqByLocale[zh ? "zh" : "en"];
  const faqRegion = within(main).getByRole("region", { name: faqCopy.title });
  const faq = within(faqRegion);
  const faqQuestions = faq.getAllByRole("button");
  if (products.nextElementSibling?.nextElementSibling !== faqRegion ||
      faqQuestions.length !== faqCopy.items.length || faqQuestions.some((item) => item.getAttribute("aria-expanded") !== "false")) {
    throw new Error("Brand FAQs must start collapsed after customer reviews");
  }
  const keywords = relatedKeywordsByLocale[zh ? "zh" : "en"];
  const keywordRegion = within(main).getByRole("region", { name: keywords.title });
  const keywordList = within(keywordRegion).getByRole("list");
  const tags = Array.from(keywordList.querySelectorAll('[data-slot="tag"]'));
  const collectionsRegion = within(main).getByRole("heading", { name: zh ? "相关专辑" : "Related Collections" }).closest("section");
  if (!collectionsRegion || faqRegion.nextElementSibling !== collectionsRegion ||
      collectionsRegion.querySelectorAll("a[href]").length !== 6 || collectionsRegion.nextElementSibling !== keywordRegion ||
      main.lastElementChild !== keywordRegion ||
      tags.length !== keywords.items.length ||
      tags.some((tag, index) => tag.textContent?.trim() !== keywords.items[index])) {
    throw new Error("The FAQ must be followed by six related collections and then the localized keyword tags");
  }
  if (canvasElement.ownerDocument.defaultView?.matchMedia("(width < 1024px)").matches) {
    const rows = new Set(tags.map(tag => tag.getBoundingClientRect().top));
    if (rows.size > 3 || getComputedStyle(keywordList.parentElement!).overflowX !== "auto") {
      throw new Error("Mobile keywords must scroll horizontally in at most three rows");
    }
  } else if (getComputedStyle(keywordList).flexWrap !== "wrap") {
    throw new Error("Desktop keywords must wrap to the available width");
  }
  const productSection = within(products);
  const grid = productSection.getByRole("list");
  const renderedCount = () => within(grid).getAllByRole("listitem").length;
  const moreProducts = () => productSection.queryByRole("button", { name: zh ? "查看更多" : "View more", exact: true });
  const columns = () => getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
  const initialSize = () => 3 * columns();
  const allCount = args.waterfall.products.length;
  const toolbar = productSection.getByRole("group", { name: zh ? "筛选" : "Filters", exact: true });
  const preview = within(canvasElement.ownerDocument.body);
  const inStock = () => within(toolbar).getByRole("button", { name: zh ? "仅看有货" : "In Stock", exact: true });
  const soldOutCards = () => Array.from(products.querySelectorAll(
    '[data-slot="product-card"][data-availability="sold-out"]',
  ));
  if (inStock().getAttribute("aria-pressed") !== "true" || soldOutCards().length) {
    throw new Error("The catalog must begin with In Stock selected when products are sold out");
  }
  await waitFor(() => {
    if (renderedCount() !== initialSize() || !moreProducts()) {
      throw new Error("Brand must start with three rows of in-stock products and a View more button");
    }
  });
  await userEvent.click(inStock());
  const batchSize = 6 * columns();
  if (renderedCount() !== initialSize()) {
    throw new Error("Changing stock filters must preserve the initial row limit");
  }
  for (let shown = initialSize(); shown < allCount; shown += batchSize) {
    const moreButton = moreProducts();
    if (!moreButton) throw new Error("View more must stay available while products remain");
    await userEvent.click(moreButton);
    if (renderedCount() !== Math.min(shown + batchSize, allCount)) {
      throw new Error("View more must reveal up to six additional rows per click");
    }
  }
  const cards = Array.from(products.querySelectorAll('[data-slot="product-card"]'));
  if (moreProducts()) throw new Error("View more must disappear when all products are shown");
  if (inStock().getAttribute("aria-pressed") !== "false" || cards.length !== allCount ||
      cards.slice(-soldOutProductIds.size).some((card) => card.getAttribute("data-availability") !== "sold-out")) {
    throw new Error("Sold-out products must be at the end of the featured grid");
  }
  const soldOutLabel = zh ? "已售完" : "Sold out";
  const notifyLabel = zh ? "到货通知" : "Notify me";
  const notifiedLabel = zh ? "已设置到货通知" : "Notification set";
  const notifyButtons = () => soldOutCards().flatMap((card) =>
    Array.from(card.querySelectorAll<HTMLButtonElement>('[data-slot="product-card-availability"] button')),
  );
  if (soldOutCards().length !== soldOutProductIds.size ||
      soldOutCards().some((card) =>
        card.querySelector('[data-slot="product-card-availability"] p')?.textContent?.trim() !== soldOutLabel ||
        card.querySelector('[data-slot="product-card-add-button"]'),
      ) ||
      notifyButtons().length !== soldOutProductIds.size ||
      notifyButtons().some((button) => button.textContent?.trim() !== notifyLabel) ||
      !products.querySelector('[data-availability="available"] [data-slot="product-card-add-button"]')) {
    throw new Error("Sold-out examples must group their stock status and restock action in place of quick add");
  }
  if (productSection.queryByRole("status")) {
    throw new Error("The product list must omit the result count");
  }
  await userEvent.click(notifyButtons()[0]);

  await userEvent.click(within(toolbar).getByRole("button", { name: zh ? "分类" : "Category" }));
  await userEvent.click(await preview.findByRole("radio", { name: zh ? "清洁与去角质" : "Cleanse & Peel" }));
  await userEvent.click(preview.getByRole("button", { name: zh ? "查看商品" : "Show products" }));
  const categoryCount = args.waterfall.productsByTab?.["cleanse-peel"].length ?? 0;
  await waitFor(() => {
    if (renderedCount() !== Math.min(categoryCount, initialSize())) {
      throw new Error("Category filtering must restore the three-row preview");
    }
  });
  const moreCategoryProducts = moreProducts();
  if (moreCategoryProducts) await userEvent.click(moreCategoryProducts);
  await waitFor(() => {
    if (renderedCount() !== categoryCount ||
        moreProducts() ||
        soldOutCards().length !== 2 ||
        !notifyButtons().some((button) =>
          button.textContent?.trim() === notifiedLabel && button.getAttribute("aria-disabled") === "true",
        )) {
      throw new Error("Category filtering must preserve sold-out and subscribed states");
    }
  });

  await userEvent.click(inStock());
  await waitFor(() => {
    if (inStock().getAttribute("aria-pressed") !== "true" ||
        soldOutCards().length !== 0 ||
        productSection.getAllByRole("listitem").length !== categoryCount - 2) {
      throw new Error("In Stock must hide sold-out cards within the selected category");
    }
  });

  await userEvent.click(within(toolbar).getByRole("button", { name: zh ? "清除全部" : "Clear all" }));
  await waitFor(() => {
    if (inStock().getAttribute("aria-pressed") !== "false" ||
        renderedCount() !== initialSize() || !moreProducts()) {
      throw new Error("Clearing the filters must restore the three-row preview of the full product list");
    }
  });

  await userEvent.click(within(toolbar).getByRole("button", { name: zh ? "价格" : "Price", exact: true }));
  await userEvent.click(await preview.findByRole("checkbox", { name: zh ? "$10 至 $25 以下" : "$10 to under $25" }));
  await userEvent.click(preview.getByRole("button", { name: zh ? "查看商品" : "Show products" }));
  const prices = () => Array.from(products.querySelectorAll('[data-slot="product-card-price"] > span:first-child'),
    (price) => Number(price.textContent?.replace("$", "")),
  );
  await waitFor(() => {
    const visible = prices();
    if (!visible.length || visible.length >= allCount || visible.some((price) => price < 10 || price >= 25)) {
      throw new Error("Price filters must limit the grid to products within the selected range");
    }
  });

  await userEvent.click(await within(toolbar).findByRole("button", { name: zh ? "排序方式" : "Sort by", exact: true }));
  await userEvent.click(await preview.findByRole("radio", { name: zh ? "价格从低到高" : "Price: low to high" }));
  await waitFor(() => {
    const visible = prices();
    if (!visible.length || visible.some((price, index) => index > 0 && price < visible[index - 1])) {
      throw new Error("Sorting must reorder the filtered product grid by current price");
    }
  });

  await userEvent.click(faqQuestions[0]);
  await faq.findByText(faqCopy.items[0].answer);
  await userEvent.click(faqQuestions[1]);
  await faq.findByText(faqCopy.items[1].answer);
  if (faqQuestions[0].getAttribute("aria-expanded") !== "false") {
    throw new Error("Opening another FAQ must collapse the first answer");
  }
} : undefined;

export const Pc = { ...BrandPc, name: "PC", tags: ["preserve-story-name"], play };
export const Mobile = { ...BrandMobile, name: "Mobile", tags: ["preserve-story-name"], play };

export const Chinese = {
  ...BrandChinese,
  name: "中文",
  tags: ["!dev", "!autodocs"],
  play,
};

export const ChineseMobile = {
  ...BrandChineseMobile,
  parameters: BrandMobile.parameters,
  name: "中文 Mobile",
  tags: ["!dev", "!autodocs"],
  play,
};

export const CustomContentWidth = {
  ...BrandCustomContentWidth,
  name: "Custom Content Width",
  tags: ["!dev", "!autodocs"],
  play,
};

export const SansTitles = {
  ...BrandSansTitles,
  name: "Sans Titles",
  tags: ["!dev", "!autodocs"],
  play,
};
