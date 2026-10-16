import {
  createFooterAppLinks, createFooterColumns, createFooterLegalLinks,
  createFooterPaymentMarks, createFooterSocialLinks, footerCopy,
} from "@yami/design-system/components/Footer/fixtures";
import { createStorefrontHeader } from "../storefront-header.fixture";
import type { CartItemData, CartLocale, CartPageProps } from "./CartPage.types";
import recommendationSnapshot from "./recommendations.snapshot.json";

export const cartFixtureSource = {
  url: "https://trade.yami.com/us/zh/cart",
  capturedAt: "2026-10-13",
  notes: "Images, product identities and visible price/shipping examples come from the observed PC cart. Recommendations use a separate 2026-10-14 source snapshot. Quantities, limits, selections, fulfillment, coupon offers, history and favorites remain curated demo data; no customer cart is imported or persisted. Mobile composition follows the Figma Cart/Reorder App reference; purchase history, category labels and purchase counts are curated local examples.",
};

const products = [
  { id: "1022005741", merchantId: "yami", zh: "日本 SK-II 青春露／神仙水 230ml 强屏障抗氧化 深层修护毛孔", en: "SK-II Facial Treatment Essence, 230ml", image: "b905709aa8e290af2b4fbe5c5f047c81", priceCents: 12999, originalPriceCents: 23500, attributes: ["230ml"] },
  { id: "1018146951", merchantId: "yami", zh: "韩国 JELLY.B 蒟蒻吸吸果冻 低卡 0 脂 柚子味 150ml × 10 包", en: "JELLY.B Konjac Jelly, yuzu, 150ml × 10", image: "7f5b5fa7a239f0bafecff12a124ba67e", priceCents: 1833, originalPriceCents: 1999, attributes: ["柚子味 / Yuzu", "10 包 / 10 pouches"] },
  { id: "1023147191", merchantId: "yami", zh: "日本 SHISEIDO 资生堂 新艳阳夏防晒霜 日版蓝胖子 50ml 新旧版随机发货", en: "SHISEIDO Ultimate Sun Protector, 50ml, assorted packaging", image: "ff19801e55f84153b2b0318729e012a6", priceCents: 4899, originalPriceCents: 6999, attributes: ["50ml"], lowStock: true },
  { id: "3148161611", merchantId: "snacks", zh: "【中国直邮】黔麻婆 贵州蘸水 木姜子胡辣椒 中辣 250g", en: "Qianmapo Guizhou chili seasoning, medium, 250g", image: "38d23635da09c99e449dd0ce7b873346", priceCents: 1499, attributes: ["250g"] },
  { id: "3022108301", merchantId: "japan", zh: "【日本直邮】花王 CUREL 珂润 保湿滋养深层乳霜 40g", en: "KAO CUREL Intensive Moisture Cream, 40g, shipped from Japan", image: "a6e2ef021527595f4d315036aef8e89e", priceCents: 2199, originalPriceCents: 4299, attributes: ["40g"] },
  { id: "3023135591", merchantId: "direct", zh: "UNICHARM 尤妮佳 化妆棉洁肤棉 82 片 新旧包装随机发货", en: "UNICHARM Silcot Cotton Pads, 82 sheets, assorted packaging", image: "3e58190a9e578b7044953724d5869891", priceCents: 550, originalPriceCents: 585, attributes: ["82 片 / 82 sheets"] },
  { id: "1024140311", merchantId: "yami", zh: "日本 FINO 芬浓 至臻触感浓润精华护发精油 小红帽 70ml × 2", en: "FINO Premium Touch Hair Oil, 70ml × 2", image: "b547643b823ad80ae8699f09bc88364a", priceCents: 1999, originalPriceCents: 3198, attributes: ["70ml × 2"] },
  { id: "1021143411", merchantId: "yami", zh: "宛禾 砂锅刀削面 170g × 3 正宗河南郑州风味", en: "Wanhe Knife-Cut Noodles, 170g × 3", image: "76089653733ed6ebbbe9b296553a87e8", priceCents: 1299, attributes: ["170g × 3"] },
  { id: "moon-mold", merchantId: "yami", zh: "水月秦淮 特色花纹月饼模具 超值 6 片装", en: "Shuiyue Qinhuai Mooncake Mold Set, 6 patterns", image: "617f6fcee76afcf2e14592a4860eef4d", priceCents: 899, originalPriceCents: 4165, attributes: ["6 片 / 6 patterns"] },
  { id: "mooncake-box", merchantId: "snacks", zh: "杏花楼 广式月饼礼盒 640g 8 饼 7 味", en: "Xinghualou Cantonese Mooncake Gift Box, 640g", image: "150a65e7898948a3bb571567e9f94cd0", priceCents: 7190, attributes: ["640g"] },
] as const;

