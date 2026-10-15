"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Badge, Button, ButtonLink, Checkbox, Drawer, Footer, Header, ProductCard, ProductList,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@yami/design-system";
import type { CartItemData, CartPageProps } from "./CartPage.types";
import { calculateCartTotals, formatCartMoney as money } from "./cart-totals";
import { cartGuarantees, cartPaymentMarks } from "./fixtures";
import styles from "./CartPage.module.css";
import { text } from "./CartPage.copy";
import { CartCoupons, CartMerchantHeader, CartProtectionDetails, CartRow, CartSecurityCarousel, CouponCodeForm } from "./CartPage.components";

const mobileIcons = {
  applePay: new URL("./assets/apple-pay.svg", import.meta.url).href,
  yami: new URL("../../../design-system/assets/icons/tabbar/yami.svg", import.meta.url).href,
  shop: new URL("../../../design-system/assets/icons/tabbar/shop.svg", import.meta.url).href,
  community: new URL("../../../design-system/assets/icons/tabbar/community.svg", import.meta.url).href,
  account: new URL("../../../design-system/assets/icons/tabbar/account.svg", import.meta.url).href,
  cart: new URL("../../../design-system/assets/icons/tabbar/cart-active.svg", import.meta.url).href,
  zipcode: new URL("./assets/zipcode.svg", import.meta.url).href,
};

type RowFeedback = { item: CartItemData; index: number; action: "removed" | "saved" };

