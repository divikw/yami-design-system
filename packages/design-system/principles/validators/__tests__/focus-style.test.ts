import { describe, expect, it } from 'vitest'
import { focusStyle } from '../focus-style'

describe('focus-style semantic separation', () => {
  it.each(['--focus-ring', '--focus-ring-inverse'])('accepts %s for keyboard outlines', (token) => {
    expect(focusStyle.check(`button:focus-visible { outline: 2px solid var(${token}); outline-offset: 2px; }`).pass).toBe(true)
  })

  it.each(['var(--border-focus)', 'var(--border-attention)', '#0066eb'])('rejects %s as a keyboard outline', (color) => {
    expect(focusStyle.check(`button:focus-visible { outline: 2px solid ${color}; }`).pass).toBe(false)
  })

  it('leaves component state borders and selected outlines alone', () => {
    expect(focusStyle.check(`input:focus { border-color: var(--border-focus); } .field:focus-within { outline: 1px solid var(--border-focus); } .chip[data-selected] { outline: 1px solid var(--border-focus); }`).pass).toBe(true)
  })
})
