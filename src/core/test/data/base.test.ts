import { AnyData, AnyDataOptions } from '~/data/base'
import { Log } from '~/logging'
import { Mapper } from '~/mappers'
import { Check, ValidationResult } from '~/validation'

describe(AnyData, () => {
  class TestData extends AnyData<string, TestData> {
    public constructor(copyFrom?: TestData, options?: AnyDataOptions<string>) {
      super(copyFrom, options)
    }

    protected createDefaultBlankValue(): string {
      return 'default blank value'
    }

    protected cloneAsSelf(options: AnyDataOptions<string>): TestData {
      return new TestData(this, options)
    }

    public createMapper(): Mapper<string> {
      throw new Error('Method not implemented.')
    }

    public get optional(): AnyData<string | undefined, unknown> {
      throw new Error('Method not implemented.')
    }
  }

  class TestCheck implements Check<unknown> {
    private _discriminant: number

    public constructor(discriminant: number) {
      this._discriminant = discriminant
    }

    public validate(value: unknown): ValidationResult {
      return {}
    }
  }

  test('is readable by default', () => {
    const descriptor = new TestData()
    expect(descriptor.isReadable).toBe(true)
  })

  test('becomes non-readable when using writeOnly', () => {
    const descriptor = new TestData().writeOnly
    expect(descriptor.isReadable).toBe(false)
  })

  test('is writable by default', () => {
    const descriptor = new TestData()
    expect(descriptor.isWritable).toBe(true)
  })

  test('becomes non-writable when using readOnly', () => {
    const descriptor = new TestData().readOnly
    expect(descriptor.isWritable).toBe(false)
  })

  test('readOnly and writeOnly are mutually exclusive', () => {
    const logWarn = jest.spyOn(Log, 'warn')

    const descriptor1 = new TestData().readOnly.writeOnly
    expect(logWarn).toHaveBeenCalledTimes(1)
    expect(logWarn).toHaveBeenCalledWith('writeOnly modifier used on non-writable field')
    // only the last operator (in this case writeOnly) is applied
    expect(descriptor1.isReadable).toBe(false)
    expect(descriptor1.isWritable).toBe(true)

    const descriptor2 = new TestData().writeOnly.readOnly
    expect(logWarn).toHaveBeenCalledTimes(2)
    expect(logWarn).toHaveBeenCalledWith('readOnly modifier used on non-readable field')
    // only the last operator (in this case readOnly) is applied
    expect(descriptor2.isReadable).toBe(true)
    expect(descriptor2.isWritable).toBe(false)
  })

  test('does not contain any checks by default', () => {
    const descriptor = new TestData()
    expect([...descriptor.checks]).toEqual([])
  })

  test('append checks at the end of the list when using checks', () => {
    const check1 = new TestCheck(1)
    const check2 = new TestCheck(2)
    const check3 = new TestCheck(3)

    const descriptorWithOneCheck = new TestData().check(check1)
    expect([...descriptorWithOneCheck.checks]).toEqual([check1])

    const descriptorWithAllChecks = descriptorWithOneCheck.check(check2, check3)
    expect([...descriptorWithAllChecks.checks]).toEqual([check1, check2, check3])
  })

  test('uses createDefaultBlankValue by default', () => {
    const descriptor = new TestData()
    expect(descriptor.createBlankValue()).toEqual('default blank value')
  })

  test("returns the given value when using withBlankValue with a value that isn't a function", () => {
    const descriptor = new TestData().withBlankValue('other blank value')
    expect(descriptor.createBlankValue()).toEqual('other blank value')
  })

  test('uses the given factory function when using withBlankValue with a function', () => {
    const descriptor = new TestData().withBlankValue(() => 'other blank value')
    expect(descriptor.createBlankValue()).toEqual('other blank value')
  })

  test('is not optional by default', () => {
    const descriptor = new TestData()
    expect(descriptor.isOptional).toBe(false)
  })
})