export function createCartPageFixture(locale: CartLocale = "zh"): CartPageProps {
  const zh = locale === "zh";
  const items: CartItemData[] = products.map((product) => ({
    id: product.id, merchantId: product.merchantId, title: product[locale],
    href: product.id.includes("-") ? "" : `https://www.yami.com/us/${locale}/item/${product.id}`,
    image: `https://cdn.yamibuy.net/item/${product.image}_208x208.webp`,
    attributes: product.attributes.map((attribute) => attribute.includes(" / ") ? attribute.split(" / ")[zh ? 0 : 1] : attribute), priceCents: product.priceCents,
    originalPriceCents: "originalPriceCents" in product ? product.originalPriceCents : undefined,
    quantity: 1, maxQuantity: product.merchantId === "japan" ? 2 : 25, selected: false,
    availability: product.id === "moon-mold" ? "sold-out" : product.id === "mooncake-box" ? "delisted" : "available",
    lowStock: "lowStock" in product, notifyAvailable: product.id === "moon-mold",
  }));
  const header = createStorefrontHeader(locale);
  const recommendations: CartItemData[] = recommendationSnapshot.products.map((product) => ({
    ...product, merchantId: "yami", attributes: [], quantity: 1, maxQuantity: 25, selected: false, availability: "available",
  }));
  return {
    locale,
    header: { ...header,
      categories: header.categories.map((category) => ({ ...category, image: category.image ? { ...category.image, alt: "" } : undefined })),
      account: { label: zh ? "我的账户" : "My account", href: `https://customer.yami.com/us/${locale}` },
      homeHref: `https://www.yami.com/us/${locale}`, halls: undefined, onSearchSubmit: undefined,
      cart: { ...header.cart, href: "#cart-main" },
    },
    footer: { columns: createFooterColumns(locale), appTitle: footerCopy[locale].appTitle, appLinks: createFooterAppLinks(),
      socialLinks: createFooterSocialLinks(locale), legalLinks: createFooterLegalLinks(locale), paymentMarks: createFooterPaymentMarks(),
      subscribe: { title: footerCopy[locale].subscribeTitle, label: footerCopy[locale].subscribeLabel,
        placeholder: footerCopy[locale].subscribePlaceholder, submitLabel: footerCopy[locale].subscribeSubmit },
      copyright: "© Copyright 2012–2026 Transocean Resources Management, Inc.", ariaLabel: zh ? "亚米页脚" : "Yami footer",
    },
    merchants: [
      { id: "yami", title: zh ? "亚米发货" : "Fulfilled by Yami", origin: zh ? "由亚米从美国发货" : "Shipped by Yami from the US", shippingCents: 599, freeShippingCents: 4900, href: `https://www.yami.com/us/${locale}/search?is_fby=1` },
      { id: "snacks", title: zh ? "慧吃慧选零食铺" : "Huichi Huixuan Snacks", origin: zh ? "从中国发货" : "Shipped from China", shippingCents: 799, freeShippingCents: 7990, href: `https://www.yami.com/us/${locale}/seller/101360208574213038208` },
      { id: "japan", title: zh ? "日本优品" : "Japan Premium", origin: zh ? "从日本发货" : "Shipped from Japan", shippingCents: 2590, freeShippingCents: 10900, href: `https://www.yami.com/us/${locale}/seller/10196582173369294016` },
      { id: "direct", title: zh ? "日本直邮馆" : "Japan Direct", origin: zh ? "从日本发货" : "Shipped from Japan", shippingCents: 1999, freeShippingCents: 9900, href: `https://www.yami.com/us/${locale}/seller/10196582175428697280` },
    ],
    initialItems: [...items.slice(0, 6), ...items.slice(8)], initialSavedItems: [items[6], items[8]],
    recommendations, history: [items[2], items[4]], favorites: [items[1], items[7]],
    reorderItems: [items[0], items[1], items[2], items[3], items[4], items[6]].map((item, index) => ({ ...item, category: index === 1 || index === 3 ? zh ? "食品" : "Grocery" : zh ? "美妆" : "Beauty", purchaseCount: index % 3 + 1 })),
    frequentlyBoughtItems: recommendations.slice(0, 6).map((item, index) => ({ ...item, category: index === 1 ? zh ? "食品" : "Grocery" : zh ? "美妆" : "Beauty", purchaseCount: [300, 1000, 900, 200, 500, 700][index] })),
    coupons: [
      { id: "demo-10", code: "DEMO10", title: zh ? "满 $100 减 $10" : "$10 off $100", description: zh ? "适用于已选商品，不与其他折扣码叠加" : "Applies to selected items. Cannot be combined with other codes.", minSubtotalCents: 10000, discountCents: 1000, validUntil: "01/01/2027 15:59" },
      { id: "demo-5", code: "DEMO5", title: zh ? "满 $50 减 $5" : "$5 off $50", description: zh ? "适用于已选商品，不与其他折扣码叠加" : "Applies to selected items. Cannot be combined with other codes.", minSubtotalCents: 5000, discountCents: 500, validUntil: "01/01/2027 15:59" },
    ],
  };
}

