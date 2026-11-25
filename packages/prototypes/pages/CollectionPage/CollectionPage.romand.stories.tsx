import { createBeautyKeywordMeta } from "./beautyKeyword.fixture";
import collection, { Mobile as CollectionMobile } from "./CollectionPage.brand.stories";

export default {
  ...createBeautyKeywordMeta(collection, {
    title: { en: "rom&nd", zh: "rom&nd" },
    faqSubject: { en: "rom&nd makeup", zh: "rom&nd 彩妆" },
    description: {
      en: "Find your rom&nd shade among glossy Juicy Lasting Tints, soft matte Blur Fudge Tint and Glasting Melting Balm. Lip and brow pencils round out the collection.",
      zh: "从杏仁玫瑰色的果汁唇釉到柔雾唇釉和水光润唇膏，按喜欢的妆效挑选 rom&nd 唇色，也可以搭配唇线笔和眉笔。",
    },
    groups: [
      { value: "tints", label: { en: "Lip tints", zh: "唇釉" }, ids: ["1194269971", "1023242531", "1194269981", "1194270021", "1194270001", "1023657521"] },
      { value: "balms", label: { en: "Tinted balm", zh: "有色润唇膏" }, ids: ["1023244621"] },
      { value: "pencils", label: { en: "Lip & brow pencils", zh: "唇线笔与眉笔" }, ids: ["1194270051", "1194270391"] },
    ],
    faq: [
      {
        id: "selection",
        question: { en: "Where can I find Almond Rose?", zh: "杏仁玫瑰色是哪一支？" },
        answer: {
          en: "Look for Juicy Lasting Tint #14 Almond Rose under Lip tints.",
          zh: "在「唇釉」中选择果汁唇釉 #14 杏仁玫瑰。",
        },
      },
      {
        id: "matte",
        question: { en: "Which tint has a matte finish?", zh: "想要柔雾妆效，可以选哪支？" },
        answer: {
          en: "Look for #13 Cooling Up in the Blur Fudge Tint line.",
          zh: "可以看 #13 Cooling Up，属于 Blur Fudge Tint 柔雾系列。",
        },
      },
      {
        id: "pencil",
        question: { en: "Which pencil can I use to line my lips?", zh: "想勾勒唇线，可以搭配哪支笔？" },
        answer: {
          en: "Under Lip & brow pencils, choose the Lip Mate Pencil in #04 Fig Breeze.",
          zh: "选择「唇线笔与眉笔」里的 #04 Fig Breeze 唇线笔。",
        },
      },
      {
        id: "balm",
        question: { en: "Which lip color comes in a balm stick?", zh: "想要膏状的有色润唇产品，可以选哪款？" },
        answer: {
          en: "Look under Tinted balm for Glasting Melting Lip Balm in shade #06.",
          zh: "在「有色润唇膏」里可以找到 #06 水光润唇膏。",
        },
      },
      {
        id: "brow",
        question: { en: "What shade is the brow pencil?", zh: "这里的眉笔是什么色号？" },
        answer: {
          en: "The Han All Flat Brow pencil comes in #W1 Gentle Brown.",
          zh: "扁头眉笔的色号是 #W1 自然棕，英文名为 Gentle Brown。",
        },
      },
    ],
  }),
  id: "yami-pages-landing-page-collection-page-romand",
  title: "YAMI/Pages/Landing Pages/Collection Templates/rom&nd",
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = {
  name: "Mobile",
  tags: ["preserve-story-name"],
  parameters: CollectionMobile.parameters,
  globals: CollectionMobile.globals,
};
