import { Field, string } from '@module/fields'
import { AutoMappedField } from '@module/resources/mappers/auto'
import { MappedField } from '@module/resources/mappers/base'
import { Result } from '@module/result'

test('auto mappings have the correct proprties', () => {
  const mapping = new AutoMappedField('something')

  expect(mapping.modelProperty).toEqual('something')
  expect(mapping.transferProperty).toEqual('something')
})

test('an auto mapping does not transform the value when (un)packing', () => {
  const mapping = new AutoMappedField('something')
  const obj = {}

  expect(mapping.packValue('foo')).toEqual(Result.ok('foo'))
  expect(mapping.packValue(3)).toEqual(Result.ok(3))
  expect(mapping.packValue(null)).toEqual(Result.ok(null))
  expect(mapping.packValue(undefined)).toEqual(Result.ok(undefined))
  expect(mapping.packValue(obj).value).toBe(obj)

  expect(mapping.unpackValue('foo')).toEqual(Result.ok('foo'))
  expect(mapping.unpackValue(3)).toEqual(Result.ok(3))
  expect(mapping.unpackValue(null)).toEqual(Result.ok(null))
  expect(mapping.unpackValue(undefined)).toEqual(Result.ok(undefined))
  expect(mapping.unpackValue(obj).value).toBe(obj)
})
