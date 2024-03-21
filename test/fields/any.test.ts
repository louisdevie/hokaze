import { string } from '@module/fields'
import { AnyField } from '@module/fields/any'

interface TestData<T> {
  field: AnyField<T, AnyField<T, any>>
  defaultBlankValue: T
  customBlankValue: T
}

test.each([{ field: string, defaultBlankValue: '', customBlankValue: 'abc' }])(
  'Shared field builder methods',
  <T>(testData: TestData<T>) => {
    let withBlankValue = testData.field.withBlankValue(testData.customBlankValue)
    expect(withBlankValue).not.toBe(testData.field)
    expect(withBlankValue.blankValue).toBe(testData.customBlankValue)

    let readOnly = testData.field.readOnly
    expect(readOnly).not.toBe(testData.field)
    expect(readOnly.isReadable).toBeTruthy()
    expect(readOnly.isWritable).toBeFalsy()

    let writeOnly = testData.field.writeOnly
    expect(writeOnly).not.toBe(testData.field)
    expect(writeOnly.isReadable).toBeFalsy()
    expect(writeOnly.isWritable).toBeTruthy()

    let asId = testData.field.asId
    expect(asId).not.toBe(testData.field)
    expect(asId.isTheId({ fieldName: '', resourceName: '' })).toMatchObject({ explicit: true })

    let optional = testData.field.optional
    expect(optional).not.toBe(testData.field)
    expect(optional.isOptional).toBeTruthy()
    expect(optional.blankValue).toEqual(testData.defaultBlankValue)

    let nullable = testData.field.nullable
    expect(nullable).not.toBe(testData.field)
    expect(nullable.isOptional).toBeFalsy()
    expect(nullable.blankValue).toEqual(null)
  },
)
