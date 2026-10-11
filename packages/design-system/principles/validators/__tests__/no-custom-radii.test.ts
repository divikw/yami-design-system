import { describe, expect, it } from 'vitest'

import { noCustomRadii } from '../no-custom-radii'

describe('Sheet radius contract', () => {
  it('accepts the mobile Sheet alias with flush bottom corners', () => {
    expect(noCustomRadii.check('.sheet { border-radius: var(--radius-surface-sheet) var(--radius-surface-sheet) 0 0; }').pass).toBe(true)
  })

  it.each(['16px 16px 0 0', 'var(--radius-surface-unknown)'])('rejects an unsupported radius: %s', (radius) => {
    expect(noCustomRadii.check(`.sheet { border-radius: ${radius}; }`).pass).toBe(false)
  })
})
