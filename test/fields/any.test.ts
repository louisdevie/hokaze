import { array, boolean, enumeration, number, object, ref, string } from '@module/fields'
import { AnyField } from '@module/fields/any'
import { Likelihood } from '@module/inference'
import { fakeResource, Fruit } from '@fake'
import { Ref } from '@module/reference'

interface TestData<T> {
  field: AnyField<T, AnyField<T, any>>
  defaultBlankValue: T
  customBlankValue: T
}

const arrayTestData: TestData<string[]> = { field: array(string), defaultBlankValue: [], customBlankValue: ['nothing'] }

const booleanTestData: TestData<boolean> = { field: boolean, defaultBlankValue: false, customBlankValue: true }

const enumTestData: TestData<'A' | 'B' | 'C'> = {
  field: enumeration('A', 'B', 'C'),
  defaultBlankValue: 'A',
  customBlankValue: 'B',
}

const numberTestData: TestData<number> = { field: number, defaultBlankValue: 0, customBlankValue: 1 }

const objectTestData: TestData<{ x: number; y: string }> = {
  field: object({ x: number, y: string }),
  defaultBlankValue: { x: 0, y: '' },
  customBlankValue: { x: 3, y: '3' },
}

const fruits = fakeResource()
const refTestData: TestData<Ref<Fruit>> = {
  field: ref(fruits),
  defaultBlankValue: Ref.fromKey(fruits, 0),
  customBlankValue: Ref.fromKey(fruits, 1),
}

const stringTestData: TestData<string> = { field: string, defaultBlankValue: '', customBlankValue: 'abc' }

const allTestData = [arrayTestData, booleanTestData, enumTestData, numberTestData, objectTestData, stringTestData]

test.each(allTestData)('the blank value of any field can be customized', (testData: TestData<any>) => {
  let withBlankValue = testData.field.withBlankValue(testData.customBlankValue)
  expect(withBlankValue).not.toBe(testData.field)
  expect(withBlankValue.blankValue).toBe(testData.customBlankValue)
})

test.each(allTestData)('any field can be made read-only', (testData: TestData<unknown>) => {
  let readOnly = testData.field.readOnly
  expect(readOnly).not.toBe(testData.field)
  expect(readOnly.isReadable).toBeTrue()
  expect(readOnly.isWritable).toBeFalse()
})

test.each(allTestData)('any field can be made write-only', (testData: TestData<unknown>) => {
  let writeOnly = testData.field.writeOnly
  expect(writeOnly).not.toBe(testData.field)
  expect(writeOnly.isReadable).toBeFalse()
  expect(writeOnly.isWritable).toBeTrue()
})

test.each(allTestData)('any field can be flagged as the id', (testData: TestData<unknown>) => {
  let asId = testData.field.asKey
  expect(asId).not.toBe(testData.field)
  expect(asId.isKey({ fieldName: '', resourceName: '' })).toEqual(Likelihood.explicit())
})

test.each(allTestData)('any field can be made optional', (testData: TestData<unknown>) => {
  let optional = testData.field.optional
  expect(optional).not.toBe(testData.field)
  expect(optional.isOptional).toBeTrue()
  expect(optional.blankValue).toEqual(testData.defaultBlankValue)
})

test.each(allTestData)('any field can be made nullable', (testData: TestData<unknown>) => {
  let nullable = testData.field.nullable
  expect(nullable).not.toBe(testData.field)
  expect(nullable.isOptional).toBeFalse()
  expect(nullable.blankValue).toEqual(null)
})
