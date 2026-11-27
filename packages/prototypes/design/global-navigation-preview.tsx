"use client";

import { useSyncExternalStore } from "react";
import { useDesktopViewport } from "@yami/design-system";
import { H5HomeDraftHeader } from "../../design-system/storybook/H5HeaderDrafts";
import { EcommerceHomeTemplate, createEcommerceHomeFixture } from "../pages/EcommerceHome";
import { MobileHomePreview } from "../pages/EcommerceHome/MobileHomePreview";
import { SearchResultsPage, createSearchResultsFixture } from "../pages/SearchResultsPage";
import type { DesignPreviewProps } from "./projects";

const categoriesPath = "/categories/all";

function subscribeToHash(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}

export function GlobalNavigationPreview({ homeHeader, locale, home, hrefFor }: DesignPreviewProps & { homeHeader: "v1" | "v2" }) {
  const desktop = useDesktopViewport();
  const categoriesOpen = useSyncExternalStore(subscribeToHash, () => window.location.hash === `#${categoriesPath}`, () => false);
  if (!hrefFor && homeHeader === "v1" && categoriesOpen) {
    const results = createSearchResultsFixture(locale);
    return <SearchResultsPage {...results} query="" resultCount={results.products.length}
      header={{ ...results.header, homeHref: "#/" }} mobileBackHref="#/" />;
  }
  if (desktop) return <EcommerceHomeTemplate {...(home ?? createEcommerceHomeFixture(locale))} />;
  return <MobileHomePreview platform="H5" locale={locale} home={home} hrefFor={hrefFor}
    staticTabBar
    headerContent={<H5HomeDraftHeader version={homeHeader} locale={locale} categoryHref={hrefFor?.(categoriesPath) ?? `#${categoriesPath}`} />} />;
}
