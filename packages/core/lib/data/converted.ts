import { DataDescriptor } from '.'
import { AnyData, AnyDataChecks } from './base'
import { Converter, PartialConverter, resolveConverter } from '~/converters'
import { Mapper } from '~/mappers'
import { WrappedMapper } from '~/mappers/converters'
import { Check, ValidationResult } from '~/validation'

/**
 * Options to initialise a {@link ConvertedData} descriptor.
 */
export interface ConvertedDataInit<V, T> {
  baseData: AnyData<T, unknown>
  converter: Converter<V, T>
  checks: Check<NonNullable<V>>[]
  blankValueFactory: (() => V) | null
}

export function applyConverter<V, T>(
  baseData: AnyData<T, unknown>,
  partialConverter: PartialConverter<V, T>,
): ConvertedDataInit<V, T> {
  const converter = resolveConverter(partialConverter)
  return {
    baseData,
    converter,
    checks: baseData.checks.map((check) => new ConvertedCheck(check, converter)),
    blankValueFactory: null,
  }
}

/**
 * A descriptor that has been wrapped with a converter. This descriptor doesn't inherit from {@link AnyData} and do not
 * provide the same configuration options.
 * @template V The type of the data described by this object.
 * @template T The underlying type of the data being transferred.
 */
export class ConvertedData<V, T> implements DataDescriptor<V> {
  private readonly _baseData: AnyData<T, unknown>
  private readonly _converter: Converter<V, T>
  private readonly _checks: AnyDataChecks<NonNullable<V>>
  private readonly _blankValueFactory: (() => V) | null

  /**
   * Decorates a base descriptor with a custom mapper. Unlike the constructors of {@link AnyData} and the classes
   * derived from it, this constructor doesn't have a "copyFrom" argument and can't reuse the configuration from another
   * {@link ConvertedData}.
   * @param init Initialisation parameters for the descriptors.
   */
  public constructor(init: ConvertedDataInit<V, T>) {
    this._baseData = init.baseData
    this._converter = init.converter
    this._checks = new AnyDataChecks(init.checks)
    this._blankValueFactory = init.blankValueFactory
  }

  public get isReadable(): boolean {
    return this._baseData.isReadable
  }

  public get isWritable(): boolean {
    return this._baseData.isWritable
  }

  public get isOptional(): boolean {
    return this._baseData.isOptional
  }

  public get checks(): AnyDataChecks<NonNullable<V>> {
    return this._checks
  }

  public createBlankValue(): V {
    return this._blankValueFactory !== null ?
        this._blankValueFactory()
      : this._converter.unpack(this._baseData.createBlankValue())
  }

  public createMapper(): Mapper<V> {
    return new WrappedMapper(this._converter, this._baseData.createMapper())
  }

  /**
   * Adds one or more validators for the converted data.
   * @param checks The validators to add to the descriptor.
   */
  public check(...checks: Check<NonNullable<V>>[]): ConvertedData<V, T> {
    return new ConvertedData({
      baseData: this._baseData,
      converter: this._converter,
      checks: [...this._checks, ...checks],
      blankValueFactory: this._blankValueFactory,
    })
  }

  /**
   * Change the "blank" value used when creating new objects. If the value is *mutable* (e.g. if it is an object),
   * consider using the other overload instead.
   * @param value The new value to use.
   */
  public withBlankValue(value: V): ConvertedData<V, T>
  /**
   * Change the "blank" value used when creating new objects.
   * @param factory A function that will create a new value each time it is called.
   */
  public withBlankValue(factory: () => V): ConvertedData<V, T>
  public withBlankValue(factoryOrValue: (() => V) | V): ConvertedData<V, T> {
    let blankValueFactory
    if (factoryOrValue instanceof Function) {
      blankValueFactory = factoryOrValue
    } else {
      blankValueFactory = (): V => factoryOrValue
    }
    return new ConvertedData({
      baseData: this._baseData,
      converter: this._converter,
      checks: [...this._checks],
      blankValueFactory,
    })
  }
}

class ConvertedCheck<V, T> implements Check<V> {
  private readonly _baseCheck: Check<T>
  private readonly _converter: Converter<V, T>

  public constructor(baseCheck: Check<T>, converter: Converter<V, T>) {
    this._baseCheck = baseCheck
    this._converter = converter
  }

  public validate(value: V): ValidationResult {
    return this._baseCheck.validate(this._converter.pack(value))
  }
}
