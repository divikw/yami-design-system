"use client";

import { PreviewNavigateMessageSchema } from "@yami/contracts";
import { Cancel01Icon, Home01Icon, Layout01Icon, RefreshCcwIcon, ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import type { HeaderProps, ProductListItem } from "@yami/design-system";
import {
  CartPage, createCartPageFixture, createEcommerceHomeFixture, createProductDetailPageFixture,
  createSearchResultsFixture, createTopicLandingPageFixture, EcommerceHomeTemplate,
  normalizePrototypePath, ProductDetailPage, SearchResultsPage, TopicLandingPage,
  type CartItemData, type SearchResultsViewState,
} from "@yami/prototypes";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidElement, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { prototypeHref, prototypeProjects, type PrototypeProject } from "../lib/prototype-projects";
import { addPrototypeItem, emptyPrototypeSession, prototypeSessionKey, readPrototypeSession, type PrototypeSession } from "../lib/prototype-session";
import { WorkbenchButton, WorkbenchIcon, WorkbenchLink, WorkbenchSelect } from "./workbench-controls";
import "@yami/design-system/styles/base.css";

export function PrototypePlayer() {
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const project = prototypeProjects.find((item) => item.id === (params.get("project") ?? prototypeProjects[0].id));
  const variant = project?.variants.find((item) => item.id === (params.get("variant") ?? "current"));
  if (!project || !variant) return <main className="prototype-unavailable"><h1>找不到这个原型方案</h1><WorkbenchLink href="/workbench">返回工作台</WorkbenchLink></main>;
  if (!ready) return <main className="app-loading">正在打开原型…</main>;
  return <PrototypeExperience key={`${project.id}:${variant.id}`} project={project} variant={variant} />;
}

function PrototypeExperience({ project, variant }: { project: PrototypeProject; variant: PrototypeProject["variants"][number] }) {
  const params = useSearchParams();
  const router = useRouter();
  const locale = params.get("locale") === "en" ? "en" : "zh";
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  const path = params.get("path") ?? "/";
  const embedded = params.get("embedded") === "1";
  const sessionKey = prototypeSessionKey(project.id, variant.id);
  const [session, setSession] = useState(() => {
    try { return readPrototypeSession(window.sessionStorage, sessionKey); } catch { return emptyPrototypeSession(); }
  });
  const sessionRef = useRef(session);
  const [notice, setNotice] = useState("");
  const [resetVersion, setResetVersion] = useState(0);
  const updateSession = useCallback((patch: Partial<PrototypeSession>) => {
    const next = { ...sessionRef.current, ...patch };
    sessionRef.current = next;
    try { sessionStorage.setItem(sessionKey, JSON.stringify(next)); }
    catch { setNotice("浏览器未允许保存，刷新后体验状态将重置。"); }
    setSession(next);
  }, [sessionKey]);
  const hrefFor = (nextPath: string) => prototypeHref(new URLSearchParams(params), nextPath);
  const navigate = (nextPath: string) => {
    const message = PreviewNavigateMessageSchema.safeParse({ type: "yami-design-system:v1:navigate", path: nextPath });
    if (!message.success) return;
    if (embedded && window.parent !== window) window.parent.postMessage(message.data, window.location.origin);
    else router.push(hrefFor(nextPath));
  };
  const search = (query: string) => {
    updateSession({ query });
    navigate(`/search/${encodeURIComponent(query.trim() || "all")}`);
  };
  const fixtures = useMemo(() => ({
    home: createEcommerceHomeFixture(locale), search: createSearchResultsFixture(locale),
    topic: createTopicLandingPageFixture(locale), product: createProductDetailPageFixture(locale),
    cart: createCartPageFixture(locale),
  }), [locale]);

  const cartItem = (product: ProductListItem, quantity = 1): CartItemData => {
    const url = new URL(product.href, window.location.origin);
    const path = url.pathname === "/prototype" && url.origin === window.location.origin
      ? url.searchParams.get("path") ?? "/" : normalizePrototypePath(product.href);
    return {
      id: path, href: path,
      merchantId: fixtures.cart.merchants[0].id, title: String(product.title),
      image: typeof product.image === "string" ? product.image : product.image?.src ?? "",
      priceCents: Math.round(Number(String(product.priceCurrent).replace(/[^\d.]/g, "")) * 100),
      quantity, maxQuantity: 99, selected: true, availability: "available", attributes: [],
    };
  };
  const add = (item: CartItemData) => {
    updateSession({ cart: addPrototypeItem(sessionRef.current.cart, item) });
    setNotice(locale === "zh" ? "已加入演示购物车" : "Added to demo cart");
  };

  // Adapt fixture destinations once, so native links also work in a new tab.
  function bind<T>(value: T): T {
    if (Array.isArray(value)) return value.map((item) => bind(item)) as T;
    if (!value || typeof value !== "object" || isValidElement(value)) return value;
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if ((key === "href" || key.endsWith("Href")) && typeof item === "string") {
        result[key] = item.startsWith("#explore-") ? item : hrefFor(normalizePrototypePath(item));
      } else if (key === "onAddToCart") {
        result[key] = (id: string) => {
          const products = "products" in value && Array.isArray(value.products) ? value.products as ProductListItem[] : [];
          const product = products.find((item) => item.id === id);
          if (product) add(cartItem(product));
        };
      } else result[key] = typeof item === "function" ? item : bind(item);
    }
    return result as T;
  }
  function header(source: HeaderProps): HeaderProps {
    const base = bind(fixtures.home.header);
    return {
      ...base, mobileVariant: source.mobileVariant,
      categoryMenu: base.categoryMenu ? { ...base.categoryMenu, presentation: variant.categoryMenu } : undefined,
      homeHref: hrefFor("/"), cart: { ...base.cart, href: hrefFor("/cart"), count: session.cart.reduce((sum, item) => sum + item.quantity, 0) },
      searchValue: session.query, onSearchValueChange: (query) => updateSession({ query }), onSearchSubmit: search,
      mobileSearchHref: hrefFor(`/search/${encodeURIComponent(session.query || "all")}`),
    };
  }
  const saveCart = useCallback((cart: CartItemData[], saved: CartItemData[]) => {
    const unwrap = (item: CartItemData) => ({ ...item, href: new URL(item.href, window.location.origin).searchParams.get("path") ?? item.href });
    updateSession({ cart: cart.map(unwrap), saved: saved.map(unwrap) });
  }, [updateSession]);
  const saveSearch = useCallback((state: SearchResultsViewState) => {
    updateSession({ query: state.query, searches: { ...sessionRef.current.searches, [path]: state } });
  }, [path, updateSession]);
  function reset() {
    updateSession(emptyPrototypeSession());
    setResetVersion((value) => value + 1);
    setNotice("已重置当前方案的体验状态");
  }
  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin || url.pathname !== "/prototype" || !url.searchParams.has("path")) return;
    event.preventDefault();
    navigate(url.searchParams.get("path")!);
  }

  let content;
  if (path === "/") content = <EcommerceHomeTemplate {...bind(fixtures.home)} header={header(fixtures.home.header)} />;
  else if (path === "/brands/anua" || path === "/brands/11712") content = <TopicLandingPage {...bind(fixtures.topic)} header={header(fixtures.topic.header)} />;
  else if (path.startsWith("/search/") || path.startsWith("/categories/")) {
    let query = path.slice(path.indexOf("/", 1) + 1);
    try { query = decodeURIComponent(query); } catch { /* Display malformed links as written. */ }
    content = <SearchResultsPage {...bind(fixtures.search)} header={header(fixtures.search.header)} query={query === "all" ? "" : query}
      resultCount={fixtures.search.products.length} mobileBackHref={hrefFor("/")}
      initialViewState={session.searches[path]} onViewStateChange={saveSearch} onQuerySubmit={search} onAddToCart={(product) => add(cartItem(product))} />;
  } else if (path.startsWith("/products/")) {
    const product = fixtures.product;
    // The registered detail fixture is the demo SKU; other fixture cards retain their identity.
    const products: ProductListItem[] = [];
    function collect(value: unknown) {
      if (!value || typeof value !== "object" || isValidElement(value)) return;
      if ("priceCurrent" in value && "href" in value && "title" in value && ("imageSrc" in value || "image" in value)) products.push(value as ProductListItem);
      for (const item of Object.values(value)) collect(item);
    }
    collect(fixtures.home); collect(fixtures.search); collect(fixtures.topic);
    const selected = products.find((item) => normalizePrototypePath(item.href) === path);
    if (path === "/products/demo-product" || selected) {
      const identity = selected ? {
        title: String(selected.title), brand: String(selected.brand ?? "YAMI"), priceCurrent: String(selected.priceCurrent),
        priceOriginal: String(selected.priceOriginal ?? ""), images: [{ id: "product", src: cartItem(selected).image, alt: String(selected.title) }],
        optionGroups: [], highlights: [], specifications: [], reviewSection: undefined, brandSection: undefined,
        ranking: "", discountLabel: "", bestBefore: "",
      } : {};
      const item: CartItemData = selected ? cartItem(selected) : {
        id: path, href: path, title: product.title, image: typeof product.images[0].src === "string" ? product.images[0].src : product.images[0].src.src, priceCents: Math.round(Number(product.priceCurrent.replace(/[^\d.]/g, "")) * 100),
        merchantId: fixtures.cart.merchants[0].id, quantity: 1, maxQuantity: 99, selected: true, availability: "available", attributes: [],
      };
      content = <ProductDetailPage {...bind(product)} {...identity} header={header(product.header)}
        onAddToCart={(quantity, options) => add({ ...item, quantity, id: Object.keys(options).length ? `${item.id}:${Object.values(options).join("-")}` : item.id, attributes: Object.values(options) })} />;
    }
  } else if (path === "/cart") content = <CartPage {...bind(fixtures.cart)} header={header(fixtures.cart.header)}
    initialItems={session.cart.map((item) => ({ ...item, href: hrefFor(item.href) }))} initialSavedItems={session.saved.map((item) => ({ ...item, href: hrefFor(item.href) }))}
    onCartChange={saveCart} />;

  return <div className={`prototype-root${theme === "dark" ? " dark" : ""}`} data-theme={theme} lang={locale}>
    {!embedded && <div className="prototype-toolbar">
      <strong>{project.name}</strong>
      <WorkbenchSelect label="设计方案" options={project.variants.map((item) => ({ value: item.id, label: item.name }))} value={variant.id}
        onValueChange={(value) => router.replace(prototypeHref(new URLSearchParams(params), path, value))} />
      <WorkbenchLink href={hrefFor("/")}><WorkbenchIcon icon={Home01Icon} />首页</WorkbenchLink>
      <WorkbenchLink href={hrefFor("/cart")}><WorkbenchIcon icon={ShoppingCart01Icon} />购物车</WorkbenchLink>
      <WorkbenchButton onClick={reset}><WorkbenchIcon icon={RefreshCcwIcon} />重置演示</WorkbenchButton>
      <WorkbenchLink href={hrefFor(path).replace("/prototype?", "/workbench?")}><WorkbenchIcon icon={Layout01Icon} />工作台</WorkbenchLink>
    </div>}
    {notice && <div className="prototype-notice" role="status">{notice}<button type="button" aria-label="关闭提示" onClick={() => setNotice("")}><WorkbenchIcon icon={Cancel01Icon} /></button></div>}
    <div className="prototype-content" key={`${path}:${locale}:${resetVersion}`} onClickCapture={intercept}>
      {content ?? <main className="prototype-unavailable"><h1>{locale === "zh" ? "此页面未包含在本次演示中" : "This page is outside this demo"}</h1><p>{path}</p><WorkbenchLink href={hrefFor("/")}>返回首页</WorkbenchLink></main>}
    </div>
  </div>;
}
