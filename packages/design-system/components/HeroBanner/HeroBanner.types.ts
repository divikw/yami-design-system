import type {
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from "react";

import type { SectionDividerProps } from "../sectionDivider.types";
import type { ImageLoadingStrategy, ImageSource } from "../image.types";

export interface HeroBannerImage {
  src: ImageSource;
  alt: string;
}

export interface HeroBannerProduct {
  src: ImageSource;
  alt: string;
}

interface HeroBannerItemBase {
  id: string;
  href: string;
  backgroundColor?: string;
}

export interface HeroBannerImageOnlyItem extends HeroBannerItemBase {
  image: HeroBannerImage;
  title?: never;
  description?: never;
  products?: never;
}

export interface HeroBannerImageTextItem extends HeroBannerItemBase {
  image: HeroBannerImage;
  title: ReactNode;
  description?: ReactNode;
  products?: never;
}

export interface HeroBannerImageTextProductsItem extends HeroBannerItemBase {
  image: HeroBannerImage;
  title: ReactNode;
  description?: ReactNode;
  products: HeroBannerProduct[];
}

export interface HeroBannerProductsOnlyItem extends HeroBannerItemBase {
  image?: never;
  title: ReactNode;
  description?: never;
  products: HeroBannerProduct[];
}

export type HeroBannerItem =
  | HeroBannerImageOnlyItem
  | HeroBannerImageTextItem
  | HeroBannerImageTextProductsItem
  | HeroBannerProductsOnlyItem;

interface HeroBannerCardProps<TItem extends HeroBannerItem> {
  item: TItem;
}

export interface HeroBannerImageOnlyCardProps
  extends HeroBannerCardProps<HeroBannerImageOnlyItem> {
  /** 图片加载时机：eager 立即加载，lazy 延迟加载。 */
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  priority?: boolean;
}

export interface HeroBannerImageTextCardProps
  extends HeroBannerCardProps<HeroBannerImageTextItem> {
  /** 图片加载时机：eager 立即加载，lazy 延迟加载。 */
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  priority?: boolean;
}

export interface HeroBannerImageTextProductsCardProps
  extends HeroBannerCardProps<HeroBannerImageTextProductsItem> {
  /** 图片加载时机：eager 立即加载，lazy 延迟加载。 */
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  priority?: boolean;
}

export interface HeroBannerProductsOnlyCardProps
  extends HeroBannerCardProps<HeroBannerProductsOnlyItem> {
  /** 借用相邻卡片的背景。imageSrc 用于图片取色，color 用于取色完成前的回退；item.backgroundColor 优先。 */
  borrowedSurface?: { imageSrc?: ImageSource; color?: string };
}

export interface HeroBannerProps
  extends Omit<HTMLAttributes<HTMLElement>, "children">,
    SectionDividerProps {
  /** 活动卡片列表，支持四种内容形态。 */
  items: HeroBannerItem[];
  /** 横幅区域的无障碍名称。 */
  ariaLabel?: string;
  /** 上一页按钮的无障碍名称。 */
  previousLabel?: string;
  /** 下一页按钮的无障碍名称。 */
  nextLabel?: string;
  /** 图片加载时机：eager 立即加载，lazy 延迟加载。 */
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** 图片加载策略：native 使用浏览器原生机制，windowed 按可见范围加载。 */
  imageLoadingStrategy?: ImageLoadingStrategy;
  /** 定时前进一张并循环。离开视口、页面隐藏、鼠标悬停或内部持有焦点时暂停；减少动态效果模式下关闭。 */
  autoAdvance?: boolean;
  /** 自动切换的间隔，单位为秒。 */
  autoAdvanceInterval?: number;
  /** 当前横幅文字区域背景色变化时的回调。 */
  onActiveSurfaceColorChange?: (color: string) => void;
}
