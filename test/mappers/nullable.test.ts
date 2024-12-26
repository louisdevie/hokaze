import { string } from '@module'

test('reading a nullable string', () => {
  const nonNullableMapper = string.makeMapper()
  const nullableMapper = string.nullable.makeMapper()

  expect(nonNullableMapper.unpackValue('elephant')).toEqual('elephant')
  expect(nullableMapper.unpackValue('elephant')).toEqual('elephant')

  expect(nonNullableMapper.unpackValue(88)).toEqual('88')
  expect(nullableMapper.unpackValue(88)).toEqual('88')

  expect(nonNullableMapper.unpackValue(null)).toEqual(null)
  expect(nullableMapper.unpackValue(null)).toEqual(null)
})
