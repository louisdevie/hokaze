import { object, string } from '@module'

test('validating nested properties', () => {
  const noChecks = object({ prop: string })
  const withChecks = object({ prop: string.maxLength(20) })

  expect(noChecks.validate({ prop: "it's too big, isn't it ?" }).isValid).toBeTrue()
  expect(withChecks.validate({ prop: "it's too big, isn't it ?" }).isValid).toBeFalse()
})
