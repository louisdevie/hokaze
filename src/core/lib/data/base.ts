import type { DataDescriptor } from '.'
import { applyConverter, ConvertedData } from './converted'
import { Converter, InputConverter, OutputConverter, PartialConverter } from '~/converters'
import { Log } from '~/logging'
import { Mapper } from '~/mappers'
import { Check, CheckCollection } from '~/validation'

/**
 * Options shared by all descriptors.
 */
export interface AnyDataOptions<T> {
  isReadable?: boolean
  isWritable?: boolean
  isOptional?: boolean
  checks?: Check<NonNullable<T>>[]
  blankValueFactory?: () => T
}

/**
 * Immutable implementation of {@link CheckCollection}.
 * @internal
 */
export class AnyDataChecks<T> implements CheckCollection<T> {
  private readonly _values: Check<T>[]

  public constructor(values: Check<T>[]) {
    this._values = values
  }

  public static wrap<T>(array: Check<T>[] | null | undefined): AnyDataChecks<T> | undefined {
    return array ? new AnyDataChecks<T>(array) : undefined
  }

  public [Symbol.iterator](): Iterator<Check<T>> {
    return this._values[Symbol.iterator]()
  }

  public map<U>(callback: (check: Check<T>) => U): U[] {
    throw this._values.map((c) => callback(c))
  }
}

/**
 * A base class containing the options shared by all descriptors.
 * @template T The corresponding JavaScript type.
 * @template Self The concrete type of the class extending this.
 */
export abstract class AnyData<T, Self> implements DataDescriptor<T> {
  private readonly _isReadable: boolean
  private readonly _isWritable: boolean
  private readonly _isOptional: boolean
  private readonly _checks: AnyDataChecks<NonNullable<T>>
  private readonly _blankValueFactory: (() => T) | null

  /**
   * Creates a base descriptor.
   * @param copyFrom Another descriptor to copy options from.
   * @param options Options that will override the descriptor copied.
   */
  protected constructor(copyFrom?: AnyData<T, unknown>, options?: AnyDataOptions<T>) {
    this._isReadable = options?.isReadable ?? copyFrom?._isReadable ?? true
    this._isWritable = options?.isWritable ?? copyFrom?._isWritable ?? true
    this._isOptional = options?.isOptional ?? copyFrom?._isOptional ?? false
    this._checks = AnyDataChecks.wrap(options?.checks) ?? copyFrom?._checks ?? new AnyDataChecks([])
    this._blankValueFactory = options?.blankValueFactory ?? copyFrom?._blankValueFactory ?? null
  }

  /**
   * The default factory for "blank values".
   */
  protected abstract createDefaultBlankValue(): T

  /**
   * Clones this object and return it as the Self type.
   * @param options Options to pass to the parent constructor.
   * @protected
   */
  protected abstract cloneAsSelf(options: AnyDataOptions<T>): Self

  public get isReadable(): boolean {
    return this._isReadable
  }

  public get isWritable(): boolean {
    return this._isWritable
  }

  public get isOptional(): boolean {
    return this._isOptional
  }

  public get checks(): CheckCollection<T> {
    return this._checks
  }

  public createBlankValue(): T {
    return this._blankValueFactory !== null ? this._blankValueFactory() : this.createDefaultBlankValue()
  }

  public abstract createMapper(): Mapper<T>

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
   * Makes this model read-only (i.e. it will never be sent, only received).
   * This and {@link writeOnly} are mutually exclusive.
   */
  public get readOnly(): Self {
    if (!this._isReadable) Log.warn('readOnly modifier used on non-readable field')
    return this.cloneAsSelf({ isWritable: false, isReadable: true })
  }

  /**
   * Makes this model write-only (i.e. it will never be received, only sent).
   * This and {@link readOnly} are mutually exclusive.
   */
  public get writeOnly(): Self {
    if (!this._isWritable) Log.warn('writeOnly modifier used on non-writable field')
    return this.cloneAsSelf({ isWritable: true, isReadable: false })
  }

  /**
   * Makes this model optional, i.e. it will not be included in the data received/sent when it is `undefined`.
   * This can be used alongside {@link AnyValue.nullable} for JSON data.
   */
  public abstract get optional(): AnyData<T | undefined, unknown>

  /**
   * Adds one or more validators.
   * @param checks The validators to add to the descriptor.
   */
  public check(...checks: Check<NonNullable<T>>[]): Self {
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
  public converted<V>(converter: T extends V ? OutputConverter<V, T> : never): ConvertedData<V, T>
  public converted<V>(converter: PartialConverter<V, T>): ConvertedData<V, T> {
    return new ConvertedData(applyConverter(this, converter))
  }

  // /**
  //  * Adds a self-converter to this descriptor.
  //  * @param cls A constructor that is used to convert the value on input.
  //  */
  // public convertedInto<C extends Object>(cls: SelfConverter<C, T>): ConvertedData<C, T> {
  //   return new ConvertedData(this, resolveSelfConverter(cls), null)
  // }
}
