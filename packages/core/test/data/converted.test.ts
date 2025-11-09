import { TestCheck } from '__mocks__'
import { Converter } from '~/converters'
import { AnyData } from '~/data/base'
import { ConvertedData, ConvertedDataInit } from '~/data/converted'
import { text } from '~/data/text'
import { Check } from '~/validation'

function convertedData<V, T>(init: {
  baseData: AnyData<T, unknown>
  converter?: Partial<Converter<V, T>>
  checks?: Check<V>[]
  blankValueFactory?: (() => V) | null
}): ConvertedData<V, T> {
  return new ConvertedData({
    baseData: init.baseData,
    converter: {
      pack: init.converter?.pack ?? ((a) => a as unknown as T),
      unpack: init.converter?.unpack ?? ((a) => a as unknown as V),
    },
    checks: init.checks ?? [],
    blankValueFactory: init.blankValueFactory ?? null,
  })
}

describe(ConvertedData, () => {
  test('inherits the isReadable property from the base descriptor', () => {
    const readableDescriptor = convertedData({ baseData: text })
    expect(readableDescriptor.isReadable).toBe(true)

    const writeOnlyDescriptor = convertedData({ baseData: text.writeOnly })
    expect(writeOnlyDescriptor.isReadable).toBe(false)
  })

  test('inherits the isWritable property from the base descriptor', () => {
    const writableDescriptor = convertedData({ baseData: text })
    expect(writableDescriptor.isWritable).toBe(true)

    const readOnlyDescriptor = convertedData({ baseData: text.readOnly })
    expect(readOnlyDescriptor.isWritable).toBe(false)
  })

  test('inherits the isOptional property from the base descriptor', () => {
    const requiredDescriptor = convertedData({ baseData: text })
    expect(requiredDescriptor.isOptional).toBe(false)

    const optionalDescriptor = convertedData({ baseData: text.optional })
    expect(optionalDescriptor.isOptional).toBe(true)
  })

  test('contain the checks passed to the constructor', () => {
    const check1 = new TestCheck(1)
    const descriptor = convertedData({ baseData: text, checks: [check1] })
    expect([...descriptor.checks]).toEqual([check1])
  })

  test('append checks at the end of the list when using checks', () => {
    const check1 = new TestCheck(1)
    const check2 = new TestCheck(2)
    const check3 = new TestCheck(3)

    const descriptorWithOneCheck = convertedData({ baseData: text, checks: [check1] })
    expect([...descriptorWithOneCheck.checks]).toEqual([check1])

    const descriptorWithAllChecks = descriptorWithOneCheck.check(check2, check3)
    expect([...descriptorWithAllChecks.checks]).toEqual([check1, check2, check3])
  })

  test('uses the blank value factory passed to the constructor', () => {
    const descriptor = convertedData({ baseData: text, blankValueFactory: () => 6 })
    expect(descriptor.createBlankValue()).toEqual(6)
  })

  test('converts the blank value from the base data when the factory is null', () => {
    const unpackFn = jest.fn(Number)
    const descriptor = convertedData({
      baseData: text.withBlankValue('6'),
      converter: { unpack: unpackFn },
      blankValueFactory: null,
    })
    expect(descriptor.createBlankValue()).toEqual(6)
    expect(unpackFn).toHaveBeenCalledWith('6')
  })

  test("returns the given value when using withBlankValue with a value that isn't a function", () => {
    const descriptor = convertedData({ baseData: text }).withBlankValue('other blank value')
    expect(descriptor.createBlankValue()).toEqual('other blank value')
  })

  test('uses the given factory function when using withBlankValue with a function', () => {
    const descriptor = convertedData({ baseData: text }).withBlankValue(() => 'other blank value')
    expect(descriptor.createBlankValue()).toEqual('other blank value')
  })
})
