import type { ImgHTMLAttributes, MouseEventHandler, ReactNode } from "react";

import type { BadgeColor, BadgeEmphasis, BadgeType } from "../Badge";
import type { ImageSource } from "../image.types";

export type ProductBadgeType = Exclude<BadgeType, "best-sellers" | "price">;

export interface ProductBadge {
  label: ReactNode;
  color?: BadgeColor;
  emphasis?: BadgeEmphasis;
  type: ProductBadgeType;
}

export interface ProductCardPromotion {
  badge: ReactNode;
  label?: ReactNode;
  value: ReactNode;
  tone?: "default" | "emphasis";
}

export type ProductCardPresentation = "rich" | "minimal" | "compact";
export type ProductCardSurface = "card" | "plain";

interface ProductCardBaseProps {
  /** 展示形态：rich 完整卡片，minimal 图片为主，compact 横向商品行。 */
  presentation?: ProductCardPresentation;
  /** 外观：plain 默认无外部内边距，card 在背景上保留 2px 内边距。 */
  surface?: ProductCardSurface;
  /** 商品标题，最多显示两行，超出省略。 */
  title: ReactNode;
  /** 当前售价；存在原价时使用强调色。 */
  priceCurrent: ReactNode;
  /** 划线原价，无折扣时省略。 */
  priceOriginal?: ReactNode;
  /** 单位或组合价格，可包含包装规格。 */
  unitPrice?: ReactNode;
  /** 排行榜文案，例如“面膜加购榜第 1 名”。 */
  ranking?: ReactNode;
  /** 评分，范围 0–5；省略时隐藏。 */
  rating?: number;
  /** 评价数量，例如“1,888”。 */
  ratingCount?: ReactNode;
  /** 评分后方的销量文案。 */
  soldCount?: ReactNode;
  /** 价格下方的活动或会员优惠信息。 */
  promotions?: ProductCardPromotion[];
  /** 活动倒计时文案。 */
  countdown?: ReactNode;
  /** 图片徽标，最多显示两个；支持 sale、low-price、discount、new、hot、exclusive、choice。 */
  badges?: ProductBadge[];
  /** 加购回调；compact 显示在价格旁，其他形态显示在图片上。 */
  onAddToCart?: MouseEventHandler<HTMLButtonElement>;
  /** 加购按钮的无障碍名称。 */
  addButtonAriaLabel?: string;
  /** 是否禁用加购按钮。 */
  addButtonDisabled?: boolean;
  /** 商品图片与标题共用的跳转地址。 */
  href: string;
}

type ProductCardImageProps =
  | {
      /** 商品图片地址或响应式图片资源。 */
      image: ImageSource;
      /** 商品图片的替代文本，提供图片时必填。 */
      imageAlt: string;
      /** 图片加载时机，默认 lazy；首屏图片可用 eager。 */
      imageLoading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
      /** 图片请求优先级，仅首屏关键图片使用 high。 */
      imageFetchPriority?: ImgHTMLAttributes<HTMLImageElement>["fetchPriority"];
    }
  | {
      /** 省略图片时显示中性占位图。 */
      image?: undefined;
      imageAlt?: never;
      imageLoading?: never;
      imageFetchPriority?: never;
    };

type ProductCardBrandProps =
  | {
      /** 标题上方的品牌名称。 */
      brand: ReactNode;
      /** 品牌链接的跳转地址。 */
      brandHref: string;
    }
  | {
      brand?: undefined;
      brandHref?: never;
    };

export type ProductCardProps = ProductCardBaseProps &
  ProductCardImageProps &
  ProductCardBrandProps;
