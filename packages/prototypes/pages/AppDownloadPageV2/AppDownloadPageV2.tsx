"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Badge, Button, Card, Checkbox, Divider, Footer, HorizontalScrollList,
  ProductCard, ProductList, ReviewList, SectionBanner, SocialMediaGallery, Tabs, TabsList, TabsTrigger, useHorizontalScrollList,
} from "@yami/design-system";
import {
  appDownloadBannerDescription, appDownloadBannerTitle, appStoreHref, asset, calculateSavings, campaignCopy, campaignProducts,
  categories, categoryLabels, createAppDownloadBanners, downloadHref, featuredProducts,
  money, playStoreHref, productHref, productImage,
  type AppDownloadLocale,
} from "./fixtures";
import { createEcommerceHomeFixture } from "../EcommerceHome/fixtures";
import { RailNavigation } from "../../../design-system/components/Button/RailNavigation";
import { SectionHeading } from "../../../design-system/components/SectionHeading";
import { StoreDownloadButtons } from "../AppDownloadPage/StoreDownloadButtons";
import styles from "./AppDownloadPageV2.module.css";
import socialTrends from "./social-trends.json";
import customerReviews from "./customer-reviews.json";
import { dividerAttributes, type AppDownloadSectionDividers } from "./sectionDividers";
import type { SectionDividerProps } from "../../../design-system/components/sectionDivider.types";
import brandSpecial from "./brand-special.json";
import { BrandSpecial } from "./BrandSpecial";

const socialAsset = (name: string) => new URL(`./assets/social/${name}`, import.meta.url).href;

const homeFooter = createEcommerceHomeFixture("en").footer;
const arrowDown = new URL("../../../design-system/assets/icons/system/arrow-down.svg", import.meta.url).href;
const localeFlag = new URL("../../../design-system/assets/icons/area/korea-flag.svg", import.meta.url).href;
const desktopLogo = new URL("../../../design-system/assets/logos/yami-ui-en-pc-fill.svg", import.meta.url).href;
const logo = new URL("../../../design-system/assets/logos/yami-ui-en-mobile-fill.svg", import.meta.url).href;
const sectionIds = ["welcome-coupon", "discount-products", "coupon-guide", "savings-calculator", "brand-special", "sns-trend", "reviews"];

function DownloadLinks() {
  return <div className={styles.downloadLinks}>
    <StoreDownloadButtons className={styles.downloadButtons} appStoreHref={appStoreHref} playStoreHref={playStoreHref} />
    <a className={styles.qr} href={downloadHref} aria-label="Scan QR Code to download"><img src={asset("download-qr.svg")} alt="" /></a>
  </div>;
}

