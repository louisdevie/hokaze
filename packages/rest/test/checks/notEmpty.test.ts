import { validate } from './validate'
import { notEmpty } from '@module/checks/notEmpty'

test('the length check rejects strings too short or too long', () => {
  expect(validate('', notEmpty)).toBeFalse()
  expect(validate('   \t \n  ', notEmpty)).toBeFalse()
  expect(validate(' -- A -- ', notEmpty)).toBeTrue()
  expect(validate('x10!', notEmpty)).toBeTrue()
})
