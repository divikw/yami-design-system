import { TabBar, type TabBarItem } from "./TabBar";

const icons = {
  home: new URL("../../assets/icons/tabbar/yami.svg", import.meta.url).href,
  shop: new URL("../../assets/icons/tabbar/shop.svg", import.meta.url).href,
  community: new URL("../../assets/icons/tabbar/community.svg", import.meta.url).href,
  cart: new URL("../../assets/icons/tabbar/cart-active.svg", import.meta.url).href,
  account: new URL("../../assets/icons/tabbar/account.svg", import.meta.url).href,
};

export function tabBarExampleItems(locale: "zh" | "en" = "en", badgeCount = 6): TabBarItem[] {
  const labels = locale === "zh" ? ["YAMI", "分类", "社区", "购物车", "我的"] : ["YAMI", "Shop", "Community", "Cart", "Account"];
  const paths = ["/", "/search", "/show", "/cart", "/account"];
  return (Object.keys(icons) as (keyof typeof icons)[]).map((value, index) => ({
    value, label: labels[index], href: paths[index],
    icon: <img src={icons[value]} width={24} height={24} alt="" />,
    ...(value === "cart" ? { badgeCount } : {}),
  }));
}

export function CartTabBar() {
  return <TabBar aria-label="App navigation" value="cart" items={tabBarExampleItems()} />;
}
