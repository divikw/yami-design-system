"use client";

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActivityPageHeader,
  BrandProductRail,
  Footer,
  Header,
  CollectionCard,
  HorizontalScrollList,
  ProductList,
  ReviewList,
  SectionHeading,
  ServiceCommitment,
  ShortcutRail,
  Tabs,
  TabsList,
  TabsTrigger,
  ThemeHero,
  ThemeProductList,
  UserReviews,
} from "@yami/design-system";

import styles from "./TopicLandingPage.module.css";
import type { CollectionModuleDividers, TopicLandingPageProps } from "./TopicLandingPage.types";
import { createCollectionHeroGallery } from "./CollectionHeroGallery";
import { RelatedKeywords } from "./RelatedKeywords";
import {
  CollectionProductFilters,
  createCollectionProductFilters,
  filterCollectionProducts,
} from "./CollectionProductFilters";

const SECTION_REVEAL_ROOT_MARGIN = "0px 0px -40px 0px";
const SCROLLABLE_OVERFLOW = /^(auto|scroll|overlay)$/;
const EXPLORE_MORE_PAGE_SIZE = 60;
const COLLECTION_FILTER_MIN_PRODUCTS = 12;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const dividerClasses = {
  top: styles.dividerTop,
  bottom: styles.dividerBottom,
  both: styles.dividerBoth,
  none: styles.dividerNone,
};

type ModuleDivider = CollectionModuleDividers[keyof CollectionModuleDividers];

function dividerClass(position: ModuleDivider) {
  return position && dividerClasses[position];
}

// Components with a single-edge API draw the bottom edge of a two-sided divider.
function componentDivider(position: ModuleDivider) {
  return position === "both" ? "bottom" : position;
}

export function resolveTopicLandingScrollRoot(
  element: HTMLElement,
): Window | HTMLElement {
  let ancestor = element.parentElement;
  while (ancestor) {
    if (SCROLLABLE_OVERFLOW.test(window.getComputedStyle(ancestor).overflowY)) {
      return ancestor;
    }
    ancestor = ancestor.parentElement;
  }
  return window;
}

export function getTopicLandingActivationLine(
  scrollRoot: Window | HTMLElement,
  tabsHeight: number,
) {
  if (scrollRoot === window) return tabsHeight + 1;
  const element = scrollRoot as HTMLElement;
  return element.getBoundingClientRect().top + element.clientTop + tabsHeight + 1;
}

