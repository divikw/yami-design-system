import type { BillboardProps } from "./Billboard.types";

export type BillboardLocale = "zh" | "en";

/* Desktop campaigns are retained; phones use the supplied new-customer artwork. */
const artworkEnDesktop = new URL(
  "./assets/new-user-offer.png",
  import.meta.url,
).href;
const artworkZhDesktop = new URL(
  "./assets/weekly-picks-zh-desktop.png",
  import.meta.url,
).href;
const artworkEnMobile = new URL("./assets/new-user-offer-en-mobile.gif", import.meta.url).href;
const artworkZhMobile = new URL("./assets/new-user-offer-zh-mobile.png", import.meta.url).href;
/* The label is what a reader gets instead of the artwork, so it has to say
 * what the artwork says. Swapping the image without rewriting this is how a
 * band ends up announcing an offer it no longer shows. */
export const billboardCopy = {
  zh: {
    label: "本周好物推荐站，解锁生活新灵感，立即购买",
    mobileLabel: "新人专享首单9折，折扣码 WELCOME，立即领取。满$49免运费*，从美国发货，当天送达*，正品保证，无忧退换",
    alt: "",
  },
  en: {
    label:
      "New customer offer: 10% off with code WELCOME. Free shipping on $49+ orders, ships from the U.S., same-day delivery",
    mobileLabel: "10% off your first order with code WELCOME. Shop now.",
    alt: "",
  },
} as const;

export function createBillboardProps(
  locale: BillboardLocale,
  href: string,
): BillboardProps {
  const desktopArtwork =
    locale === "zh"
      ? { src: artworkZhDesktop, width: 3170, height: 320 }
      : { src: artworkEnDesktop, width: 1585, height: 160 };

  return {
    image: {
      ...desktopArtwork,
      mobile: locale === "zh"
        ? { src: artworkZhMobile, width: 1500, height: 375 }
        : { src: artworkEnMobile, width: 1500, height: 376 },
      // The artwork's every word is in the label already; repeating it here
      // would have a reader hear the offer twice.
      alt: billboardCopy[locale].alt,
    },
    href,
    label: billboardCopy[locale].label,
    mobileLabel: billboardCopy[locale].mobileLabel,
  };
}
