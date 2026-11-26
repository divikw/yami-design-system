import { userEvent, waitFor, within } from "storybook/test";

import { createCollectionFaq } from "./collectionFaq.fixture";
import { createCollectionPageFixture } from "./collectionPage.fixture";
import { createRelatedCollections } from "./relatedCollections.fixture";
import { resolveTopicLandingScrollRoot } from "../TopicLandingPage/TopicLandingPage";
import type { TopicLandingPageRelatedKeywords } from "../TopicLandingPage/TopicLandingPage.types";
import type { TopicLandingPageLocale } from "../TopicLandingPage/fixtures";
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
const faqByLocale = createCollectionFaq({ en: "ANUA skincare", zh: "ANUA 护肤品" }, [
  {
    id: "selection",
    question: { en: "Which ANUA skincare products are featured here?", zh: "这里有哪些 ANUA 护肤品？" },
    answer: {
      en: "Editor’s Picks includes cleansers, toners and pads, serums, moisturizers, sunscreens and masks.",
      zh: "「编辑精选」收录了洁面、爽肤水与棉片、精华、乳液与面霜、防晒和面膜等商品。",
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
      zh: "可以在「编辑精选」里比较鱼腥草清洁卸妆油和鱼腥草洁面泡沫。",
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
    createPageFixture: (locale: TopicLandingPageLocale) => {
      const fixture = createCollectionPageFixture(locale, {
        showCouponUseLinks: false,
        newUserCouponCopy: locale === "en" ? {
          title: "10% OFF Your First Order",
          validity: "Valid for 7 days after claiming.",
        } : undefined,
      });
      return {
        ...fixture,
        couponSection: {
          ...fixture.couponSection,
          title: locale === "zh" ? "新人优惠" : "Welcome Offers",
        },
      };
    },
    createRelatedCollections,
    faqByLocale,
    relatedKeywordsByLocale,
    docs: {
      ...brandMeta.parameters.docs,
      description: {
        component:
          "This keyword collection uses Anua as its example, with a text introduction, a filterable product list, customer reviews, frequently asked questions, related collections, related keywords, Yami app downloads and service commitments.",
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
      catalogFilters: "brand" as const,
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
  const sectionTitles = canvasElement.querySelectorAll("main h2, footer h2, footer h3");
  for (const title of sectionTitles) {
    if (!title.matches("[data-section-heading] > div > [data-section-heading-title]")) {
      throw new Error("Collection module and footer titles must share the SectionHeading structure");
    }
    const headingRow = title.closest("[data-section-heading]")!;
    const headingStyle = getComputedStyle(headingRow);
    if (headingStyle.paddingBlockStart !== "2px" || headingStyle.paddingBlockEnd !== "2px") {
      throw new Error("Collection heading rows must have 2px of padding above and below");
    }
  }
  if (main.querySelector("#explore, #shop, #popular-picks")) {
    throw new Error("Brand collection must omit category shortcuts, the routine section, and Popular Picks");
  }
  const products = main.querySelector<HTMLElement>("#product-list");
  const coupons = hero.nextElementSibling;
  if (!products || coupons?.querySelectorAll('[data-slot="coupon"]').length !== 2 || coupons.nextElementSibling !== products || main.querySelector('[data-slot="topic-landing-tabs"]')) {
    throw new Error("The Brand introduction, coupons and product list must appear in order");
  }
  const couponPanel = coupons.querySelector<HTMLElement>('[data-horizontal-scroll-list="true"]');
  const desktop = canvasElement.ownerDocument.defaultView?.matchMedia("(min-width: 1024px)").matches;
  const couponHeading = within(coupons).getByRole("heading", {
    level: 2,
    name: globals.locale === "zh" ? "新人优惠" : "Welcome Offers",
  });
  const firstCoupon = coupons.querySelector('[data-slot="coupon"]')!;
  if (!couponPanel || getComputedStyle(coupons).rowGap !== (desktop ? "16px" : "12px") ||
      getComputedStyle(couponPanel).paddingBlockStart !== "0px" ||
      getComputedStyle(couponPanel).backgroundColor !== "rgba(0, 0, 0, 0)" ||
      Math.abs(firstCoupon.getBoundingClientRect().left - couponHeading.getBoundingClientRect().left) > 1) {
    throw new Error("The coupon list must use a transparent surface and align with the heading");
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
  const descriptionCopy = zh
    ? "关于在线选购 ANUA 护肤品，你想知道的，我们都为你解答。"
    : "We answer everything you want to know about shopping for ANUA skincare online.";
  const faqDescription = faq.getByText(descriptionCopy, { exact: true });
  if (faqDescription.previousElementSibling !== faq.getByRole("heading", { name: faqCopy.title, level: 2 }) ||
      faqRegion.getAttribute("aria-describedby") !== faqDescription.id) {
    throw new Error("The localized FAQ description must follow the section heading");
  }
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
  const appReviews = main.querySelector<HTMLElement>('[data-slot="user-reviews"]');
  if (!collectionsRegion || faqRegion.nextElementSibling !== collectionsRegion ||
      collectionsRegion.querySelectorAll("a[href]").length !== 6 || collectionsRegion.nextElementSibling !== keywordRegion ||
      tags.length !== keywords.items.length ||
      tags.some((tag, index) => tag.textContent?.trim() !== keywords.items[index])) {
    throw new Error("The FAQ must be followed by six related collections and then the localized keyword tags");
  }
  if (!appReviews || appReviews !== keywordRegion.nextElementSibling ||
      appReviews.lang !== (zh ? "zh" : "en") ||
      appReviews.dataset.dividerPosition !== "top" || appReviews.dataset.dividerVariant !== "gray") {
    throw new Error("The app download module must follow the keyword tags");
  }
  const appReviewsContainer = appReviews.querySelector('[data-slot="user-reviews-container"]')!;
  const containerStyle = getComputedStyle(appReviewsContainer);
  const contentWidth = appReviewsContainer.clientWidth -
    parseFloat(containerStyle.paddingInlineStart) - parseFloat(containerStyle.paddingInlineEnd);
  const downloadLinks = within(appReviews).getAllByRole("link");
  if (contentWidth < 640) {
    const downloadLabel = zh ? "下载亚米 App" : "Download the Yami app";
    if (downloadLinks.length !== 1 ||
        within(appReviews).getByRole("link", { name: downloadLabel }).getAttribute("href") !== `https://www.yami.com/us/${zh ? "zh" : "en"}/download`) {
      throw new Error("The mobile app download module must show one localized download button");
    }
  } else if (downloadLinks.length !== 3) {
    throw new Error("The desktop app download module must show the QR and both store links");
  }
  const serviceCommitment = within(main).getByRole("list", { name: zh ? "服务承诺" : "Service commitments" });
  const serviceCommitmentModule = appReviews.nextElementSibling;
  const commitmentCopy = within(serviceCommitment).getAllByRole("listitem").map((item) => item.textContent);
  const expectedCommitmentCopy = zh
    ? ["满$49免运费", "从美国发货", "当日送达*", "正品保证", "无忧退换"]
    : ["Free shipping from the US over $49", "Ships from the United States", "Same-day delivery*", "100% authentic ( & trendy! )", "Worry-Free Returns"];
  if (commitmentCopy.join("|") !== expectedCommitmentCopy.join("|")) {
    throw new Error("Service commitments must display the localized copy in homepage order");
  }
  if (!serviceCommitmentModule?.contains(serviceCommitment) || serviceCommitmentModule !== main.lastElementChild ||
      main.nextElementSibling?.getAttribute("data-slot") !== "footer" ||
      getComputedStyle(serviceCommitmentModule).borderBlockStartWidth !== "1px") {
    throw new Error("The localized service commitments must follow app reviews and precede the footer");
  }
  const appTitle = getComputedStyle(within(appReviews).getByRole("heading", { level: 2 }));
  const keywordTitle = getComputedStyle(within(keywordRegion).getByRole("heading", { level: 2 }));
  if (appTitle.fontSize !== keywordTitle.fontSize || appTitle.lineHeight !== keywordTitle.lineHeight ||
      appTitle.fontFamily !== keywordTitle.fontFamily || appTitle.fontWeight !== keywordTitle.fontWeight) {
    throw new Error("The app download title must match the collection section headings");
  }
  if (canvasElement.ownerDocument.defaultView?.matchMedia("(width < 1024px)").matches) {
    const bounds = tags.map(tag => tag.getBoundingClientRect());
    const rows = new Set(bounds.map(tag => tag.top));
    const scroller = keywordList.parentElement!;
    const scrolls = scroller.dataset.horizontalScrollList === "true";
    const narrow = canvasElement.ownerDocument.defaultView.matchMedia("(width <= 477px)").matches;
    if (keywordList.children.length !== tags.length || rows.size > 3 ||
        (narrow && !scrolls) ||
        (scrolls && (rows.size !== 3 || getComputedStyle(scroller).overflowX !== "auto" ||
          scroller.scrollWidth <= scroller.clientWidth)) ||
        bounds.some((tag, index) => index > 0 &&
          tag.top === bounds[index - 1].top && Math.abs(tag.left - bounds[index - 1].right - 8) > 1)) {
      throw new Error("Mobile keywords must use a single list with up to three rows and 8px gaps");
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
  const toolbarControls = within(toolbar);
  if (toolbarControls.queryByRole("button", { name: zh ? /^(筛选|分类)$/ : /^(Filters|Category)$/ })) {
    throw new Error("ANUA must use Brand in place of the all-filters and category controls");
  }
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
  const loadRemainingProducts = async () => {
    for (let shown = initialSize(); shown < allCount; shown += batchSize) {
      const moreButton = moreProducts();
      if (!moreButton) throw new Error("View more must stay available while products remain");
      await userEvent.click(moreButton);
      if (renderedCount() !== Math.min(shown + batchSize, allCount)) {
        throw new Error("View more must reveal up to six additional rows per click");
      }
    }
  };
  await loadRemainingProducts();
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

  const brandLabel = zh ? "品牌" : "Brand";
  const brandFilter = toolbarControls.getByRole("button", { name: brandLabel, exact: true });
  await userEvent.click(brandFilter);
  const brandMenu = within(await preview.findByRole("dialog", { name: brandLabel, exact: true }));
  await userEvent.click(brandMenu.getByRole("checkbox", { name: "ANUA", exact: true }));
  await userEvent.click(brandMenu.getByRole("button", { name: zh ? "查看商品" : "Show products" }));
  await waitFor(() => {
    if (brandFilter.getAttribute("aria-pressed") !== "true" || renderedCount() !== initialSize() || !moreProducts()) {
      throw new Error("Brand filtering must restore the three-row preview");
    }
  });
  await loadRemainingProducts();
  await waitFor(() => {
    if (renderedCount() !== allCount ||
        moreProducts() ||
        soldOutCards().length !== soldOutProductIds.size ||
        !notifyButtons().some((button) =>
          button.textContent?.trim() === notifiedLabel && button.getAttribute("aria-disabled") === "true",
        )) {
      throw new Error("Brand filtering must preserve sold-out and subscribed states");
    }
  });

  await userEvent.click(inStock());
  await waitFor(() => {
    if (inStock().getAttribute("aria-pressed") !== "true" ||
        soldOutCards().length !== 0 ||
        renderedCount() !== Math.min(initialSize(), allCount - soldOutProductIds.size)) {
      throw new Error("In Stock must hide sold-out cards within the selected brand");
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

  const [newUserCoupon, appShippingCoupon] = coupons.querySelectorAll<HTMLElement>('[data-slot="coupon"]');
  if (!zh) {
    within(newUserCoupon).getByText("10% OFF Your First Order", { exact: true });
    within(newUserCoupon).getByText("Valid for 7 days after claiming.", { exact: true });
  }
  const claimLabel = zh ? "领取" : "Claim";
  const claimedLabel = zh ? "已领取" : "Claimed";
  await userEvent.click(within(newUserCoupon).getByRole("button", { name: claimLabel, exact: true }));
  await within(newUserCoupon).findByText(claimedLabel, { exact: true });
  await within(newUserCoupon).findByText(zh ? /^可用至 / : /^Valid until /);
  await userEvent.click(within(appShippingCoupon).getByRole("button", { name: claimLabel, exact: true }));
  await within(appShippingCoupon).findByText(claimedLabel, { exact: true });
  if (coupons.querySelector("a[href]")) {
    throw new Error("Claimed Anua coupons must show status text");
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
