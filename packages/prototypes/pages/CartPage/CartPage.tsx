"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Badge, Button, ButtonGroup, ButtonLink, Checkbox, Dialog, Drawer, Footer, Header, ProductCard, ProductList,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@yami/design-system";
import type { CartItemData, CartPageProps } from "./CartPage.types";
import { calculateCartTotals, formatCartMoney as money } from "./cart-totals";
import { cartGuarantees, cartPaymentMarks } from "./fixtures";
import styles from "./CartPage.module.css";
import { text } from "./CartPage.copy";
import { CartAddNotice, CartCouponActions, CartCoupons, CartMerchantHeader, CartOrderDetails, CartProtectionDetails, CartRow, CartSecurityCarousel, CouponCodeForm } from "./CartPage.components";

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

export function CartPage({ locale, header, footer, merchants, initialItems, initialSavedItems, recommendations, history, favorites, reorderItems = [], frequentlyBoughtItems = [], coupons, signedIn = true, loading = false, error, onRetry, initialPageTab = "cart", initialCollection = "recommended", initialDrawer = null }: CartPageProps) {
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
  const addNoticeRef = useRef<HTMLDivElement>(null);
  const addNoticeTriggerRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState(initialItems);
  const [saved, setSaved] = useState(initialSavedItems);
  const [tab, setTab] = useState<string>(initialCollection);
  const requiresSignIn = !signedIn && initialDrawer === "coupons";
  const [signInOpen, setSignInOpen] = useState(requiresSignIn);
  const [drawer, setDrawer] = useState<Exclude<CartPageProps["initialDrawer"], undefined>>(requiresSignIn ? null : initialDrawer);
  const [checkoutError, setCheckoutError] = useState(false);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [draftCouponId, setDraftCouponId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; drawer: typeof drawer; item?: CartItemData }>({ message: "", drawer: null });
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

  useEffect(() => {
    if (!notice.message) return;
    const timeout = window.setTimeout(() => {
      if (addNoticeRef.current?.contains(document.activeElement)) addNoticeTriggerRef.current?.focus({ preventScroll: true });
      setNotice((current) => current === notice ? { message: "", drawer: null } : current);
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useLayoutEffect(() => {
    if (signedIn) setSignInOpen(false);
    else {
      setCouponId(null);
      setDrawer((current) => current === "coupons" ? null : current);
    }
  }, [signedIn]);

  useLayoutEffect(() => {
    if (feedback) (feedbackRef.current ?? emptyDrawerRef.current ?? (mobile ? mobileCartTabRef.current : titleRef.current))?.focus({ preventScroll: true });
  }, [feedback]);

  useLayoutEffect(() => {
    if (savedFocusRef.current === null) return;
    const row = savedGridRef.current?.children[Math.min(savedFocusRef.current, saved.length - 1)];
    const target = row?.querySelector<HTMLButtonElement>('[data-slot="cart-saved-actions"] button') ?? savedTabRef.current;
    target?.focus({ preventScroll: true });
    if (!addNoticeTriggerRef.current?.isConnected) addNoticeTriggerRef.current = target;
    savedFocusRef.current = null;
  }, [saved]);

  function showNotice(message: string, item?: CartItemData) {
    setNotice({ message, drawer, item });
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
    if (!signedIn) { setSignInOpen(true); return; }
    setFeedback(null);
    setCouponId(id);
    showNotice("");
  }
  function openCoupons() {
    setDraftCouponId(eligibleCoupons.some((entry) => entry.id === couponId) ? couponId : null);
    setDrawer("coupons");
  }
  function saveCoupons() {
    if (draftCouponId && !eligibleCoupons.some((entry) => entry.id === draftCouponId)) return;
    if (draftCouponId !== couponId) applyCoupon(draftCouponId);
    closeDrawer();
  }
  function saveItem(item: CartItemData) {
    if (!signedIn) { setSignInOpen(true); return; }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setSaved((current) => current.some((entry) => entry.id === item.id) ? current : [...current, { ...item, selected: false }]);
    showItemFeedback(item, "saved");
  }
  function addItem(item: CartItemData, selected = true) {
    const existing = items.find((entry) => entry.id === item.id);
    if (existing && (existing.quantity >= existing.maxQuantity || existing.availability !== "available")) { showNotice(t.limit); return; }
    if (item.availability !== "available") return;
    addNoticeTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const savedIndex = saved.findIndex((entry) => entry.id === item.id);
    if (savedIndex >= 0 && pageTab === "cart" && tab === "saved") savedFocusRef.current = savedIndex;
    setItems((current) => current.some((entry) => entry.id === item.id)
      ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.min(entry.quantity + 1, entry.maxQuantity) } : entry)
      : [...current, { ...item, selected }]);
    setSaved((current) => current.filter((entry) => entry.id !== item.id));
    setFeedback(null);
    showNotice(t.added, item);
  }
  function redeem(code: string, select: (id: string) => void = applyCoupon) {
    if (!signedIn) { setSignInOpen(true); return ""; }
    const found = coupons.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
    if (!found) return t.couponInvalid;
    if (totals.quantity === 0 || totals.subtotalCents < found.minSubtotalCents) return `${t.condition} · ${money(found.minSubtotalCents)}`;
    select(found.id);
    return "";
  }
  function switchPage(value: string) { setPageTab(value); window.scrollTo({ top: 0 }); }
  const mobileSummaryOpen = mobile && drawer === "summary";
  const drawerTitles = { coupons: t.coupons, unavailable: t.unavailable, protection: t.protection, summary: t.summary };
  const yourReorderItems = signedIn ? reorderItems : [];
  const reorderCollection = reorderTab === "your" ? yourReorderItems : frequentlyBoughtItems;
  const categories = [...new Set(reorderCollection.map((item) => item.category))];
  const collections = { recommended: recommendations, history, favorites };
  function renderCollection(value: string, collection: CartItemData[]) {
    return collection.length > 0 ? <ProductList title={value === "recommended" ? t.recommendations : value === "history" ? t.history : t.favorites} layout="waterfall" dividerPosition="none" mobileSurface="plain"
    products={collection.map((item) => ({
      id: item.id, title: item.title, href: item.href, image: item.image, imageAlt: item.title,
      priceCurrent: money(item.priceCents), priceOriginal: item.originalPriceCents ? money(item.originalPriceCents) : undefined,
      availability: item.availability, availabilityLabel: item.availability === "delisted" ? t.delisted : t.soldOut,
      onNotify: item.notifyAvailable ? () => setNotifications((current) => [...current, item.id]) : undefined,
      notifyLabel: notifications.includes(item.id) ? t.notified : locale === "zh" ? "到货通知" : t.notify,
      notifyDisabled: notifications.includes(item.id), addButtonAriaLabel: `${t.add} ${item.title}`,
    }))}
    onAddToCart={(id) => { const item = collection.find((entry) => entry.id === id); if (item) addItem(item); }} /> : <p>{t.emptyTab}</p>;
  }
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
          <ul className={styles.guarantees}>{cartGuarantees.map((guarantee) => <li key={guarantee.en}><Button className={styles.guaranteeAction} variant="tertiary" size="sm" aria-haspopup="dialog" onClick={() => setDrawer("protection")} leftIcon={<img src={`https://cdn.yamibuy.net/mkt/${guarantee.image}_0x0.png`} alt="" width={20} height={20} />}>{mobile && locale === "en" && guarantee === cartGuarantees[0] ? "Global & Secure Payments" : guarantee[locale]}</Button></li>)}</ul>
          {!mobile ? <Button className={styles.learnLink} variant="tertiary" size="sm" aria-haspopup="dialog" onClick={() => setDrawer("protection")}>{t.learn}</Button> : null}
        </section>;
  const couponSection = <section className={styles.couponSection}><h2>{t.coupons}</h2>{!mobile ? <CouponCodeForm locale={locale} onRedeem={redeem} /> : null}
          {signedIn ? <div className={styles.sectionHeader}><span>{coupon ? coupon.title : eligibleCoupons.length > 0 ? locale === "zh" ? `${eligibleCoupons.length} 张可用优惠券` : `${eligibleCoupons.length} available ${eligibleCoupons.length === 1 ? "coupon" : "coupons"}` : t.noCoupons}</span><Button className={`${styles.actionLink} ${styles.couponAction}`} size="md" variant="tertiary" aria-label={`${t.edit} ${t.coupons}`} aria-haspopup="dialog" onClick={openCoupons}>{t.edit}</Button></div>
            : <p className={styles.couponSignIn}><Button className={`${styles.actionLink} ${styles.signInLink}`} variant="tertiary" size="sm" aria-haspopup="dialog" onClick={() => setSignInOpen(true)}>{t.emptyLogin}</Button>{" "}{t.signInCoupons}</p>}
          {coupon && totals.discountCents === 0 ? <p className={styles.attention}>{t.couponSelected}</p> : null}
        </section>;
  function selectAll(checked: boolean) {
    setFeedback(null); setCheckoutError(false);
    setItems((current) => current.map((item) => item.availability === "available" ? { ...item, selected: checked } : item));
  }


  function renderCheckoutBar(inSummary = false) {
    return <div className={styles.checkoutBar} data-slot="cart-checkout-bar" hidden={mobileSummaryOpen && !inSummary}>
          {mobile ? <><label className={styles.checkoutAll}><Checkbox checked={allSelected} onCheckedChange={selectAll} /><span>{locale === "zh" ? t.all : "All"}</span></label><Button className={styles.checkoutTotal} variant="tertiary" aria-label={`${t.details} ${money(totals.totalCents)}`} aria-haspopup="dialog" aria-expanded={mobileSummaryOpen} onClick={() => mobileSummaryOpen ? closeDrawer() : setDrawer("summary")}><span><small>{inSummary ? t.orderSubtotal : t.estimated}</small> <strong>{money(totals.totalCents)}</strong><span className={styles.totalChevron} aria-hidden="true" /></span><small>{totals.quantity === 0 ? "" : totals.shippingCents === 0 ? t.free : `${t.shipping} ${money(totals.shippingCents)}`}</small></Button></> : null}{checkoutError && totals.quantity === 0 ? <p className={styles.checkoutHint} role="alert">{t.choose}</p> : null}<Button variant="emphasis" size="lg" form="full" onClick={() => { if (!signedIn) { if (inSummary) closeDrawer(); setSignInOpen(true); return; } if (totals.quantity === 0) { setCheckoutError(true); return; } setDrawer("summary"); }}>{t.checkout}{totals.quantity > 0 && !inSummary ? ` (${totals.quantity})` : ""}</Button></div>;
  }
  function renderAppNavigation(inSummary = false) {
    return <nav data-slot="cart-app-navigation" hidden={mobileSummaryOpen && !inSummary} className={styles.appNavigation} aria-label={locale === "zh" ? "App 导航" : "App navigation"}>
      <a href={header.homeHref}><img src={mobileIcons.yami} alt="" width={24} height={24} /><span>YAMI</span></a>
      <a href={`https://www.yami.com/us/${locale}/search`}><img src={mobileIcons.shop} alt="" width={24} height={24} /><span>{t.shopNav}</span></a>
      <a href={`https://www.yami.com/us/${locale}/show`}><img src={mobileIcons.community} alt="" width={24} height={24} /><span>{t.community}</span></a>
      <button type="button" aria-current="page" aria-label={`${locale === "zh" ? t.cart : "Cart"} ${cartQuantity}`} onClick={() => { if (inSummary) closeDrawer(); setPageTab("cart"); window.scrollTo({ top: 0 }); }}><span className={styles.navIcon}><img src={mobileIcons.cart} alt="" width={24} height={24} /><Badge className={styles.navCartCount} color="red" aria-hidden="true">{cartQuantity > 99 ? "99+" : cartQuantity}</Badge></span><span>{locale === "zh" ? t.cart : "Cart"}</span></button>
      <a href={header.account?.href}><img src={mobileIcons.account} alt="" width={24} height={24} /><span>{t.account}</span></a>
    </nav>;
  }

  return <div className={styles.page} lang={locale} data-slot="cart-page" data-page-tab={pageTab} data-signed-in={signedIn} style={{ "--cart-header-height": `${desktopHeaderHeight}px` } as CSSProperties}>
    <div ref={desktopHeaderRef} className={styles.desktopHeader} data-slot="cart-desktop-header"><Header {...header} account={signedIn ? header.account : { ...header.account, label: t.signInRegister }} cart={{ ...header.cart, count: cartQuantity }} />
      {!mobile && notice.item ? <CartAddNotice ref={addNoticeRef} item={notice.item} locale={locale} onClose={() => { addNoticeTriggerRef.current?.focus({ preventScroll: true }); setNotice({ message: "", drawer: null }); }} /> : null}
    </div>
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
        <section className={`${styles.overview} ${!loading && !error && available.length === 0 ? styles.emptyOverview : ""}`} aria-labelledby="cart-title">
          <div className={styles.titleRow}>
            <h1 ref={titleRef} tabIndex={-1} id="cart-title">{t.cart}</h1>
            <CartSecurityCarousel locale={locale} />
          </div>
          {!loading && !error && available.length > 0 ? <label className={styles.selectAll}>
            <span className={styles.selectionControl}><Checkbox checked={allSelected}
              onCheckedChange={(checked) => { setFeedback(null); setCheckoutError(false); setItems((current) => current.map((item) => item.availability === "available" ? { ...item, selected: checked } : item)); }} /></span>
            <span>{t.all} <small>({merchantCount} {locale === "en" && merchantCount === 1 ? "seller" : t.merchants}, {itemCountLabel(cartQuantity)})</small></span>
          </label> : null}
          {!loading && !error && available.length === 0 ? <div className={styles.emptyState} data-slot="cart-empty-state">
            <h2>{t.empty}</h2><p>{signedIn ? t.emptyBrowse : <><Button className={`${styles.actionLink} ${styles.signInLink}`} variant="tertiary" size="sm" aria-haspopup="dialog" onClick={() => setSignInOpen(true)}>{t.emptyLogin}</Button>{" "}{t.emptyHint}</>}</p>
          </div> : null}
        </section>
        {loading ? <section className={styles.state} aria-busy="true"><p role="status">{t.loading}</p>{Array.from({ length: 4 }, (_, index) => <div key={index} className={styles.skeleton} aria-hidden="true" />)}</section>
          : error ? <section className={styles.state}><p role="alert">{error}</p>{onRetry ? <Button onClick={onRetry}>{t.retry}</Button> : null}</section>
            : <>
              {notice.message && !drawer && (mobile || !notice.item) ? <div className={styles.notice}><span role="status">{notice.message}</span></div> : null}
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
                {!signedIn ? renderCollection("recommended", recommendations) : <Tabs value={tab} onValueChange={setTab}>
                  <TabsList variant="tertiary" aria-label={locale === "zh" ? "商品分类" : "Product collections"}>
                    <TabsTrigger value="recommended">{t.recommendations}</TabsTrigger><TabsTrigger ref={savedTabRef} value="saved">{t.save} ({saved.length})</TabsTrigger>
                    <TabsTrigger value="history">{t.history}</TabsTrigger><TabsTrigger value="favorites">{t.favorites}</TabsTrigger>
                  </TabsList>
                  {Object.entries(collections).map(([value, collection]) => <TabsContent key={value} value={value}>
                    {renderCollection(value, collection)}
                  </TabsContent>)}
                  <TabsContent value="saved">
                    {saved.length > 0 ? <ul ref={savedGridRef} className={styles.savedGrid} data-slot="cart-saved-grid">{saved.map((item) => <li key={item.id} className={styles.savedItem}>
                      <ProductCard title={item.title} href={item.href} image={item.image} imageAlt={item.title} priceCurrent={money(item.priceCents)} priceOriginal={item.originalPriceCents ? money(item.originalPriceCents) : undefined}
                        availability={item.availability} availabilityLabel={item.availability === "delisted" ? t.delisted : t.soldOut}
                        onAddToCart={() => addItem(item, false)} addButtonAriaLabel={`${t.move} ${item.title}`}
                        onNotify={item.notifyAvailable ? () => { setNotifications((current) => [...current, item.id]); } : undefined} notifyLabel={notifications.includes(item.id) ? t.notified : locale === "zh" ? "到货通知" : t.notify} notifyDisabled={notifications.includes(item.id)} />
                      <div className={styles.savedActions} data-slot="cart-saved-actions"><Button className={styles.actionLink} size="sm" variant="tertiary" aria-label={`${t.remove} ${item.title}`} onClick={() => removeItem(item, true)}>{t.remove}</Button></div>
                    </li>)}</ul> : <p className={styles.state}>{t.emptyTab}</p>}
                  </TabsContent>
                </Tabs>}
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
        {renderCheckoutBar()}
        {!mobile ? protection : null}
      </aside> : null}
    </main>
      </TabsContent>
      <TabsContent value="reorder" className={styles.reorderPanel}>
        <Tabs role="main" aria-label={t.reorder} value={reorderTab} onValueChange={(value) => { setReorderTab(value); setReorderCategory("all"); }}>
          <TabsList variant="secondary" aria-label={t.reorder}><TabsTrigger value="your">{t.yourReorder}</TabsTrigger><TabsTrigger value="frequent">{t.frequent}</TabsTrigger></TabsList>
          {notice.message && (mobile || !notice.item) ? <p className={styles.notice} role="status">{notice.message}</p> : null}
          <Tabs className={styles.reorderCategories} value={reorderCategory} onValueChange={setReorderCategory}>
            <TabsList variant="tertiary" aria-label={t.categories}>
              {["all", ...categories].map((category) => <TabsTrigger key={category} value={category} controls={`${reorderResultsId}-${reorderTab}`}>{category === "all" ? locale === "zh" ? "全部" : "All" : category}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          {["your", "frequent"].map((value) => <TabsContent value={value} key={value}>
            <ul id={`${reorderResultsId}-${value}`} aria-label={reorderCategory === "all" ? t.categories : reorderCategory} className={styles.reorderGrid} data-slot="cart-reorder-grid">{(value === "your" ? yourReorderItems : frequentlyBoughtItems).filter((item) => reorderCategory === "all" || item.category === reorderCategory).map((item) => <li key={item.id}>
              <ProductCard title={item.title} href={item.href} image={item.image} imageAlt={item.title} priceCurrent={money(item.priceCents)} priceOriginal={item.originalPriceCents ? money(item.originalPriceCents) : undefined}
                availability={item.availability} availabilityLabel={item.availability === "delisted" ? t.delisted : t.soldOut}
                onAddToCart={() => addItem({ ...item, quantity: 1 })} addButtonAriaLabel={`${t.move} ${item.title}`} />
              <Badge className={styles.purchaseBadge} color="neutral" emphasis="secondary"><span>{item.purchaseCount}</span> {t.purchased}</Badge>
            </li>)}</ul>
            {(value === "your" ? yourReorderItems : frequentlyBoughtItems).filter((item) => reorderCategory === "all" || item.category === reorderCategory).length === 0 ? <p className={styles.state}>{t.emptyTab}</p> : null}
          </TabsContent>)}
        </Tabs>
      </TabsContent>
      </div>
    </Tabs>
    {renderAppNavigation()}
    <div className={styles.footer}><Footer {...footer} /></div>
    <Dialog open={signInOpen} title={t.signInRegister} closeLabel={t.close} onClose={() => setSignInOpen(false)} footer={<ButtonGroup full aria-label={t.signInRegister}>
      <Button variant="secondary" form="full" onClick={() => setSignInOpen(false)}>{t.continueBrowsing}</Button>
      <ButtonLink form="full" href={header.account.href ?? `https://customer.yami.com/us/${locale}/orders`} target="_blank" rel="noopener noreferrer">{t.emptyLogin}</ButtonLink>
    </ButtonGroup>}><p>{t.signInHint}</p></Dialog>
    <Drawer className={`${styles.cartDrawer} ${drawer === "protection" ? styles.protectionDrawer : drawer === "unavailable" ? styles.unavailableDrawer : drawer === "coupons" ? styles.couponDrawer : drawer === "summary" ? styles.summaryDrawer : ""}`} open={drawer !== null && (signedIn || drawer !== "coupons")} title={mobileSummaryOpen ? t.orderDetails : drawer ? drawerTitles[drawer] : ""} size={mobileSummaryOpen ? "content" : "full"} closeLabel={t.close} onClose={closeDrawer}
      description={mobile && drawer === "coupons" ? t.couponHint : undefined}
      onAfterClose={() => { if (restoreTitleRef.current) { (mobile ? mobileCartTabRef.current : titleRef.current)?.focus({ preventScroll: true }); restoreTitleRef.current = false; } }}
      footer={mobileSummaryOpen ? <>{renderCheckoutBar(true)}{renderAppNavigation(true)}</> : drawer === "coupons" ? <CartCouponActions locale={locale} onSave={saveCoupons} disabled={Boolean(draftCouponId && !eligibleCoupons.some((entry) => entry.id === draftCouponId))} /> : drawer === "protection" || drawer === "unavailable" ? undefined : <div className={styles.drawerFooter}><Button size="lg" form="full" onClick={closeDrawer}>{drawer === "summary" ? t.back : t.done}</Button></div>}>
      {notice.message && drawer && notice.drawer === drawer ? <div className={styles.drawerNotice}><p role="status">{notice.message}</p></div> : null}
      {drawer === "coupons" ? <CartCoupons locale={locale} coupons={coupons} couponId={draftCouponId} subtotalCents={totals.subtotalCents} quantity={totals.quantity} mobile={mobile} onRedeem={(code) => redeem(code, setDraftCouponId)} onSelect={setDraftCouponId} /> : null}
      {drawer === "unavailable" ? unavailable.length === 0 ? <p ref={emptyDrawerRef} tabIndex={-1} className={styles.drawerEmpty}>{t.unavailableEmpty}</p> : <ul className={styles.itemList}>{unavailableRows}</ul> : null}
      {drawer === "protection" ? <CartProtectionDetails locale={locale} /> : null}
      {drawer === "summary" ? mobile ? <CartOrderDetails locale={locale} items={items} merchants={merchants} totals={totals} /> : <><p>{t.selected} {itemCountLabel(totals.quantity)}</p><ul className={styles.orderItems}>{available.filter((item) => item.selected).map((item) => <li key={item.id}><span>{item.title}<small>× {item.quantity}</small></span><strong>{money(item.priceCents * item.quantity)}</strong></li>)}</ul>
        <div className={styles.summary}><dl>
          <div><dt>{t.subtotal}</dt><dd>{money(totals.subtotalCents)}</dd></div>
          <div><dt>{t.shipping}</dt><dd>{totals.shippingCents === 0 ? t.free : money(totals.shippingCents)}</dd></div>
          {totals.discountCents > 0 ? <div><dt>{t.discount}</dt><dd>−{money(totals.discountCents)}</dd></div> : null}
          <div className={styles.total}><dt>{t.total}</dt><dd>{money(totals.totalCents)}</dd></div>
        </dl></div><p className={styles.muted}>{t.tax}</p></> : null}
    </Drawer>
  </div>;
}
