import { userEvent, waitFor, within } from "storybook/test";

import { createCollectionFaq } from "./collectionFaq.fixture";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createBeautyReviews } from "./beautyKeyword.fixture";
import { collectionMobile, createCollectionMeta } from "./collectionTemplate";
import topicMeta, { type Pc as TopicPc } from "../TopicLandingPage/TopicLandingPage.stories";
import { localizedBeautyProduct } from "./localizedBeautyProduct";
import catalog from "./k-beauty.products.json";

const introByLocale = {
  zh: "探索韩系护肤与彩妆，从 ANUA 的鱼腥草爽肤水、SKIN1004 的积雪草防晒精华，认识韩国品牌常用的护肤成分。彩妆可以从 rom&nd 的果汁唇釉入手，用一抹透亮的杏仁玫瑰色，给日常妆容添点气色。",
  en: "Explore the ingredients behind Korean skincare with ANUA’s heartleaf toner and SKIN1004’s centella sun serum. For a sheer, glossy touch of color, finish your everyday look with a swipe of rom&nd’s Juicy Lasting Tint in Almond Rose.",
};

function createKBeautyFixture(locale: TopicLandingPageLocale = "en") {
  const page = createCollectionPageFixture(locale);
  const products = catalog.map((item) => localizedBeautyProduct(item, locale));
  return {
    ...page,
    activityHeader: { ...page.activityHeader, title: "K-Beauty" },
    hero: {
      ...page.hero,
      title: "K-Beauty",
      description: introByLocale[locale],
    },
    reviewList: { ...page.reviewList, reviews: createBeautyReviews(products, locale) },
    waterfall: {
      ...page.waterfall,
      products,
      productsByTab: { all: products },
      tabs: undefined,
      defaultValue: "all",
    },
  };
}

const faqByLocale = createCollectionFaq({ en: "Korean beauty products", zh: "韩系美妆产品" }, [
  {
    id: "categories",
    question: { en: "Where can I find cleansing balms and face washes?", zh: "在哪里找卸妆膏和洁面乳？" },
    answer: {
      en: "Use Brand to find cleansing balms and face washes from Beauty of Joseon, ANUA and COSRX.",
      zh: "在「品牌」里选择 Beauty of Joseon、ANUA 或 COSRX，即可查看这些品牌的卸妆膏和洁面产品。",
    },
  },
  {
    id: "makeup",
    question: { en: "Which makeup products are in this collection?", zh: "这个专辑里有哪些彩妆？" },
    answer: {
      en: "Filter by rom&nd for lip tint and balm, JUNG SAEM MOOL for foundation, or ABOUT TONE for concealer. Look for the shade number in each product name.",
      zh: "选 rom&nd 可查看唇釉和润唇膏，选 JUNG SAEM MOOL 可查看粉底，选 ABOUT TONE 可查看遮瑕液。色号标在商品名称里。",
    },
  },
  {
    id: "brands",
    question: { en: "Where can I browse one brand at a time?", zh: "想集中看一个品牌，有哪些专辑？" },
    answer: {
      en: "Under Related Collections, choose ANUA, SKIN1004 or rom&nd to open that brand’s collection.",
      zh: "在下方的「相关专辑」里选择 ANUA、SKIN1004 或 rom&nd，即可查看该品牌的商品。",
    },
  },
  {
    id: "sun-care",
    question: { en: "Which sunscreen formats are featured?", zh: "这里有哪些不同形态的防晒？" },
    answer: {
      en: "Compare SKIN1004’s sun serum and sun stick with Beauty of Joseon’s Relief Sun Aqua-fresh Sunscreen.",
      zh: "可以比较 SKIN1004 的防晒精华和防晒棒，以及朝鲜美人的清爽水感防晒乳。",
    },
  },
  {
    id: "sheet-masks",
    question: { en: "Which MEDIHEAL sheet masks are featured?", zh: "MEDIHEAL 面膜有哪些款？" },
    answer: {
      en: "Choose MEDIHEAL under Brand to find its madecassoside, vitamin C and collagen serum masks.",
      zh: "在「品牌」里选择 MEDIHEAL，可查看积雪草苷、维生素 C 和胶原蛋白精华面膜。",
    },
  },
]);

export default {
  ...createCollectionMeta(topicMeta, createKBeautyFixture, faqByLocale, "A Korean beauty collection spanning skincare, sun care and makeup."),
  id: "yami-pages-landing-page-collection-page-k-beauty",
  title: "YAMI/Pages/Landing Pages/Collection Templates/K-Beauty",
};

const play: typeof TopicPc.play = import.meta.env.MODE === "test" ? async ({ canvasElement, globals }) => {
  await within(canvasElement).findByRole("main", { busy: false });
  const zh = globals.locale === "zh";
  const products = canvasElement.querySelector("#explore-more-all")!;
  const toolbar = within(products).getByRole("group", { name: zh ? "筛选" : "Filters", exact: true });
  const filters = within(toolbar);
  if (filters.queryByRole("button", { name: zh ? /^(筛选|分类)$/ : /^(Filters|Category)$/ })) {
    throw new Error("K-Beauty must show Brand in place of the all-filters and category controls");
  }

  const displayedBrands = () => new Set(Array.from(products.querySelectorAll('[data-slot="product-card-brand"]'),
    (brand) => brand.textContent?.trim()));
  const brandLabel = zh ? "品牌" : "Brand";
  const brandFilter = filters.getByRole("button", { name: brandLabel, exact: true });
  await userEvent.click(brandFilter);
  const preview = within(canvasElement.ownerDocument.body);
  const brandMenu = within(await preview.findByRole("dialog", { name: brandLabel, exact: true }));
  await userEvent.click(brandMenu.getByRole("checkbox", { name: "ANUA", exact: true }));
  await userEvent.click(brandMenu.getByRole("checkbox", { name: "SKIN1004", exact: true }));
  await userEvent.click(brandMenu.getByRole("button", { name: zh ? "查看商品" : "Show products", exact: true }));
  await waitFor(() => {
    const brands = displayedBrands();
    if (brands.size !== 2 || !brands.has("ANUA") || !brands.has("SKIN1004")) {
      throw new Error("Selecting multiple brands must show products from both brands only");
    }
  });
  await userEvent.click(await filters.findByRole("button", { name: zh ? "清除全部" : "Clear all", exact: true }));
  await waitFor(() => {
    if (!displayedBrands().has("Beauty of Joseon")) throw new Error("Clear all must reset the brand filter");
  });
} : undefined;

export const Pc = { name: "PC", tags: ["preserve-story-name"], play };
export const Mobile = { ...collectionMobile, name: "Mobile", tags: ["preserve-story-name"], play };
