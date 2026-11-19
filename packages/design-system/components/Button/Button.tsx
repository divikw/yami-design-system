'use client'

/**
 * Button — YAMI primary interactive element.
 *
 * Uses the YAMI UI/UX Guidelines (Mobile v2 + PC v2) as its visual reference:
 *   - variant: emphasis / primary / secondary / tertiary / destructive
 *   - form:    3 layout modes — full / inline / icon
 *   - size:    sm / md / lg (32 / 40 / 48; PC full form uses 40 / 48 / 56)
 *   - inverse: false (default surface polarity) / true (opposite surface polarity)
 *
 * A11y contract:
 *   - form="icon" requires an aria-label (enforced at runtime in dev).
 *   - Disabled / loading uses `aria-disabled="true"` over native `disabled`,
 *     keeping the element keyboard-focusable so SR can still announce it.
 *     Base UI blocks activation.
 *   - Loading additionally sets aria-busy="true".
 *   - Focus-visible outline is 2px solid var(--focus-ring) with 2px offset
 *     (var(--focus-ring-inverse) when inverse=true).
 *
 * Backward compat: legacy props `iconOnly` and `fullWidth` are deprecated
 * but still honored — they map to `form="icon"` / `form="full"` when set.
 * Page templates pre-v0.2.0 continue to work without changes.
 *
 * See meta.json for structured spec, usage.md for narrative.
 */

import { Button as BaseButton } from '@base-ui/react/button'
import { type ButtonHTMLAttributes, forwardRef, type ReactNode, useEffect, useState } from 'react'

import styles from './Button.module.css'

declare const process: { env?: { NODE_ENV?: string } } | undefined

export type ButtonVariant = 'emphasis' | 'primary' | 'secondary' | 'tertiary' | 'destructive'
export type ButtonForm = 'full' | 'inline' | 'icon'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Visual role. Defaults to 'primary'. Use 'destructive' for actions such as deleting data. */
  variant?: ButtonVariant
  /**
   * Layout mode (Figma Form axis).
   * - 'inline' (default): content-width, sits in a row
   * - 'full': stretches to container width — page-level CTAs
   * - 'icon': circular, icon-only — requires aria-label
   * When omitted, falls back to legacy iconOnly / fullWidth booleans.
   */
  form?: ButtonForm
  /** Height / padding tier. Defaults to 'md'. On PC, full sm/md/lg are 40/48/56px. */
  size?: ButtonSize
  /** When true, swaps to the opposite-polarity token set in either Light or Dark. Default: false. */
  inverse?: boolean
  /** Optional icon rendered before the label. Prefer currentColor-inheriting SVGs from assets/icons/. */
  leftIcon?: ReactNode
  /** Optional icon rendered after the label. */
  rightIcon?: ReactNode
  /** @deprecated — use `form="icon"`. Kept for backward compat. REQUIRES aria-label. */
  iconOnly?: boolean
  /** @deprecated — use `form="full"`. Kept for backward compat. */
  fullWidth?: boolean
  /** Shows a spinner in place of content; sets aria-busy. Still focusable. */
  loading?: boolean
  /** Delay the spinner in milliseconds; busy state and click blocking remain immediate. Default: 0. */
  loadingDelay?: number
  /** HTML form button type; defaults to 'button' (not 'submit'). Use 'submit' inside <form> explicitly. */
  htmlType?: 'button' | 'submit' | 'reset'
  /** Native form owner id for a button rendered outside its associated <form>. */
  htmlForm?: string
  /** Children become the label text (or icon node if form='icon'). */
  children?: ReactNode
}

function resolveForm(
  form: ButtonForm | undefined,
  iconOnly: boolean,
  fullWidth: boolean,
): ButtonForm {
  if (form) return form
  if (iconOnly) return 'icon'
  if (fullWidth) return 'full'
  return 'inline'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    form,
    size = 'md',
    inverse = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    fullWidth = false,
    loading = false,
    loadingDelay = 0,
    htmlType = 'button',
    htmlForm,
    disabled,
    children,
    className,
    onClick,
    onKeyDown,
    onKeyUp,
    onMouseDown,
    onPointerDown,
    tabIndex,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const [delayedSpinner, setDelayedSpinner] = useState(false)
  useEffect(() => {
    setDelayedSpinner(false)
    if (!loading || loadingDelay <= 0) return
    const timer = setTimeout(() => setDelayedSpinner(true), loadingDelay)
    return () => clearTimeout(timer)
  }, [loading, loadingDelay])
  const showSpinner = loading && (loadingDelay <= 0 || delayedSpinner)
  const effectiveForm = resolveForm(form, iconOnly, fullWidth)
  const isIconOnly = effectiveForm === 'icon'
  const isFullWidth = effectiveForm === 'full'
  const isDevelopment =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
    Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)

  if (isDevelopment && isIconOnly && !ariaLabel) {
    console.warn(
      '[Button] form="icon" (or iconOnly) rendered without aria-label. Screen readers will announce "button" with no context.',
    )
  }

  const isInert = Boolean(disabled) || loading

  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    isIconOnly && styles.iconOnly,
    isFullWidth && styles.fullWidth,
    inverse && styles.inverse,
    showSpinner && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <BaseButton
      {...rest}
      ref={ref}
      form={htmlForm}
      className={classes}
      data-slot="button"
      disabled={isInert}
      focusableWhenDisabled
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      onClick={isInert ? undefined : onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseDown={onMouseDown}
      onPointerDown={onPointerDown}
      // Preserve native form and tab defaults, and let inert buttons receive
      // pointer focus and bubble key events such as Escape to parent overlays.
      render={(props) => (
        <button
          {...props}
          type={htmlType}
          tabIndex={tabIndex}
          aria-disabled={isInert || undefined}
          onKeyDown={isInert ? onKeyDown : props.onKeyDown}
          onKeyUp={isInert ? onKeyUp : props.onKeyUp}
          onMouseDown={isInert ? onMouseDown : props.onMouseDown}
          onPointerDown={isInert ? onPointerDown : props.onPointerDown}
        />
      )}
    >
      {leftIcon && !isIconOnly && <span className={styles.icon}>{leftIcon}</span>}
      {isIconOnly ? (
        <span className={styles.icon}>{children}</span>
      ) : (
        <span className={styles.label}>{children}</span>
      )}
      {rightIcon && !isIconOnly && <span className={styles.icon}>{rightIcon}</span>}
      {showSpinner && <span className={styles.spinner} aria-hidden="true" />}
    </BaseButton>
  )
})
