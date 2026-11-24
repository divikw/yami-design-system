import { createBeautyKeywordMeta } from "./beautyKeyword.fixture";
import collection, { Mobile as CollectionMobile } from "./CollectionPage.brand.stories";

export default {
  ...createBeautyKeywordMeta(collection, {
    title: { en: "Sun Serums", zh: "防晒精华" },
    description: {
      en: "Compare Korean sun serums, including SKIN1004’s Water-Fit formula, Torriden’s DIVE-IN Watery Sun Serum and Numbuzin’s tinted No.3.",
      zh: "从 SKIN1004 积雪草水感防晒精华、Torriden DIVE-IN 水感系列，到 Numbuzin 3 号润色款，按质地、色调与容量挑选日间防晒。",
    },
    groups: [
      { value: "skin1004", label: { en: "SKIN1004", zh: "SKIN1004" }, ids: ["1022431511", "1022738691", "1180045951"] },
      { value: "torriden", label: { en: "Torriden", zh: "Torriden" }, ids: ["1022685961"] },
      { value: "numbuzin", label: { en: "Numbuzin", zh: "Numbuzin" }, ids: ["5196078061"] },
    ],
    faq: [
      {
        id: "selection",
        question: { en: "Which sun serum is tinted?", zh: "哪款防晒精华带润色效果？" },
        answer: {
          en: "Numbuzin No.3 No Filter Tone-Up Sun Serum comes in shade #01 Blur Matte.",
          zh: "Numbuzin 3 号柔焦润色防晒精华的色号为 #01 Blur Matte。",
        },
      },
      {
        id: "duo",
        question: { en: "Which sun serum comes in a twin pack?", zh: "想买两支装，应该选哪款？" },
        answer: {
          en: "SKIN1004’s Water-Fit Sun Serum duo contains two 50 ml bottles.",
          zh: "SKIN1004 的积雪草玻尿酸防晒精华有双支装，每支 50 ml。",
        },
      },
      {
        id: "watery",
        question: { en: "Which other brand offers a watery sun serum?", zh: "除了 SKIN1004，还有哪款水感防晒精华？" },
        answer: {
          en: "Look for Torriden’s DIVE-IN Watery Sun Serum.",
          zh: "可以看看 Torriden 的 DIVE-IN 水感防晒精华。",
        },
      },
      {
        id: "large-bottle",
        question: { en: "Which sun serum comes in a single 100 ml bottle?", zh: "想买 100 ml 单支装，该选哪款？" },
        answer: {
          en: "Look for the 100 ml version of SKIN1004’s Centella Water-Fit Sun Serum.",
          zh: "选择 SKIN1004 积雪草玻尿酸防晒精华，商品名中标有「100 ml」。",
        },
      },
      {
        id: "format",
        question: { en: "Where can I compare a sun serum with a sun stick?", zh: "想比较防晒精华和防晒棒，去哪里看？" },
        answer: {
          en: "Open SKIN1004 under Related Collections, then choose Sun care to see the serum and stick together.",
          zh: "打开下方「相关专辑」中的 SKIN1004，在「日常防晒」里可以同时看到防晒精华和防晒棒。",
        },
      },
    ],
  }),
  id: "yami-pages-landing-page-collection-page-sun-serums",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Sun Serums",
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = {
  name: "Mobile",
  tags: ["preserve-story-name"],
  parameters: CollectionMobile.parameters,
  globals: CollectionMobile.globals,
};
