import { Field, FieldRoleHints } from '.'
import { Infer, Likelihood } from '../inference'
import { valid, ValidationResult } from '../validation'

/**
 * Options shared by all fields.
 * @internal
 */
export interface AnyFieldOpts<T> {
  blankValue?: BlankValue<T>
  isReadable?: boolean
  isWritable?: boolean
  useAsId?: boolean
  isOptional?: boolean
  checks?: Checks<T>
}

type BlankValue<T> = { variant: 'unspecified' } | { variant: 'explicit'; value: T }

export function explicitBlankValue<T>(value: T): BlankValue<T> {
  return { variant: 'explicit', value }
}

export interface Checks<T> {
  validate(value: T): ValidationResult
}

class NoChecks implements Checks<any> {
  validate(value: any): ValidationResult {
    return valid()
  }
}

export abstract class SingleCheck<T> implements Checks<T> {
  private _otherChecks: Checks<T>

  public constructor(otherChecks: Checks<T>) {
    this._otherChecks = otherChecks
  }

  public validate(value: T): ValidationResult {
    let thisCheckResult = this.check(value)
    return !thisCheckResult.isValid ? thisCheckResult : this._otherChecks.validate(value)
  }

  protected abstract check(value: T): ValidationResult
}

/**
 * A base class containing the options shared by all field types.
 * @template T The type of field.
 * @template Self The concrete type of the class extending this.
 */
export abstract class AnyField<T, Self> implements Field<T> {
  private readonly _blankValue: BlankValue<T>
  private readonly _isReadable: boolean
  private readonly _isWritable: boolean
  private readonly _isOptional: boolean
  private readonly _useAsId: boolean
  private _checks: Checks<T>

  /**
   * Creates a base field descriptor.
   * @param copyFrom Another descriptor to copy options from.
   * @param options Options that will override the descriptor copied.
   * @protected
   */
  protected constructor(copyFrom?: AnyField<T, unknown>, options?: AnyFieldOpts<T>) {
    this._blankValue = options?.blankValue ?? copyFrom?._blankValue ?? { variant: 'unspecified' }
    this._isReadable = options?.isReadable ?? copyFrom?._isReadable ?? true
    this._isWritable = options?.isWritable ?? copyFrom?._isWritable ?? true
    this._isOptional = options?.isOptional ?? copyFrom?._isOptional ?? false
    this._useAsId = options?.useAsId ?? copyFrom?._useAsId ?? false
    this._checks = options?.checks ?? copyFrom?._checks ?? new NoChecks()
  }

  /**
   * The default "blank" value.
   * @protected
   */
  protected abstract get defaultBlankValue(): T

  /**
   * Clones this object and return it as the Self type.
   * @param options Options to pass to the parent constructor.
   * @protected
   */
  protected abstract cloneAsSelf(options: AnyFieldOpts<T>): Self

  //region Field<T> implementation

  public get blankValue(): T {
    return this._blankValue.variant === 'explicit' ? this._blankValue.value : this.defaultBlankValue
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

  public isTheId(hints: FieldRoleHints): Likelihood {
    return this._useAsId ? { explicit: true } : Infer.isImplicitId(hints)
  }

  public validate(value: T): ValidationResult {
    return this._checks.validate(value)
  }

  //endregion

  //region Builder methods

  /**
   * Change the "blank" value used when creating new objects.
   * @param value The new value to use.
   */
  public withBlankValue(value: T): Self {
    if (this._blankValue.variant !== 'unspecified')
      console?.warn('withBlankValue modifier used twice on the same field')
    return this.cloneAsSelf({ blankValue: explicitBlankValue(value) })
  }

  /**
   * Makes this field read-only (i.e. it will never be sent, only received).
   */
  public get readOnly(): Self {
    if (!this._isReadable) console?.warn('readOnly modifier used on non-readable field')
    return this.cloneAsSelf({ isWritable: false, isReadable: true })
  }

  /**
   * Makes this field write-only (i.e. it will never be received, only sent).
   */
  public get writeOnly(): Self {
    if (!this._isWritable) console?.warn('writeOnly modifier used on non-writable field')
    return this.cloneAsSelf({ isWritable: true, isReadable: false })
  }

  /**
   * Makes this field the ID of the resource.
   */
  public get asId(): Self {
    if (this._useAsId) console?.warn('useAsId modifier used twice on the same field')
    return this.cloneAsSelf({ useAsId: true })
  }

  /**
   * Makes this field optional. While a *nullable* field is always received/sent with an explicit value,
   * *optional* means that it will not be included in the data received/sent when it is undefined.
   */
  public abstract get optional(): AnyField<T | undefined, unknown>

  /**
   * Makes this field Nullable. While an *optional* field is not included in the data received/sent when
   * it is undefined, *nullable* means it is always received and sent with an explicit value.
   */
  public abstract get nullable(): AnyField<T | null, unknown>

  //endregion
}
