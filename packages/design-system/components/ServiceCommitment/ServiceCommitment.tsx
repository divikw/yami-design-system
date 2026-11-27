"use client";

import { useEffect, useRef } from "react";
import { Divider } from "../Divider";

import styles from "./ServiceCommitment.module.css";

const icons = {
  shipping: new URL("./assets/shipping.svg", import.meta.url).href,
  us: new URL("./assets/us.svg", import.meta.url).href,
  sameDay: new URL("./assets/same-day.svg", import.meta.url).href,
  authentic: new URL("./assets/authentic.svg", import.meta.url).href,
  returns: new URL("./assets/returns.svg", import.meta.url).href,
};

const titles = { zh: "服务承诺", en: "Service commitments" };

const commitments = {
  en: [
    { icon: "shipping", label: "Free Shipping on Orders $49+ *" },
    { icon: "us", label: "Delivered from our U.S. warehouses *" },
    { icon: "sameDay", label: "Same-Day Delivery *" },
    { icon: "authentic", label: "Official Brand Partnerships" },
  ],
  zh: [
    { icon: "shipping", label: "满$49免运费" },
    { icon: "us", label: "从美国发货" },
    { icon: "sameDay", label: "当日送达*" },
    { icon: "authentic", label: "正品保证" },
    { icon: "returns", label: "无忧退换" },
  ],
} as const;

export interface ServiceCommitmentProps {
  /** Language for the built-in service commitments. Defaults to zh. */
  locale?: "zh" | "en";
  /** Cycle through centered rows of benefits that fit the available mobile width. */
  mobileCarousel?: boolean;
  /** Optional class for page layout. */
  className?: string;
}

export function ServiceCommitment({ locale = "zh", mobileCarousel = false, className }: ServiceCommitmentProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const items = commitments[locale];

  useEffect(() => {
    if (!mobileCarousel || !listRef.current) return;
    const list = listRef.current;
    const mobile = window.matchMedia("(width < 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    let transitions: Animation[] = [];
    const benefits = Array.from(list.querySelectorAll<HTMLElement>(`.${styles.benefit}`));
    function syncPlayback() {
      window.clearInterval(timer);
      transitions.forEach(animation => animation.cancel());
      const canScroll = mobile.matches && list.scrollHeight > list.clientHeight;
      if (canScroll) list.tabIndex = 0;
      else list.removeAttribute("tabindex");
      if (!canScroll || reducedMotion.matches) return;
      timer = window.setInterval(() => {
        if (document.hidden || list.matches(":focus-within, :active") || !list.clientHeight) return;
        transitions.forEach(animation => animation.cancel());
        const height = list.clientHeight;
        const rowCount = Math.round(list.scrollHeight / height);
        const current = Math.round(list.scrollTop / height);
        const next = (current + 1) % rowCount;
        list.scrollTo({ top: next * height, behavior: "instant" });
        transitions = [];
        for (const benefit of benefits) {
          const row = Math.round(benefit.parentElement!.offsetTop / height);
          if (row !== current && row !== next) continue;
          // Move the outgoing row through the top edge even when looping back to the first row.
          const start = row === next ? height : (next - current) * height;
          transitions.push(benefit.animate(
            [{ transform: `translateY(${start}px)` }, { transform: `translateY(${start - height}px)` }],
            { duration: 700, easing: "ease-in-out" },
          ));
        }
      }, 3000);
    }
    const observer = new ResizeObserver(syncPlayback);
    observer.observe(list);
    benefits.forEach(benefit => observer.observe(benefit));
    syncPlayback();
    mobile.addEventListener("change", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      transitions.forEach(animation => animation.cancel());
      mobile.removeEventListener("change", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      list.removeAttribute("tabindex");
    };
  }, [items, mobileCarousel]);

  return (
    <div className={[styles.root, mobileCarousel && styles.mobileCarousel, className].filter(Boolean).join(" ")} lang={locale} data-slot="service-commitment">
      <div className={styles.container} data-slot="service-commitment-container">
        <ul ref={listRef} key={locale} className={styles.list} data-slot="service-commitment-list" role="list" aria-label={titles[locale]}>
          {items.map((commitment, index) => (
            <li className={styles.item} key={commitment.icon}>
              {index > 0 && <Divider className={styles.separator} orientation="vertical" />}
              <span className={styles.benefit}>
                <img className={styles.icon} src={icons[commitment.icon]} alt="" />
                <span>{commitment.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
