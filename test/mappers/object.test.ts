import { object, string } from '@module'
import { maxLength } from '@module/checks'
import L from '@module/locale'

test('validating nested properties', () => {
  const noChecks = object({ prop: string })
  const withChecks = object({ prop: string.and(maxLength(20)) })

  expect(noChecks.validate({ prop: "it's too big, isn't it ?" }).isValid).toBeTrue()
  const checkedResult = withChecks.validate({ prop: "it's too big, isn't it ?" })
  expect(checkedResult.isValid).toBeFalse()
  expect(checkedResult.hasError('$')).toBeFalse()
  expect(checkedResult.getError('$')).toBeUndefined()
  expect(checkedResult.hasError('$.prop')).toBeTrue()
  expect(checkedResult.getError('$.prop')).toEqual(L.stringTooLong(20))
})
