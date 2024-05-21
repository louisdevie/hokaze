import { string } from '@module/fields'
import { Checks } from '@module/fields/checks'

function isValid(value: string | null | undefined, checks: Checks<string | null | undefined>): boolean {
  return checks.validate(value).isValid
}

test('the notEmpty option rejects empty strings', () => {
  const notEmpty = string.nullable.optional.notEmpty
  expect(isValid('', notEmpty)).toBeFalse()
  expect(isValid('   \t \n ', notEmpty)).toBeFalse()
  expect(isValid('abcdef', notEmpty)).toBeTrue()
  expect(isValid(null, notEmpty)).toBeTrue()
  expect(isValid(undefined, notEmpty)).toBeTrue()
})

test('the maxLength option rejects strings strictly longer than the length parameter', () => {
  const maxLength = string.nullable.optional.maxLength(10)
  expect(isValid('', maxLength)).toBeTrue()
  expect(isValid('abcdef', maxLength)).toBeTrue()
  expect(isValid('abcdefghij', maxLength)).toBeTrue()
  expect(isValid('abcdefghijklm', maxLength)).toBeFalse()
  expect(isValid(null, maxLength)).toBeTrue()
  expect(isValid(undefined, maxLength)).toBeTrue()
})
