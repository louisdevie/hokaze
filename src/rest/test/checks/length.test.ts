import { validateWith } from './validate'
import { length, minLength, maxLength } from '@module/checks/length'

const strings = ['', 'a', 'abc', 'abcdefgh', 'abcdefghij', 'abcdefghijklmno']

test('the length check rejects strings too short or too long', () => {
  const results = strings.map(validateWith(length(3, 10)))
  expect(results).toEqual([false, false, true, true, true, false])
})

test('the minLength check rejects strings too short', () => {
  const results = strings.map(validateWith(minLength(3)))
  expect(results).toEqual([false, false, true, true, true, true])
})

test('the minLength check rejects strings too long', () => {
  const results = strings.map(validateWith(maxLength(10)))
  expect(results).toEqual([true, true, true, true, true, false])
})
