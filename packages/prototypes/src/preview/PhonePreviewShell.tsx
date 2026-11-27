"use client";

import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import wifi from "./assets/ios-wifi.svg";
import battery from "./assets/ios-battery.svg";
import { SafariPreviewToolbar, type SafariPreviewToolbarProps } from "./SafariPreviewToolbar";

// Next returns image metadata; Storybook's manager returns an asset URL.
const assetUrl = (asset: string | { src: string }) => typeof asset === "string" ? asset : asset.src;

export { PhonePreviewInsets } from "./PhonePreviewInsets";

export interface PhonePreviewShellProps {
  frame: HTMLIFrameElement | null;
  enabled?: boolean;
  theme?: "light" | "dark";
  mode?: "app" | "h5";
  safari?: Omit<SafariPreviewToolbarProps, "theme">;
}

/** Transparent host chrome overlays the full iframe viewport. */
export function PhonePreviewShell({ frame, enabled = true, theme = "light", mode = "app", safari }: PhonePreviewShellProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const parent = frame?.parentElement;
    if (!parent || !enabled) {
      setHost(null);
      return;
    }
    const update = () => {
      const mobile = parent.clientWidth > 0 && parent.clientWidth < 768;
      parent.toggleAttribute("data-phone-preview-host", mobile);
      if (mobile) parent.setAttribute("data-phone-preview-mode", mode);
      else parent.removeAttribute("data-phone-preview-mode");
      setHost(mobile ? parent : null);
    };
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    update();
    return () => {
      observer.disconnect();
      parent.removeAttribute("data-phone-preview-host");
      parent.removeAttribute("data-phone-preview-mode");
    };
  }, [frame, enabled, mode]);

  useLayoutEffect(() => {
    if (!frame) return;
    const origin = new URL(frame.src, window.location.href).origin;
    const send = () => frame.contentWindow?.postMessage({ type: "yami:phone-preview:insets", active: Boolean(host && enabled), mode }, origin);
    const receive = (event: MessageEvent) => {
      if (event.source === frame.contentWindow && event.origin === origin && event.data?.type === "yami:phone-preview:ready") send();
    };
    frame.addEventListener("load", send);
    window.addEventListener("message", receive);
    send();
    return () => {
      frame.removeEventListener("load", send);
      window.removeEventListener("message", receive);
      frame.contentWindow?.postMessage({ type: "yami:phone-preview:insets", active: false }, origin);
    };
  }, [frame, host, enabled, mode]);

  if (!host || !enabled) return null;
  return createPortal(
    <div className={theme === "dark" ? "dark" : undefined} data-phone-preview-shell="" data-phone-preview-mode={mode} data-theme={theme} aria-hidden={mode === "app" ? true : undefined}>
      <style>{`
        [data-phone-preview-host] { position: relative; border-radius: 40px; }
        [data-phone-preview-host] > iframe {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 0 !important;
          border-radius: inherit;
          clip-path: inset(0 round 40px);
        }
        [data-phone-preview-shell] {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          border-radius: inherit; overflow: hidden;
          color: #000; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        [data-phone-preview-shell][data-theme="dark"] { color: #fff; }
        [data-phone-preview-status], [data-phone-preview-home] {
          position: absolute; left: 0; right: 0; background: transparent;
        }
        [data-phone-preview-status] {
          top: 0; height: 62px; box-sizing: border-box; padding: 3px 8px 0;
          display: grid; grid-template-columns: minmax(0, 1fr) 95px minmax(0, 1fr); align-items: center;
          font-size: 17.67px; font-weight: 590; line-height: 22px;
          font-variation-settings: "wdth" 100;
        }
        [data-phone-preview-time], [data-phone-preview-levels] {
          display: flex; width: min(145.5px, 100%); box-sizing: border-box; min-width: 0; align-items: center; justify-content: center;
        }
        [data-phone-preview-time] { height: 13px; }
        [data-phone-preview-island] { align-self: stretch; padding-top: 11px; }
        [data-phone-preview-island]::after { content: ""; display: block; height: 36.667px; border-radius: 100px; background: #000; }
        [data-phone-preview-levels] { justify-self: end; gap: 8px; }
        [data-phone-preview-cellular] { display: flex; gap: 2.333px; align-items: flex-end; padding-top: 1.333px; }
        [data-phone-preview-cellular] > i { display: block; width: 3.333px; border-radius: 4px; background: currentColor; }
        [data-phone-preview-cellular] > i:nth-child(1) { height: 6.333px; }
        [data-phone-preview-cellular] > i:nth-child(2) { height: 8.67px; }
        [data-phone-preview-cellular] > i:nth-child(3) { height: 11px; }
        [data-phone-preview-cellular] > i:nth-child(4) { height: 13.667px; }
        [data-phone-preview-levels] > img { display: block; flex: none; }
        [data-phone-preview-shell][data-theme="dark"] [data-phone-preview-levels] > img { filter: invert(1); }
        [data-phone-preview-home] { bottom: 0; height: 34px; display: flex; align-items: flex-end; justify-content: center; }
        [data-phone-preview-home]::after { content: ""; width: 144px; height: 5px; margin-bottom: 8px; border-radius: 100px; background: currentColor; }
      `}</style>
      <div data-phone-preview-status="" aria-hidden="true">
        <span data-phone-preview-time="">9:41</span>
        <span data-phone-preview-island="" />
        <span data-phone-preview-levels="">
          <span data-phone-preview-cellular=""><i /><i /><i /><i /></span>
          <img src={assetUrl(wifi)} width="19.333" height="14.3333" alt="" />
          <img src={assetUrl(battery)} width="29.333" height="13.6667" alt="" />
        </span>
      </div>
      {mode === "h5" && safari && <SafariPreviewToolbar {...safari} theme={theme} />}
      <div data-phone-preview-home="" aria-hidden="true" />
    </div>,
    host,
  );
}

/** Page folders can also contain isolated component stories and email previews. */
export function isPhonePreviewPage(title: string) {
  return /^YAMI\/(pages|design)\//i.test(title)
    && !/\/(components|email templates)(\/|$)/i.test(title);
}
