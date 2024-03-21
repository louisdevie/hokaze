import { string } from '@module'

test('String field builder methods', () => {
  let notEmpty = string.notEmpty
  expect(notEmpty).not.toBe(string)
  expect(notEmpty.validate('')).toBe(testData.customBlankValue)

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
})
