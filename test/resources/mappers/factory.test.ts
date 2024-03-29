import { Field, string } from '@module/fields'
import { MappedField } from '@module/resources/mappers/base'
import { MappingFactory, MappingFactoryImpl } from '@module/resources/mappers/factory'
import { Result } from '@module/result'

const generic = (factory: MappingFactory, field: Field<unknown>) => factory.makeGenericMapping(field)

const factoryMethods = [generic]

test.each(factoryMethods)(
  'field mappings created by the factory have the correct proprties',
  (factoryMethod: (factory: MappingFactory, field: Field<unknown>) => MappedField) => {
    const factory = new MappingFactoryImpl('something')
    const mapping = factoryMethod(factory, string)

    expect(mapping.modelProperty).toEqual('something')
    expect(mapping.transferProperty).toEqual('something')
  },
)

test.each(factoryMethods)(
  'field mappings created by the factory reject undefined values unless the field is optional',
  (factoryMethod: (factory: MappingFactory, field: Field<unknown>) => MappedField) => {
    const factory = new MappingFactoryImpl('something')
    const requiredMapping = factoryMethod(factory, string)
    const optionalMapping = factoryMethod(factory, string.optional)

    expect(requiredMapping.packValue('foo').success).toBeTrue()
    expect(optionalMapping.packValue('foo').success).toBeTrue()

    expect(requiredMapping.packValue(undefined).success).toBeFalse()
    expect(optionalMapping.packValue(undefined).success).toBeTrue()
  },
)

test.each(factoryMethods)(
  'field mappings created by the factory are not sent when read-only',
  (factoryMethod: (factory: MappingFactory, field: Field<unknown>) => MappedField) => {
    const factory = new MappingFactoryImpl('something')
    const writeableMapping = factoryMethod(factory, string)
    const readOnlyMapping = factoryMethod(factory, string.readOnly)

    expect(writeableMapping.packValue('foo')).toEqual(Result.ok('foo'))
    expect(readOnlyMapping.packValue('foo')).toEqual(Result.ok(undefined))
  },
)

test.each(factoryMethods)(
  'field mappings created by the factory are not received when write-only',
  (factoryMethod: (factory: MappingFactory, field: Field<unknown>) => MappedField) => {
    const factory = new MappingFactoryImpl('something')
    const readableMapping = factoryMethod(factory, string)
    const writeOnlyMapping = factoryMethod(factory, string.writeOnly)

    expect(readableMapping.unpackValue('foo')).toEqual(Result.ok('foo'))
    expect(writeOnlyMapping.unpackValue('foo')).toEqual(Result.ok(undefined))
  },
)
