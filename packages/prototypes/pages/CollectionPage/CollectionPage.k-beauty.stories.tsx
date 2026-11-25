import { createCollectionFaq } from "./collectionFaq.fixture";
import type { ProductListItem } from "@yami/design-system";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createBeautyReviews } from "./beautyKeyword.fixture";
import collectionMeta, { Mobile as AnuaMobile } from "./CollectionPage.brand.stories";
import { localizedBeautyProduct } from "./localizedBeautyProduct";
import catalog from "./k-beauty.products.json";

const categories = [
  { value: "cleanse", en: "Cleansers", zh: "洁面与卸妆" },
  { value: "tone", en: "Toners & pads", zh: "爽肤水与棉片" },
  { value: "moisturize", en: "Serums & creams", zh: "精华与面霜" },
  { value: "sun", en: "Sun care", zh: "防晒" },
  { value: "mask", en: "Sheet masks", zh: "面膜" },
  { value: "makeup", en: "Makeup", zh: "彩妆" },
] as const;

const introByLocale = {
  zh: "探索韩系护肤与彩妆，从 ANUA 的鱼腥草爽肤水、SKIN1004 的积雪草防晒精华，认识韩国品牌常用的护肤成分。彩妆可以从 rom&nd 的果汁唇釉入手，用一抹透亮的杏仁玫瑰色，给日常妆容添点气色。",
  en: "Explore the ingredients behind Korean skincare with ANUA’s heartleaf toner and SKIN1004’s centella sun serum. For a sheer, glossy touch of color, finish your everyday look with a swipe of rom&nd’s Juicy Lasting Tint in Almond Rose.",
};

function createKBeautyFixture(locale: TopicLandingPageLocale = "en") {
  const page = createCollectionPageFixture(locale);
  const productsByTab: Record<string, ProductListItem[]> = Object.fromEntries(
    categories.map(({ value }) => [value, []]),
  );
  const products = catalog.map((item): ProductListItem => {
    const product = localizedBeautyProduct(item, locale);
    productsByTab[item.category].push(product);
    return product;
  });
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
      productsByTab: { ...productsByTab, all: products },
      tabs: categories.map(({ value, ...label }) => ({ value, label: label[locale] })),
      defaultValue: "all",
    },
  };
}

const fixture = createKBeautyFixture();

export default {
  ...collectionMeta,
  id: "yami-pages-landing-page-collection-page-k-beauty",
  title: "YAMI/Pages/Landing Pages/Collection Templates/K-Beauty",
  args: {
    ...collectionMeta.args,
    activityHeader: fixture.activityHeader,
    hero: {
      ...collectionMeta.args.hero,
      title: fixture.hero.title,
      description: introByLocale.en,
    },
    waterfall: { ...collectionMeta.args.waterfall, ...fixture.waterfall },
  },
  parameters: {
    ...collectionMeta.parameters,
    createPageFixture: createKBeautyFixture,
    docs: {
      ...collectionMeta.parameters.docs,
      description: { component: "A Korean beauty collection spanning skincare, sun care and makeup." },
    },
    faqByLocale: createCollectionFaq({ en: "Korean beauty products", zh: "韩系美妆产品" }, [
      {
        id: "categories",
        question: { en: "Where can I find cleansing balms and face washes?", zh: "在哪里找卸妆膏和洁面乳？" },
        answer: {
          en: "Choose Cleansers under Category to browse cleansing balms, gel cleansers and foaming washes together.",
          zh: "在「分类」里选「洁面与卸妆」，可以一起看卸妆膏、凝胶洁面乳和洁面泡沫。",
        },
      },
      {
        id: "makeup",
        question: { en: "Which makeup products are in this collection?", zh: "这个专辑里有哪些彩妆？" },
        answer: {
          en: "Choose Makeup to see rom&nd lip tint and balm alongside foundation and concealer. Look for the shade number in each product name.",
          zh: "选择「彩妆」，可以查看 rom&nd 唇釉和润唇膏，以及粉底和遮瑕液。色号标在商品名称里。",
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
          en: "Under Sheet masks, look for MEDIHEAL’s madecassoside, vitamin C and collagen serum masks.",
          zh: "「面膜」分类收录了 MEDIHEAL 的积雪草苷、维生素 C 和胶原蛋白精华面膜。",
        },
      },
    ]),
    relatedKeywordsByLocale: {
      zh: { title: "探索更多", items: ["ANUA", "SKIN1004", "rom&nd", ...categories.map(category => category.zh)] },
      en: { title: "Explore More", items: ["ANUA", "SKIN1004", "rom&nd", ...categories.map(category => category.en)] },
    },
  },
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = {
  name: "Mobile",
  tags: ["preserve-story-name"],
  parameters: AnuaMobile.parameters,
  globals: AnuaMobile.globals,
};