function SavingsCalculator({ locale, onGuide, ...divider }: { locale: AppDownloadLocale; onGuide: () => void } & SectionDividerProps) {
  const [mode, setMode] = useState<"welcome" | "app">("welcome");
  const [amount, setAmount] = useState(30);
  const [selected, setSelected] = useState<string[]>([]);
  const { listRef, state: railState, updateState, scrollByPage } = useHorizontalScrollList({ enabled: mode === "app", itemCount: featuredProducts.length, minimumPageDistance: 128 });
  const t = campaignCopy[locale].calculator;
  const ko = locale === "ko";
  const result = calculateSavings(mode, amount, featuredProducts.filter((product) => selected.includes(product.sku)));
  return <section {...dividerAttributes(divider)} id="savings-calculator" className={styles.calculatorSection}>
    <div className={styles.calculator}>
      <SectionHeading
        align="center" slot="savings-calculator" className={styles.calculatorHeading}
        title={ko ? "내 혜택 미리 계산해보기" : "Calculate My Savings"}
        description={ko ? "쿠폰과 배송비 혜택을 직접 확인해보세요" : "Check your exact discount and shipping benefits live"}
      />
      <div className={styles.calculatorTabs} role="tablist" aria-label={ko ? "쿠폰 선택" : "Choose coupon"}>
        <button id="calculator-tab-welcome" type="button" role="tab" className={styles.calculatorTab} aria-selected={mode === "welcome"} aria-controls="calculator-panel-welcome" onClick={() => setMode("welcome")}>
          <span className={styles.couponTab}>
            <span className={styles.couponTabLabel}>{ko ? "쿠폰 1" : "Coupon 1"}</span>
            <span className={styles.couponTabTitle}>{t.tab1Title_combo1010}</span>
            <span className={styles.calculatorTabHint}>{t.tab1Badge}</span>
          </span>
        </button>
        <button id="calculator-tab-app" type="button" role="tab" className={styles.calculatorTab} aria-selected={mode === "app"} aria-controls="calculator-panel-app" onClick={() => setMode("app")}>
          <span className={styles.couponTab}>
            <span className={styles.couponTabLabel}>{ko ? "쿠폰 2" : "Coupon 2"}</span>
            <span className={styles.couponTabTitle}>{t.tab2Title}</span>
            <span className={styles.calculatorTabHint}>{t.tab2Badge}</span>
          </span>
        </button>
      </div>
        <Card padding="lg" className={styles.calculatorCard}>
          <div className={styles.calculatorInput}>
          <div className={styles.amountHeading}>
            <div><h3>{mode === "welcome" ? t.card1Title : (ko ? "선택 상품 쿠폰 적용 후 합계" : "Selected Items After Coupon")}</h3><p>{mode === "welcome" ? t.sliderHint : selected.length ? (ko ? `${selected.length}개 선택 · 배송비 별도` : `${selected.length} selected · Shipping excluded`) : (ko ? "상품을 선택하면 할인과 최종 결제 금액을 확인할 수 있어요." : "Select products to see your discount and final payment.")}</p></div>
            <strong data-testid="selected-items-total">{money(mode === "welcome" ? result.subtotal : Math.max(0, result.subtotal - result.discount))}</strong>
          </div>
          <div id="calculator-panel-welcome" role="tabpanel" aria-labelledby="calculator-tab-welcome" hidden={mode !== "welcome"} className={styles.calculatorControls}>
            <label className={styles.srOnly} htmlFor="campaign-order-amount">{t.card1Title}</label>
            <input id="campaign-order-amount" className={styles.slider} type="range" min={12} max={100} step={1} value={amount} onChange={(event) => setAmount(Number(event.target.value))} aria-valuetext={money(amount)} />
            <div className={styles.ticks} aria-hidden="true">{[12, 25, 50, 75, 100].map((value) => <span key={value} style={{ left: `${(value - 12) / 88 * 100}%` }}>{money(value).replace(".00", "")}</span>)}</div>
          </div>
          <div id="calculator-panel-app" role="tabpanel" aria-labelledby="calculator-tab-app" hidden={mode !== "app"} className={styles.calculatorControls}>
            {selected.length > 0 && <p className={styles.selectionSavings} data-testid="selection-savings-hint">
              {ko ? <>선택한 상품으로 최대 <strong>{money(result.saved)}</strong> 절약하세요!</> : <>Save up to <strong>{money(result.saved)}</strong> on your selected items!</>}
            </p>}
            {selected.length === 0 && <div className={styles.selectionNavigation}>
              <span>{ko ? `추천 상품 ${featuredProducts.length}개 · 쿠폰 적용가` : `${featuredProducts.length} products · Prices after coupon`}</span>
            </div>}
            <div className={styles.selectionRailFrame}>
            <HorizontalScrollList as="ul" ref={listRef} onScroll={updateState} className={styles.selectionRail} aria-label={ko ? "혜택 계산 상품" : "Products for savings calculation"}>
              {featuredProducts.map((product) => <li key={product.sku} className={styles.selectionProduct} data-selected={selected.includes(product.sku)} onClick={(event) => {
                if ((event.target as HTMLElement).closest('a, [role="checkbox"], input')) return;
                setSelected((current) => current.includes(product.sku) ? current.filter((sku) => sku !== product.sku) : [...current, product.sku]);
              }}>
                <ProductCard
                  surface="card" href="" brandHref=""
                  title={product.name[locale]} image={productImage(product)} imageAlt={product.name[locale]}
                  brand={product.brand[locale]}
                  priceCurrent={money(product.appPrice)}
                />
                <a className={styles.comparePrice} href={productHref(product, locale)}>{ko ? "웹 가격과 비교해보기" : "Compare Web Price"}</a>
                <span className={styles.selectionCheck}><Checkbox checked={selected.includes(product.sku)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, product.sku] : current.filter((sku) => sku !== product.sku))} aria-label={product.name[locale]} /></span>
              </li>)}
            </HorizontalScrollList>
              <RailNavigation className={styles.selectionEdgeNavigation}
                previousLabel={ko ? "이전 추천 상품" : "Previous featured products"}
                nextLabel={ko ? "다음 추천 상품" : "Next featured products"}
                previousDisabled={railState.atStart} nextDisabled={railState.atEnd}
                onPrevious={() => scrollByPage(-1)} onNext={() => scrollByPage(1)} />
            </div>
            <p className={styles.moreDeals}>{ko ? "추천 상품 일부입니다. 더 많은 혜택 상품은 " : "These are a few featured picks. See more deals "}<a href="#discount-products">{ko ? "여기" : "here"}</a></p>
          </div>
          </div>
          <div className={styles.calculatorDetails}>
          <dl className={styles.breakdown}>
            <div><dt>{mode === "welcome" ? t.card1Title : t.card2Title}</dt><dd>{money(result.subtotal)}</dd></div>
            <div><dt>{mode === "welcome" ? t.tab1Title_combo1010 : t.tab2Title}</dt><dd className={styles.saving}>−{money(result.discount)}</dd></div>
          </dl>
          {mode === "welcome" && <button type="button" className={styles.textAction} onClick={onGuide}>{ko ? "영상 속 숨은 추가 혜택까지 포함" : "Hidden extra perk in the video included"}</button>}
          <dl className={styles.breakdown}>
            <div><dt>{ko ? "배송비" : "Shipping Fee"} <Badge color={result.freeShipping ? "green" : "red"} emphasis="secondary">{result.freeShipping ? (ko ? "$49 이상 무료" : "Free over $49") : (ko ? "$49 미만" : "Under $49")}</Badge></dt><dd>{result.shipping ? "+" : ""}{money(result.shipping)}</dd></div>
          </dl>
          </div>
          <Divider />
          <div className={styles.calculatorResult}>
          {mode === "app" && <dl className={styles.breakdown}><div className={styles.saving}><dt>{ko ? "총 절약 금액" : "TOTAL SAVINGS"}</dt><dd data-testid="total-savings">{money(result.saved)}</dd></div></dl>}
          <div className={styles.total} aria-live="polite"><span>{ko ? "예상 최종 결제 금액" : "Est. Final Payment"}</span><output data-testid="final-payment">{money(result.total)}</output></div>
          </div>
          <div className={styles.shippingProgress}>
          {!result.freeShipping && <p className={styles.shippingHint}>{result.subtotal === 0 ? (ko ? "상품을 선택하고 혜택을 확인해보세요!" : "Select items to see how much you can save!") : ko ? `상품할인 ${money(result.discount)} 절약 중 (할인 적용 후 $49 이상 담으면 $5.99 추가 절감!)` : `Saving ${money(result.discount)} on items (Reach $49 after discounts to save another $5.99!)`}</p>}
          <progress className={styles.progress} max={1} value={result.progress} aria-label={ko ? "무료 배송까지" : "Progress to free shipping"} />
          </div>
        </Card>
    </div>
  </section>;
}

