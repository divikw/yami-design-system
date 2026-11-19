import { type AnchorHTMLAttributes, forwardRef } from 'react'
import type { ButtonForm, ButtonProps } from './Button'
import styles from './Button.module.css'

export interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
  Pick<ButtonProps, 'variant' | 'size' | 'inverse' | 'leftIcon' | 'rightIcon'> {
  /** Real navigation destination. Native link behavior is preserved. */
  href: string
  /** Button appearance. Default: 'inline'. Provide an aria-label for 'icon'. */
  form?: ButtonForm
}

/** Native link sharing Button's appearance, sizing, and focus styles. */
export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { href, variant = 'primary', size = 'md', form = 'inline', inverse = false,
    leftIcon, rightIcon, children, className, ...rest },
  ref,
) {
  const isIconOnly = form === 'icon'
  const classes = [styles.button, styles[variant], styles[size],
    isIconOnly && styles.iconOnly, form === 'full' && styles.fullWidth, inverse && styles.inverse, className]
    .filter(Boolean).join(' ')

  return (
    <a {...rest} ref={ref} href={href} className={classes} data-slot="button-link">
      {leftIcon && !isIconOnly && <span className={styles.icon}>{leftIcon}</span>}
      <span className={isIconOnly ? styles.icon : styles.label}>{children}</span>
      {rightIcon && !isIconOnly && <span className={styles.icon}>{rightIcon}</span>}
    </a>
  )
})
