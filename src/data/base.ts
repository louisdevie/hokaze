import { DataDescriptor } from '.'
import { Check } from '@module/checks'
import { ConvertedData } from '@module/data/converted'
import L from '@module/locale'
import { Mapper } from '@module/mappers'
import {
  AnyConverter,
  Converter,
  InputConverter,
  InputSelfConverter,
  OutputConverter,
  OutputSelfConverter,
} from '@module/mappers/converters'
import { resolveConverter, resolveSelfConverter } from '@module/mappers/converters/factory'
import { ValidationResult } from '@module/validation'

/**
 * Options shared by all descriptors.
 */
export interface AnyDataOptions<T> {
  blankValueFactory?: () => T
  isReadable?: boolean
  isWritable?: boolean
  isOptional?: boolean
  checks?: Check<NonNullable<T>>[]
}

/**
 * A base class containing the options shared by all descriptors.
 * @template T The corresponding JavaScript type.
 * @template Self The concrete type of the class extending this.
 */
export abstract class AnyData<T, Self> implements DataDescriptor<T> {
  private readonly _blankValueFactory: (() => T) | null
  private readonly _isReadable: boolean
  private readonly _isWritable: boolean
  private readonly _isOptional: boolean
  private readonly _checks: Check<NonNullable<T>>[]

  /**
   * Creates a base descriptor.
   * @param copyFrom Another descriptor to copy options from.
   * @param options Options that will override the descriptor copied.
   * @protected
   */
  protected constructor(copyFrom?: AnyData<T, unknown>, options?: AnyDataOptions<T>) {
    this._blankValueFactory = options?.blankValueFactory ?? copyFrom?._blankValueFactory ?? null
    this._isReadable = options?.isReadable ?? copyFrom?._isReadable ?? true
    this._isWritable = options?.isWritable ?? copyFrom?._isWritable ?? true
    this._isOptional = options?.isOptional ?? copyFrom?._isOptional ?? false
    this._checks = options?.checks ?? copyFrom?._checks ?? []
  }

  /**
   * The default "blank" value.
   * @protected
   */
  protected abstract makeDefaultBlankValue(): T

  /**
   * Clones this object and return it as the Self type.
   * @param options Options to pass to the parent constructor.
   * @protected
   */
  protected abstract cloneAsSelf(options: AnyDataOptions<T>): Self

  public makeBlankValue(): T {
    return this._blankValueFactory !== null ? this._blankValueFactory() : this.makeDefaultBlankValue()
  }

  public validate(value: T): ValidationResult {
    let result
    if (value === undefined) {
      if (this._isOptional) {
        result = ValidationResult.valid()
      } else {
        result = ValidationResult.invalid(L.requiredValueMissing)
      }
    } else {
      result = this._checks.reduce((r, c) => r.mergeWith(c.validate(value as NonNullable<T>)), ValidationResult.valid())
    }
    return result
  }

  public get isReadable(): boolean {
    return this._isReadable
  }

  public get isWritable(): boolean {
    return this._isWritable
  }

  public get isOptional(): boolean {
    return this._isOptional
  }

  public abstract makeMapper(): Mapper<T>

  /**
   * Change the "blank" value used when creating new objects. If the value is *mutable* (e.g. if it is an object),
   * consider using the other overload instead.
   * @param value The new value to use.
   */
  public withBlankValue(value: T): Self
  /**
   * Change the "blank" value used when creating new objects.
   * @param factory A function that will create a new value each time it is called.
   */
  public withBlankValue(factory: () => T): Self
  public withBlankValue(factoryOrValue: (() => T) | T): Self {
    let blankValueFactory
    if (factoryOrValue instanceof Function) {
      blankValueFactory = factoryOrValue
    } else {
      blankValueFactory = (): T => factoryOrValue
    }
    return this.cloneAsSelf({ blankValueFactory })
  }

  /**
   * Makes this model read-only (i.e. it will never be sent, only received). This and {@link writeOnly} are mutually
   * exclusive.
   */
  public get readOnly(): Self {
    if (!this._isReadable) console.warn('readOnly modifier used on non-readable field')
    return this.cloneAsSelf({ isWritable: false, isReadable: true })
  }

  /**
   * Makes this model write-only (i.e. it will never be received, only sent). This and {@link readOnly} are mutually
   * exclusive.
   */
  public get writeOnly(): Self {
    if (!this._isWritable) console.warn('writeOnly modifier used on non-writable field')
    return this.cloneAsSelf({ isWritable: true, isReadable: false })
  }

  /**
   * Makes this field optional, i.e. it will not be included in the data received/sent when it is undefined. This can be
   * used alongside {@link AnyValue.nullable} for JSON data.
   */
  public abstract get optional(): AnyData<T | undefined, unknown>

  /**
   * Adds one or more validators to be run on the data before it is sent.
   * @param checks The checks to add to the descriptor.
   */
  public and(...checks: Check<NonNullable<T>>[]): Self {
    return this.cloneAsSelf({ checks: [...this._checks, ...checks] })
  }

  /**
   * Adds an input-output converter to this descriptor. The resulting value type can be anything.
   * @param converter A converter object with both unpack and pack operations.
   */
  public converted<V>(converter: Converter<V, T>): ConvertedData<V, T>
  /**
   * Adds an input converter to this descriptor. The resulting value type must be assignable to the original type.
   * @param converter A converter object with an unpack operation.
   */
  public converted<V extends T>(converter: InputConverter<V, T>): ConvertedData<V, T>
  /**
   * Adds an output converter to this descriptor. The resulting value type must be assignable from the original type.
   * @param converter A converter object with a pack operation.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  public converted<V>(converter: T extends V ? OutputConverter<V, T> : never): ConvertedData<V, T>
  public converted<V>(converter: AnyConverter<V, T>): ConvertedData<V, T> {
    return new ConvertedData(this, resolveConverter(converter), null)
  }

  /**
   * Adds a self-converter to this descriptor.
   * @param cls A constructor that is used to convert the value on input.
   */
  public convertedInto<C extends OutputSelfConverter<T>>(cls: InputSelfConverter<C, T>): ConvertedData<C, T> {
    return new ConvertedData(this, resolveSelfConverter(cls), null)
  }
}
