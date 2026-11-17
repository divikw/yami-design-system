/**
 * tap-target — Web targets ≥24×24 CSS px or applicable WCAG exceptions.
 * 44×44px is a touch recommendation, not a component layout minimum.
 * A size prop cannot prove the rendered hit area, clipping or spacing.
 * Defer size review to the runtime validator instead of warning on sm icons.
 */

import type { Validator } from '../schema'
import { result } from './_shared'

export const tapTarget: Validator = {
  ruleId: 'tap-target',
  title: '触摸区域',
  severity: 'warning',
  check() {
    return result([])
  },
}
