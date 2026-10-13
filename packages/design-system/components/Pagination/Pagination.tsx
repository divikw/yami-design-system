"use client";

import type { ComponentPropsWithoutRef } from "react";

import styles from "./Pagination.module.css";

type PaginationBaseProps = Omit<ComponentPropsWithoutRef<"nav">, "children"> & {
  /** Current page, starting at 1. The host owns the result data. */
  page: number;
  /** Total number of pages. Zero renders nothing. */
  pageCount: number;
  locale?: "zh" | "en";
  inverse?: boolean;
  disabled?: boolean;
};

export type PaginationProps = PaginationBaseProps & (
  | { onPageChange: (page: number) => void; getPageHref?: never }
  | { getPageHref: (page: number) => string; onPageChange?: never }
);

function pageItems(count: number): Array<number | string> {
  if (count <= 10) return Array.from({ length: count }, (_, index) => index + 1);
  return [...Array.from({ length: 9 }, (_, index) => index + 1), "ellipsis", count];
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  getPageHref,
  locale = "en",
  inverse = false,
  disabled = false,
  className,
  "aria-label": label,
  ...rest
}: PaginationProps) {
  if (pageCount < 1) return null;
  const current = Math.min(Math.max(page, 1), pageCount);
  const zh = locale === "zh";

  function control(target: number) {
    const isCurrent = target === current;
    const shared = {
      className: styles.control,
      "aria-label": zh ? `第 ${target} 页` : `Page ${target}`,
      "aria-current": isCurrent ? "page" as const : undefined,
    };
    if (getPageHref) {
      return disabled ? (
        <span {...shared} role="link" aria-disabled="true">{target}</span>
      ) : (
        <a {...shared} href={getPageHref(target)}>{target}</a>
      );
    }
    return (
      <button {...shared} type="button" disabled={disabled}
        onClick={() => { if (target !== current) onPageChange?.(target); }}>
        {target}
      </button>
    );
  }

  return (
    <nav data-slot="pagination" lang={locale} {...rest} className={[styles.root, className].filter(Boolean).join(" ")}
      data-inverse={inverse ? "true" : undefined}
      aria-label={label ?? (zh ? "分页导航" : "Pagination")}>
      <ul className={styles.list}>
        {pageItems(pageCount).map((item) => (
          <li key={item}>
            {typeof item === "number"
              ? control(item)
              : <span className={styles.ellipsis} aria-hidden="true">…</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
}
