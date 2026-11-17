/**
 * tap-target (runtime) — Web targets ≥24×24 CSS pixels or applicable WCAG exceptions.
 *
 * Bounds below 24px request review, not a definitive WCAG failure.
 * Does not infer spacing/inline exceptions, pseudo-element hit areas or clipping.
 *
 * This is the check that AST validators fundamentally cannot do —
 * rendered bounding box depends on CSS cascade, layout context,
 * padding, and parent constraints.
 */

import { getAllInteractiveElements, getSelectorPath, getYamiId, isVisible } from '../_shared'
import type { RuntimeValidator, RuntimeViolation } from '../schema'

const MIN_SIZE = 24 // CSS px — WCAG 2.2 SC 2.5.8 baseline

export const tapTarget: RuntimeValidator = {
  ruleId: 'tap-target',
  title: '触摸区域',
  severity: 'warning',
  check(root) {
    const violations: RuntimeViolation[] = []
    const elements = getAllInteractiveElements(root)

    for (const el of elements) {
      if (!isVisible(el)) continue

      const rect = el.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      if (width < MIN_SIZE || height < MIN_SIZE) {
        violations.push({
          ruleId: 'tap-target',
          message: `Review interactive target: rendered bounds are ${Math.round(width)}×${Math.round(height)}px (below the ${MIN_SIZE}×${MIN_SIZE}px baseline; actual hit area or exceptions may apply).`,
          severity: 'warning',
          yamiId: getYamiId(el),
          selector: getSelectorPath(el),
          element: el,
          suggestion:
            'Verify the actual hit area and WCAG 2.5.8 spacing or other exceptions. If none applies, provide at least 24×24px without clipping or overlapping adjacent controls. Prefer 44×44px for important touch actions; layout height need not match the hit area.',
          measured: { width: Math.round(width), height: Math.round(height) },
        })
      }
    }

    return violations
  },
}
