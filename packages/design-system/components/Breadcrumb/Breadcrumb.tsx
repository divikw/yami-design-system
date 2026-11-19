import { useRender } from "@base-ui/react/use-render";
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
  /** Show an underline on mouse hover. */
  underline?: boolean;
  /** Preserve the supplied anchor props when using a framework link. */
  renderLink?: (props: BreadcrumbLinkProps) => ReactNode;
};

/** A static marker for levels omitted by the host. Use as an item's label. */
export function BreadcrumbEllipsis({ "aria-label": label }: { "aria-label": string }) {
  return <span data-slot="breadcrumb-ellipsis" role="img" aria-label={label}>…</span>;
}

export function Breadcrumb({
  items,
  locale = "en",
  size = "sm",
  inverse = false,
  underline = true,
  renderLink,
  className,
  ref,
  "aria-label": label,
  ...rest
}: BreadcrumbProps) {
  const trail = (
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
  );

  return useRender({
    defaultTagName: "nav",
    enabled: items.length > 0,
    ref,
    props: {
      "data-slot": "breadcrumb",
      lang: locale,
      ...rest,
      className: [styles.root, className].filter(Boolean).join(" "),
      "data-size": size,
      "data-inverse": inverse ? "true" : undefined,
      "data-underline": underline ? "true" : "false",
      "aria-label": label ?? (locale === "zh" ? "面包屑导航" : "Breadcrumb"),
      children: trail,
    },
  });
}
