import { resolveConverter, resolveSelfConverter } from '~/converters'

describe(resolveConverter, () => {
  test("doesn't modify the converter if both operations are already defined", () => {
    const resolved = resolveConverter<number, string>({ unpack: Number, pack: String })

    expect(resolved.unpack('6')).toEqual(6)
    expect(resolved.pack(6)).toEqual('6')
  })

  test('if the unpack operation is not defined, implements it with an identity function', () => {
    const resolved = resolveConverter<number, string>({ pack: String })

    expect(resolved.unpack('6')).toEqual('6')
    expect(resolved.pack(6)).toEqual('6')
  })

  test('if the pack operation is not defined, implements it with an identity function', () => {
    const resolved = resolveConverter<number, string>({ unpack: Number })

    expect(resolved.unpack('6')).toEqual(6)
    expect(resolved.pack(6)).toEqual(6)
  })
})

describe(resolveSelfConverter, () => {
  describe('with a class that defines a toString() method', () => {
    class TestClassToString {
      private readonly _internalValue: string

      public constructor(value: string) {
        this._internalValue = value
      }

      public toString() {
        return this._internalValue
      }
    }

    test('the toString() method is always used to pack the object', () => {
      const testObject = new TestClassToString('Junko')

      const resolvedForDefault = resolveSelfConverter(TestClassToString, 'default')
      expect(resolvedForDefault.unpack('Junko')).toEqual(testObject)
      expect(resolvedForDefault.pack(testObject)).toEqual('Junko')

      const resolvedForNumber = resolveSelfConverter(TestClassToString, 'number')
      expect(resolvedForNumber.unpack('Junko')).toEqual(testObject)
      expect(resolvedForNumber.pack(testObject)).toEqual('Junko')

      const resolvedForString = resolveSelfConverter(TestClassToString, 'string')
      expect(resolvedForString.unpack('Junko')).toEqual(testObject)
      expect(resolvedForString.pack(testObject)).toEqual('Junko')
    })
  })

  describe('with a class that defines a valueOf() method', () => {
    class TestClassValueOf {
      private readonly _internalValue: number

      public constructor(value: number) {
        this._internalValue = value
      }

      public toString() {
        return `TestClass(${this._internalValue})`
      }

      public valueOf() {
        return this._internalValue
      }
    }

    test('the valueOf() method is used to pack the object if the hint is "default" or  "number"', () => {
      const testObject = new TestClassValueOf(39)

      const resolvedForDefault = resolveSelfConverter(TestClassValueOf, 'default')
      expect(resolvedForDefault.unpack(39)).toEqual(testObject)
      expect(resolvedForDefault.pack(testObject)).toEqual(39)

      const resolvedForNumber = resolveSelfConverter(TestClassValueOf, 'number')
      expect(resolvedForNumber.unpack(39)).toEqual(testObject)
      expect(resolvedForNumber.pack(testObject)).toEqual(39)
    })

    test('the toString() method is used to pack the object if the hint is "string"', () => {
      const testObject = new TestClassValueOf(39)

      const resolvedForString = resolveSelfConverter(TestClassValueOf, 'string')
      expect(resolvedForString.unpack(39)).toEqual(testObject)
      expect(resolvedForString.pack(testObject)).toEqual('TestClass(39)')
    })
  })

  describe('with a class that defines a @@toPrimitive() method', () => {
    class TestClassToPrimitive {
      private readonly _internalValue: number

      public constructor(value: number) {
        this._internalValue = value
      }

      public [Symbol.toPrimitive]() {
        // always use valueOf, even with a "string" hint
        return this.valueOf()
      }

      public toString() {
        return `TestClass(${this._internalValue})`
      }

      public valueOf() {
        return this._internalValue
      }
    }

    test('the @@toPrimitive() method is always used to pack the object', () => {
      const testObject = new TestClassToPrimitive(39)

      const resolvedForDefault = resolveSelfConverter(TestClassToPrimitive, 'default')
      expect(resolvedForDefault.unpack(39)).toEqual(testObject)
      expect(resolvedForDefault.pack(testObject)).toEqual(39)

      const resolvedForNumber = resolveSelfConverter(TestClassToPrimitive, 'number')
      expect(resolvedForNumber.unpack(39)).toEqual(testObject)
      expect(resolvedForNumber.pack(testObject)).toEqual(39)

      const resolvedForString = resolveSelfConverter(TestClassToPrimitive, 'string')
      expect(resolvedForString.unpack(39)).toEqual(testObject)
      expect(resolvedForString.pack(testObject)).toEqual(39)
    })
  })

  describe('practical use cases', () => {
    test('representing a Date as a timestamp', () => {
      const testTimestamp = Date.UTC(2004, 3, 10)
      const testDate = new Date(testTimestamp)

      const resolvedForDefault = resolveSelfConverter<Date, number>(Date, 'number')
      expect(resolvedForDefault.unpack(testTimestamp)).toEqual(testDate)
      expect(resolvedForDefault.pack(testDate)).toEqual(testTimestamp)
    })

    test('using the URL class for fields containing URLs', () => {
      const testURL = new URL('https://example.com')

      const resolvedForDefault = resolveSelfConverter<URL, string>(URL, 'string')
      expect(resolvedForDefault.unpack('https://example.com')).toEqual(testURL)
      // the URL gets normalized on output
      expect(resolvedForDefault.pack(testURL)).toEqual('https://example.com/')
    })
  })
})
