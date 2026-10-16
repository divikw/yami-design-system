/**
 * Card — surface primitive for a discrete, self-contained content item.
 * Use headings and spacing for ordinary page sections.
 *
 * Default: no border (rule card-no-border), 12px radius
 * (rule no-custom-radii → --radius-surface-default), no shadow.
 *
 * If a card is clickable, hover/press changes background color. Static Figma
 * depth tokens are opt-in; Card keeps its shadow-free default.
 *
 * Use as="a" with href for navigation or as="button" for an action.
 */

import type {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from 'react'
import { forwardRef } from 'react'

import styles from './Card.module.css'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardSurface = 'primary' | 'secondary' | 'inverse'

export interface CardBaseProps {
  /** 内边距档位：none=0、sm=12px、md=16px、lg=24px。默认 md；贴边媒体使用 none，同组卡片保持一致。 */
  padding?: CardPadding
  /** 背景表面令牌。默认为 'primary'（--surface-primary）。 */
  surface?: CardSurface
  /** 是否显示细边框。默认不显示，按设计规范仅用于密集列表或网格。 */
  bordered?: boolean
  /**
   * 启用悬浮和按下反馈，并提供至少 44×44px 的点击区域。
   * as="button" 或 as="a" 且提供 href 时自动启用。
   * 自定义元素需自行提供语义和键盘行为。键盘焦点及禁用样式始终可用。
   */
  interactive?: boolean
  /** 卡片内容。 */
  children?: ReactNode
}

export type CardProps<T extends ElementType = 'div'> = CardBaseProps &
  Omit<ComponentPropsWithoutRef<T>, keyof CardBaseProps | 'as'> & {
    /** 渲染的元素类型，默认为 'div'。链接卡片使用 'a' 并提供 href；操作卡片使用 'button'。 */
    as?: T
  }

function CardImpl<T extends ElementType = 'div'>(
  {
    as,
    padding = 'md',
    surface = 'primary',
    bordered = false,
    interactive,
    className,
    children,
    ...rest
  }: CardProps<T>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Element = (as ?? 'div') as ElementType

  // Auto-infer interactive when rendering as button or anchor-with-href.
  const restProps = rest as { href?: string; type?: string }
  const isInteractive =
    interactive ?? (Element === 'button' || (Element === 'a' && typeof restProps.href === 'string'))
  const elementProps = Element === 'button' ? { ...rest, type: restProps.type ?? 'button' } : rest
  const Content = Element === 'button' ? 'span' : 'div'

  const classes = [
    styles.card,
    styles[`pad-${padding}`],
    styles[`surface-${surface}`],
    bordered && styles.bordered,
    isInteractive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Element {...elementProps} ref={ref} className={classes} data-slot="card">
      <Content className={styles.content} data-slot="card-content">{children}</Content>
    </Element>
  )
}

// Polymorphic + forwardRef: cast preserves the generic API for consumers
// while letting React.forwardRef accept the impl. Ref type is widened to
// HTMLElement since `as` can render different host elements.
export const Card = forwardRef(CardImpl) as <T extends ElementType = 'div'>(
  props: CardProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement
