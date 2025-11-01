import type {CheckCollection, DataDescriptor} from '.'
import {Check} from "~/abstractions/validation";
import {Mapper} from "~/abstractions/mappers";
import {
  AnyConverter,
  Converter,
  InputConverter,
  InputSelfConverter,
  OutputConverter,
  OutputSelfConverter
} from "~/converters";
import {ConvertedData} from "./converted";
import {resolveConverter, resolveSelfConverter} from "~/converters/factory";

/**
 * Options shared by all descriptors.
 */
export interface AnyDataOptions<T> {
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
    this._isReadable = options?.isReadable ?? copyFrom?._isReadable ?? true
    this._isWritable = options?.isWritable ?? copyFrom?._isWritable ?? true
    this._isOptional = options?.isOptional ?? copyFrom?._isOptional ?? false
    this._checks = options?.checks ?? copyFrom?._checks ?? []
  }

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
    return freezeArray(this._checks)
  }

  public abstract createMapper(): Mapper<T>

  /**
   * Makes this model read-only (i.e. it will never be sent, only received).
   * This and {@link writeOnly} are mutually exclusive.
   */
  public get readOnly(): Self {
    if (!this._isReadable) console.warn('readOnly modifier used on non-readable field')
    return this.cloneAsSelf({isWritable: false, isReadable: true})
  }

  /**
   * Makes this model write-only (i.e. it will never be received, only sent).
   * This and {@link readOnly} are mutually exclusive.
   */
  public get writeOnly(): Self {
    if (!this._isWritable) console.warn('writeOnly modifier used on non-writable field')
    return this.cloneAsSelf({isWritable: true, isReadable: false})
  }

  /**
   * Makes this model optional, i.e. it will not be included in the data received/sent when it is `undefined`.
   * This can be used alongside {@link AnyValue.nullable} for JSON data.
   */
  public get optional(): Self {
    return this.cloneAsSelf({isOptional: true})
  }

  /**
   * Adds one or more validators to restrict what values are allowed.
   * @param checks The checks to add to the descriptor.
   */
  public check(...checks: Check<NonNullable<T>>[]): Self {
    return this.cloneAsSelf({checks: [...this._checks, ...checks]})
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

export function freezeArray<T>(array: T[]): Iterable<T> {
  return {
    [Symbol.iterator]: array[Symbol.iterator].bind(array)
  }
}