export function CartPage({ locale, header, footer, merchants, initialItems, initialSavedItems, recommendations, history, favorites, reorderItems = [], frequentlyBoughtItems = [], coupons, loading = false, error, onRetry, initialPageTab = "cart", initialCollection = "recommended", initialDrawer = null }: CartPageProps) {
  const t = text[locale];
  const [mobile, setMobile] = useState(false);
  const desktopHeaderRef = useRef<HTMLDivElement>(null);
  const [desktopHeaderHeight, setDesktopHeaderHeight] = useState(0);
  const [pageTab, setPageTab] = useState<string>(initialPageTab);
  const [reorderTab, setReorderTab] = useState("your");
  const [reorderCategory, setReorderCategory] = useState("all");
  const reorderResultsId = useId();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    function update() { setMobile(query.matches); if (!query.matches) setPageTab("cart"); }
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    const element = desktopHeaderRef.current;
    if (!element) return;
    const updateHeight = () => setDesktopHeaderHeight(element.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const mobileCartTabRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const restoreTitleRef = useRef(false);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const emptyDrawerRef = useRef<HTMLParagraphElement>(null);
  const savedGridRef = useRef<HTMLUListElement>(null);
  const savedTabRef = useRef<HTMLButtonElement>(null);
  const savedFocusRef = useRef<number | null>(null);
  const [items, setItems] = useState(initialItems);
  const [saved, setSaved] = useState(initialSavedItems);
  const [tab, setTab] = useState<string>(initialCollection);
  const [drawer, setDrawer] = useState<Exclude<CartPageProps["initialDrawer"], undefined>>(initialDrawer);
  const [checkoutError, setCheckoutError] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; drawer: typeof drawer }>({ message: "", drawer: null });
  const [feedback, setFeedback] = useState<RowFeedback | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const available = items.filter((item) => item.availability === "available");
  const unavailable = items.filter((item) => item.availability !== "available");
  const coupon = coupons.find((entry) => entry.id === couponId);
  const totals = calculateCartTotals(items, merchants, coupon);
  const eligibleCoupons = coupons.filter((entry) => totals.quantity > 0 && totals.subtotalCents >= entry.minSubtotalCents);
  const cartQuantity = available.reduce((sum, item) => sum + item.quantity, 0);
  const merchantCount = merchants.filter((merchant) => available.some((item) => item.merchantId === merchant.id)).length;
  const itemCountLabel = (count: number) => `${count} ${locale === "en" && count === 1 ? "item" : t.items}`;
  const selectedCount = available.filter((item) => item.selected).length;
  const allSelected = available.length > 0 && selectedCount === available.length;

  useLayoutEffect(() => {
    if (feedback) (feedbackRef.current ?? emptyDrawerRef.current ?? (mobile ? mobileCartTabRef.current : titleRef.current))?.focus({ preventScroll: true });
  }, [feedback]);

  useLayoutEffect(() => {
    if (savedFocusRef.current === null) return;
    const row = savedGridRef.current?.children[Math.min(savedFocusRef.current, saved.length - 1)];
    (row?.querySelector<HTMLButtonElement>('[data-slot="cart-saved-actions"] button') ?? savedTabRef.current)?.focus({ preventScroll: true });
    savedFocusRef.current = null;
  }, [saved]);

  function showNotice(message: string) {
    setNotice({ message, drawer });
  }
  function closeDrawer() {
    restoreTitleRef.current = drawer === "unavailable" && unavailable.length === 0;
    setDrawer(null);
  }
  function patchItem(id: string, patch: Partial<CartItemData>) {
    setFeedback(null);
    if (patch.selected !== undefined) setCheckoutError(false);
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }
  function showItemFeedback(item: CartItemData, action: RowFeedback["action"]) {
    const list = item.availability === "available" ? available.filter((entry) => entry.merchantId === item.merchantId) : unavailable;
    setFeedback({ item, action, index: list.findIndex((entry) => entry.id === item.id) });
    showNotice("");
  }
  function removeItem(item: CartItemData, fromSaved = false) {
    if (fromSaved) {
      savedFocusRef.current = saved.findIndex((entry) => entry.id === item.id);
      setSaved((current) => current.filter((entry) => entry.id !== item.id));
      setFeedback(null); showNotice("");
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    showItemFeedback(item, "removed");
  }
  function applyCoupon(id: string | null) {
    setFeedback(null);
    setCouponId(id);
    showNotice(id ? t.couponApplied : t.couponRemoved);
  }
  function saveItem(item: CartItemData) {
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setSaved((current) => current.some((entry) => entry.id === item.id) ? current : [...current, { ...item, selected: false }]);
    showItemFeedback(item, "saved");
  }
  function addItem(item: CartItemData) {
    const existing = items.find((entry) => entry.id === item.id);
    if (existing && (existing.quantity >= existing.maxQuantity || existing.availability !== "available")) { showNotice(t.limit); return; }
    if (item.availability !== "available") return;
    const savedIndex = saved.findIndex((entry) => entry.id === item.id);
    if (savedIndex >= 0) savedFocusRef.current = savedIndex;
    setItems((current) => current.some((entry) => entry.id === item.id)
      ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.min(entry.quantity + 1, entry.maxQuantity) } : entry)
      : [...current, { ...item, selected: false }]);
    setSaved((current) => current.filter((entry) => entry.id !== item.id));
    setFeedback(null);
    showNotice(t.added);
  }
  function redeem(code: string) {
    const found = coupons.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
    if (!found) return t.couponInvalid;
    if (totals.quantity === 0 || totals.subtotalCents < found.minSubtotalCents) return `${t.condition} · ${money(found.minSubtotalCents)}`;
    applyCoupon(found.id);
    return "";
  }
  function switchPage(value: string) { setPageTab(value); window.scrollTo({ top: 0 }); }
  const drawerTitles = { coupons: t.coupons, unavailable: t.unavailable, protection: t.protection, summary: t.summary };
  const reorderCollection = reorderTab === "your" ? reorderItems : frequentlyBoughtItems;
  const categories = [...new Set(reorderCollection.map((item) => item.category))];
  const collections = { recommended: recommendations, history, favorites };
  function feedbackRow(entry: RowFeedback) {
    return <li className={styles.itemFeedback} key={`feedback-${entry.item.id}`} data-slot="cart-item-feedback" data-action={entry.action}>
      <img src={entry.item.image} alt={entry.item.title} width={40} height={40} />
      <p ref={feedbackRef} tabIndex={-1}>{t[entry.action]}</p>
    </li>;
  }
  const unavailableRows = unavailable.map((item) => <CartRow key={item.id} item={item} locale={locale} onRemove={() => removeItem(item)} onSave={() => saveItem(item)}
    notified={notifications.includes(item.id)} onNotify={item.notifyAvailable ? () => { setNotifications((current) => [...current, item.id]); showNotice(t.notified); } : undefined} />);
  if (feedback && feedback.item.availability !== "available" && unavailableRows.length > 0) unavailableRows.splice(feedback.index, 0, feedbackRow(feedback));

  const paymentMarks = mobile ? [cartPaymentMarks[1], { name: "Apple Pay", src: mobileIcons.applePay }, ...cartPaymentMarks.slice(2)] : cartPaymentMarks;
  const protection = <section className={styles.protection}>
          <div className={styles.protectionIntro}><h2>{mobile ? <Button className={styles.protectionHeading} variant="tertiary" size="sm" aria-label={t.learn} aria-haspopup="dialog" onClick={() => setDrawer("protection")}>{locale === "en" ? "Service Guarantee" : t.protection}<span className={styles.chevron} aria-hidden="true" /></Button> : t.protection}</h2><p className={styles.muted}>{locale === "zh" ? cartGuarantees[0].zhBody : mobile ? "Secure payments with encryption and trusted partners." : cartGuarantees[0].enBody}</p></div>
          <ul className={styles.paymentMarks} aria-label={locale === "zh" ? "支付方式" : "Payment methods"}>{paymentMarks.map((mark) => <li key={mark.name}><img src={mark.src} alt={mark.name} width={52} height={36} loading="lazy" /></li>)}</ul>
          <ul className={styles.guarantees}>{cartGuarantees.map((guarantee) => <li key={guarantee.en}><img src={`https://cdn.yamibuy.net/mkt/${guarantee.image}_0x0.png`} alt="" width={20} height={20} /><span>{mobile && locale === "en" && guarantee === cartGuarantees[0] ? "Global & Secure Payments" : guarantee[locale]}</span></li>)}</ul>
          {!mobile ? <Button className={styles.learnLink} variant="tertiary" size="sm" aria-haspopup="dialog" onClick={() => setDrawer("protection")}>{t.learn}</Button> : null}
        </section>;
  const couponSection = <section className={styles.couponSection}><h2>{t.coupons}</h2>{!mobile ? <CouponCodeForm locale={locale} onRedeem={redeem} /> : null}
          <div className={styles.sectionHeader}><span>{coupon ? coupon.title : eligibleCoupons.length > 0 ? locale === "zh" ? `${eligibleCoupons.length} 张可用优惠券` : `${eligibleCoupons.length} available ${eligibleCoupons.length === 1 ? "coupon" : "coupons"}` : t.noCoupons}</span><Button className={`${styles.actionLink} ${styles.couponAction}`} size="md" variant="tertiary" aria-label={`${t.edit} ${t.coupons}`} aria-haspopup="dialog" onClick={() => setDrawer("coupons")}>{t.edit}</Button></div>
          {coupon && totals.discountCents === 0 ? <p className={styles.attention}>{t.couponSelected}</p> : null}
        </section>;
  function selectAll(checked: boolean) {
    setFeedback(null); setCheckoutError(false);
    setItems((current) => current.map((item) => item.availability === "available" ? { ...item, selected: checked } : item));
  }


  return <div className={styles.page} lang={locale} data-slot="cart-page" data-page-tab={pageTab} style={{ "--cart-header-height": `${desktopHeaderHeight}px` } as CSSProperties}>
    <div ref={desktopHeaderRef} className={styles.desktopHeader} data-slot="cart-desktop-header"><Header {...header} cart={{ ...header.cart, count: cartQuantity }} /></div>
    <Tabs value={pageTab} onValueChange={switchPage} className={styles.appTabs}>
      <header className={styles.mobileHeader}>
        <TabsList variant="primary" aria-label={locale === "zh" ? "购物车页面" : "Cart pages"}>
          <TabsTrigger ref={mobileCartTabRef} value="cart">{locale === "zh" ? t.cart : "Cart"}</TabsTrigger><TabsTrigger value="reorder">{t.reorder}</TabsTrigger>
        </TabsList>
        {header.zipcode ? <a className={styles.mobileZipcode} href={header.zipcode.href} aria-label={`${header.zipcode.label} ${header.zipcode.code}`}><img src={mobileIcons.zipcode} width={24} height={24} alt="" /><span>{header.zipcode.code}</span></a> : null}
      </header>
      <div onTouchStart={(event) => {
        const target = event.target as HTMLElement;
        if (!mobile || target.closest('button, a, input, [role="tablist"], [data-slot="cart-discovery"], [data-slot="cart-reorder-grid"], [class*="thumbnails"]')) { touchStart.current = null; return; }
        if (event.touches.length !== 1) { touchStart.current = null; return; }
        touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }} onTouchCancel={() => { touchStart.current = null; }} onTouchEnd={(event) => {
        const start = touchStart.current; touchStart.current = null;
        if (!start) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) switchPage(dx < 0 ? "reorder" : "cart");
      }}>
      <TabsContent value="cart" className={styles.cartPanel}>
    <main className={styles.layout} id="cart-main">
      <div className={styles.mainColumn}>
        <section className={styles.overview} aria-labelledby="cart-title">
          <div className={styles.titleRow}>
            <h1 ref={titleRef} tabIndex={-1} id="cart-title">{t.cart}</h1>
            <CartSecurityCarousel locale={locale} />
          </div>
          {!loading && !error && available.length > 0 ? <label className={styles.selectAll}>
            <span className={styles.selectionControl}><Checkbox checked={allSelected}
              onCheckedChange={(checked) => { setFeedback(null); setCheckoutError(false); setItems((current) => current.map((item) => item.availability === "available" ? { ...item, selected: checked } : item)); }} /></span>
            <span>{t.all} <small>({merchantCount} {locale === "en" && merchantCount === 1 ? "seller" : t.merchants}, {itemCountLabel(cartQuantity)})</small></span>
          </label> : null}
        </section>
        {loading ? <section className={styles.state} aria-busy="true"><p role="status">{t.loading}</p>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton} aria-hidden="true" />)}</section>
          : error ? <section className={styles.state}><p role="alert">{error}</p>{onRetry ? <Button onClick={onRetry}>{t.retry}</Button> : null}</section>
            : <>
              {notice.message && !drawer ? <div className={styles.notice}><span role="status">{notice.message}</span></div> : null}
              {available.length === 0 ? <section className={styles.state}><h2>{t.empty}</h2><p>{t.emptyHint}</p><ButtonLink href={`https://www.yami.com/us/${locale}`}>{t.shop}</ButtonLink></section> : null}
              {merchants.map((merchant) => {
                const group = available.filter((item) => item.merchantId === merchant.id);
                if (group.length === 0) return null;
                const rows = group.map((item) => <CartRow key={item.id} item={item} locale={locale}
                  onSelect={(selected) => patchItem(item.id, { selected })} onQuantity={(quantity) => patchItem(item.id, { quantity })}
                  onRemove={() => removeItem(item)} onSave={() => saveItem(item)} />);
                if (feedback && feedback.item.availability === "available" && feedback.item.merchantId === merchant.id) rows.splice(feedback.index, 0, feedbackRow(feedback));
                const selected = group.filter((item) => item.selected).length;
                const subtotal = totals.merchantSubtotals[merchant.id];
                return <section className={styles.merchant} key={merchant.id} aria-labelledby={`merchant-${merchant.id}`}>
                  <CartMerchantHeader merchant={merchant} locale={locale} subtotal={subtotal} checked={selected === group.length}
                    onCheckedChange={(checked) => { setFeedback(null); setCheckoutError(false); setItems((current) => current.map((item) => item.merchantId === merchant.id && item.availability === "available" ? { ...item, selected: checked } : item)); }} />
                  <ul className={styles.itemList}>{rows}</ul>
                </section>;
              })}
              {mobile ? protection : null}
              {unavailable.length > 0 ? <section className={styles.unavailable}>
                <div className={styles.sectionHeader}><h2>{t.unavailable}</h2><Button className={styles.actionLink} size="sm" variant="tertiary" aria-label={`${t.viewAll} ${t.unavailable}`} aria-haspopup="dialog" onClick={() => setDrawer("unavailable")}>{t.viewAll}</Button></div>
                <p className={styles.muted}>{t.unavailableHint}</p>
                <div className={styles.thumbnails}>{unavailable.map((item) => <img key={item.id} src={item.image} alt={item.title} width={48} height={48} loading="lazy" />)}</div>
              </section> : null}
              {mobile ? <>{couponSection}<section className={styles.mobileSummary}><strong>{t.estimated} {t.total}: {money(totals.totalCents)}</strong><Button className={styles.actionLink} size="sm" variant="tertiary" aria-haspopup="dialog" onClick={() => setDrawer("summary")}>{t.details}</Button></section></> : null}
              <div className={styles.discovery} data-slot="cart-discovery">
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList variant="tertiary" aria-label={locale === "zh" ? "商品分类" : "Product collections"}>
                    <TabsTrigger value="recommended">{t.recommendations}</TabsTrigger><TabsTrigger ref={savedTabRef} value="saved">{t.save} ({saved.length})</TabsTrigger>
                    <TabsTrigger value="history">{t.history}</TabsTrigger><TabsTrigger value="favorites">{t.favorites}</TabsTrigger>
                  </TabsList>
                  {Object.entries(collections).map(([value, collection]) => <TabsContent key={value} value={value}>
                    {collection.length > 0 ? <ProductList title={value === "recommended" ? t.recommendations : value === "history" ? t.history : t.favorites} layout="waterfall" dividerPosition="none" mobileSurface="plain"
                      products={collection.map((item) => ({
                        id: item.id, title: item.title, href: item.href, image: item.image, imageAlt: item.title,
                        priceCurrent: money(item.priceCents), priceOriginal: item.originalPriceCents ? money(item.originalPriceCents) : undefined,
                        availability: item.availability, availabilityLabel: item.availability === "delisted" ? t.delisted : t.soldOut,
                        onNotify: item.notifyAvailable ? () => setNotifications((current) => [...current, item.id]) : undefined,
                        notifyLabel: notifications.includes(item.id) ? t.notified : locale === "zh" ? "到货通知" : t.notify,
                        notifyDisabled: notifications.includes(item.id), addButtonAriaLabel: `${t.move} ${item.title}`,
                      }))}
                      onAddToCart={(id) => { const item = collection.find((entry) => entry.id === id); if (item) addItem(item); }} /> : <p>{t.emptyTab}</p>}
                  </TabsContent>)}
                  <TabsContent value="saved">
                    {saved.length > 0 ? <ul ref={savedGridRef} className={styles.savedGrid} data-slot="cart-saved-grid">{saved.map((item) => <li key={item.id} className={styles.savedItem}>
                      <ProductCard title={item.title} href={item.href} image={item.image} imageAlt={item.title} priceCurrent={money(item.priceCents)} priceOriginal={item.originalPriceCents ? money(item.originalPriceCents) : undefined}
                        availability={item.availability} availabilityLabel={item.availability === "delisted" ? t.delisted : t.soldOut}
                        onAddToCart={() => addItem(item)} addButtonAriaLabel={`${t.move} ${item.title}`}
                        onNotify={item.notifyAvailable ? () => { setNotifications((current) => [...current, item.id]); } : undefined} notifyLabel={notifications.includes(item.id) ? t.notified : locale === "zh" ? "到货通知" : t.notify} notifyDisabled={notifications.includes(item.id)} />
                      <div className={styles.savedActions} data-slot="cart-saved-actions"><Button className={styles.actionLink} size="sm" variant="tertiary" aria-label={`${t.remove} ${item.title}`} onClick={() => removeItem(item, true)}>{t.remove}</Button></div>
                    </li>)}</ul> : <p className={styles.state}>{t.emptyTab}</p>}
                  </TabsContent>
                </Tabs>
              </div>
            </>}
      </div>
      {!loading && !error ? <aside className={styles.sidebar} aria-label={t.summary}>
        {!mobile ? couponSection : null}
        <section className={styles.summary} hidden={mobile || totals.quantity === 0} aria-live="polite" aria-atomic="true" data-slot="cart-totals">
          {totals.quantity > 0 ? <><p>{t.selected} {itemCountLabel(totals.quantity)}</p><dl>
            <div><dt>{t.subtotal}</dt><dd>{money(totals.subtotalCents)}</dd></div>
            <div><dt>{t.shipping}</dt><dd>{totals.shippingCents === 0 ? t.free : money(totals.shippingCents)}</dd></div>
            {totals.discountCents > 0 ? <div><dt>{t.discount}</dt><dd>−{money(totals.discountCents)}</dd></div> : null}
            <div className={styles.total}><dt>{t.total}</dt><dd>{money(totals.totalCents)}</dd></div>
          </dl><p className={styles.muted}>{t.tax}</p></> : null}
        </section>
        <div className={styles.checkoutBar} data-slot="cart-checkout-bar">
          {mobile ? <><label className={styles.checkoutAll}><Checkbox checked={allSelected} onCheckedChange={selectAll} /><span>{locale === "zh" ? t.all : "All"}</span></label><Button className={styles.checkoutTotal} variant="tertiary" aria-label={`${t.details} ${money(totals.totalCents)}`} aria-haspopup="dialog" onClick={() => setDrawer("summary")}><span><small>{t.estimated}</small> <strong>{money(totals.totalCents)}</strong><span className={styles.totalChevron} aria-hidden="true" /></span><small>{totals.quantity === 0 ? "" : totals.shippingCents === 0 ? t.free : `${t.shipping} ${money(totals.shippingCents)}`}</small></Button></> : null}{checkoutError && totals.quantity === 0 ? <p className={styles.checkoutHint} role="alert">{t.choose}</p> : null}<Button variant="emphasis" size="lg" form="full" onClick={() => { if (totals.quantity === 0) { setCheckoutError(true); return; } setDrawer("summary"); }}>{t.checkout}{totals.quantity > 0 ? ` (${totals.quantity})` : ""}</Button></div>
        {!mobile ? protection : null}
      </aside> : null}
    </main>
      </TabsContent>
      <TabsContent value="reorder" className={styles.reorderPanel}>
        <Tabs role="main" aria-label={t.reorder} value={reorderTab} onValueChange={(value) => { setReorderTab(value); setReorderCategory("all"); }}>
          <TabsList variant="secondary" aria-label={t.reorder}><TabsTrigger value="your">{t.yourReorder}</TabsTrigger><TabsTrigger value="frequent">{t.frequent}</TabsTrigger></TabsList>
          {notice.message ? <p className={styles.notice} role="status">{notice.message}</p> : null}
          <Tabs className={styles.reorderCategories} value={reorderCategory} onValueChange={setReorderCategory}>
            <TabsList variant="tertiary" aria-label={t.categories}>
              {["all", ...categories].map((category) => <TabsTrigger key={category} value={category} controls={`${reorderResultsId}-${reorderTab}`}>{category === "all" ? locale === "zh" ? "全部" : "All" : category}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          {["your", "frequent"].map((value) => <TabsContent value={value} key={value}>
            <ul id={`${reorderResultsId}-${value}`} aria-label={reorderCategory === "all" ? t.categories : reorderCategory} className={styles.reorderGrid} data-slot="cart-reorder-grid">{(value === "your" ? reorderItems : frequentlyBoughtItems).filter((item) => reorderCategory === "all" || item.category === reorderCategory).map((item) => <li key={item.id}>
              <ProductCard title={item.title} href={item.href} image={item.image} imageAlt={item.title} priceCurrent={money(item.priceCents)} priceOriginal={item.originalPriceCents ? money(item.originalPriceCents) : undefined}
                availability={item.availability} availabilityLabel={item.availability === "delisted" ? t.delisted : t.soldOut}
                onAddToCart={() => addItem({ ...item, quantity: 1 })} addButtonAriaLabel={`${t.move} ${item.title}`} />
              <Badge className={styles.purchaseBadge} color="neutral" emphasis="secondary"><span>{item.purchaseCount}</span> {t.purchased}</Badge>
            </li>)}</ul>
            {(value === "your" ? reorderItems : frequentlyBoughtItems).filter((item) => reorderCategory === "all" || item.category === reorderCategory).length === 0 ? <p className={styles.state}>{t.emptyTab}</p> : null}
          </TabsContent>)}
        </Tabs>
      </TabsContent>
      </div>
    </Tabs>
    <nav data-slot="cart-app-navigation" className={styles.appNavigation} aria-label={locale === "zh" ? "App 导航" : "App navigation"}>
      <a href={header.homeHref}><img src={mobileIcons.yami} alt="" width={24} height={24} /><span>YAMI</span></a>
      <a href={`https://www.yami.com/us/${locale}/search`}><img src={mobileIcons.shop} alt="" width={24} height={24} /><span>{t.shopNav}</span></a>
      <a href={`https://www.yami.com/us/${locale}/show`}><img src={mobileIcons.community} alt="" width={24} height={24} /><span>{t.community}</span></a>
      <button type="button" aria-current="page" aria-label={`${locale === "zh" ? t.cart : "Cart"} ${cartQuantity}`} onClick={() => { setPageTab("cart"); window.scrollTo({ top: 0 }); }}><span className={styles.navIcon}><img src={mobileIcons.cart} alt="" width={24} height={24} /><Badge className={styles.navCartCount} color="red" aria-hidden="true">{cartQuantity > 99 ? "99+" : cartQuantity}</Badge></span><span>{locale === "zh" ? t.cart : "Cart"}</span></button>
      <a href={header.account?.href}><img src={mobileIcons.account} alt="" width={24} height={24} /><span>{t.account}</span></a>
    </nav>
    <div className={styles.footer}><Footer {...footer} /></div>
    <Drawer className={`${styles.cartDrawer} ${drawer === "protection" ? styles.protectionDrawer : drawer === "unavailable" ? styles.unavailableDrawer : ""}`} open={drawer !== null} title={drawer ? drawerTitles[drawer] : ""} closeLabel={t.close} onClose={closeDrawer}
      onAfterClose={() => { if (restoreTitleRef.current) { (mobile ? mobileCartTabRef.current : titleRef.current)?.focus({ preventScroll: true }); restoreTitleRef.current = false; } }}
      footer={drawer === "protection" || drawer === "unavailable" ? undefined : <div className={styles.drawerFooter}><Button size="lg" form="full" onClick={closeDrawer}>{drawer === "summary" ? t.back : t.done}</Button></div>}>
      {notice.message && drawer && notice.drawer === drawer ? <div className={styles.drawerNotice}><p role="status">{notice.message}</p></div> : null}
      {drawer === "coupons" ? <CartCoupons locale={locale} coupons={coupons} couponId={couponId} subtotalCents={totals.subtotalCents} quantity={totals.quantity} onRedeem={redeem} onApply={applyCoupon} /> : null}
      {drawer === "unavailable" ? unavailable.length === 0 ? <p ref={emptyDrawerRef} tabIndex={-1} className={styles.drawerEmpty}>{t.unavailableEmpty}</p> : <ul className={styles.itemList}>{unavailableRows}</ul> : null}
      {drawer === "protection" ? <CartProtectionDetails locale={locale} /> : null}
      {drawer === "summary" ? <><p>{t.selected} {itemCountLabel(totals.quantity)}</p><ul className={styles.orderItems}>{available.filter((item) => item.selected).map((item) => <li key={item.id}><span>{item.title}<small>× {item.quantity}</small></span><strong>{money(item.priceCents * item.quantity)}</strong></li>)}</ul>
        <div className={styles.summary}><dl>
          <div><dt>{t.subtotal}</dt><dd>{money(totals.subtotalCents)}</dd></div>
          <div><dt>{t.shipping}</dt><dd>{totals.shippingCents === 0 ? t.free : money(totals.shippingCents)}</dd></div>
          {totals.discountCents > 0 ? <div><dt>{t.discount}</dt><dd>−{money(totals.discountCents)}</dd></div> : null}
          <div className={styles.total}><dt>{t.total}</dt><dd>{money(totals.totalCents)}</dd></div>
        </dl></div><p className={styles.muted}>{t.tax}</p></> : null}
    </Drawer>
  </div>;
}
