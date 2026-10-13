import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from "react";

import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  /** Set only for the actual current page, not its parent category. */
  current?: boolean;
}

export type BreadcrumbLinkProps = ComponentPropsWithoutRef<"a"> & { href: string };

export type BreadcrumbProps = Omit<ComponentPropsWithRef<"nav">, "children"> & {
  items: readonly BreadcrumbItem[];
  locale?: "zh" | "en";
  size?: "sm" | "md";
  inverse?: boolean;
  underline?: boolean;
  /** Preserve the supplied anchor props when using a framework link. */
  renderLink?: (props: BreadcrumbLinkProps) => ReactNode;
};

export function Breadcrumb({
  items,
  locale = "en",
  size = "sm",
  inverse = false,
  underline = true,
  renderLink,
  className,
  "aria-label": label,
  ...rest
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav data-slot="breadcrumb" lang={locale} {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-size={size} data-inverse={inverse ? "true" : undefined}
      data-underline={underline ? "true" : undefined}
      aria-label={label ?? (locale === "zh" ? "面包屑导航" : "Breadcrumb")}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const current = item.current ? "page" as const : undefined;
          const linkProps: BreadcrumbLinkProps = {
            href: item.href ?? "",
            className: styles.link,
            "aria-current": current,
            children: item.label,
          };
          return (
            <li key={index} className={styles.item}>
              {index > 0 ? <span className={styles.separator} aria-hidden="true">/</span> : null}
              {item.href
                ? renderLink ? renderLink(linkProps) : <a {...linkProps} />
                : <span className={styles.label} aria-current={current}>{item.label}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
