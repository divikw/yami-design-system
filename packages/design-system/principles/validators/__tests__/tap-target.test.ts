import { expect, it } from 'vitest'
import { tapTarget } from '../tap-target'

it.each(['form="icon"', 'iconOnly'])('requests context review for compact icons: %s', (form) => {
  expect(tapTarget.check(`<Button size="sm" ${form} aria-label="Add" />`).violations).toHaveLength(1)
})

it('does not flag a default-sized text action as a compact icon', () => {
  expect(tapTarget.check('<Button>Save</Button>').violations).toHaveLength(0)
})
