import topicMeta from "../TopicLandingPage/TopicLandingPage.stories";
import { createBeautyKeywordMeta } from "./beautyKeyword.fixture";
import { collectionMobile } from "./collectionTemplate";

export default {
  ...createBeautyKeywordMeta(topicMeta, {
    title: { en: "Lip Tints", zh: "唇釉" },
    faqSubject: { en: "lip tints", zh: "唇釉" },
    description: {
      en: "Shop Korean lip tints by finish, from rom&nd Almond Rose and CLIO Tender Fig to the soft blur of 3CE Double Wind.",
      zh: "按妆效挑选韩系唇釉。喜欢水光感，可以比较 rom&nd 的杏仁玫瑰色和 CLIO 的 Tender Fig；想要柔雾妆感，则可以看看 3CE 的 Double Wind。",
    },
    groups: [
      { value: "glossy", label: { en: "Glossy tints", zh: "水光唇釉" }, ids: ["1194269971", "1194337511", "1194226491", "1194269981", "1023242531", "1194270021", "1194270001"] },
      { value: "matte", label: { en: "Matte tints", zh: "柔雾唇釉" }, ids: ["1023657521", "1023140441"] },
    ],
    faq: [
      {
        id: "selection",
        question: { en: "Which shades can I compare for a glossy finish?", zh: "水光系列可以比较哪些色号？" },
        answer: {
          en: "Juicy Lasting shades include #14 Almond Rose, #15 Bare Fig, #22 Pomelo Skin, #35 Earl Grey Lychee and #42 Soy Fig.",
          zh: "果汁唇釉包括 #14 杏仁玫瑰、#15 Bare Fig、#22 柚子色、#35 伯爵荔枝和 #42 Soy Fig。",
        },
      },
      {
        id: "matte",
        question: { en: "Which shades can I compare for a matte finish?", zh: "想要柔雾妆效，可以比较哪两支？" },
        answer: {
          en: "Compare rom&nd #13 Cooling Up with 3CE Double Wind in Editor’s Picks.",
          zh: "可以在「编辑精选」里比较 rom&nd 的 #13 Cooling Up 和 3CE 的 Double Wind。",
        },
      },
      {
        id: "glossy-brands",
        question: { en: "Which other brands offer glossy tints?", zh: "除了 rom&nd，还有哪些水光唇釉？" },
        answer: {
          en: "Look for CLIO Crystal Glam Tint in #36 Tender Fig or Lilybyred Bloody Liar Coating Tint in #02 Sweet Rose Apple.",
          zh: "可以看看 CLIO 晶透水光唇釉 #36 Tender Fig 和 Lilybyred 镜面唇釉 #02 Sweet Rose Apple。",
        },
      },
      {
        id: "fig",
        question: { en: "Are Bare Fig, Soy Fig and Tender Fig from the same brand?", zh: "Bare Fig、Soy Fig 和 Tender Fig 是同一个品牌的吗？" },
        answer: {
          en: "Bare Fig (#15) and Soy Fig (#42) are rom&nd Juicy Lasting Tints. Tender Fig (#36) is a CLIO Crystal Glam Tint.",
          zh: "Bare Fig（#15）和 Soy Fig（#42）是 rom&nd 的果汁唇釉，Tender Fig（#36）是 CLIO 的晶透水光唇釉。",
        },
      },
      {
        id: "lip-liner",
        question: { en: "Where can I find a lip liner to pair with a tint?", zh: "想给唇釉搭配唇线笔，去哪里找？" },
        answer: {
          en: "Open rom&nd under Related Collections and look for the #04 Fig Breeze Lip Mate Pencil.",
          zh: "打开下方「相关专辑」中的 rom&nd，即可查看 #04 Fig Breeze 唇线笔。",
        },
      },
    ],
  }),
  id: "yami-pages-landing-page-collection-page-lip-tints",
  title: "YAMI/Pages/Landing Pages/Collection Templates/Lip Tints",
};

export const Pc = { name: "PC", tags: ["preserve-story-name"] };
export const Mobile = { ...collectionMobile, name: "Mobile", tags: ["preserve-story-name"] };
