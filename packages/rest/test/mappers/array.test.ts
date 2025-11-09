import { array, string } from '@module'
import { maxLength } from '@module/checks'
import L from '@module/locale'

test('validating the items of an array', () => {
  const noChecks = array(string)
  const withChecks = array(string.and(maxLength(20)))

  expect(noChecks.validate(['this one is fine', "but this one's too long"]).isValid).toBeTrue()
  const checkedResult = withChecks.validate(['this one is fine', "but this one's too long"])
  expect(checkedResult.isValid).toBeFalse()
  expect(checkedResult.hasError('$')).toBeFalse()
  expect(checkedResult.getError('$')).toBeUndefined()
  expect(checkedResult.hasError('$[0]')).toBeFalse()
  expect(checkedResult.getError('$[0]')).toBeUndefined()
  expect(checkedResult.hasError('$[1]')).toBeTrue()
  expect(checkedResult.getError('$[1]')).toEqual(L.stringTooLong(20))
})
