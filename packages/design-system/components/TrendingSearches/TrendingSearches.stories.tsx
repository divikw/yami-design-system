import type { Meta, StoryObj } from "@storybook/react-vite";

import { TrendingSearches } from "./TrendingSearches";
import storyStyles from "./TrendingSearches.stories.module.css";
import {
  createTrendingSearchesProps,
  type TrendingSearchesLocale,
} from "./fixtures";

function localeFromGlobals(value: unknown): TrendingSearchesLocale {
  return value === "en" ? "en" : "zh";
}

const meta = {
  id: "yami-components-commerce-trending-searches",
  title: "YAMI/Modules/Commerce/Trending Searches",
  component: TrendingSearches,
  argTypes: {
    dividerPosition: { description: "分割线位置：top 顶部、bottom 底部、none 不显示；仅 PC 生效。" },
    dividerVariant: { description: "分割线样式：gray 为 1px 灰色分割线，black 为 2px 强调分割线。" },
    title: { description: "模块标题。" },
    headingAlign: { description: "标题对齐方式：start 左对齐，center 居中；PC 居中时翻页按钮显示在内容区两侧。", options: ["start", "center"], control: { type: "radio" } },
    mobileTitle: { description: "小于 1024px 时显示的移动端标题；未设置时使用 title。" },
    keywords: { description: "按排名排列的搜索词及关联商品，包含搜索链接、推荐说明和移动端缩略图；PC 每个搜索词展示前两个商品，移动端可横向滚动查看全部商品。" },
    seeAllLabel: { description: "PC 搜索词卡片的“查看全部”链接文案。" },
    previousLabel: { description: "PC 上一页按钮的无障碍名称。" },
    nextLabel: { description: "PC 下一页按钮的无障碍名称。" },
    expandLabel: { description: "根据搜索词生成移动端展开按钮的无障碍名称。" },
    defaultExpandedId: { description: "移动端默认展开的搜索词 ID；未设置时展开排名第一项，各项可独立展开和收起。" },
    onAddToCart: { description: "点击商品加购按钮时的回调，参数为商品 ID。" },
    imageLoadingStrategy: { description: "商品图片加载策略：native 使用原生懒加载，windowed 根据可视窗口加载。" },
  },
  decorators: [
    (Story) => (
      <div
        className={storyStyles.pageCanvas}
        data-slot="trending-searches-story-canvas"
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "**稳定版**：PC 和 Mobile 已完成评审。\n\n热门搜索模块：PC 使用横向搜索词卡片，每项展示前两个关联商品；Mobile 使用排名折叠列表，各项可独立展开，横向浏览关联商品并进入搜索结果。",
      },
      // Rendered in its own frame, like BrandProductRail and Footer. Inline,
      // the component sits in the docs document and its media queries read the
      // browser's width while its box is only the docs column — so a wide
      // window put four keyword cards inside 800px and shredded the copy. In a
      // frame the width it measures is the width it gets, which below 1024
      // means the docs page shows the accordion.
      story: { inline: false, height: "880px" },
    },
  },
  args: createTrendingSearchesProps("zh"),
} satisfies Meta<typeof TrendingSearches>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  tags: ["!dev", "!autodocs"],
  render: (args, { globals }) => (
    <TrendingSearches
      {...createTrendingSearchesProps(localeFromGlobals(globals.locale))}
      headingAlign={args.headingAlign}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="trending-searches"]',
    );
    if (!root) throw new Error("Trending searches did not render");

    const heading = root.querySelector<HTMLElement>(
      '[data-slot="trending-searches-title"]',
    );
    if (!heading || getComputedStyle(heading).fontSize !== "24px") {
      throw new Error("Desktop trending searches title must use the 24px display-sm token");
    }

    const items = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="trending-searches-item"]'),
    );
    if (items.length === 0) throw new Error("No keyword cards rendered");

    // Artwork that 404s still renders a card of the right size in the right
    // place, so every geometry check below passes over a section of alt text.
    // Only the images themselves say whether the fixture resolves.
    const images = Array.from(root.querySelectorAll("img")).filter(
      (image) => getComputedStyle(image).display !== "none",
    );
    if (images.length === 0) throw new Error("No product artwork rendered");
    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            image.loading = "eager";
            if (image.complete) return resolve();
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    );
    const brokenImage = images.find((image) => image.naturalWidth === 0);
    if (brokenImage) {
      throw new Error(
        `Artwork failed to load: ${brokenImage.getAttribute("src")}`,
      );
    }

    // Desktop is a set of links, not an accordion. The toggles are display:
    // none, which keeps them out of the accessibility tree — a reader must not
    // meet a control that does nothing here.
    const toggles = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-slot="trending-searches-toggle"]',
      ),
    );
    const liveToggle = toggles.find(
      (toggle) => getComputedStyle(toggle).display !== "none",
    );
    if (liveToggle) {
      throw new Error(
        "Desktop must not render the mobile row toggles — every card is already open",
      );
    }

    // Every card shows its results whatever the accordion state says, since
    // the state is the mobile layout's and its control is not rendered.
    const closedPanel = items.find((item) => {
      const panel = item.querySelector<HTMLElement>(
        '[data-slot="trending-searches-panel"]',
      );
      return !panel || getComputedStyle(panel).display === "none";
    });
    if (closedPanel) {
      throw new Error("Every desktop keyword card must show its results");
    }

    // Each card previews the leading two results and keeps the rest for the
    // mobile rail — asserting both halves, since a card that rendered only two
    // would pass a visible-count check while leaving mobile nothing to scroll.
    const firstCard = items[0];
    const firstPanel = firstCard.querySelector<HTMLElement>(
      '[data-slot="trending-searches-panel"]',
    );
    const firstCardTop = firstPanel?.firstElementChild;
    const firstRank = firstCardTop?.firstElementChild?.firstElementChild;
    const firstKeyword = firstCard.querySelector<HTMLElement>(
      '[data-slot="trending-searches-keyword"]',
    );
    if (
      !(firstCardTop instanceof HTMLElement) ||
      !(firstRank instanceof HTMLElement) ||
      !firstKeyword
    ) {
      throw new Error("Desktop keyword card header did not render");
    }
    const itemRowGap = getComputedStyle(firstCard).rowGap;
    const panelRowGap = getComputedStyle(firstPanel).rowGap;
    const cardTopRowGap = getComputedStyle(firstCardTop).rowGap;
    const rankStyle = getComputedStyle(firstRank);
    const keywordFontSize = getComputedStyle(firstKeyword).fontSize;
    if (
      itemRowGap !== "4px" ||
      panelRowGap !== "4px" ||
      cardTopRowGap !== "4px" ||
      rankStyle.width !== "16px" ||
      rankStyle.flexBasis !== "16px" ||
      rankStyle.textAlign !== "center" ||
      keywordFontSize !== "20px"
    ) {
      throw new Error(
        `Desktop keyword card geometry is incorrect: gaps ${itemRowGap}/${panelRowGap}/${cardTopRowGap}, rank ${rankStyle.width}/${rankStyle.flexBasis}/${rankStyle.textAlign}, keyword ${keywordFontSize}`,
      );
    }
    const products = Array.from(
      firstCard.querySelectorAll<HTMLElement>("li"),
    ).filter((node) => node.querySelector('[data-slot="product-card"]'));
    if (products.length < 3) {
      throw new Error(
        `A keyword card must carry more results than it previews, got ${products.length}`,
      );
    }
    const visible = products.filter(
      (product) => getComputedStyle(product).display !== "none",
    );
    if (visible.length !== 2) {
      throw new Error(
        `Desktop keyword cards preview two results, got ${visible.length}`,
      );
    }

    // The rail shows a whole number of cards per view — two below 1280, three
    // from 1280 through 1679, and four from 1680. Deriving the
    // expected count from the width rather than restating the media queries,
    // so this checks the rule and not the copy of it.
    const rail = root.querySelector<HTMLElement>(
      '[data-slot="trending-searches-list"]',
    );
    if (!rail) throw new Error("Rail did not render");
    const railWidth = rail.clientWidth;
    const perView = railWidth >= 1680 - 96 ? 4 : railWidth >= 1280 - 96 ? 3 : 2;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const cardWidth = items[0].getBoundingClientRect().width;
    const filled = perView * cardWidth + (perView - 1) * gap;
    if (Math.abs(filled - railWidth) > 1) {
      throw new Error(
        `${perView} cards and ${perView - 1} gaps must fill the rail: ${filled}px in ${railWidth}px`,
      );
    }

    // The tagline holds exactly two lines whether or not the copy fills them,
    // so every card's products start on the same line. Checking the product
    // rows rather than the tagline heights: the alignment is the point, and a
    // future change could keep it by other means.
    const productTops = new Set(
      items.map((item) =>
        Math.round(
          item.querySelector("ul")?.getBoundingClientRect().top ?? Number.NaN,
        ),
      ),
    );
    if (productTops.size !== 1) {
      throw new Error(
        `Every keyword card's results must start on the same line, got tops ${[...productTops].join(", ")}`,
      );
    }
    const taglineText = firstCard.querySelector<HTMLElement>("p span");
    if (!taglineText) throw new Error("Tagline did not render");
    const taglineLines =
      taglineText.getBoundingClientRect().height /
      parseFloat(getComputedStyle(taglineText).lineHeight);
    if (Math.round(taglineLines) !== 2) {
      throw new Error(
        `The tagline box must be two lines tall, measured ${taglineLines}`,
      );
    }
    // Bounded as well as reserved — copy longer than two lines must clip
    // rather than push the products out of the card.
    if (taglineText.scrollHeight > taglineText.clientHeight + 1) {
      const clamp = getComputedStyle(taglineText).webkitLineClamp;
      if (clamp !== "2") {
        throw new Error(
          `Overflowing tagline copy must clamp at two lines, got ${clamp}`,
        );
      }
    }

    // The media panel must not introduce a surface of its own inside the
    // product tile. Comparing it against the tile rather than naming a colour,
    // since the point is that the two are indistinguishable — matching the
    // themed and atmospheric lists, which reach it by painting the media white.
    const media = firstCard.querySelector<HTMLElement>(
      '[data-slot="product-card-image"]',
    );
    const tile = media?.closest<HTMLElement>('[data-slot="card"]');
    if (!media || !tile) throw new Error("Product media did not render");
    const mediaBg = getComputedStyle(media).backgroundColor;
    const tileBg = getComputedStyle(tile).backgroundColor;
    const transparent = /rgba\(0, 0, 0, 0\)|transparent/.test(mediaBg);
    if (!transparent && mediaBg !== tileBg) {
      throw new Error(
        `Product media must not paint its own surface: ${mediaBg} against a ${tileBg} tile`,
      );
    }

    const link = firstCard.querySelector<HTMLAnchorElement>(
      '[data-slot="trending-searches-see-all"]',
    );
    const keyword = firstCard.querySelector<HTMLElement>(
      '[data-slot="trending-searches-keyword"]',
    );
    if (!link || !keyword || getComputedStyle(link).display === "none") {
      throw new Error("Each desktop card must link to the term's results");
    }
    // Six links reading "See all" and nothing else are six identical links in
    // a reader's link list. The term is appended out of sight so they differ.
    const term = keyword.textContent?.trim() ?? "";
    if (!term || !link.textContent?.includes(term)) {
      throw new Error(
        `The see-all link must name its term: "${link.textContent}" does not contain "${term}"`,
      );
    }

    // The link is caption type — 41x20, sized to sit beside a heading rather
    // than to be hit. Probing what the pointer actually lands on, since the
    // target is an overlay and its own box stays small on purpose.
    const linkBox = link.getBoundingClientRect();
    const centreX = linkBox.left + linkBox.width / 2;
    const centreY = linkBox.top + linkBox.height / 2;
    const reach = 44 / 2 - 1;
    const hits = (x: number, y: number) =>
      Boolean(
        link.ownerDocument
          .elementFromPoint(x, y)
          ?.closest('[data-slot="trending-searches-see-all"]'),
      );
    const missed = [
      ["above", centreX, centreY - reach],
      ["below", centreX, centreY + reach],
      ["left", centreX - Math.max(linkBox.width, 44) / 2 + 1, centreY],
      ["right", centreX + Math.max(linkBox.width, 44) / 2 - 1, centreY],
    ].find(([, x, y]) => !hits(x as number, y as number));
    if (missed) {
      throw new Error(
        `The see-all link must answer a 44px pointer target; ${missed[0]} of centre did not hit it`,
      );
    }
  },
};

