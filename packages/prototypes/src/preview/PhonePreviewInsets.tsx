"use client";

import React, { useLayoutEffect, useState } from "react";

/** The embedded document owns its safe areas; the host only draws the chrome. */
export function PhonePreviewInsets({ enabled = true }: { enabled?: boolean }) {
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<"app" | "h5">("app");
  const [statusBackground, setStatusBackground] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    setMode(new URLSearchParams(window.location.search).get("previewMode") === "h5" ? "h5" : "app");
    if (window.parent === window) return;
    const receive = (event: MessageEvent) => {
      if (event.source === window.parent && event.data?.type === "yami:phone-preview:insets" && typeof event.data.active === "boolean") {
        setActive(event.data.active);
        if (event.data.mode === "app" || event.data.mode === "h5") setMode(event.data.mode);
      }
    };
    window.addEventListener("message", receive);
    // This contains no page data; it also supports a cross-origin Storybook host.
    window.parent.postMessage({ type: "yami:phone-preview:ready" }, "*");
    return () => window.removeEventListener("message", receive);
  }, [enabled]);

  useLayoutEffect(() => {
    document.documentElement.toggleAttribute("data-phone-preview-content", enabled && active);
    return () => document.documentElement.removeAttribute("data-phone-preview-content");
  }, [enabled, active, mode]);

  useLayoutEffect(() => {
    if (enabled && mode === "h5") document.documentElement.setAttribute("data-prototype-preview-mode", "h5");
    else document.documentElement.removeAttribute("data-prototype-preview-mode");
    return () => document.documentElement.removeAttribute("data-prototype-preview-mode");
  }, [enabled, mode]);

  useLayoutEffect(() => {
    if (!enabled || !active) return;
    let animationFrame = 0;
    const update = () => {
      if (window.scrollY <= 0) {
        setStatusBackground(null);
        return;
      }
      const headers = document.querySelectorAll<HTMLElement>('[data-slot="sticky-storefront-header"], [data-slot="cart-mobile-header"], [data-slot="topic-landing-global-header"], [data-slot="campaign-header"], [data-slot="header-mobile"]');
      const background = Array.from(headers)
        .filter((header) => header.getBoundingClientRect().height > 0)
        .map((header) => getComputedStyle(header).backgroundColor)
        .find((color) => color !== "transparent" && color !== "rgba(0, 0, 0, 0)");
      setStatusBackground(background ?? "var(--surface-primary)");
    };
    // Read after the page's scroll handler has updated the sticky navigation.
    const schedule = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, active, mode]);

  useLayoutEffect(() => {
    if (!enabled || !active || mode !== "h5") return;
    // Only page-owned fixed bars extend beneath Safari; inline tabs and drawer
    // controls keep their ordinary backgrounds and positioning.
    const selector = '[data-slot="tab-bar"], [data-slot="cart-app-navigation"], [data-slot="cart-checkout-bar"], [data-slot="product-detail-purchase-checkout"]';
    const update = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((bar) => {
        const fixed = getComputedStyle(bar).position === "fixed" && !bar.closest("[data-drawer]");
        if (bar.hasAttribute("data-phone-preview-bottom-bar") !== fixed) {
          bar.toggleAttribute("data-phone-preview-bottom-bar", fixed);
        }
      });
    };
    const observer = new MutationObserver(update);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      document.querySelectorAll("[data-phone-preview-bottom-bar]").forEach((bar) => bar.removeAttribute("data-phone-preview-bottom-bar"));
    };
  }, [enabled, active, mode]);

  if (!enabled) return null;
  const h5Styles = mode === "h5" ? <style>{`
    @media (max-width: 767px) {
      html[data-prototype-preview-mode="h5"] [data-slot="cart-app-navigation"] { display: none; }
      html[data-prototype-preview-mode="h5"] [data-slot="cart-page"] { padding-bottom: calc(var(--space-800) + env(safe-area-inset-bottom)); }
      html[data-prototype-preview-mode="h5"] [data-slot="cart-page"][data-page-tab="reorder"] { padding-bottom: env(safe-area-inset-bottom); }
      html[data-prototype-preview-mode="h5"] [data-slot="cart-checkout-bar"]:not([data-drawer] *) { bottom: ${active ? 86 : 0}px; }
    }
  `}</style> : null;
  if (!active) return h5Styles;
  const bottomInset = mode === "h5" ? 86 : 34;
  return <><style>{`
    html[data-phone-preview-content] { scroll-padding-block: 62px ${bottomInset}px; scrollbar-width: none; }
    html[data-phone-preview-content]::-webkit-scrollbar { display: none; }
    html[data-phone-preview-content] body { padding-bottom: ${bottomInset}px; }
    html[data-phone-preview-content] :is([data-slot="ecommerce-home"], [data-slot$="-page"], .prototype-unavailable, .placeholder-route) {
      padding-top: 62px;
    }
    html[data-phone-preview-content] :is([data-slot="sticky-storefront-header"], [data-slot="cart-mobile-header"], [data-slot="topic-landing-global-header"], [data-slot="campaign-header"], [data-slot="product-detail-page"] > [data-slot="header"]) { top: 62px; }
    html[data-phone-preview-content] [data-slot="topic-landing-tabs"] { top: calc(62px + var(--topic-landing-header-height, 0px)); }
    html[data-phone-preview-content] [data-slot="campaign-section-nav"] { top: calc(62px + var(--campaign-header-height)); }
    html[data-phone-preview-content] [data-slot="cart-discovery"] > [data-slot="tabs"] > [role="tablist"] { top: 118px; }
    html[data-phone-preview-content] :is([data-slot="cart-app-navigation"], [data-slot="product-detail-purchase-checkout"]):not([data-drawer] *) { bottom: ${bottomInset}px; }
    html[data-phone-preview-content] [data-slot="cart-checkout-bar"]:not([data-drawer] *) { bottom: 83px; }
    html[data-phone-preview-content] [data-slot="campaign-sticky-cta"] { bottom: max(var(--space-300), ${bottomInset}px); }
    html[data-phone-preview-content] [data-drawer][data-swipe-direction] { max-height: calc(100dvh - ${62 + bottomInset}px); }
    html[data-phone-preview-content] [data-drawer][data-swipe-direction="down"] { bottom: ${bottomInset}px; }
    html[data-phone-preview-content] [data-drawer][data-swipe-direction]:not([data-swipe-direction="down"]) { top: 62px; }
    html[data-phone-preview-content][data-prototype-preview-mode="h5"] [data-phone-preview-bottom-bar] { bottom: 86px; }
    html[data-phone-preview-content][data-prototype-preview-mode="h5"] [data-phone-preview-bottom-bar]::after {
      content: ""; position: absolute; inset: 100% 0 auto; height: 86px;
      background: inherit; pointer-events: none;
    }
    [data-phone-preview-status-surface] { position: fixed; inset: 0 0 auto; height: 62px; z-index: 20; pointer-events: none; }
  `}</style>{h5Styles}{statusBackground && <div data-phone-preview-status-surface="" aria-hidden="true" style={{ backgroundColor: statusBackground }} />}</>;
}
