import { string } from '@module/fields'
import { MappingFactoryImpl } from '@module/resources/mappers/factory'
import { Result } from '@module/result'
import __ from '@module/locale'

test('a generic mapping does not transform the value when (un)packing', () => {
  const factory = new MappingFactoryImpl('something')
  const mapping = factory.makeGenericMapping(string)
  const obj = {}

  expect(mapping.packValue('foo').value).toEqual('foo')
  expect(mapping.packValue(3).value).toEqual(3)
  expect(mapping.packValue(obj).value).toBe(obj)

  expect(mapping.unpackValue('foo').value).toEqual('foo')
  expect(mapping.unpackValue(3).value).toEqual(3)
  expect(mapping.unpackValue(obj).value).toBe(obj)
})

test('a generic mapping rejects invalid values', () => {
  const factory = new MappingFactoryImpl('something')
  const mapping = factory.makeGenericMapping(string.notEmpty)

  expect(mapping.packValue('foo').success).toBeTrue()
  expect(mapping.packValue('').success).toBeFalse()
})
