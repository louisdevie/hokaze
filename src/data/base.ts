import { DataDescriptor } from '.'
import { ValidationResult } from '@module/validation'
import { Checks, NoChecks } from '@module/checks'
import { Mapper } from '@module/mappers'
import __ from '@module/locale'

/**
 * Options shared by all descriptors.
 */
export interface AnyDataOptions<T> {
  blankValueFactory?: () => T
  isReadable?: boolean
  isWritable?: boolean
  isOptional?: boolean
  checks?: Checks<T>
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
  private readonly _checks: Checks<T>

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
    this._checks = options?.checks ?? copyFrom?._checks ?? new NoChecks()
  }

  /**
   * The default "blank" value.
   * @protected
   */
  protected abstract makeDefaultBlankValue(): T

  /**
   * The checks currently applied.
   * @protected
   */
  protected get currentChecks(): Checks<T> {
    return this._checks
  }

  /**
   * Clones this object and return it as the Self type.
   * @param options Options to pass to the parent constructor.
   * @protected
   */
  protected abstract cloneAsSelf(options: AnyDataOptions<T>): Self

  //region Field<T> implementation

  public makeBlankValue(): T {
    return this._blankValueFactory !== null ? this._blankValueFactory() : this.makeDefaultBlankValue()
  }

  public validate(value: T): ValidationResult {
    let result
    if (value === undefined) {
      if (this._isOptional) {
        result = ValidationResult.valid()
      } else {
        result = ValidationResult.invalid(__.missingValue)
      }
    } else {
      result = this._checks.validate(value)
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

  //endregion

  //region Builder methods

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

  //endregion
}
