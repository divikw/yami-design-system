import type { HomepageData } from "./HomepagePilot";

function artwork(width: number, height: number, fill: string, label: string) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="24" fill="#222">${label}</text></svg>`)}`;
}

const logo = artwork(140, 48, "#fff", "Demo shop");
const icon = artwork(32, 32, "#eee", "✦");
const campaigns = ["Pantry essentials", "Tea season", "Sunday cooking", "Keep shopping", "Fruit market", "Dinner ideas"];
const collections = ["New arrivals", "Weeknight meals", "Pantry", "Gift ideas", "Tea", "Snacks", "Drinks", "Kitchen", "Dessert", "Offers"];
const products = ["Jasmine tea", "Rice crackers", "Chili oil", "Sesame noodles"];

export const home: HomepageData = {
  lang: "en",
  header: {
    logo: { src: logo, alt: "Demo shop" }, homeHref: "#pilot-home",
    categories: [{ id: "pantry", label: "Pantry", href: "#category-pantry", image: { src: icon, alt: "Pantry" } }],
    searchLabel: "Search the shop", searchPlaceholder: "Try jasmine tea", searchValue: "Jasmine tea",
    account: { label: "Account", href: "#account" },
    locale: { label: "EN", flag: { src: icon, alt: "" }, href: "#language" },
    cart: { label: "Cart", href: "#cart" },
    zipcode: { code: "94000", label: "Deliver to", href: "#delivery" },
  },
  hero: {
    ariaLabel: "Featured campaigns", previousLabel: "Previous campaigns", nextLabel: "Next campaigns",
    items: campaigns.map((title, index) => {
      const common = { id: `campaign-${index}`, href: `#campaign-${index}`, title, backgroundColor: "#eef4e7" };
      return index === 3
        ? { ...common, products: [{ src: "/product.svg", alt: "Tea tin" }] }
        : { ...common, image: { src: artwork(320, 360, "#eef4e7", ""), alt: "" }, description: `Explore ${title.toLowerCase()}` };
    }),
  },
  shortcuts: {
    ariaLabel: "Shop by collection",
    items: collections.map((label, index) => ({ id: `collection-${index}`, href: `#collection-${index}`, label, iconSrc: icon })),
  },
  billboard: {
    href: "#weekly-offer", label: "Weekly offer",
    image: {
      src: artwork(1344, 136, "#f5ece5", "Weekly offer"), width: 1344, height: 136, alt: "",
      mobile: { src: artwork(386, 88, "#f5ece5", "Weekly offer"), width: 386, height: 88 },
    },
  },
  products: {
    title: "Best sellers",
    products: products.map((title, index) => ({
      id: `product-${index}`, title, priceCurrent: "$8.99", href: `#product-${index}`, image: "/product.svg", imageAlt: "",
    })),
  },
  destinations: [
    ...campaigns.map((title, index) => ({ id: `campaign-${index}`, title, description: `Campaign details for ${title.toLowerCase()}.` })),
    ...collections.map((title, index) => ({ id: `collection-${index}`, title, description: `Browse the ${title.toLowerCase()} collection.` })),
    { id: "weekly-offer", title: "Weekly offer details", description: "Free delivery on the weekly selection." },
    { id: "category-pantry", title: "Pantry category" },
    { id: "account", title: "Your account" }, { id: "language", title: "Language preferences" },
    { id: "cart", title: "Your cart" }, { id: "delivery", title: "Delivery options" },
    ...products.map((title, index) => ({ id: `product-${index}`, title })),
  ],
};
