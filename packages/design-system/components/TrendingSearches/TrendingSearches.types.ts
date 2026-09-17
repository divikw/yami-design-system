import type { HTMLAttributes, ReactNode } from "react";

import type { ProductListItem } from "../ProductList";
import type { SectionDividerProps } from "../sectionDivider.types";
import type { ImageLoadingStrategy, ImageSource } from "../image.types";

export interface TrendingSearchKeyword {
  id: string;
  /** 搜索词名称。 */
  keyword: string;
  /** 搜索结果页链接，供 PC 链接及移动端按钮使用。 */
  href: string;
  /** 搜索词推荐说明，显示在星光图标旁。 */
  tagline?: ReactNode;
  /** 移动端搜索词行的缩略图及替代文本。 */
  thumbnail?: { src: ImageSource; alt: string };
  /** 关联商品列表；PC 展示前两个，移动端可横向浏览全部商品。 */
  products: ProductListItem[];
  /** 移动端搜索按钮文案；未设置时使用 seeAllLabel。 */
  exploreLabel?: ReactNode;
}

export interface TrendingSearchesProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">,
    SectionDividerProps {
  /** 模块标题。 */
  title: ReactNode;
  /** 标题对齐方式：start 左对齐，center 居中；PC 居中时翻页按钮显示在内容区两侧。 */
  headingAlign?: "start" | "center";
  /** 小于 1024px 时显示的移动端标题；未设置时使用 title。 */
  mobileTitle?: ReactNode;
  /** 按排名排列的搜索词及关联商品，包含搜索链接、推荐说明和移动端缩略图；PC 每个搜索词展示前两个商品，移动端可横向滚动查看全部商品。 */
  keywords: TrendingSearchKeyword[];
  /** PC 搜索词卡片的“查看全部”链接文案。 */
  seeAllLabel?: ReactNode;
  /** PC 上一页按钮的无障碍名称。 */
  previousLabel?: string;
  /** PC 下一页按钮的无障碍名称。 */
  nextLabel?: string;
  /** 根据搜索词生成移动端展开按钮的无障碍名称。 */
  expandLabel?: (keyword: string) => string;
  /** 移动端默认展开的搜索词 ID；未设置时展开排名第一项，各项可独立展开和收起。 */
  defaultExpandedId?: string;
  /** 点击商品加购按钮时的回调，参数为商品 ID。 */
  onAddToCart?: (productId: string) => void;
  /** 商品图片加载策略：native 使用原生懒加载，windowed 根据可视窗口加载。 */
  imageLoadingStrategy?: ImageLoadingStrategy;
}
