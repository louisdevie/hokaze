import { validate } from './validate'
import {
  between,
  exclusiveBetween,
  greaterThan,
  greaterThanOrEqualTo,
  lessThan,
  lessThanOrEqualTo,
  negative,
  positive,
  strictlyNegative,
  strictlyPositive,
} from '@module/checks/range'

test('the greaterThan check rejects any number less than or equal to its argument', () => {
  expect(validate(-1, greaterThan(5))).toBeFalse()
  expect(validate(2, greaterThan(5))).toBeFalse()
  expect(validate(5, greaterThan(5))).toBeFalse()
  expect(validate(8, greaterThan(5))).toBeTrue()
})

test('the lessThan check rejects any number greater than or equal to its argument', () => {
  expect(validate(-1, lessThan(2))).toBeTrue()
  expect(validate(2, lessThan(2))).toBeFalse()
  expect(validate(5, lessThan(2))).toBeFalse()
  expect(validate(8, lessThan(2))).toBeFalse()
})

test('the greaterThanOrEqualTo check rejects any number less than or equal to its argument', () => {
  expect(validate(-1, greaterThanOrEqualTo(5))).toBeFalse()
  expect(validate(2, greaterThanOrEqualTo(5))).toBeFalse()
  expect(validate(5, greaterThanOrEqualTo(5))).toBeTrue()
  expect(validate(8, greaterThanOrEqualTo(5))).toBeTrue()
})

test('the lessThanOrEqualTo check rejects any number greater than or equal to its argument', () => {
  expect(validate(-1, lessThanOrEqualTo(2))).toBeTrue()
  expect(validate(2, lessThanOrEqualTo(2))).toBeTrue()
  expect(validate(5, lessThanOrEqualTo(2))).toBeFalse()
  expect(validate(8, lessThanOrEqualTo(2))).toBeFalse()
})

test('the positive check rejects any number less than zero', () => {
  expect(validate(-3, positive)).toBeFalse()
  expect(validate(0, positive)).toBeTrue()
  expect(validate(3, positive)).toBeTrue()
})

test('the negative check rejects any number greater than zero', () => {
  expect(validate(-3, negative)).toBeTrue()
  expect(validate(0, negative)).toBeTrue()
  expect(validate(3, negative)).toBeFalse()
})

test('the strictlyPositive check rejects any number less than or equal to zero', () => {
  expect(validate(-3, strictlyPositive)).toBeFalse()
  expect(validate(0, strictlyPositive)).toBeFalse()
  expect(validate(3, strictlyPositive)).toBeTrue()
})

test('the strictlyNegative check rejects any number greater than or equal to zero', () => {
  expect(validate(-3, strictlyNegative)).toBeTrue()
  expect(validate(0, strictlyNegative)).toBeFalse()
  expect(validate(3, strictlyNegative)).toBeFalse()
})

test('the between check rejects any number outside of the specified range (inclusive)', () => {
  expect(validate(-1, between(2, 5))).toBeFalse()
  expect(validate(2, between(2, 5))).toBeTrue()
  expect(validate(3.56, between(2, 5))).toBeTrue()
  expect(validate(5, between(2, 5))).toBeTrue()
  expect(validate(8, between(2, 5))).toBeFalse()
})

test('the exclusiveBetween check rejects any number outside of the specified range (exclusive)', () => {
  expect(validate(-1, exclusiveBetween(2, 5))).toBeFalse()
  expect(validate(2, exclusiveBetween(2, 5))).toBeFalse()
  expect(validate(3.56, exclusiveBetween(2, 5))).toBeTrue()
  expect(validate(5, exclusiveBetween(2, 5))).toBeFalse()
  expect(validate(8, exclusiveBetween(2, 5))).toBeFalse()
})
