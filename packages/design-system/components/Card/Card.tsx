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

import { useRender } from '@base-ui/react/use-render'
import type {
  ComponentPropsWithRef,
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
  /** 各设备内边距一致：sm 8px、md（默认）16px、lg 24px、none 0。 */
  padding?: CardPadding
  /** 背景表面令牌。默认为 'primary'（--surface-primary）。 */
  surface?: CardSurface
  /** 是否显示细边框。默认不显示，按设计规范仅用于密集列表或网格。 */
  bordered?: boolean
  /**
   * 启用悬浮和按下反馈，并提供至少 32×32px 的点击区域。
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
  } & (T extends 'div' ? { size?: 'default' | 'sm' } : unknown)

function CardImpl<T extends ElementType = 'div'>(
  {
    as,
    padding,
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
  const restProps = rest as { href?: string; type?: string; size?: unknown }
  const { size, ...divProps } = rest
  const usesCardSize = Element === 'div' && (size === 'sm' || size === 'default')
  const resolvedPadding = padding ?? (usesCardSize && size === 'sm' ? 'sm' : 'md')
  const isInteractive =
    interactive ?? (Element === 'button' || (Element === 'a' && typeof restProps.href === 'string'))
  const elementProps = Element === 'button' ? { ...rest, type: restProps.type ?? 'button' } : usesCardSize ? divProps : rest
  const Content = Element === 'button' ? 'span' : 'div'

  const classes = [
    styles.card,
    styles[`pad-${resolvedPadding}`],
    styles[`surface-${surface}`],
    bordered && styles.bordered,
    isInteractive && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return useRender({
    defaultTagName: 'div',
    render: as ? (props) => <Element {...props} /> : undefined,
    ref,
    props: {
      ...elementProps,
      className: classes,
      'data-slot': 'card',
      children: <Content className={styles.content} data-slot="card-content">{children}</Content>,
    },
  })
}

// Polymorphic + forwardRef: cast preserves the generic API for consumers
// while letting React.forwardRef accept the impl. Ref type is widened to
// HTMLElement since `as` can render different host elements.
export const Card = forwardRef(CardImpl) as <T extends ElementType = 'div'>(
  props: CardProps<T> & { ref?: ForwardedRef<HTMLElement> },
) => ReactElement

export function CardHeader({ className, ...props }: ComponentPropsWithRef<'header'>) {
  return <header {...props} data-slot="card-header" className={[styles.header, className].filter(Boolean).join(' ')} />
}

export function CardTitle({ className, ...props }: ComponentPropsWithRef<'h3'>) {
  return <h3 {...props} data-slot="card-title" className={[styles.title, className].filter(Boolean).join(' ')} />
}

export function CardDescription({ className, ...props }: ComponentPropsWithRef<'p'>) {
  return <p {...props} data-slot="card-description" className={[styles.description, className].filter(Boolean).join(' ')} />
}

export function CardAction({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div {...props} data-slot="card-action" className={[styles.action, className].filter(Boolean).join(' ')} />
}

export function CardContent({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div {...props} data-slot="card-body" className={[styles.body, className].filter(Boolean).join(' ')} />
}

export function CardFooter({ className, ...props }: ComponentPropsWithRef<'footer'>) {
  return <footer {...props} data-slot="card-footer" className={[styles.footer, className].filter(Boolean).join(' ')} />
}
