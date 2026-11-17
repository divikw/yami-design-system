// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { tapTarget } from '../validators/tap-target'
import { createElement, mountFixture } from './setup'

describe('tap-target (runtime)', () => {
  let cleanup: () => void

  afterEach(() => {
    cleanup?.()
    vi.restoreAllMocks()
  })

  function mountTarget(width: number, height: number) {
    const button = createElement('button', {
      textContent: 'Action',
      styles: { width: `${width}px`, height: `${height}px`, display: 'block' },
    })
    cleanup = mountFixture(button)
    // happy-dom has no layout engine.
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      width, height, x: 0, y: 0, top: 0, left: 0, bottom: height, right: width,
      toJSON: () => {},
    })
  }

  it.each([24, 32, 44])('accepts a %ipx target without requiring the 44px recommendation', (size) => {
    mountTarget(size, size)
    expect(tapTarget.check(document.body)).toEqual([])
  })

  it.each([[23, 24], [24, 23], [20, 20]])('requests exception review for a %i×%i target', (width, height) => {
    mountTarget(width, height)
    const violations = tapTarget.check(document.body)
    expect(violations).toHaveLength(1)
    expect(violations[0]).toMatchObject({
      ruleId: 'tap-target', severity: 'warning', measured: { width, height },
    })
    expect(violations[0]?.message).toContain('exceptions may apply')
    expect(violations[0]?.suggestion).toContain('spacing or other exceptions')
    expect(violations[0]?.selector).toBeTruthy()
  })

  it('skips hidden elements', () => {
    cleanup = mountFixture(createElement('button', {
      textContent: 'Hidden',
      styles: { width: '10px', height: '10px', display: 'none' },
    }))
    expect(tapTarget.check(document.body)).toEqual([])
  })
})
