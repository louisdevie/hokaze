import { BlobData } from '~/data/blob'

describe(BlobData, () => {
  test('modifiers return an instance of BlobData', () => {
    const descriptor = new BlobData()
    expect(descriptor.readOnly).toBeInstanceOf(BlobData)
    expect(descriptor.writeOnly).toBeInstanceOf(BlobData)
    expect(descriptor.optional).toBeInstanceOf(BlobData)
    expect(descriptor.check()).toBeInstanceOf(BlobData)
    expect(descriptor.withBlankValue('')).toBeInstanceOf(BlobData)
  })

  test('createBlankValue return an empty Blob by default', () => {
    const descriptor = new BlobData()
    expect(descriptor.createBlankValue()).toEqual(new Blob())
  })

  test('becomes optional when using optional', () => {
    const descriptor = new BlobData().optional
    expect(descriptor.isOptional).toBe(true)
  })
})
