// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { focusStyle } from '../validators/focus-style'
import { createElement, mountFixture } from './setup'

describe('focus-style (runtime)', () => {
  let cleanup: () => void

  afterEach(() => {
    cleanup?.()
    vi.restoreAllMocks()
  })

  it.each(['rgb(0, 102, 235)', 'rgb(102, 161, 255)'])('accepts the resolved light/dark blue token %s', (color) => {
    const button = createElement('button', {
      textContent: 'Click me',
      styles: { width: '100px', height: '44px', display: 'block' },
    })

    cleanup = mountFixture(button)

    // happy-dom returns empty strings for computed outline properties,
    // so we mock getComputedStyle to simulate a real browser.
    const originalGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const real = originalGetComputedStyle(el)
      if (el === button) {
        return {
          ...real,
          outlineStyle: 'solid',
          outlineWidth: '2px',
          outlineColor: color,
          getPropertyValue: (name: string) => name === '--focus-ring' ? color : '',
        } as CSSStyleDeclaration
      }
      return real
    })

    const violations = focusStyle.check(document.body)
    expect(violations).toEqual([])
  })

  it('flags elements with no visible outline on focus as warning', () => {
    const button = createElement('button', {
      textContent: 'No outline',
      styles: { width: '100px', height: '44px', display: 'block' },
    })

    cleanup = mountFixture(button)

    const originalGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const real = originalGetComputedStyle(el)
      if (el === button) {
        return {
          ...real,
          outlineStyle: 'none',
          outlineWidth: '0px',
          outlineColor: '',
        } as CSSStyleDeclaration
      }
      return real
    })

    const violations = focusStyle.check(document.body)

    expect(violations.length).toBe(1)
    expect(violations[0]?.ruleId).toBe('focus-style')
    expect(violations[0]?.severity).toBe('warning')
    expect(violations[0]?.suggestion).toContain('--focus-ring')
  })

  it('rejects the old neutral border color as a keyboard outline', () => {
    const button = createElement('button', {
      textContent: 'Neutral ring',
      styles: { width: '100px', height: '44px', display: 'block' },
    })

    cleanup = mountFixture(button)

    const originalGetComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const real = originalGetComputedStyle(el)
      if (el === button) {
        return {
          ...real,
          outlineStyle: 'solid',
          outlineWidth: '2px',
          outlineColor: 'rgba(0, 0, 0, 0.87)',
          getPropertyValue: (name: string) => name === '--focus-ring' ? '#0066eb' : '#66a1ff',
        } as CSSStyleDeclaration
      }
      return real
    })

    const violations = focusStyle.check(document.body)

    expect(violations.length).toBe(1)
    expect(violations[0]?.ruleId).toBe('focus-style')
    expect(violations[0]?.severity).toBe('error')
    expect(violations[0]?.message).toContain('--focus-ring')
  })
})
