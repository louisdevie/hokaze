import { noArgs } from '@module/resources/decorator'

describe('the noArgs helper function', () => {
  test('returns true when undefined', () => {
    expect(noArgs(undefined)).toBeTrue()
  })

  test('returns true for an empty object literal', () => {
    expect(noArgs({})).toBeTrue()
  })

  test('returns false for an object literal with properties', () => {
    expect(noArgs({ a: 5, b: 6 })).toBeFalse()
  })
})
