import {MaximumLengthCheck, NotEmptyCheck} from "@module/checks/string";
import {NoChecks} from "@module/checks";

test('the NotEmptyCheck rejects empty strings', () => {
  const notEmpty = new NotEmptyCheck(new NoChecks())
  expect(notEmpty.validate('').isValid).toBeFalse()
  expect(notEmpty.validate('   \t \n ').isValid).toBeFalse()
  expect(notEmpty.validate('abcdef').isValid).toBeTrue()
  expect(notEmpty.validate(null).isValid).toBeTrue()
  expect(notEmpty.validate(undefined).isValid).toBeTrue()
})

test('the MaximumLengthCheck rejects strings longer than the length parameter', () => {
  const maxLength = new MaximumLengthCheck(new NoChecks(), 10)
  expect(maxLength.validate('').isValid).toBeTrue()
  expect(maxLength.validate('abcdef').isValid).toBeTrue()
  expect(maxLength.validate('abcdefghij').isValid).toBeTrue()
  expect(maxLength.validate('abcdefghijklm').isValid).toBeFalse()
  expect(maxLength.validate(null).isValid).toBeTrue()
  expect(maxLength.validate(undefined).isValid).toBeTrue()
})
