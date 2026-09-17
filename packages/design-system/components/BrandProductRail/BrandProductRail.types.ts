import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import type {
  ProductListItem,
  ProductListTab,
} from "../ProductList";
import type { SectionDividerProps } from "../sectionDivider.types";
import type { ImageLoadingStrategy, ImageSource } from "../image.types";

export interface BrandProductCampaign {
  id: string;
  title: ReactNode;
  href?: string;
  banner: {
    src: ImageSource;
    alt: string;
    badgeSrc?: string;
    badgeAlt?: string;
  };
  products: ProductListItem[];
}

export type BrandProductRailMobileSurface = "card" | "plain";

export interface BrandProductRailProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">,
    SectionDividerProps {
  /** PC 和 Mobile 共用的模块标题。 */
  title: ReactNode;
  /** 标题对齐方式。center 时标题居中，PC 翻页按钮置于内容两侧；移动端卡片保持左对齐。 */
  headingAlign?: "start" | "center";
  /** 标题字体：sans 为无衬线，serif 为衬线。 */
  titleFontFamily?: "sans" | "serif";
  /** 品牌活动列表，包含品牌横幅、跳转地址及商品。 */
  campaigns: BrandProductCampaign[];
  /** 移动端外观：card 为卡片；plain 为通栏，内容内边距 16px，支持分隔线。 */
  mobileSurface?: BrandProductRailMobileSurface;
  /** 模块的分类标签列表。 */
  tabs?: ProductListTab[];
  /** 当前选中的分类值（受控模式）。 */
  value?: string;
  /** 初始选中的分类值（非受控模式）。 */
  defaultValue?: string;
  /** 切换分类时的回调，返回选中的分类值。 */
  onValueChange?: (value: string) => void;
  /** 查看全部的跳转地址；居中布局下由标题和箭头整体跳转。 */
  viewAllHref?: string;
  /** 查看全部的链接文案。 */
  viewAllLabel?: ReactNode;
  /** 上一组按钮的无障碍名称。 */
  previousLabel?: string;
  /** 下一组按钮的无障碍名称。 */
  nextLabel?: string;
  /** 点击加购时的回调，返回活动 ID 和商品 ID。 */
  onAddToCart?: (campaignId: string, productId: string) => void;
  /** 图片加载策略：native 使用浏览器原生加载，windowed 按可视窗口加载。 */
  imageLoadingStrategy?: ImageLoadingStrategy;
}
