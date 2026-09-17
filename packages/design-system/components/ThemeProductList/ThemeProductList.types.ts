import type { ReactNode } from "react";

import type { ProductListItem, ProductListProps } from "../ProductList";

export interface ThemeProductListContent {
  image: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
  /** 图片底部文字区域的预采样颜色，避免客户端采样完成前文字颜色闪烁。 */
  backgroundColor?: string;
  title: ReactNode;
  description: ReactNode;
  href?: string;
}

export interface ThemeProductListTheme {
  value: string;
  label: ReactNode;
  content: ThemeProductListContent;
  products: ProductListItem[];
  disabled?: boolean;
}

export interface ThemeProductListProps
  extends Omit<
    ProductListProps,
    | "appearance"
    | "banner"
    | "backgroundColor"
    | "backgroundImage"
    | "backgroundImageMobile"
    | "backgroundImage2x"
    | "backgroundImageMobile2x"
    | "content"
    | "layout"
    | "leadingContent"
  > {
  content: ThemeProductListContent;
  /** 可选的主题分组，切换标签时同时更新主题内容和商品。 */
  themes?: ThemeProductListTheme[];
}
