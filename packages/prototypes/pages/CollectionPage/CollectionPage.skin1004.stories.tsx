import { createBeautyKeywordMeta } from "./beautyKeyword.fixture";
import collection, { Mobile as CollectionMobile } from "./CollectionPage.brand.stories";

export default {
  ...createBeautyKeywordMeta(collection, {
    title: { en: "SKIN1004", zh: "SKIN1004" },
    description: {
      en: "Explore SKIN1004’s Madagascar Centella line, from cleansing foam and ampoules to Water-Fit Sun Serum. Choose a single bottle or a duo for your daily routine.",
      zh: "从洁面泡沫、安瓶到水感防晒精华，按护肤步骤浏览 SKIN1004 的马达加斯加积雪草系列。日常防晒单支、双支装都能在这里找到。",
    },
    groups: [
      { value: "ampoules", label: { en: "Centella ampoules", zh: "积雪草安瓶" }, ids: ["1022190081", "1022190131", "1022503211"] },
      { value: "sun", label: { en: "Sun care", zh: "日常防晒" }, ids: ["1022431511", "1022738691", "1180045951", "1022503251"] },
      { value: "cleansers", label: { en: "Cleansing foam", zh: "洁面泡沫" }, ids: ["1022190061"] },
    ],
    faq: [
      {
        id: "selection",
        question: { en: "Which Water-Fit Sun Serum sizes are featured?", zh: "水感防晒精华有哪些规格？" },
        answer: {
          en: "The selection includes a 50 ml bottle, a pair of 50 ml bottles and a 100 ml bottle.",
          zh: "可选 50 ml 单支、50 ml 双支装和 100 ml 单支。",
        },
      },
      {
        id: "ampoules",
        question: { en: "Which ampoules can I compare with the original Centella Ampoule?", zh: "除了经典积雪草安瓶，还有哪些款？" },
        answer: {
          en: "The Tone Brightening Capsule Ampoule and the Hyalu-Cica First Ampoule both come in 100 ml bottles.",
          zh: "可以比较积雪草透亮胶囊安瓶和玻尿酸积雪草安瓶，两款都是 100 ml。",
        },
      },
      {
        id: "foam",
        question: { en: "Which product is the face wash?", zh: "哪一款是洁面用的？" },
        answer: {
          en: "Look under Cleansing foam for Centella Ampoule Foam in the 125 ml tube.",
          zh: "在「洁面泡沫」里找 125 ml 的积雪草安瓶洁面泡沫，英文品名是 Centella Ampoule Foam。",
        },
      },
      {
        id: "sun-stick",
        question: { en: "Is there a stick sunscreen?", zh: "有棒状防晒吗？" },
        answer: {
          en: "Yes. Look under Sun care for the Centella Hyalu-Cica Sun Stick.",
          zh: "有，在「日常防晒」里可以找到积雪草玻尿酸防晒棒。",
        },
      },
      {
        id: "original",
        question: { en: "What size is the original Centella Ampoule?", zh: "经典款积雪草安瓶是什么规格？" },
        answer: {
          en: "The Madagascar Centella Ampoule featured here comes in a 100 ml bottle.",
          zh: "商品名为「马达加斯加积雪草安瓶」，本专辑收录的是 100 ml 装。",
        },
      },
    ],
  }),
  id: "yami-pages-landing-page-collection-page-skin1004",
  title: "YAMI/Pages/Landing Pages/Collection Templates/SKIN1004",
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = {
  name: "Mobile",
  tags: ["preserve-story-name"],
  parameters: CollectionMobile.parameters,
  globals: CollectionMobile.globals,
};