export const Pc: Story = {
  name: "PC",
  render: Showcase.render,
  play: import.meta.env.MODE === "test" ? Showcase.play : undefined,
  parameters: { viewport: { defaultViewport: "yamiDesktopLg" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiDesktopLg", isRotated: false } }
    : {},
};

export const MobileAccordion: Story = {
  name: "Mobile",
  parameters: { viewport: { defaultViewport: "yamiMobile" } },
  globals: import.meta.env.MODE === "test"
    ? { viewport: { value: "yamiMobile", isRotated: false } }
    : {},
  render: Showcase.render,
  play: import.meta.env.MODE === "test" ? async ({ canvasElement, userEvent }) => {
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-slot="trending-searches"]',
    );
    if (!root) throw new Error("Trending searches did not render");

    const items = Array.from(
      root.querySelectorAll<HTMLElement>('[data-slot="trending-searches-item"]'),
    );
    const toggles = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        '[data-slot="trending-searches-toggle"]',
      ),
    );
    if (toggles.length !== items.length) {
      throw new Error("Every mobile row must be a toggle");
    }

    // Opening closed would show six words and nothing else, so the top-ranked
    // term starts open.
    const openCount = items.filter(
      (item) => item.dataset.expanded === "true",
    ).length;
    if (openCount !== 1 || items[0].dataset.expanded !== "true") {
      throw new Error(
        `The top term must start open and be the only one, got ${openCount} open`,
      );
    }
    if (toggles[0].getAttribute("aria-expanded") !== "true") {
      throw new Error("The open row's toggle must report aria-expanded=true");
    }
    if (
      toggles.some((toggle) => getComputedStyle(toggle).columnGap !== "8px")
    ) {
      throw new Error("Mobile accordion rows must use an 8px column gap");
    }
    const chevrons = toggles.map((toggle) => toggle.querySelector("svg"));
    if (
      chevrons.some((chevron) => {
        if (!chevron) return true;
        const style = getComputedStyle(chevron);
        return (
          style.width !== "12px" ||
          style.height !== "12px" ||
          style.marginInlineEnd !== "4px"
        );
      })
    ) {
      throw new Error(
        "Mobile accordion chevrons must be 12px with 4px inline-end spacing",
      );
    }

    const panelOf = (index: number) =>
      items[index].querySelector<HTMLElement>(
        '[data-slot="trending-searches-panel"]',
      );
    const firstPanel = panelOf(0);
    const secondPanel = panelOf(1);
    if (!firstPanel || !secondPanel) throw new Error("Panels did not render");
    const mobileTagline = firstPanel.querySelector<HTMLElement>("p");
    if (!mobileTagline) throw new Error("Mobile tagline did not render");
    const mobileTaglineStyle = getComputedStyle(mobileTagline);
    if (
      mobileTaglineStyle.fontSize !== "12px" ||
      mobileTaglineStyle.paddingTop !== "4px" ||
      mobileTaglineStyle.paddingRight !== "8px" ||
      mobileTaglineStyle.paddingBottom !== "4px" ||
      mobileTaglineStyle.paddingLeft !== "8px" ||
      mobileTaglineStyle.columnGap !== "12px"
    ) {
      throw new Error(
        "Mobile tagline must use 12px text, 4px vertical padding, 8px inline padding, and a 12px column gap",
      );
    }
    if (getComputedStyle(secondPanel).display !== "none") {
      throw new Error("A closed row must not show its results");
    }

    // The mobile rail scrolls the whole result set rather than previewing two.
    const railProducts = Array.from(
      firstPanel.querySelectorAll<HTMLElement>("li"),
    ).filter((node) => node.querySelector('[data-slot="product-card"]'));
    const hidden = railProducts.filter(
      (product) => getComputedStyle(product).display === "none",
    );
    if (railProducts.length < 3 || hidden.length > 0) {
      throw new Error(
        `Mobile must scroll every result, ${hidden.length} of ${railProducts.length} were hidden`,
      );
    }

    const explore = firstPanel.querySelector<HTMLElement>(":scope > a");
    if (!explore || getComputedStyle(explore).height !== "32px") {
      throw new Error(
        `Mobile explore action must use the 32px sm visual height, got ${explore ? getComputedStyle(explore).height : "missing"}`,
      );
    }

    // The section is one of the page's white cards on the grey canvas.
    const container = firstPanel.closest("section")
      ?.firstElementChild as HTMLElement | null;
    if (!container) throw new Error("Section container did not render");
    const containerStyle = getComputedStyle(container);
    if (
      containerStyle.marginInlineStart !== "8px" ||
      containerStyle.borderRadius !== "12px"
    ) {
      throw new Error(
        `Mobile section must inset as a card, got margin ${containerStyle.marginInlineStart} and radius ${containerStyle.borderRadius}`,
      );
    }

    // The row thumbnail composites like ProductCard's media: the tile carries
    // the fill and the shot multiplies onto it. A background alone shows
    // nothing — the catalogue's photos are opaque squares that cover the tile
    // — and an element cannot blend with its own background, so tile and image
    // have to be separate elements. All three parts are checked because any
    // one of them missing silently returns a plain white square.
    const thumbnailImage = toggles[0].querySelector("img");
    const thumbnailTile = thumbnailImage?.parentElement;
    if (!thumbnailImage || !thumbnailTile) {
      throw new Error("Row thumbnail did not render");
    }
    const tileStyle = getComputedStyle(thumbnailTile);
    const imageStyle = getComputedStyle(thumbnailImage);
    if (thumbnailTile === toggles[0]) {
      throw new Error(
        "Row thumbnail needs a tile of its own — an image cannot blend with its own background",
      );
    }
    if (tileStyle.backgroundColor === "rgba(0, 0, 0, 0)") {
      throw new Error("Row thumbnail tile must carry the fill behind the shot");
    }
    if (imageStyle.mixBlendMode !== "multiply") {
      throw new Error(
        `Row thumbnail must multiply onto its tile like product media does, got ${imageStyle.mixBlendMode}`,
      );
    }
    if (tileStyle.borderRadius !== "4px") {
      throw new Error(
        `Row thumbnail tile is 4px-cornered, got ${tileStyle.borderRadius}`,
      );
    }

    // The rank is a fixed 24px column so the rows read as a ranked list.
    // Proving it by the thing it protects: forcing a two-digit rank must not
    // move the thumbnails, which is exactly what a shrink-to-fit rank does
    // once a list reaches 10.
    const thumbnailLefts = () =>
      toggles.map((toggle) =>
        Math.round(
          toggle.querySelector("img")?.getBoundingClientRect().left ??
            Number.NaN,
        ),
      );
    const beforeLefts = thumbnailLefts();
    if (new Set(beforeLefts).size !== 1) {
      throw new Error(
        `Row thumbnails must share one left edge, got ${[...new Set(beforeLefts)].join(", ")}`,
      );
    }
    const probe = toggles[0].firstElementChild as HTMLElement;
    const probeText = probe.textContent;
    probe.textContent = "10";
    const shifted = thumbnailLefts()[0] !== beforeLefts[0];
    probe.textContent = probeText;
    if (shifted) {
      throw new Error(
        "A two-digit rank moved its row's thumbnail — the rank column is not holding a fixed width",
      );
    }

    // One 8px pad, on the card, and nothing inside pads again — the sequence
    // SocialMediaGallery uses at this width. Checking the heading's position
    // rather than its padding: what matters is that it starts on the card's
    // inner edge, however that is achieved.
    const pads = [
      containerStyle.paddingTop,
      containerStyle.paddingRight,
      containerStyle.paddingBottom,
      containerStyle.paddingLeft,
    ];
    if (pads.some((pad) => pad !== "8px")) {
      throw new Error(
        `The mobile card pads once at 8px, got ${pads.join(" ")}`,
      );
    }
    const heading = container.querySelector<HTMLElement>(
      '[data-slot="trending-searches-heading"]',
    );
    if (!heading) throw new Error("Heading did not render");
    const headingInset =
      heading.getBoundingClientRect().left -
      container.getBoundingClientRect().left;
    if (Math.abs(headingInset - 8) > 1) {
      throw new Error(
        `The shared heading must start on the card's inner edge, sat ${headingInset}px in`,
      );
    }

    // The inset and the corner only read against the grey page the section is
    // designed to sit on. On the default white canvas the card is white on
    // white and the whole mobile layout looks like it has no edges.
    const storyCanvas = canvasElement.querySelector<HTMLElement>(
      '[data-slot="trending-searches-story-canvas"]',
    );
    if (!storyCanvas) throw new Error("Story canvas did not render");
    const canvasBg = getComputedStyle(storyCanvas).backgroundColor;
    if (canvasBg === containerStyle.backgroundColor) {
      throw new Error(
        `The mobile preview must stand the card on the grey page canvas, both were ${canvasBg}`,
      );
    }

    await userEvent.click(toggles[1]);
    if (
      items[1].dataset.expanded !== "true" ||
      items[0].dataset.expanded !== "true"
    ) {
      throw new Error(
        "Opening another row must keep the previously expanded row open",
      );
    }
    if (
      toggles[0].getAttribute("aria-expanded") !== "true" ||
      toggles[1].getAttribute("aria-expanded") !== "true"
    ) {
      throw new Error("Each open row must report aria-expanded=true");
    }
    if (
      getComputedStyle(firstPanel).display === "none" ||
      getComputedStyle(secondPanel).display === "none"
    ) {
      throw new Error("Each expanded row must keep its results visible");
    }

    await userEvent.click(toggles[1]);
    if (
      items[1].dataset.expanded !== "false" ||
      items[0].dataset.expanded !== "true"
    ) {
      throw new Error("Closing one row must not change another expanded row");
    }
    if (
      getComputedStyle(secondPanel).display !== "none" ||
      getComputedStyle(firstPanel).display === "none"
    ) {
      throw new Error("Only the row clicked a second time should hide");
    }

    // Restore the preview after the interaction check without changing real keyboard focus styles.
    toggles[1].blur();
  } : undefined,
};

export const Centered: Story = {
  tags: ["!dev", "!autodocs"],
  render: Showcase.render,
  args: { headingAlign: "center" },
  globals: { viewport: { value: "yamiDesktopLg", isRotated: false } },
};
