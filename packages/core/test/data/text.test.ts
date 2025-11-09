import { TextData } from '~/data/text'

describe(TextData, () => {
  test('modifiers return an instance of TextData', () => {
    const descriptor = new TextData()
    expect(descriptor.readOnly).toBeInstanceOf(TextData)
    expect(descriptor.writeOnly).toBeInstanceOf(TextData)
    expect(descriptor.optional).toBeInstanceOf(TextData)
    expect(descriptor.check()).toBeInstanceOf(TextData)
    expect(descriptor.withBlankValue('')).toBeInstanceOf(TextData)
  })

  test('createBlankValue return an empty string by default', () => {
    const descriptor = new TextData()
    expect(descriptor.createBlankValue()).toEqual('')
  })

  test('becomes optional when using optional', () => {
    const descriptor = new TextData().optional
    expect(descriptor.isOptional).toBe(true)
  })
})
