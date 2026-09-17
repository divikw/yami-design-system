import type {
  HTMLAttributes,
  ImgHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

import type { BadgeSize, BadgeTone } from "../Badge";

export interface ThemeHeroImage {
  /** 主题图片地址，同时作为默认装饰背景。 */
  src: string;
  /** 主题图片的替代文本。 */
  alt: string;
  /** 图片原始宽度，用于保留宽高比。 */
  width: number;
  /** 图片原始高度，用于保留宽高比。 */
  height: number;
  /** 根据图片焦点设置的 CSS object-position。 */
  objectPosition?: string;
}

export interface ThemeHeroCta {
  label: string;
  ariaLabel?: string;
  /** 按钮所控制区域的 ID。 */
  controls?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export interface ThemeHeroProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  title: ReactNode;
  description: ReactNode;
  /** 展开描述的本地化文案。 */
  descriptionExpandLabel?: ReactNode;
  /** 收起描述的本地化文案。 */
  descriptionCollapseLabel?: ReactNode;
  /** 可选的简短关键词，以不可交互的 Badge 展示。 */
  tags?: readonly string[];
  /** 关键词标签尺寸，默认 sm；低于 1024px 时统一使用 sm。 */
  tagSize?: BadgeSize;
  /** 标签明暗样式，默认 dark。 */
  tagTone?: BadgeTone;
  image: ThemeHeroImage;
  /** 可选的模糊背景图片，默认使用主题图片。 */
  backgroundImageSrc?: string;
  /** 图片底边预采样颜色，用于移动端自适应遮罩。 */
  backgroundColor?: string;
  /** 可选主操作按钮，默认不显示。 */
  cta?: ThemeHeroCta;
  /** 可选次操作按钮，默认不显示。 */
  secondaryCta?: ThemeHeroCta;
  imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
}
