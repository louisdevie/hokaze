import { string } from '@module'

test('reading a nullable string', () => {
  const nonNullablemapper = string.makeMapper()
  const nullablemapper = string.nullable.makeMapper()

  expect(nonNullablemapper.unpackValue('elephant')).toEqual('elephant')
  expect(nullablemapper.unpackValue('elephant')).toEqual('elephant')

  expect(nonNullablemapper.unpackValue(88)).toEqual('88')
  expect(nullablemapper.unpackValue(88)).toEqual('88')

  expect(nonNullablemapper.unpackValue(null)).toEqual(null)
  expect(nullablemapper.unpackValue(null)).toEqual(null)
})
