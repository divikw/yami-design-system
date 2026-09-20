import type { HTMLAttributes, ReactNode } from "react";

import type { SectionDividerProps } from "../sectionDivider.types";

export type ReviewListMobileSurface = "card" | "plain";

export interface ReviewProduct {
  /** 评论底部显示的商品图片。 */
  imageSrc: string;
  /** 商品图片的替代文本。 */
  imageAlt: string;
  /** 商品名称上方的品牌。 */
  brand: ReactNode;
  /** 评论底部的商品名称。 */
  name: ReactNode;
  /** 关联商品的可选跳转地址。 */
  href?: string;
}

export interface ReviewCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "id"> {
  /** 用于 React 和埋点的稳定标识。 */
  id: string;
  /** 五星制评分，小数评分显示半星。 */
  rating: number;
  /** 用户评论内容。 */
  review: ReactNode;
  /** 匿名化的评论者昵称。 */
  reviewer: ReactNode;
  /** 评论关联的商品。 */
  product?: ReviewProduct;
}

export interface ReviewListProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title">,
    SectionDividerProps {
  /** 模块标题，同时作为无障碍标签。 */
  title: ReactNode;
  /** 标题旁的辅助说明。 */
  description?: ReactNode;
  /** 标题对齐方式。移动端 card 固定左对齐；PC 和移动端 plain 支持居中，PC 居中时翻页按钮显示在列表两侧。 */
  headingAlign?: "start" | "center";
  /** 标题字体：sans 为无衬线，serif 为衬线。 */
  titleFontFamily?: "sans" | "serif";
  /** 移动端专用标题，未设置时使用 title。 */
  mobileTitle?: ReactNode;
  /** 按顺序展示的评论卡片。 */
  reviews: ReviewCardProps[];
  /** 移动端外观，plain 为通栏布局，内容内边距 16px，支持分割线。 */
  mobileSurface?: ReviewListMobileSurface;
  /** PC 和 Mobile 共用的查看全部跳转地址。 */
  viewAllHref?: string;
  /** 查看全部的本地化文案。 */
  viewAllLabel?: ReactNode;
  /** 上一页按钮的本地化无障碍标签。 */
  previousLabel?: string;
  /** 下一页按钮的本地化无障碍标签。 */
  nextLabel?: string;
}
