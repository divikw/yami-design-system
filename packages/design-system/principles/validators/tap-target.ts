/**
 * tap-target — interactive elements ≥ 44pt iOS / 48dp Android.
 *
 * Status: SKELETON — precise check requires runtime layout measurement
 * (CSS padding + visible-size vs rendered bounding box). A static check
 * would need to:
 *   1. Parse every interactive component usage (<Button>, <Input>, <a>, …)
 *   2. Resolve size prop + padding CSS + any parent scaling
 *   3. Compute final hit-area dimensions
 *
 * That's effectively partial runtime layout. Phase 8.5 visual scorer runs
 * this via Playwright + getBoundingClientRect.
 *
 * What we DO check statically: compact icon Buttons need context review.
 * Web SM/MD targets extend to 44px through pseudo-elements, not internal
 * padding. This does not reserve layout space or prevent ancestor clipping.
 */

import type { Validator, Violation } from '../schema'
import { findJsxElements, result } from './_shared'

export const tapTarget: Validator = {
  ruleId: 'tap-target',
  title: '触摸区域',
  severity: 'warning',
  check(code) {
    const violations: Violation[] = []
    // Both the current form prop and legacy shorthand need context review.
    for (const hit of findJsxElements(code, /Button/)) {
      if (hit.props.size === 'sm' && (hit.props.form === 'icon' || hit.props.iconOnly === true)) {
        violations.push({
          ruleId: 'tap-target',
          message:
            "Compact icon Button: verify its 44×44px pseudo-element target is not clipped by ancestors or overlapped by adjacent targets.",
          severity: 'warning',
          locations: [hit.location],
          suggestion:
            "Inspect the rendered layout and pointer hit area. Reserve enough spacing and avoid clipping; changing size alone does not resolve ancestor overflow.",
        })
      }
    }
    return result(violations)
  },
}
