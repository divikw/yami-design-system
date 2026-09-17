import type {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from "react";
import { forwardRef } from "react";

import styles from "./HorizontalScrollList.module.css";

export type HorizontalScrollListSurface = "card" | "plain";

export type HorizontalScrollListBaseProps = {
  /** 是否启用横向滚动和键盘聚焦。 */
  enabled?: boolean;
  /** 可选背景形式。`card` 在调用方提供的背景上增加 8px 内边距。 */
  surface?: HorizontalScrollListSurface;
  children?: ReactNode;
};

export type HorizontalScrollListProps<T extends ElementType = "div"> =
  HorizontalScrollListBaseProps &
    Omit<
      ComponentPropsWithoutRef<T>,
      keyof HorizontalScrollListBaseProps | "as"
    > & {
      /** 列表使用的语义标签，默认为 `div`。 */
      as?: T;
    };

function HorizontalScrollListImpl<T extends ElementType = "div">(
  {
    as,
    enabled = true,
    surface = "plain",
    className,
    children,
    tabIndex,
    ...rest
  }: HorizontalScrollListProps<T>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Element = (as ?? "div") as ElementType;
  const classes = [
    enabled && styles.root,
    surface === "card" ? styles.surfaceCard : styles.surfacePlain,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Element
      {...rest}
      ref={ref}
      className={classes}
      data-horizontal-scroll-list={enabled ? "true" : "false"}
      data-surface={surface}
      tabIndex={enabled ? (tabIndex ?? 0) : tabIndex}
    >
      {children}
    </Element>
  );
}

export const HorizontalScrollList = forwardRef(
  HorizontalScrollListImpl,
) as <T extends ElementType = "div">(
  props: HorizontalScrollListProps<T> & {
    ref?: ForwardedRef<HTMLElement>;
  },
) => ReactElement;
