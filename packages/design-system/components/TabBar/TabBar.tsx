import type { ComponentPropsWithRef, MouseEventHandler, ReactNode } from "react";
import { Badge } from "../Badge";
import styles from "./TabBar.module.css";

export type TabBarItem = {
  value: string;
  label: string;
  /** Decorative icon, normally 24 × 24px. */
  icon: ReactNode;
  /** Omit to hide; zero remains visible and counts above 99 display as 99+. */
  badgeCount?: number;
} & (
  | { href: string; onClick?: MouseEventHandler<HTMLAnchorElement> }
  | { href?: never; onClick: MouseEventHandler<HTMLButtonElement> }
);

export type TabBarProps = Omit<ComponentPropsWithRef<"nav">, "children"> & {
  items: readonly TabBarItem[];
  /** Host-controlled current destination; activation does not change it automatically. */
  value: string;
  "aria-label": string;
};

/** App destination navigation. The host owns routes, positioning and breakpoints. */
export function TabBar({ items, value, className, ...rest }: TabBarProps) {
  if (items.length === 0) return null;
  return <nav data-slot="tab-bar" {...rest} className={[styles.root, className].filter(Boolean).join(" ")}>
    {items.map((item) => {
      const props = {
        className: styles.item,
        "aria-current": item.value === value ? "page" as const : undefined,
        "aria-label": item.badgeCount === undefined ? undefined : `${item.label} ${item.badgeCount}`,
        children: <>
          <span className={styles.icon} aria-hidden="true">{item.icon}
            {item.badgeCount !== undefined && <Badge className={styles.count} color="red">{item.badgeCount > 99 ? "99+" : item.badgeCount}</Badge>}
          </span>
          <span className={styles.label}>{item.label}</span>
        </>,
      };
      return item.href !== undefined
        ? <a key={item.value} {...props} href={item.href} onClick={item.onClick} />
        : <button key={item.value} {...props} type="button" onClick={item.onClick} />;
    })}
  </nav>;
}
