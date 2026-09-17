import type {
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

import type {
  ProductCardPresentation,
  ProductCardProps,
} from "../ProductCard";
import type { SectionDividerProps } from "../sectionDivider.types";
import type { ImageLoadingStrategy, ImageSource } from "../image.types";

export type ProductListAppearance =
  | "standard"
  | "background"
  | "themed"
  | "themed-background"
  | "atmospheric";

export type ProductListLayout = "rail" | "waterfall";

export type ProductListMobileSurface = "card" | "plain";

export type ProductListItem = Omit<
  ProductCardProps,
  "presentation" | "onAddToCart"
> & {
  id: string;
};

export interface ProductListTab {
  /** 受控的当前标签值。 */
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface ProductListBaseProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">,
    SectionDividerProps {
  "data-component"?: string;
  /** 模块标题。 */
  title: ReactNode;
  /** 通栏布局的标题与标签对齐方式；居中时翻页按钮位于内容区两侧。 */
  headingAlign?: "start" | "center";
  /** 小于 1024px 时默认 20px 常规字重；16px 时按 lang 使用中文 600、英文 500 字重。 */
  mobileTitleSize?: 16 | 20;
  /** 标题旁的可选辅助说明。 */
  description?: ReactNode;
  /** 商品列表上方的可选通栏介绍内容。 */
  introContent?: ReactNode;
  /** 标题字体：sans 无衬线，serif 衬线。 */
  titleFontFamily?: "sans" | "serif";
  /** 商品数据列表，每件商品需要稳定的 id。 */
  products: ProductListItem[];
  /** 引导内容：Mobile 位于横向列表上方，PC 位于首张商品卡片之前。 */
  leadingContent?: ReactNode;
  /** rail 横向滚动；waterfall 响应式网格。 */
  layout?: ProductListLayout;
  /** Mobile 外观。plain 为通栏布局，内容内边距 16px，支持分割线。 */
  mobileSurface?: ProductListMobileSurface;
  /** 商品卡片展示形式。 */
  presentation?: ProductCardPresentation;
  /** 分类标签列表。 */
  tabs?: ProductListTab[];
  /** 受控的当前标签值。 */
  value?: string;
  /** 非受控模式的初始标签值。 */
  defaultValue?: string;
  /** 标签切换回调；商品筛选由调用方负责。 */
  onValueChange?: (value: string) => void;
  /** 查看全部的跳转地址。 */
  viewAllHref?: string;
  /** 查看全部链接文案。 */
  viewAllLabel?: ReactNode;
  /** 上一页按钮的无障碍名称。 */
  previousLabel?: string;
  /** 下一页按钮的无障碍名称。 */
  nextLabel?: string;
  /** 是否有更多商品可加载。 */
  hasMore?: boolean;
  /** 点击加载更多时的回调。 */
  onLoadMore?: MouseEventHandler<HTMLButtonElement>;
  /** 加载更多按钮文案。 */
  loadMoreLabel?: ReactNode;
  /** 加购回调，传入商品 id。 */
  onAddToCart?: (productId: string) => void;
  /** 是否显示加载骨架。 */
  loading?: boolean;
  /** 加载状态的无障碍提示。 */
  loadingLabel?: string;
  /** 加载骨架数量。 */
  skeletonCount?: number;
  /** 图片加载策略：横向列表可选 windowed 按可见范围加载；网格保持原生懒加载。 */
  imageLoadingStrategy?: ImageLoadingStrategy;
}

type StandardAppearanceProps = {
  appearance?: "standard";
  /** 活动横幅素材及背景色，可分别提供 PC 和 Mobile 素材。 */
  banner?: never;
  /** 活动背景色。 */
  backgroundColor?: never;
  /** PC 活动背景图。 */
  backgroundImage?: never;
  /** Mobile 活动背景图。 */
  backgroundImageMobile?: never;
  /** PC 二倍分辨率背景图。 */
  backgroundImage2x?: never;
  /** Mobile 二倍分辨率背景图。 */
  backgroundImageMobile2x?: never;
};

type ThemedAppearanceProps = {
  appearance: "themed" | "themed-background";
  /** 活动横幅素材及背景色，可分别提供 PC 和 Mobile 素材。 */
  banner: {
    src: ImageSource;
    mobileSrc?: ImageSource;
    alt: string;
    backgroundColor?: string;
    mobileBackgroundColor?: string;
  };
  /** 活动背景色。 */
  backgroundColor?: never;
  /** PC 活动背景图。 */
  backgroundImage?: never;
  /** Mobile 活动背景图。 */
  backgroundImageMobile?: never;
  /** PC 二倍分辨率背景图。 */
  backgroundImage2x?: never;
  /** Mobile 二倍分辨率背景图。 */
  backgroundImageMobile2x?: never;
};

type AtmosphericAppearanceProps = {
  appearance: "atmospheric" | "background";
  /** 活动横幅素材及背景色，可分别提供 PC 和 Mobile 素材。 */
  banner?: never;
  /** 活动背景色。 */
  backgroundColor?: string;
  /** PC 活动背景图。 */
  backgroundImage?: string;
  /** Mobile 活动背景图。 */
  backgroundImageMobile?: string;
  /** PC 二倍分辨率背景图。 */
  backgroundImage2x?: string;
  /** Mobile 二倍分辨率背景图。 */
  backgroundImageMobile2x?: string;
};

export type ProductListProps = ProductListBaseProps &
  (
    | StandardAppearanceProps
    | ThemedAppearanceProps
    | AtmosphericAppearanceProps
  );
