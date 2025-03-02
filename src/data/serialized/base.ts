import { AnyData, AnyDataOptions } from '@module/data/base'
import { FieldRoleHints, KeyKind, ValueDescriptor } from '@module/data/serialized/index'
import { isImplicitId, Likelihood } from '@module/inference'
import L from '@module/locale'
import { ValueMapper } from '@module/mappers/serialized'
import { ValidationResult } from '@module/validation'

/**
 * Options shared by all descriptors.
 */
export interface AnyValueOptions<T> extends AnyDataOptions<T> {
  useAsKey?: boolean
  isNullable?: boolean
}

/**
 * A base class for all descriptors of serialized data.
 * @template T The corresponding JavaScript type.
 * @template Self The concrete type of the class extending this.
 */
export abstract class AnyValue<T, Self> extends AnyData<T, Self> implements ValueDescriptor<T> {
  private readonly _isNullable: boolean
  private readonly _useAsKey: boolean

  /**
   * Creates a base serialized descriptor.
   * @param copyFrom Another descriptor to copy options from.
   * @param options Options that will override the descriptor copied.
   * @protected
   */
  protected constructor(copyFrom?: AnyValue<T, unknown>, options?: AnyValueOptions<T>) {
    super(copyFrom, options)
    this._isNullable = options?.isNullable ?? copyFrom?._isNullable ?? false
    this._useAsKey = options?.useAsKey ?? copyFrom?._useAsKey ?? false
  }

  //region Field<T> implementation

  /**
   * Indicates whether that field allows null as a value.
   */
  public get isNullable(): boolean {
    return this._isNullable
  }

  public get keyKind(): KeyKind | null {
    return null
  }

  public isKey(hints: FieldRoleHints): Likelihood {
    let likelihood
    if (this._useAsKey) {
      likelihood = Likelihood.explicit()
    } else if (this.keyKind == null) {
      likelihood = Likelihood.implicit(0)
    } else {
      likelihood = isImplicitId(hints)
    }
    return likelihood
  }

  public abstract makeMapper(): ValueMapper<T>

  public validate(value: T): ValidationResult {
    let result
    if (value === null) {
      if (this._isNullable) {
        result = ValidationResult.valid()
      } else {
        result = ValidationResult.invalid(L.requiredValueMissing)
      }
    } else {
      result = super.validate(value)
    }
    return result
  }

  protected abstract cloneAsSelf(options: AnyValueOptions<T>): Self

  //endregion

  //region Builder methods

  /**
   * When used on the field of a resource descriptor, it makes this field the ID of the resource. Otherwise, it doesn't
   * do anything.
   */
  public get asKey(): Self {
    if (this._useAsKey) console.warn('asKey modifier used twice on the same field')
    return this.cloneAsSelf({ useAsKey: true })
  }

  /**
   * Makes this field nullable and sets the blank value to null. This can be used alongside {@link AnyData.optional}.
   */
  public abstract get nullable(): AnyValue<T | null, unknown>

  //endregion
}
