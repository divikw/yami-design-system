import type { SectionDividerProps } from "../sectionDivider.types";
import type { HTMLAttributes, ReactNode } from "react";
import type { ImageLoadingStrategy, ImageSource } from "../image.types";

export interface SocialVideoProduct {
  /** 用于 React 和埋点的稳定标识。 */
  id: string;
  /** 卡片底部的正方形商品图片。 */
  imageSrc: ImageSource;
  /** 商品图片的替代文本。 */
  imageAlt: string;
  /** 单商品样式显示的可选商品标题。 */
  title?: ReactNode;
  /** 商品的可选跳转地址。 */
  href?: string;
}

export interface SocialVideoCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "id"> {
  /** 用于 React 和埋点的稳定标识。 */
  id: string;
  /** 社交视频的封面图片。 */
  posterSrc: ImageSource;
  /** 视频封面的替代文本。 */
  posterAlt: string;
  /** 可选的视频地址，在媒体区域静音循环自动播放。 */
  videoSrc?: string;
  /** 社交账号名称，传入 null 时隐藏账号信息。 */
  username: ReactNode;
  /** 账号名称旁的装饰性平台图标。 */
  platformIconSrc: ImageSource;
  /** 未提供商品时显示的底部文案。 */
  caption: ReactNode;
  /** 视频的可选跳转地址。 */
  href?: string;
  /** 视频下方显示的可选商品数据。 */
  products?: SocialVideoProduct[];
  /** 未包含在 products 中的额外商品数量，与当前未展示的商品合并计数。 */
  additionalProductCount?: number;
}

export interface SocialMediaGalleryProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title">, SectionDividerProps {
  /** PC 模块标题。 */
  title: ReactNode;
  /** 移动端专用标题，未设置时使用 title。 */
  mobileTitle?: ReactNode;
  /** 标题旁的辅助说明。 */
  description?: ReactNode;
  /** 标题对齐方式。移动端卡片固定左对齐；PC 居中时翻页按钮位于列表两侧。 */
  headingAlign?: "start" | "center";
  /** 按展示顺序排列的社交视频卡片。 */
  cards: SocialVideoCardProps[];
  /** 查看全部的可选跳转地址。 */
  viewAllHref?: string;
  /** 查看全部的本地化文案。 */
  viewAllLabel?: ReactNode;
  /** 上一页按钮的本地化标签。 */
  previousLabel?: string;
  /** 下一页按钮的本地化标签。 */
  nextLabel?: string;
  /** 图片加载策略。 */
  imageLoadingStrategy?: ImageLoadingStrategy;
}