export const cartPaymentMarks = [
  ["Google Pay", "539d27de09825f48a98fe1147ade31b1"], ["PayPal", "8e8925cfbbb33141c2300cf4f0b9b66e"],
  ["Visa", "715f0e3b4238bbe10cdb84344f0f75dc"], ["Mastercard", "1cf045a3f5348df169f5034e08cdd8a6"],
  ["Discover", "2faa22f879a853d45dec622317fd87a6"], ["American Express", "8f36d3d03c41c262ad41b054a0dc6e1d"],
  ["UnionPay", "613c6baf8b4b5a55364e34fc91297223"], ["JCB", "df0e082d6d0b764db3f2b2b67faf5d07"],
  ["Diners Club", "8f46ef5106a504620d5a374667c69e20"], ["WeChat Pay", "93305d79f90012ba6e710540e6bb86d9"],
  ["Alipay", "55c8f954086e4f47f2b30074082451d8"], ["Cash App", "a82aff6440d8fc44c5c5b62cbee2ea00"],
].map(([name, hash]) => ({ name, src: `https://cdn.yamibuy.net/mkt/${hash}_0x0.png` }));

export const cartGuarantees = [
  { zh: "国际化安全支付", en: "Secure international payments", image: "341ac742a06d76dc9bae6baaadefdf91", zhBody: "采用加密技术并与可信赖的支付机构合作，确保支付安全。", enBody: "Encrypted connections and trusted payment providers help keep payments secure." },
  { zh: "个人隐私保护", en: "Privacy protection", image: "9a9643041dad876b77464cd16a961bc5", zhBody: "了解亚米如何处理和保护个人信息。", enBody: "Learn how Yami handles and protects personal information." },
  { zh: "Yami 购物保障", en: "Yami shopping protection", image: "845c1d634c850c02f1e9f71244712a11", zhBody: "购物保障和售后服务以商品与商家的适用政策为准。", enBody: "Shopping protection and after-sales support follow the policies applicable to each item and seller." },
  { zh: "极速配送", en: "Fast delivery", image: "fe5e7a68111ce5580c4546946d7e8feb", zhBody: "配送范围和时效以商品、商家和配送地区为准。", enBody: "Delivery availability and timing depend on the item, seller and delivery region." },
];

export const cartSecurityCertifications = [
  ["Visa Secure", "6e9b948f296c8174de4ad5cbe3c05176"],
  ["Mastercard ID Check", "294b72953f8cfe925204f1a8cda9197f"],
  ["American Express SafeKey", "d56cef5abdc41ac3c3d88bd2b1d2bd53"],
  ["Discover ProtectBuy", "3c773a6f61339dfb7519fb1549065865"],
  ["JCB J/Secure", "a4e10b6a589392eaef5c277cf7010566"],
].map(([name, hash]) => ({ name, src: `https://cdn.yamibuy.net/mkt/${hash}_0x0.png` }));

export const cartProtectionDetails: {
  guarantee: typeof cartGuarantees[number];
  body?: Record<CartLocale, string>;
  items?: Record<CartLocale, string[]>;
}[] = [
  { guarantee: cartGuarantees[0], body: {
    zh: "支持国际主流支付方式，与可信赖的支付机构深度合作，并采用先进的支付加密技术。",
    en: "We support major international payment methods, work closely with trusted payment providers, and use advanced payment encryption.",
  } },
  { guarantee: cartGuarantees[1], body: {
    zh: "Yami 非常重视您的隐私和数据安全。我们严格遵守法规，绝不出售、出租或以任何方式从您的个人信息中获利。",
    en: "Yami values your privacy and data security. We comply with regulations and never sell, rent, or profit from your personal information.",
  } },
  { guarantee: cartGuarantees[2], items: {
    zh: ["100% 正品", "无忧退换", "包裹损坏可退款", "运输丢失可退款"],
    en: ["100% authentic products", "Worry-free returns and exchanges", "Refunds for damaged packages", "Refunds for packages lost in transit"],
  } },
  { guarantee: cartGuarantees[3], items: {
    zh: ["Yami 发货商品均由美国本地仓库极速发货。", "Yami 发货商品支持当日达、本地快送、标准配送。", "Yami 发货商品均由FedEx、Amazon、DHL、OnTrac、UPS等可靠承运商配送。"],
    en: ["Items fulfilled by Yami ship quickly from local US warehouses.", "Yami offers same-day, local express, and standard delivery.", "Yami ships with reliable carriers including FedEx, Amazon, DHL, OnTrac, and UPS."],
  } },
];
