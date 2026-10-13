import type {
  SocialMediaGalleryProps,
  SocialVideoCardProps,
} from "./SocialMediaGallery.types";

export type SocialMediaGalleryLocale = "zh" | "en";

const assets = {
  instagram:
    "https://cdn.yamibuy.net/mkt/a37da925bdf1ad011a80eeb801c38b52_0x0.png",
  posters: [
    new URL("./assets/social-1.jpg", import.meta.url).href,
    new URL("./assets/social-2.jpg", import.meta.url).href,
    new URL("./assets/social-3.jpg", import.meta.url).href,
    new URL("./assets/social-4.jpg", import.meta.url).href,
    new URL("./assets/social-5.jpg", import.meta.url).href,
    new URL("./assets/social-6.jpg", import.meta.url).href,
  ],
  products: [
    new URL("./assets/product-1.png", import.meta.url).href,
    new URL("./assets/product-2.png", import.meta.url).href,
    new URL("./assets/product-3.png", import.meta.url).href,
    new URL("./assets/product-4.png", import.meta.url).href,
    new URL("./assets/product-5.png", import.meta.url).href,
  ],
};

const copy = {
  zh: {
    title: "社交媒体热门",
    mobileTitle: "真实用户，真实分享",
    viewAll: "查看全部",
    previous: "上一组社交内容",
    next: "下一组社交内容",
    captions: [
      "黑五正是焕新家居的好时机！",
      "深夜拉面也能做出餐厅级满足感。",
      "这盘眼影的日常配色太实用了。",
      "火鸡面这样搭配，辣得更有层次。",
      "户外也要记得补涂防晒。",
      "香菜爱好者一定要试试这道菜。",
    ],
  },
  en: {
    title: "Real People, Real Reviews",
    // Same as the desktop title now, so English reads one line at every width.
    // Chinese still swaps, which is what the prop is for.
    mobileTitle: "Real People, Real Reviews",
    viewAll: "See all",
    previous: "Previous social posts",
    next: "Next social posts",
    captions: [
      "Black Friday is the moment to give your home a refresh!",
      "Your ramen is in its flop era — this fixes it.",
      "An everyday palette that works for every look.",
      "Love Buldak but cannot handle the heat? Try this.",
      "Keep your skin protected all day outdoors.",
      "When the recipe says add cilantro, add more.",
    ],
  },
} as const;

export function createSocialVideoCards(
  locale: SocialMediaGalleryLocale,
): SocialVideoCardProps[] {
  const localeCopy = copy[locale];

  return Array.from({ length: 8 }, (_, index) => {
    const assetIndex = index % assets.posters.length;
    const withoutProducts = index % 4 === 3;
    const singleProduct = index % 3 === 0;
    const products = withoutProducts
      ? []
      : singleProduct
      ? [
          {
            id: `social-product-${index + 1}`,
            imageSrc: assets.products[assetIndex % assets.products.length],
            imageAlt: locale === "en" ? "Featured product" : "视频同款商品",
            title:
              locale === "en"
                ? "Daily moisture and sun care favorite"
                : "日常补水防晒人气单品",
            href: `#social-product-${index + 1}`,
          },
        ]
      : Array.from({ length: 3 }, (_, productIndex) => ({
          id: `social-product-${index + 1}-${productIndex + 1}`,
          imageSrc:
            assets.products[(assetIndex + productIndex) % assets.products.length],
          imageAlt:
            locale === "en"
              ? `Featured product ${productIndex + 1}`
              : `视频同款商品 ${productIndex + 1}`,
          href: `#social-product-${index + 1}-${productIndex + 1}`,
        }));

    return {
      id: `social-video-${index + 1}`,
      posterSrc: assets.posters[assetIndex],
      posterAlt: localeCopy.captions[assetIndex],
      username: index % 2 === 0 ? "@yamibuy" : "@yamiselect",
      platformIconSrc: assets.instagram,
      caption: localeCopy.captions[assetIndex],
      href: `#social-video-${index + 1}`,
      products,
      ...(!withoutProducts && !singleProduct
        ? { additionalProductCount: 2 }
        : {}),
    };
  });
}

