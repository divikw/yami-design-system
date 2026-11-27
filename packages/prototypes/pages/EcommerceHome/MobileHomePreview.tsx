"use client";

import type { ReactNode } from "react";
import { TabBar } from "@yami/design-system";
import type { EcommerceHomeProps } from "./EcommerceHome.types";
import { EcommerceHomeTemplate } from "./EcommerceHome";
import { createEcommerceHomeFixture, type EcommerceHomeLocale } from "./fixtures";
import styles from "./EcommerceHome.module.css";

const navigationIcons = {
  home: new URL("../../../design-system/assets/icons/tabbar/yami.svg", import.meta.url).href,
  shop: new URL("../../../design-system/assets/icons/tabbar/shop.svg", import.meta.url).href,
  community: new URL("../../../design-system/assets/icons/tabbar/community.svg", import.meta.url).href,
  cart: new URL("../../../design-system/assets/icons/tabbar/cart-active.svg", import.meta.url).href,
  account: new URL("../../../design-system/assets/icons/tabbar/account.svg", import.meta.url).href,
};

export function MobileHomePreview({ platform, locale, headerContent, staticTabBar = false, home, hrefFor }: {
  platform: "App" | "H5";
  locale: EcommerceHomeLocale;
  headerContent?: ReactNode;
  staticTabBar?: boolean;
  home?: EcommerceHomeProps;
  hrefFor?: (path: string) => string;
}) {
  const fixture = home ?? createEcommerceHomeFixture(locale);
  const zh = locale === "zh";
  const storyHref = (id: string) => `./iframe.html?id=${id}&viewMode=story&globals=locale:${locale}`;
  const destinations = [
    { value: "home", label: "YAMI", href: hrefFor?.("/") ?? "#home" },
    { value: "shop", label: zh ? "分类" : "Shop", href: hrefFor?.("/search/all") ?? storyHref("yami-pages-search-results--mobile") },
    { value: "community", label: zh ? "社区" : "Community", href: hrefFor?.("/show") ?? `https://www.yami.com/us/${locale}/show` },
    { value: "cart", label: zh ? "购物车" : "Cart", href: hrefFor?.("/cart") ?? storyHref("yami-pages-cart--mobile"), badgeCount: fixture.header.cart.count },
    { value: "account", label: zh ? "我的" : "Account", href: hrefFor?.("/account") ?? `https://customer.yami.com/us/${locale}/orders` },
  ] as const;

  return (
    <div className={styles.mobileStory} data-h5-home-draft={staticTabBar || undefined}>
      <EcommerceHomeTemplate
        {...fixture}
        header={platform === "H5" ? { ...fixture.header, mobileVariant: "h5-home" } : fixture.header}
        headerContent={headerContent}
      />
      <div className={styles.storyNavigation} data-slot="tab-bar-container">
        <TabBar
          aria-label={zh ? `${platform} 导航` : `${platform} navigation`}
          value="home"
          inert={staticTabBar}
          items={destinations
            .filter((item) => !staticTabBar || item.value !== "community")
            .map((item) => ({
              ...item,
              icon: <span className={styles.storyNavigationIcon} style={{ maskImage: `url("${navigationIcons[item.value]}")` }} />,
            }))}
        />
      </div>
    </div>
  );
}
