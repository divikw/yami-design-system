import type { HTMLAttributes, ImgHTMLAttributes } from "react";
import type { ImageSource } from "../image.types";

export interface BillboardArtwork {
  /** 图片地址或图片资源。 */
  src: ImageSource;
  /**
   * 图片原始宽度（像素），与高度一起用于预留空间，避免加载时页面跳动。
   */
  width?: number;
  /** 图片原始高度（像素）。 */
  height?: number;
}

export interface BillboardImage extends BillboardArtwork {
  /**
   * 图片替代文本。若与 label 的活动描述重复，设为空字符串，避免重复朗读。
   */
  alt: string;
  /**
   * 小于 1024px 时使用的移动端图片，需提供该图片自身的原始宽高。
   */
  mobile?: BillboardArtwork;
}

export interface BillboardProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * 活动图片，包含完整文案与视觉内容，支持单独配置移动端图片。
   */
  image: BillboardImage;
  /** 点击后跳转的地址。 */
  href: string;
  /**
   * 供屏幕阅读器朗读的链接名称，应清楚说明活动内容或跳转目的。
   */
  label: string;
  /** 图片加载方式。首屏图片使用 eager，非首屏使用 lazy。 */
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  /** 图片解码完成后再显示；加载期间保留背景，减少闪烁。 */
  revealOnLoad?: boolean;
}