export interface AppDownloadPageV2Props { initialLocale?: AppDownloadLocale; contentMaxWidth?: number | string; sectionDividers?: AppDownloadSectionDividers }

export function AppDownloadPageV2({ initialLocale = "ko", contentMaxWidth = 1440, sectionDividers = {} }: AppDownloadPageV2Props) {
  const [locale, setLocale] = useState(initialLocale);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [category, setCategory] = useState<string>("beauty");
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [showSticky, setShowSticky] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const pendingSection = useRef<string | null>(null);
  const contentWidth = typeof contentMaxWidth === "number" ? `${contentMaxWidth}px` : contentMaxWidth;
  const pageStyle = { "--campaign-content-max-width": contentWidth } as CSSProperties;
  const t = campaignCopy[locale];
  const ko = locale === "ko";
  const labels = [t.nav.categories.welcomeCoupon, t.nav.categories.discountProducts, t.nav.categories.couponGuide, ko ? "혜택 계산기" : "Calculator", brandSpecial[locale].title, socialTrends[locale].title, customerReviews[locale].title];

  useEffect(() => {
    const update = () => {
      const downloadButtons = root.current?.querySelector<HTMLElement>(`[data-campaign-hero] .${styles.downloadButtons}`);
      const bounds = downloadButtons?.getBoundingClientRect();
      const headerBottom = root.current?.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const downloadButtonsVisible = bounds && bounds.bottom > headerBottom && bounds.top < window.innerHeight;
      setShowSticky(Boolean(bounds && !downloadButtonsVisible));
      if (pendingSection.current) return;
      let active = sectionIds[0];
      for (const id of sectionIds) {
        if ((root.current?.querySelector(`#${id}`)?.getBoundingClientRect().top ?? Infinity) <= 180) active = id;
      }
      setActiveSection(active);
    };
    const resumeTracking = () => {
      pendingSection.current = null;
      update();
    };
    const onScrollEnd = (event: Event) => {
      if (event.target !== document) return;
      const target = pendingSection.current && root.current?.querySelector<HTMLElement>(`#${pendingSection.current}`);
      if (target && Math.abs(target.getBoundingClientRect().top - parseFloat(getComputedStyle(target).scrollMarginTop)) > 2) return;
      resumeTracking();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) resumeTracking();
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("wheel", resumeTracking, { passive: true });
    window.addEventListener("touchstart", resumeTracking, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("wheel", resumeTracking);
      window.removeEventListener("touchstart", resumeTracking);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void player.play().catch(() => { /* The native play control remains available. */ });
      } else {
        player.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  const showGuide = (time: number) => {
    const player = video.current;
    root.current?.querySelector("#coupon-guide")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    if (player) {
      player.currentTime = time;
      void player.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
    }
  };

  return <><div className={styles.root} style={pageStyle} lang={locale} ref={root} data-slot="app-download-page">
    <header className={styles.header}><div>
      <a href={`https://www.yami.com/${locale}`} aria-label="Yami Home"><picture><source media="(min-width: 1024px)" srcSet={desktopLogo} /><img className={styles.logo} src={logo} alt="YAMI" /></picture></a>
      <div className={styles.headerActions}>
        <Button className={styles.languageButton} variant="secondary" leftIcon={<img className={styles.flag} src={localeFlag} alt="" />} onClick={() => setLocale(ko ? "en" : "ko")} aria-label={ko ? "Switch to English" : "한국어로 전환"}>{ko ? "KO" : "EN"}</Button>
        <a className={styles.shopLink} href={`https://www.yami.com/${locale}`}>{t.nav.shopNow}</a>
      </div>
    </div></header>
    <main>
      <section {...dividerAttributes(sectionDividers.hero ?? {})} className={styles.hero} data-campaign-hero>
        <div className={styles.downloadContainer}>
          <div className={styles.heroCopy}>
            <div className={styles.heroHeading}>
            <span className={styles.offerBadge}>{t.hero.badge}</span>
            <div className={styles.heroTitleGroup}>
              <h1>{t.hero.headline}</h1>
              <p className={styles.heroDescription}>{t.hero.subheadline}</p>
            </div>
            </div>
            <p className={styles.appNotice}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>{t.hero.appOnlyNotice}</p>
          </div>
          <DownloadLinks />
        </div>
      </section>
      <nav className={styles.sectionNav} aria-label={ko ? "페이지 섹션" : "Page sections"}>
        <Tabs value={activeSection} onValueChange={(id) => {
          pendingSection.current = id;
          setActiveSection(id);
          root.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
        }}>
          <TabsList centerActiveTab align="center" edgePadding variant="primary" styleVariant="a" inverse aria-label={ko ? "페이지 섹션" : "Page sections"}>
            {sectionIds.map((id, index) => <TabsTrigger key={id} value={id} controls={id}>{labels[index]}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </nav>
      <section {...dividerAttributes(sectionDividers["welcome-coupon"] ?? {})} id="welcome-coupon" className={styles.couponSection}>
        <Card padding="none" className={styles.couponPanel}>
          <div className={styles.couponHeading}>
            <p className={styles.eyebrow}>{t.coupon.preTitle}</p>
            <div className={styles.couponTitleGroup}>
              <h2>{t.coupon.title}</h2>
              <p>{t.coupon.subtitle}</p>
            </div>
          </div>
          <div className={styles.coupons}>
            {[t.coupon.first, t.coupon.returning].map((coupon, index) => <div className={styles.coupon} key={coupon.code}>
              <p className={styles.couponBadge}>{ko ? (index ? "다음 주문" : "첫 주문") : (index ? "Next order" : "First order")} · {coupon.badge}</p>
              <h3>{coupon.title.split(/(\$[\d,]+)/).map((part, partIndex) => part.startsWith("$") ? <strong className={styles.couponAmount} key={partIndex}>{part}</strong> : part)}</h3>
              <div className={styles.couponCode}>
                <div className={styles.couponCopy}>{ko ? "쿠폰코드:" : "Code:"} <span>{coupon.code}</span><button type="button" aria-label={`${ko ? "복사" : "Copy"} ${coupon.code}`} onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(coupon.code);
                    setCopiedCode(coupon.code);
                    setCopyFailed(false);
                  } catch {
                    setCopyFailed(true);
                  }
                }}>{copiedCode === coupon.code ? (ko ? "복사됨" : "Copied") : (ko ? "복사" : "Copy")}</button></div>
                <button type="button" onClick={() => showGuide(index ? 23 : 0)}>{ko ? "적용법 보기" : "How to use"}</button>
              </div>
            </div>)}
          </div>
          <p className={styles.srOnly} role="status">{copyFailed ? (ko ? "복사하지 못했어요. 쿠폰코드를 직접 선택해 복사해 주세요." : "Could not copy. Select the coupon code to copy it manually.") : copiedCode ? `${copiedCode} ${ko ? "복사됨" : "copied"}` : ""}</p>
          <div className={styles.terms}>
            <Divider />
            <div className={styles.termsCopy}>
            <p>{t.coupon.eligibility}</p>
            <p><strong>{ko ? "이용 방법: " : "How to use: "}</strong>{ko ? "앱 다운로드 후 첫 주문 시 KOREA 코드를 사용하세요. WELCOME26은 다음 주문에 사용 가능해요. 아래 " : "Download the app and use KOREA on your first order. Use WELCOME26 on your next order. Watch the "}<button type="button" className={styles.textAction} onClick={() => showGuide(12)}>{ko ? "영상" : "video"}</button>{ko ? " 재생 시 숨겨진 추가 혜택을 확인할 수 있어요." : " below to unlock hidden extra benefits."}</p>
            <p><strong>{ko ? "주의사항: " : "Note: "}</strong>{t.coupon.notice}</p><p>{t.coupon.details}</p>
            </div>
          </div>
          <a className={styles.dealsLink} href="#discount-products">{ko ? "앱 전용 혜택 상품 보러가기" : "Explore App-Only Deals"}<img src={arrowDown} alt="" /></a>
        </Card>
      </section>
        <ProductList
          id="discount-products"
          title={t.nav.categories.discountProducts}
          description={ko ? "웰컴 쿠폰팩 적용으로 상상 초월 폭풍 할인!" : "Unlock incredible savings with your welcome coupon pack!"}
          appearance="background" headingAlign="center" layout="rail" dividerPosition="none" {...sectionDividers["discount-products"]}
          backgroundColor="var(--brand-tertiary)"
          tabs={categories.map((value, index) => ({ value, label: categoryLabels[locale][index] }))}
          value={category} onValueChange={setCategory}
          previousLabel={ko ? "이전 상품" : "Previous products"} nextLabel={ko ? "다음 상품" : "Next products"}
          products={campaignProducts.filter((product) => product.category === category).map((product) => ({
            id: product.sku, title: product.name[locale], image: productImage(product), imageAlt: product.name[locale],
            href: productHref(product, locale), brand: product.brand[locale], brandHref: productHref(product, locale),
            priceCurrent: <>{money(product.appPrice)} <span className={styles.appPriceLabel}>{ko ? "(앱 전용가)" : "(App Price)"}</span></>, priceOriginal: money(product.originalPrice),
            unitPrice: <a className={styles.dealComparePrice} href={productHref(product, locale)}>{ko ? "웹 가격과 비교해보기" : "Compare Web Price"}</a>,
            badges: [{ type: "discount" as const, label: `${product.discountPercent}% OFF` }],
          }))}
        />
      <section {...dividerAttributes(sectionDividers["coupon-guide"] ?? {})} id="coupon-guide" className={styles.guideSection}>
        <div className={styles.guideContainer}>
          <SectionHeading
            align="center" slot="coupon-guide"
            title={t.nav.categories.couponGuide}
            description={ko ? "영상 속에 숨겨진 추가 혜택을 확인해보세요" : "Watch the video to discover hidden extra benefits"}
          />
          <video className={styles.video} ref={video} controls muted loop playsInline preload="metadata" aria-label={ko ? "쿠폰 적용 안내 영상" : "Coupon redemption tutorial"}><source src={asset("Final_video_0811.mp4")} type="video/mp4" /></video>
        </div>
      </section>
      <SavingsCalculator {...sectionDividers["savings-calculator"]} locale={locale} onGuide={() => showGuide(12)} />
      <SectionBanner
        className={styles.storyBanner}
        title={appDownloadBannerTitle}
        description={appDownloadBannerDescription}
        headingAlign="center"
        items={createAppDownloadBanners()}
        previousLabel={ko ? "이전 상품" : "Previous products"}
        nextLabel={ko ? "다음 상품" : "Next products"}
        imageLoading="eager"
      />
      <BrandSpecial {...sectionDividers["brand-special"]} locale={locale} />
      <SocialMediaGallery
        {...sectionDividers["sns-trend"]}
        id="sns-trend"
        className={styles.socialTrends}
        title={socialTrends[locale].title}
        description={socialTrends[locale].description}
        headingAlign="center"
        previousLabel={ko ? "이전 영상" : "Previous videos"}
        nextLabel={ko ? "다음 영상" : "Next videos"}
        cards={socialTrends.cards.map((card) => ({
          id: `social-trend-${card.id}`,
          posterSrc: socialAsset(card.poster),
          posterAlt: card.products.map((product) => product.title).join(", "),
          username: null,
          platformIconSrc: logo,
          caption: card.products.map((product) => product.title).join(", "),
          href: socialAsset(card.video),
          videoSrc: socialAsset(card.video),
          products: card.products.map((product) => ({
            id: product.id, title: product.title, imageAlt: product.title,
            imageSrc: socialAsset(product.image), href: product.href.replace("/us/ko/", `/us/${locale}/`),
          })),
        }))}
      />
      <ReviewList
        {...sectionDividers.reviews}
        id="reviews"
        className={styles.reviews}
        headingAlign="center"
        title={customerReviews[locale].title}
        description={customerReviews[locale].description}
        reviews={customerReviews.reviews.map((review) => ({
          ...review,
          review: <><strong className={styles.reviewTitle}>{review.title}</strong>{review.review}</>,
        }))}
        mobileSurface="plain"
        previousLabel={ko ? "이전 리뷰" : "Previous reviews"}
        nextLabel={ko ? "다음 리뷰" : "Next reviews"}
      />
      <section {...dividerAttributes({ dividerPosition: "top", dividerVariant: "gray", ...sectionDividers["bottom-cta-section"] })} className={styles.bottom} id="bottom-cta-section">
        <div className={styles.downloadContainer}>
          <div className={styles.heroHeading}>
            <span className={styles.offerBadge}>{t.bottom.badge_combo1010}</span>
            <div className={styles.heroTitleGroup}>
              <h2>{t.bottom.title}</h2>
              <p className={styles.heroDescription}>{t.bottom.subtitle}</p>
            </div>
          </div>
          <DownloadLinks />
        </div>
      </section>
    </main>
    {showSticky && <a className={styles.stickyCta} href={appStoreHref}>{ko ? "앱 전용 첫 구매 혜택 받기" : "Claim Your App-Only Deal"}<img src={asset("chevron-right.svg")} alt="" /></a>}
  </div><div className={styles.footerContainer} style={pageStyle} lang="en"><Footer {...homeFooter} /></div></>;
}
