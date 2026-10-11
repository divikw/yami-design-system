import { expect, it } from 'vitest'
import { emphasisLimit } from '../emphasis-limit'

it('counts ButtonLink and Button against the same emphasis limit', () => {
  expect(emphasisLimit.check('<ButtonLink href="/checkout" variant="emphasis">Checkout</ButtonLink>').pass).toBe(true)
  const result = emphasisLimit.check('<ButtonLink href="/checkout" variant="emphasis">Checkout</ButtonLink><Button variant="emphasis">Buy now</Button>')
  expect(result.pass).toBe(false)
  expect(result.violations).toHaveLength(1)
})