export function createSocialMediaGalleryFixture(
  locale: SocialMediaGalleryLocale,
): SocialMediaGalleryProps {
  const localeCopy = copy[locale];
  const imageCards = createSocialImageCards(locale);
  return {
    title: localeCopy.title,
    mobileTitle: localeCopy.mobileTitle,
    cards: [
      ...imageCards.slice(0, 2),
      {
        id: "social-matcha-video",
        posterSrc: "https://cdn.yamibuy.net/vod/2022/scraper_video_transcode/1778058085205rked/scraper_850.0000000.jpg",
        posterAlt: locale === "zh" ? "丸久小山园抹茶分享" : "Marukyu Koyamaen matcha review",
        videoSrc: "https://cdn.yamibuy.net/file/common/902396df74364960953664c4c6c21414.mp4",
        username: locale === "zh" ? "@Yami亚米" : "@Yami",
        caption: locale === "zh" ? "在家制作抹茶饮品。" : "Make matcha drinks at home.",
        products: [{
          id: "social-matcha-product",
          imageSrc: "https://cdn.yamibuy.net/item/f2bf76e03ba1580e3760e6239fc9ea1c_120x120.webp",
          imageAlt: locale === "zh" ? "丸久小山园又玄抹茶粉" : "Marukyu Koyamaen Yugen matcha",
          title: locale === "zh" ? "丸久小山园 · 又玄抹茶粉 40g" : "Marukyu Koyamaen · Yugen Matcha, 40g",
        }],
      },
      imageCards[2],
      ...createSocialVideoCards(locale).slice(4).map((card) => ({ ...card, href: undefined })),
    ],
    viewAllHref: "#all-social-videos",
    viewAllLabel: localeCopy.viewAll,
    previousLabel: localeCopy.previous,
    nextLabel: localeCopy.next,
  };
}

// Image-post covers and associated thumbnails observed on the public Chinese
// homepage on 2026-10-13. The Starman sample includes three observed frames
// from the original multi-image post; +N counts products, not images.
export function createSocialImageCards(
  locale: SocialMediaGalleryLocale,
): SocialVideoCardProps[] {
  const posts = [
    {
      id: "udon",
      cover: "a7589936d294cc6057b969accfaa3e65",
      caption: locale === "zh" ? "番茄乌冬面，简单几步就能复刻。" : "Tomato udon in a few simple steps.",
      products: [
        { hash: "d5f854672691aab42760c89d5258e288", name: locale === "zh" ? "李锦记番茄汤底" : "Lee Kum Kee tomato soup base" },
        { hash: "366ab3cc3cefd3d46dc56d2e6669d5ee", name: locale === "zh" ? "李锦记薄盐生抽" : "Lee Kum Kee light soy sauce" },
      ],
    },
    {
      id: "starman",
      cover: "0a4c7233e4f8f4ab0c420e7a2989a9e2",
      images: [
        "0a4c7233e4f8f4ab0c420e7a2989a9e2",
        "f41e87e693e3e300343dd0de52c8d4e6",
        "02f639dff5460b2209ce5f43676ce9fd",
      ],
      caption: locale === "zh" ? "星星人餐具，让吃饭更有仪式感。" : "Starman tableware for a playful everyday table.",
      products: [
        { hash: "203419373a3832ae2d31508f0f69f0f4", name: locale === "zh" ? "星星人泰迪饼干款深盘" : "Starman Teddy Biscuit deep plates" },
        { hash: "91664e19dcb6bc2590e57dbbeb3ea164", name: locale === "zh" ? "星星人苹果款深盘" : "Starman Apple deep plate" },
      ],
      additionalProductCount: 2,
    },
    {
      id: "new-finds",
      cover: "a0fc2b1ea64b303d6aaa35304ae37369",
      caption: locale === "zh" ? "这个月入手的新品，一起交换好物清单。" : "New finds this month. Share your favorites.",
      products: [
        { hash: "2d8ef323b694f380a4f255dc0f75eec2", name: locale === "zh" ? "含羞草固体杨枝甘露" : "Mango pomelo sago fruit snacks" },
        { hash: "8b077cb830a4e8359148352461e63d3b", name: locale === "zh" ? "海底捞东北风味麻辣烫" : "Haidilao self-heating hot pot" },
      ],
      additionalProductCount: 2,
    },
  ];

  return posts.map((post) => ({
    id: `social-image-${post.id}`,
    posterSrc: `https://cdn.yamibuy.net/common/${post.cover}_0x0.jpg`,
    images: post.images?.map((image) => `https://cdn.yamibuy.net/common/${image}_0x0.jpg`),
    posterAlt: post.caption,
    username: locale === "zh" ? "@Yami亚米" : "@Yami",
    caption: post.caption,
    products: post.products.map((product, index) => ({
      id: `${post.id}-product-${index + 1}`,
      imageSrc: `https://cdn.yamibuy.net/item/${product.hash}_120x120.webp`,
      imageAlt: product.name,
    })),
    additionalProductCount: post.additionalProductCount,
  }));
}
