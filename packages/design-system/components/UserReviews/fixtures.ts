import type { UserReviewsProps } from "./UserReviews";

const appStore = {
  href: "https://apps.apple.com/us/app/yami-shop-all-of-asias-best/id981366229",
  iconSrc: new URL("./assets/app-store.png", import.meta.url).href,
};
const googlePlay = {
  href: "https://play.google.com/store/apps/details?id=com.yamibuy.yamiapp",
  iconSrc: new URL("./assets/google-play.svg", import.meta.url).href,
};
export const userReviewsExamples = {
  zh: {
    locale: "zh",
    download: {
      appStore,
      googlePlay,
      qr: { href: "https://www.yami.com/us/zh/download", src: new URL("./assets/download-qr-zh.png", import.meta.url).href },
    },
    reviewColumns: [
      [
        { id: "zh-1", author: "消防车***", quote: "北美最好的亚洲app，身边朋友都喜欢" },
        { id: "zh-2", author: "顺顺服***", quote: "我买到的宝贝都很靠谱，质量没得说、说明平台选择货品的眼光和把关让人放心👍" },
        { id: "zh-3", author: "god***", quote: "这是我第二次在亚米买东西，比较了几家店铺还是很靠谱的卖家，质量放心，买够还包邮！这次正赶上店庆搞活动，心仪的东东就买齐了！" },
      ],
      [
        {
          id: "zh-4",
          author: "Spi***",
          quote: "物美价廉正品好货。我们这边华人超市很小，买的酱油料酒味道都很古怪，原先以为是我自己的问题，问亲戚朋友都这个反应，于是我怀疑它们进货渠道有问题。亚马逊上价格非常高也不确定真假，还是亚米放心，我刚上学那会儿就开始做了，兢兢业业十多年，品质我还是很放心的。",
        },
        { id: "zh-5", author: "Sar***", quote: "无意中被同学安利了亚米，简直打开了新世界。我的零食问题都在亚米解决了，还有好多很好用的日韩美妆产品，怕是这几年钱包要交给亚米了我爱亚米" },
        { id: "zh-6", author: "Roc***", quote: "超多我喜欢的食品，护肤品！常常有新品有惊喜！" },
      ],
      [
        { id: "zh-7", author: "给策划***", quote: "留学党福音 亚米的网站一直做的很好 分类 商品都很齐全 还慢慢添加了不少东西" },
        { id: "zh-8", author: "Goo***", quote: "可以买到不少日本韩国的好货，还有台湾同中国大陆的零食，发货速度好快，大爱" },
        { id: "zh-9", author: "zgu***", quote: "今年是亚米网陪伴我的第七年。身在异国他乡，还能尝到新鲜家乡的美食都得感谢有亚米网的陪伴。每次回到家能收到亚米的包裹我都很激动。而且价额实惠，时不时还有折扣。" },
        { id: "zh-10", author: "蔚小威***", quote: "在美国的日子不能没有亚米网呀！ 好吃的好用的应用在这搞定吧！" },
      ],
      [
        { id: "zh-11", author: "Kik***", quote: "购物体验太棒了！货品一目了然 下单很方便 发货速度比其他同类华人购物网站快好多！ 给100个赞？希望亚米越来越好！❤❤❤" },
        {
          id: "zh-12",
          author: "饕餮一***",
          quote: "最重要的是可以买到很多很多国内才有的零食，物流非常非常快和在中国买东西感觉很像。怎么说呢！非常感谢吧！因为也没办法经常回去也没有时间跑那么远去华人区买....感觉这些零食对我很重要虽然回不去但是能吃到经常吃的小零食可以说是最大的安慰了。谢谢！",
        },
        { id: "zh-13", author: "蓝天中***", quote: "总能在这里找到心爱的零食、日用品，物流也超级给力，头天晚上下的单第二天货就送到了！加油亚米！！" },
      ],
    ],
  },
  en: {
    locale: "en",
    download: {
      appStore,
      googlePlay,
      qr: { href: "https://www.yami.com/us/en/download", src: new URL("./assets/download-qr-en.png", import.meta.url).href },
    },
    reviewColumns: [
      [
        { id: "en-1", author: "yey***", quote: "I love Yami! Cool treats and drinks" },
        { id: "en-2", author: "fuq***", quote: "Highly recommended, with one day free arrival and very professional package!" },
        { id: "en-3", author: "ssa***", quote: "The express shipping is the best thing ever. Yami maybe you should teach other institutions how you do it . (2 year user only)" },
        { id: "en-4", author: "no ***", quote: "5/5 ⭐⭐⭐⭐⭐ Every single order has been spot on and arrived quickly!!" },
      ],
      [
        { id: "en-5", author: "gal***", quote: "I bought some Yamibuy snacks and they are so good and really cute" },
        {
          id: "en-6",
          author: "soo***",
          quote: "This is the best app ever I love this app so much I just got my first package from Yamibuy and I love it all ready!!!!! I LOVE YAMIBUY AHHHHHHHHHHHHH❤❤😭❤❤❤❤",
        },
        {
          id: "en-7",
          author: "Rhw***",
          quote: "Good quality. Cost effective. The foods packaging are beautiful and sealed good with clean transport package outside. Delivered faster than planned. So no worries to buy them on summer days.",
        },
      ],
      [
        { id: "en-8", author: "Sun***", quote: "Love you guys , good service and nice fresh , I will definitely come back" },
        {
          id: "en-9",
          author: "Bec***",
          quote: "I love Asian food, i don’t eat it a lot but when i do its really hard to find it in American stores. There are Asian markets in my state but several hours away. This app really gives me a large variety that it makes shopping for Asian food and snacks easier!",
        },
      ],
    ],
  },
} satisfies Record<"zh" | "en", UserReviewsProps>;