export function TopicLandingPage({
  moduleDividers = {},
  contentMaxWidth = 1440,
  titleFontFamily = "serif",
  showChrome = true,
  revealHeaderOnScrollUp = false,
  activityHeader,
  header,
  hero,
  couponSection,
  primaryTabs,
  shortcutRail,
  standardRail,
  reviewList,
  reviewsAfterProducts = false,
  faq,
  relatedKeywords,
  appReviews,
  serviceCommitment,
  relatedCollections,
  productRail,
  brandRail,
  waterfall,
  footer,
  hiddenModules = [],
  className,
  ...rest
}: TopicLandingPageProps) {
  const couponHeadingId = useId();
  const faqHeadingId = useId();
  const faqDescriptionId = `${faqHeadingId}-description`;
  const mainRef = useRef<HTMLElement>(null);
  const waterfallRef = useRef<HTMLDivElement>(null);
  const activityHeaderRef = useRef<HTMLDivElement>(null);
  const globalHeaderRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const initialViewportPrepared = useRef(false);
  const primaryTabsRef = useRef<HTMLDivElement>(null);
  const pendingPrimaryTabValueRef = useRef<string | null>(null);
  const [primaryTabValue, setPrimaryTabValue] = useState(
    primaryTabs.defaultValue,
  );
  const contentMaxWidthValue =
    typeof contentMaxWidth === "number"
      ? `${contentMaxWidth}px`
      : contentMaxWidth;
  const [waterfallTabValue, setWaterfallTabValue] = useState(
    () =>
      waterfall.value ??
      waterfall.defaultValue ??
      waterfall.tabs?.find((tab) => !tab.disabled)?.value ??
      "",
  );
  const [waterfallPageCounts, setWaterfallPageCounts] = useState<Record<string, number>>({});
  const [waterfallColumns, setWaterfallColumns] = useState(2);
  const [productRailTabValue, setProductRailTabValue] = useState(
    () =>
      productRail.value ??
      productRail.defaultValue ??
      productRail.tabs?.find((tab) => !tab.disabled)?.value ??
      "",
  );
  const {
    products: productRailFallbackProducts,
    productsByTab: productRailProductsByTab,
    ...productRailProps
  } = productRail;
  const activeProductRailTab = productRail.value ?? productRailTabValue;
  const visibleProductRailProducts =
    productRailProductsByTab?.[activeProductRailTab] ?? productRailFallbackProducts;
  const selectProductRailTab = (value: string) => {
    if (productRail.value === undefined) setProductRailTabValue(value);
    productRail.onValueChange?.(value);
  };
  const {
    products: waterfallFallbackProducts,
    productsByTab: waterfallProductsByTab,
    catalogFilters,
    initialRows,
    rowsPerPage,
    ...waterfallProps
  } = waterfall;
  const allWaterfallProducts = waterfallProductsByTab?.all ?? waterfallFallbackProducts;
  const showCatalogFilters = catalogFilters && allWaterfallProducts.length >= (
    catalogFilters === "brand" ? 1 : COLLECTION_FILTER_MIN_PRODUCTS
  );
  const brandOptions = useMemo(() => catalogFilters === "brand"
    ? [...new Set(allWaterfallProducts.flatMap(({ brand }) => typeof brand === "string" && brand.trim() ? [brand] : []))]
    : undefined, [catalogFilters, allWaterfallProducts]);
  const [collectionFilters, setCollectionFilters] = useState(() =>
    createCollectionProductFilters(catalogFilters ? allWaterfallProducts : undefined),
  );
  const activeWaterfallTab = catalogFilters === "brand" ? "all" : (
    waterfall.value ?? (catalogFilters && !showCatalogFilters ? "all" : waterfallTabValue)
  );
  const waterfallCategoryProducts =
    waterfallProductsByTab?.[activeWaterfallTab] ?? waterfallFallbackProducts;
  const waterfallProducts = useMemo(
    () => showCatalogFilters
      ? filterCollectionProducts(waterfallCategoryProducts, collectionFilters)
      : waterfallCategoryProducts,
    [showCatalogFilters, waterfallCategoryProducts, collectionFilters],
  );
  const waterfallPageSize = rowsPerPage === undefined
    ? EXPLORE_MORE_PAGE_SIZE
    : rowsPerPage * waterfallColumns;
  const waterfallInitialSize = initialRows === undefined
    ? waterfallPageSize
    : initialRows * waterfallColumns;
  const waterfallExtraPages = waterfallPageCounts[activeWaterfallTab] ?? 0;
  const waterfallVisibleCount = waterfallInitialSize + waterfallExtraPages * waterfallPageSize;
  const visibleWaterfallProducts = useMemo(
    () => waterfallProducts.slice(0, waterfallVisibleCount),
    [waterfallProducts, waterfallVisibleCount],
  );
  const loadMoreWaterfallProducts = () => {
    setWaterfallPageCounts((counts) => ({
      ...counts,
      [activeWaterfallTab]: (counts[activeWaterfallTab] ?? 0) + 1,
    }));
  };
  const selectWaterfallTab = (value: string) => {
    if (waterfall.value === undefined) {
      setWaterfallTabValue(value);
    }
    waterfall.onValueChange?.(value);
  };
  const selectPrimaryTab = (value: string) => {
    const item = primaryTabs.items.find((tab) => tab.value === value);
    if (!item) return;

    pendingPrimaryTabValueRef.current = value;
    setPrimaryTabValue(value);
    window.history.pushState(null, "", `#${item.targetId}`);
    window.requestAnimationFrame(() => {
      const target = document.getElementById(item.targetId);
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target?.scrollIntoView({
        block: "start",
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  };
  const linkedShortcutItems = shortcutRail.items.map((item) => ({
    ...item,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      item.onClick?.(event);
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const targetValue = item.href.startsWith("#explore-more-")
        ? item.href.slice("#explore-more-".length)
        : undefined;
      if (!targetValue || !waterfallProductsByTab?.[targetValue]) return;

      event.preventDefault();
      selectWaterfallTab(targetValue);
      window.history.pushState(null, "", item.href);
      window.requestAnimationFrame(() => {
        const target = mainRef.current?.querySelector<HTMLElement>(
          '[data-page-slot="topic-landing-waterfall"]',
        );
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        target?.scrollIntoView({
          block: "start",
          behavior: reducedMotion ? "auto" : "smooth",
        });
        target
          ?.querySelector<HTMLButtonElement>(
            '[role="tab"][data-state="active"]',
          )
          ?.focus({ preventScroll: true });
      });
    },
  }));

  useLayoutEffect(() => {
    const desktop = globalHeaderRef.current;
    const mobile = catalogFilters ? activityHeaderRef.current : null;
    const updateHeight = () => setHeaderHeight(
      (desktop?.getBoundingClientRect().height ?? 0) || mobile?.getBoundingClientRect().height || 0,
    );
    updateHeight();
    if (!desktop) return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(desktop);
    if (mobile) observer.observe(mobile);
    return () => observer.disconnect();
  }, [catalogFilters, showChrome]);

  useLayoutEffect(() => {
    const element = globalHeaderRef.current;
    if (!revealHeaderOnScrollUp || !element?.offsetHeight) return;
    const scrollRoot = resolveTopicLandingScrollRoot(element);
    const scrollElement = scrollRoot instanceof HTMLElement ? scrollRoot : document.scrollingElement;
    if (!scrollElement) return;
    let previousTop = scrollElement.scrollTop;
    const updateHeader = () => {
      const top = Math.max(0, Math.min(scrollElement.scrollTop, scrollElement.scrollHeight - scrollElement.clientHeight));
      if (Math.abs(top - previousTop) < 4 && top > 0) return;
      element.toggleAttribute("data-scrolling-up", top > 0 && top < previousTop);
      previousTop = top;
    };
    scrollRoot.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", updateHeader);
      element.removeAttribute("data-scrolling-up");
    };
  }, [headerHeight, revealHeaderOnScrollUp]);

  const showWaterfall = !hiddenModules.includes("explore-more");
  const measureWaterfallColumns = initialRows !== undefined || rowsPerPage !== undefined;
  useLayoutEffect(() => {
    if (!measureWaterfallColumns || !showWaterfall) return;
    const grid = waterfallRef.current?.querySelector<HTMLElement>('[data-slot="product-list-items"]');
    if (!grid) return;

    const updateColumns = () => {
      if (!grid.clientWidth) return;
      const tracks = getComputedStyle(grid).gridTemplateColumns;
      setWaterfallColumns(tracks.trim().split(/\s+/).length);
    };
    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(grid);
    window.addEventListener("resize", updateColumns);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateColumns);
    };
  }, [measureWaterfallColumns, showWaterfall]);

  useLayoutEffect(() => {
    const targetId = window.location.hash.slice(1);
    const matchingTab = primaryTabs.items.find(
      (item) => item.targetId === targetId,
    );
    if (matchingTab) setPrimaryTabValue(matchingTab.value);
  }, [primaryTabs.items]);

  useLayoutEffect(() => {
    const primaryTabsElement = primaryTabsRef.current;
    if (!primaryTabsElement) return;
    const scrollRoot = resolveTopicLandingScrollRoot(primaryTabsElement);
    const scrollTarget: EventTarget = scrollRoot;
    const scrollElement = scrollRoot === window ? document.scrollingElement : scrollRoot as HTMLElement;
    const lastTab = primaryTabs.items.at(-1);

    let animationFrame = 0;
    const updateActiveTab = () => {
      animationFrame = 0;
      const activationLine = getTopicLandingActivationLine(
        scrollRoot,
        headerHeight + primaryTabsElement.getBoundingClientRect().height,
      );
      const maxScrollTop = scrollElement ? scrollElement.scrollHeight - scrollElement.clientHeight : 0;
      const reachedPageEnd = maxScrollTop > 0 && maxScrollTop <= (scrollElement?.scrollTop ?? 0) + 1;
      const pendingValue = pendingPrimaryTabValueRef.current;
      if (pendingValue) {
        const pendingItem = primaryTabs.items.find(
          (item) => item.value === pendingValue,
        );
        const pendingSection = pendingItem
          ? document.getElementById(pendingItem.targetId)
          : null;
        const pendingSectionTop =
          pendingSection?.getBoundingClientRect().top ??
          Number.POSITIVE_INFINITY;
        const reachedPendingSection =
          pendingSectionTop <= activationLine &&
          pendingSectionTop >= activationLine - 2;

        if (!reachedPendingSection && !(reachedPageEnd && pendingValue === lastTab?.value)) return;
        pendingPrimaryTabValueRef.current = null;
      }

      // The last section may be too short to reach the sticky tabs at the end of the page.
      if (reachedPageEnd && lastTab && document.getElementById(lastTab.targetId)) {
        setPrimaryTabValue(lastTab.value);
        return;
      }

      let nextValue = primaryTabs.items[0]?.value ?? primaryTabs.defaultValue;

      for (const item of primaryTabs.items) {
        const section = document.getElementById(item.targetId);
        if (!section || section.getBoundingClientRect().top > activationLine) {
          break;
        }
        nextValue = item.value;
      }

      setPrimaryTabValue((currentValue) =>
        currentValue === nextValue ? currentValue : nextValue,
      );
    };
    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveTab);
    };
    const finishProgrammaticNavigation = () => {
      const pendingValue = pendingPrimaryTabValueRef.current;
      if (!pendingValue) return;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = window.requestAnimationFrame(() => {
          animationFrame = 0;
          updateActiveTab();
          if (pendingPrimaryTabValueRef.current !== pendingValue) return;
          pendingPrimaryTabValueRef.current = null;
          updateActiveTab();
        });
      });
    };

    updateActiveTab();
    scrollTarget.addEventListener("scroll", scheduleUpdate, { passive: true });
    scrollTarget.addEventListener("scrollend", finishProgrammaticNavigation);
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      scrollTarget.removeEventListener("scroll", scheduleUpdate);
      scrollTarget.removeEventListener("scrollend", finishProgrammaticNavigation);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [headerHeight, primaryTabs.defaultValue, primaryTabs.items]);

  useLayoutEffect(() => {
    if (waterfall.value !== undefined) return;
    const hashPrefix = "#explore-more-";
    if (!window.location.hash.startsWith(hashPrefix)) return;

    const targetValue = window.location.hash.slice(hashPrefix.length);
    if (waterfallProductsByTab?.[targetValue]) {
      setWaterfallTabValue(targetValue);
    }
  }, [waterfall.value, waterfallProductsByTab]);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealSections = Array.from(
      main.querySelectorAll<HTMLElement>('[data-motion-reveal="scroll"]'),
    );
    const waterfallRowItems = window.matchMedia("(min-width: 1024px)").matches
      ? Array.from(
          main.querySelectorAll<HTMLElement>(
            '[data-slot="topic-landing-waterfall-section"] [data-slot="product-list-item"]',
          ),
        )
      : [];
    waterfallRowItems.forEach((target) => {
      target.dataset.motionReveal = "scroll-row";
    });
    const waterfallRows = waterfallRowItems.reduce<HTMLElement[][]>(
      (rows, target) => {
        const previousRow = rows.at(-1);
        const previousTop = previousRow?.[0]?.offsetTop;
        if (
          previousTop === undefined ||
          Math.abs(target.offsetTop - previousTop) > 1
        ) {
          rows.push([target]);
        } else {
          previousRow?.push(target);
        }
        return rows;
      },
      [],
    );
    const waterfallRowByTrigger = new Map(
      waterfallRows.map((row) => [row[0], row]),
    );
    const revealTargets = [
      ...revealSections,
      ...waterfallRows.map((row) => row[0]),
    ];
    const initialReveal = main.querySelector<HTMLElement>(
      '[data-motion-reveal="initial"]',
    );
    initialReveal?.setAttribute("data-motion-observed", "true");
    revealTargets.forEach((target) => {
      target.dataset.motionObserved = "true";
    });
    waterfallRowItems.forEach((target) => {
      target.dataset.motionObserved = "true";
    });

    // Start every first-screen content fade together, independently of image
    // decoding and the observers used for later scroll reveals.
    if (!initialViewportPrepared.current) {
      initialViewportPrepared.current = true;
      const scrollRoot = resolveTopicLandingScrollRoot(main);
      const rootBounds = scrollRoot === window
        ? { top: 0, bottom: window.innerHeight }
        : (scrollRoot as HTMLElement).getBoundingClientRect();
      const inInitialViewport = (element: HTMLElement) => {
        const bounds = element.getBoundingClientRect();
        return bounds.bottom > Math.max(0, rootBounds.top) &&
          bounds.top < Math.min(window.innerHeight, rootBounds.bottom) &&
          bounds.right > 0 && bounds.left < window.innerWidth;
      };
      revealTargets.filter(inInitialViewport).forEach((target) => {
        const targets = waterfallRowByTrigger.get(target) ?? [target];
        targets.forEach((element) => {
          element.dataset.motionInitial = "true";
          const content = element.dataset.motionReveal === "scroll-row"
            ? element
            : element.querySelector<HTMLElement>(
                '[data-slot="shortcut-rail-container"], [data-slot="brand-product-rail-container"], [data-slot="product-list-container"], [data-slot="review-list-container"]',
              );
          if (content && !content.parentElement?.closest('[data-initial-fade="true"]')) {
            content.dataset.initialFade = "true";
          }
        });
      });
      main.querySelectorAll<HTMLElement>(
        '[data-slot="theme-hero-copy-content"] > :not([data-adaptive-image-scrim]), [data-slot="theme-hero-media"], [data-slot="topic-landing-tabs-container"]',
      ).forEach((element) => {
        element.dataset.initialFade = "true";
      });
      main.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
        if (!inInitialViewport(image)) return;
        image.loading = "eager";
        image.dataset.initialImage = image.complete && image.naturalWidth > 0
          ? "cached"
          : "pending";
      });
    }

    if (reducedMotion) {
      main.dataset.motionReady = "reduced";
      return;
    }

    if (!("IntersectionObserver" in window)) {
      initialReveal?.setAttribute("data-motion-state", "visible");
      revealTargets.forEach((target) => {
        target.dataset.motionState = "visible";
      });
      return;
    }

    let previousScrollY = window.scrollY;
    let scrollDirection: "down" | "up" = "down";
    let isInitialObservation = true;
    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY !== previousScrollY) {
        scrollDirection = currentScrollY > previousScrollY ? "down" : "up";
        previousScrollY = currentScrollY;
        if (scrollDirection === "up") {
          revealSections.forEach((target) => {
            if (target.dataset.motionState === "visible") {
              target.dataset.motionDirection = "up";
            }
          });
          waterfallRowItems.forEach((target) => {
            if (target.dataset.motionState === "visible") {
              target.dataset.motionDirection = "up";
            }
          });
        }
      }
    };
    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        entries
          .filter((entry) => !entry.isIntersecting)
          .forEach((entry) => {
            const target = entry.target as HTMLElement;
            const targets = waterfallRowByTrigger.get(target) ?? [target];
            targets.forEach((controlledTarget) => {
              delete controlledTarget.dataset.motionState;
              delete controlledTarget.dataset.motionDirection;
            });
          });
        visibleEntries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const targets = waterfallRowByTrigger.get(target) ?? [target];
          targets.forEach((controlledTarget) => {
            controlledTarget.dataset.motionDirection = isInitialObservation
              ? "down"
              : scrollDirection;
            controlledTarget.dataset.motionState = "visible";
          });
        });
        isInitialObservation = false;
      },
      {
        rootMargin: SECTION_REVEAL_ROOT_MARGIN,
      },
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollDirection);
      waterfallRowItems.forEach((target) => {
        delete target.dataset.motionReveal;
        delete target.dataset.motionObserved;
        delete target.dataset.motionState;
        delete target.dataset.motionDirection;
      });
    };
  }, [activeWaterfallTab, visibleWaterfallProducts]);

  const reviewsSection = reviewList && !hiddenModules.includes("reviews") ? (
    <div
      id="reviews"
      className={styles.reviewList}
      data-motion-reveal="scroll"
      data-slot="topic-landing-review-list"
    >
      <ReviewList
        {...reviewList}
        dividerPosition={componentDivider(moduleDividers.reviewList) ?? reviewList.dividerPosition}
        className={cx(reviewList.className, dividerClass(moduleDividers.reviewList))}
      />
    </div>
  ) : null;

  const collectionIntro = Boolean(catalogFilters && !hero.image);
  const heroGallery = useMemo(
    () => collectionIntro ? createCollectionHeroGallery(allWaterfallProducts) : null,
    [collectionIntro, allWaterfallProducts],
  );
  const heroIntro = (
    <ThemeHero
      {...hero}
      imageLoading="eager"
      style={heroGallery ? { ...hero.style, backgroundColor: "transparent", minHeight: 0 } : hero.style}
      className={cx(styles.initialReveal, collectionIntro && !heroGallery && styles.collectionIntro, hero.className, !heroGallery && dividerClass(moduleDividers.hero))}
      data-motion-reveal="initial"
    />
  );

  return (
    <div
      {...rest}
      className={cx(styles.root, catalogFilters && styles.collection, className)}
      data-slot="topic-landing-page"
      style={{
        ...rest.style,
        "--topic-landing-header-height": `${headerHeight}px`,
        "--topic-landing-content-max-width": contentMaxWidthValue,
      } as CSSProperties}
    >
      {serviceCommitment && (
        <ServiceCommitment
          mobileCarousel={Boolean(catalogFilters)}
          {...serviceCommitment}
          className={cx(styles.serviceCommitment, serviceCommitment.className, dividerClass(moduleDividers.serviceCommitment))}
        />
      )}
      {showChrome && (
        <>
          <div ref={activityHeaderRef} className={styles.activityHeader} data-slot="topic-landing-activity-header">
            <ActivityPageHeader
              {...activityHeader}
              className={cx(activityHeader.className, dividerClass(moduleDividers.header ?? (catalogFilters ? "bottom" : undefined)))}
            />
          </div>
          <div ref={globalHeaderRef} className={cx(styles.globalHeader, revealHeaderOnScrollUp && styles.revealHeader)} data-slot="topic-landing-global-header">
            <Header {...header} className={cx(header.className, dividerClass(moduleDividers.header))} />
          </div>
        </>
      )}

      <main
        ref={mainRef}
        className={styles.main}
        data-slot="topic-landing-main"
        data-motion-ready="true"
        data-content-max-width={contentMaxWidthValue}
        data-title-font-family={titleFontFamily}
      >
        {!hiddenModules.includes("hero") && (heroGallery ? (
          <div className={cx(styles.galleryHero, dividerClass(moduleDividers.hero))} data-slot="collection-gallery-hero">
            <div className={styles.galleryHeroInner}>
              {heroIntro}
              {heroGallery}
            </div>
          </div>
        ) : heroIntro)}
        {couponSection && couponSection.cards.length > 0 && (
          <section className={dividerClass(moduleDividers.couponSection)} aria-labelledby={couponHeadingId}>
            <div className={styles.couponContainer}>
              <SectionHeading id={couponHeadingId} title={couponSection.title} slot="coupon" />
              <HorizontalScrollList className={styles.couponSurface} role="group" aria-labelledby={couponHeadingId}>
                {couponSection.cards}
              </HorizontalScrollList>
            </div>
          </section>
        )}
        {primaryTabs.items.length > 0 && (
          <div
            ref={primaryTabsRef}
            className={styles.primaryTabs}
            data-slot="topic-landing-tabs"
          >
            <div
              className={styles.primaryTabsContainer}
              data-slot="topic-landing-tabs-container"
            >
              <Tabs
                value={primaryTabValue}
                onValueChange={selectPrimaryTab}
              >
                <TabsList
                  centerActiveTab
                  aria-label={primaryTabs.ariaLabel}
                  variant="primary"
                  styleVariant="a"
                >
                  {primaryTabs.items.map((item) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      controls={item.targetId}
                    >
                      {item.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}
        {!hiddenModules.includes("shortcuts") && (
          <div
            id="explore"
            className={styles.shortcutRail}
            data-motion-reveal="scroll"
            data-slot="topic-landing-shortcut-rail"
          >
            <ShortcutRail
              {...shortcutRail}
              presentation="image-card"
              items={linkedShortcutItems}
            />
          </div>
        )}
        {standardRail && !hiddenModules.includes("start-here") && (
          <div
            id="shop"
            className={styles.shopReveal}
            data-motion-reveal="scroll"
            data-slot="topic-landing-theme-product-list"
          >
            <ThemeProductList
              {...standardRail}
              className={cx(styles.shop, standardRail.className)}
            />
          </div>
        )}
        {!hiddenModules.includes("popular-picks") && (
          <div
            id="popular-picks"
            className={styles.standardRail}
            data-motion-reveal="scroll"
            data-slot="topic-landing-standard-rail"
          >
            <ProductList
              {...productRailProps}
              products={visibleProductRailProducts}
              value={activeProductRailTab}
              onValueChange={selectProductRailTab}
            />
          </div>
        )}
        {brandRail && !hiddenModules.includes("brand-spotlight") && (
          <div
            id="brand-spotlight"
            className={styles.brandRail}
            data-motion-reveal="scroll"
            data-slot="topic-landing-brand-rail"
          >
            <BrandProductRail
              {...brandRail}
              titleFontFamily={titleFontFamily}
            />
          </div>
        )}
        {!reviewsAfterProducts && reviewsSection}
        {showWaterfall && (
          <div
            id="product-list"
            ref={waterfallRef}
            className={styles.waterfallAnchor}
            data-motion-reveal="scroll"
            data-slot="topic-landing-waterfall-section"
          >
            <ProductList
              {...waterfallProps}
              dividerPosition={componentDivider(moduleDividers.waterfall) ?? waterfallProps.dividerPosition}
              {...(catalogFilters && {
                tabs: undefined,
                introContent: showCatalogFilters ? (
                  <CollectionProductFilters
                    locale={rest.lang?.startsWith("zh") ? "zh" : "en"}
                    brandOptions={brandOptions}
                    categories={(waterfallProps.tabs ?? [])
                      .filter(({ value, disabled }) => value !== "all" && value !== "complete-routine" && !disabled)
                      .map(({ value, label }) => ({ value, label: String(label) }))}
                    category={activeWaterfallTab === "all" ? "" : activeWaterfallTab}
                    filters={collectionFilters}
                    resultCount={waterfallProducts.length}
                    onChange={(filters, category) => {
                      selectWaterfallTab(category || "all");
                      setCollectionFilters(filters);
                      setWaterfallPageCounts({});
                    }}
                  />
                ) : undefined,
              })}
              id={`explore-more-${activeWaterfallTab}`}
              products={visibleWaterfallProducts}
              value={activeWaterfallTab}
              onValueChange={selectWaterfallTab}
              hasMore={visibleWaterfallProducts.length < waterfallProducts.length}
              onLoadMore={loadMoreWaterfallProducts}
              className={cx(styles.waterfall, dividerClass(moduleDividers.waterfall))}
              data-page-slot="topic-landing-waterfall"
            />
          </div>
        )}
        {reviewsAfterProducts && reviewsSection}
        {faq && faq.items.length > 0 && (
          <section
            id="faq"
            className={cx(styles.faq, dividerClass(moduleDividers.faq))}
            aria-labelledby={faqHeadingId}
            aria-describedby={faq.description ? faqDescriptionId : undefined}
          >
            <div className={styles.faqContainer}>
              <SectionHeading
                id={faqHeadingId}
                title={faq.title}
                description={faq.description}
                descriptionId={faqDescriptionId}
                className={styles.faqIntro}
                slot="faq"
              />
              <Accordion>
                {faq.items.map(({ id, question, answer }) => (
                  <AccordionItem key={id} value={id}>
                    <AccordionTrigger>{question}</AccordionTrigger>
                    <AccordionContent><p>{answer}</p></AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}
        {relatedCollections && relatedCollections.items.length > 0 && (
          <ProductList
            layout="rail"
            mobileSurface="plain"
            dividerPosition={componentDivider(moduleDividers.relatedCollections)}
            title={relatedCollections.title}
            titleFontFamily={titleFontFamily}
            previousLabel={relatedCollections.previousLabel}
            nextLabel={relatedCollections.nextLabel}
            className={cx(styles.relatedCollections, relatedCollections.items.length < 4 && styles.fillRelatedCollections, dividerClass(moduleDividers.relatedCollections))}
            railItems={relatedCollections.items.map(item => ({
              id: item.id,
              content: (
                <CollectionCard item={relatedCollections.items.length < 4
                  ? { ...item, products: item.products.slice(0, 3) }
                  : item} />
              ),
            }))}
          />
        )}
        {relatedKeywords && relatedKeywords.items.length > 0 && (
          <RelatedKeywords {...relatedKeywords} className={dividerClass(moduleDividers.relatedKeywords)} />
        )}
        {appReviews && (
          <UserReviews
            {...appReviews}
            dividerPosition={componentDivider(moduleDividers.appReviews) ?? appReviews.dividerPosition}
            className={cx(styles.appReviews, appReviews.className, dividerClass(moduleDividers.appReviews))}
            titleFontFamily={appReviews.titleFontFamily ?? titleFontFamily}
          />
        )}
      </main>

      {showChrome && <Footer {...footer} className={cx(footer.className, dividerClass(moduleDividers.footer))} />}
    </div>
  );
}
