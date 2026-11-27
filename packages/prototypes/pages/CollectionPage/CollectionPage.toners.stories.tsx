import topicMeta from "../TopicLandingPage/TopicLandingPage.stories";
import { createBeautyKeywordMeta } from "./beautyKeyword.fixture";
import { collectionMobile } from "./collectionTemplate";

export default {
  ...createBeautyKeywordMeta(topicMeta, {
    title: { en: "Toners", zh: "爽肤水" },
    faqSubject: { en: "toners", zh: "爽肤水" },
    description: {
      en: "Discover Korean toners, from ANUA’s heartleaf and milky rice formulas to ROUND LAB’s Dokdo Toner and Beauty of Joseon’s Ginseng Essence Water.",
      zh: "从 ANUA 的鱼腥草爽肤水和大米乳状爽肤水，到 ROUND LAB 的独岛爽肤水和朝鲜美人的人参精华水，按喜欢的品牌与质地挑选。",
    },
    groups: [
      { value: "anua", label: { en: "ANUA", zh: "ANUA" }, ids: ["1022281871", "1022500901"] },
      { value: "round-lab", label: { en: "ROUND LAB", zh: "ROUND LAB" }, ids: ["1022138761"] },
      { value: "joseon", label: { en: "Beauty of Joseon", zh: "朝鲜美人" }, ids: ["1022215801"] },
      { value: "numbuzin", label: { en: "Numbuzin", zh: "Numbuzin" }, ids: ["1030425321"] },
    ],
    faq: [
      {
        id: "selection",
        question: { en: "Which toner has a milky texture?", zh: "想试乳状质地，可以看哪款？" },
        answer: {
          en: "Look for ANUA Rice 70 Glow Milky Toner. Its product card links to the ingredient list and size.",
          zh: "可以看看 ANUA 大米 70 乳状爽肤水，点开商品卡可查看成分和规格。",
        },
      },
      {
        id: "dokdo",
        question: { en: "Which one is the Dokdo toner?", zh: "独岛爽肤水是哪款？" },
        answer: {
          en: "Look for ROUND LAB 1025 Dokdo Toner. The bottle featured here is 200 ml.",
          zh: "选 ROUND LAB 的 1025 独岛爽肤水，这里收录的是 200 ml 装。",
        },
      },
      {
        id: "ginseng",
        question: { en: "Which toner features ginseng?", zh: "哪款爽肤水含有人参？" },
        answer: {
          en: "Beauty of Joseon’s Ginseng Essence Water comes in a 150 ml bottle.",
          zh: "朝鲜美人的人参精华水（Ginseng Essence Water）是 150 ml 装。",
        },
      },
      {
        id: "heartleaf",
        question: { en: "Which brand makes the heartleaf toner?", zh: "想找鱼腥草爽肤水，该看哪个品牌？" },
        answer: {
          en: "Choose ANUA and look for Heartleaf Soothing Toner.",
          zh: "选择 ANUA，找到「鱼腥草舒缓爽肤水」。",
        },
      },
      {
        id: "pdrn",
        question: { en: "Which toner lists PDRN in its name?", zh: "哪款爽肤水标有 PDRN？" },
        answer: {
          en: "Look for Numbuzin No.9 NAD+ PDRN Glow Boosting Toner in the 150 ml bottle.",
          zh: "Numbuzin 9 号 NAD+ PDRN 光泽爽肤水，容量为 150 ml。",
        },
      },
    ],
  }),
  id: "yami-pages-landing-page-collection-page-toners",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Toners",
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = { ...collectionMobile, name: "Mobile", tags: ["preserve-story-name"] };
