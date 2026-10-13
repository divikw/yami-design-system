/**
 * focus-style (runtime) — focus must use 2px outline in --focus-ring / --focus-ring-inverse.
 *
 * P1: Real implementation using programmatic focus + getComputedStyle.
 *
 * For each interactive element: focus it, read computed outline properties,
 * verify it's a 2px solid outline in the resolved theme's focus token,
 * then blur.
 */

import {
  getAllInteractiveElements,
  getSelectorPath,
  getYamiId,
  isVisible,
  resolveColor,
} from '../_shared'
import type { RuntimeValidator, RuntimeViolation } from '../schema'

const EXPECTED_WIDTH = 2 // px

export const focusStyle: RuntimeValidator = {
  ruleId: 'focus-style',
  title: '焦点样式',
  severity: 'error',
  check(root) {
    const violations: RuntimeViolation[] = []
    const elements = getAllInteractiveElements(root)

    for (const el of elements) {
      if (!isVisible(el)) continue

      const htmlEl = el as HTMLElement

      // Programmatically focus the element
      try {
        htmlEl.focus()
      } catch {
        continue // skip elements that can't be focused
      }

      // Check if this element actually received focus
      if (document.activeElement !== el) continue

      const style = getComputedStyle(el)
      const outlineStyle = style.outlineStyle
      const outlineWidth = parseFloat(style.outlineWidth)
      const outlineColor = style.outlineColor

      // Blur before potentially pushing violations
      try {
        htmlEl.blur()
      } catch {
        // ignore blur errors
      }

      // Elements with outline:none may use box-shadow or border as
      // alternative focus indicator. Flag as warning (not error) since
      // we can't reliably detect box-shadow changes in happy-dom.
      // Phase 8.5 Playwright tests will do before/after comparison.
      if (outlineStyle === 'none' || outlineWidth === 0) {
        violations.push({
          ruleId: 'focus-style',
          message:
            'Interactive element has no visible outline on focus. Verify it uses an alternative focus indicator, or add 2px outline in --focus-ring.',
          severity: 'warning',
          yamiId: getYamiId(el),
          selector: getSelectorPath(el),
          element: el,
          suggestion:
            'Add outline: 2px solid var(--focus-ring) with outline-offset: 2px on :focus-visible. Keep component state borders separate.',
          measured: { outlineStyle, outlineWidth, outlineColor },
        })
        continue
      }

      // Verify outline width is ~2px
      if (Math.abs(outlineWidth - EXPECTED_WIDTH) > 0.5) {
        violations.push({
          ruleId: 'focus-style',
          message: `Focus outline width is ${outlineWidth}px (expected ${EXPECTED_WIDTH}px).`,
          severity: 'error',
          yamiId: getYamiId(el),
          selector: getSelectorPath(el),
          element: el,
          suggestion: `Set outline-width to ${EXPECTED_WIDTH}px.`,
          measured: { outlineWidth, outlineColor },
        })
      }

      // Compare against the resolved semantic tokens in this element's theme.
      const parsed = resolveColor(outlineColor)
      if (parsed) {
        const allowedColors = ['--focus-ring', '--focus-ring-inverse']
          .map((token) => resolveColor(style.getPropertyValue(token).trim()))
        if (!allowedColors.some((color) => color &&
          color.r === parsed.r && color.g === parsed.g && color.b === parsed.b && color.a === parsed.a)) {
          violations.push({
            ruleId: 'focus-style',
            message: `Focus outline color "${outlineColor}" does not match --focus-ring or --focus-ring-inverse.`,
            severity: 'error',
            yamiId: getYamiId(el),
            selector: getSelectorPath(el),
            element: el,
            suggestion:
              'Use outline-color: var(--focus-ring) or var(--focus-ring-inverse); keep borders and selected states separate.',
            measured: { outlineColor, parsedColor: parsed },
          })
        }
      }
    }

    return violations
  },
}
