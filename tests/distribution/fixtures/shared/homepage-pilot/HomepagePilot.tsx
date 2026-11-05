"use client";

import { useRef, useState } from "react";
import { StickyStorefrontHeader, type HeaderProps } from "@yami/design-system/components/Header";
import { HeroBanner, type HeroBannerProps } from "@yami/design-system/components/HeroBanner";
import { ShortcutRail, type ShortcutRailProps } from "@yami/design-system/components/ShortcutRail";
import { Billboard, type BillboardProps } from "@yami/design-system/components/Billboard";
import { ProductList, type ProductListProps } from "@yami/design-system/components/ProductList";
import { home } from "./homepage-data";
import "./homepage-pilot.css";

export interface HomepageData {
  lang: "en" | "zh";
  header: HeaderProps;
  hero: HeroBannerProps;
  shortcuts: ShortcutRailProps;
  billboard: BillboardProps;
  products: ProductListProps;
  destinations: Array<{ id: string; title: string; description?: string }>;
}

export function HomepagePilot() {
  const page = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLElement>(null);
  const searchHeading = useRef<HTMLHeadingElement>(null);
  const [searchValue, setSearchValue] = useState(home.header.searchValue ?? "");
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState(0);
  const zh = home.lang === "zh";
  const productMatches = home.products.products.filter(({ title }) =>
    query && typeof title === "string" && title.toLowerCase().includes(query.toLowerCase()),
  );

  function submitSearch(value: string) {
    setQuery(value.trim());
    search.current?.scrollIntoView();
    searchHeading.current?.focus({ preventScroll: true });
  }

  return (
    <div id="pilot-home" ref={page} className="homepage-pilot" lang={home.lang}>
      <StickyStorefrontHeader {...home.header} searchValue={searchValue} onSearchValueChange={setSearchValue} onSearchSubmit={submitSearch} mobileSearchHref="#pilot-search" />
      <main className="homepage-pilot-main">
        <h1 className="homepage-pilot-hidden">{zh ? "商城首页" : "Storefront home"}</h1>
        <div className="homepage-pilot-intro">
          <HeroBanner {...home.hero} onActiveSurfaceColorChange={(color) => page.current?.style.setProperty("--homepage-pilot-atmosphere", color)} />
          <ShortcutRail {...home.shortcuts} />
        </div>
        <Billboard {...home.billboard} className="homepage-pilot-billboard" />
        <ProductList {...home.products} id="pilot-products" onAddToCart={() => setAdded((count) => count + 1)} />
        <output className="homepage-pilot-hidden" aria-live="polite">{zh ? "已加购" : "Added to cart"}: {added}</output>
        <section id="pilot-search" ref={search} className="homepage-pilot-destination" tabIndex={-1} aria-labelledby="pilot-search-title">
          <h2 id="pilot-search-title" ref={searchHeading} tabIndex={-1}>{zh ? "搜索商品" : "Find products"}</h2>
          <form onSubmit={(event) => { event.preventDefault(); submitSearch(String(new FormData(event.currentTarget).get("q") ?? "")); }}>
            <label>{zh ? "关键词" : "Keyword"} <input name="q" type="search" /></label>{" "}
            <button type="submit">{zh ? "查询" : "Find"}</button>
          </form>
          {query && <p role="status">{query}: {productMatches.length} {zh ? "件商品" : "results"}</p>}
          {productMatches.length > 0 && <ul>{productMatches.map(({ id, title }) => <li key={id}>{title}</li>)}</ul>}
        </section>
        {home.destinations.map(({ id, title, description }) => (
          <section id={id} key={id} className="homepage-pilot-destination" tabIndex={-1} aria-labelledby={`${id}-title`}>
            <h2 id={`${id}-title`}>{title}</h2>
            {description && <p>{description}</p>}
          </section>
        ))}
      </main>
    </div>
  );
}
