import { invalid, ValidationResult } from '@module/validation'
import { AnyField, AnyFieldOpts, Checks, explicitBlankValue, SingleCheck } from './any'
import { Locale } from '@module/locale'

/**
 * Options specific to string fields.
 */
interface StringFieldOpts<N> extends AnyFieldOpts<string | N> {
  isEmptyAllowed?: boolean
  maxLength?: number
}

class LengthCheck<N> extends SingleCheck<string | N> {
  private _maxLength: number

  public constructor(otherChecks: Checks<string | N>, maxLength: number) {
    super(otherChecks)
    this._maxLength = maxLength
  }

  protected check(value: string | N): ValidationResult {
    return typeof value === 'string' && value.length > this._maxLength ?
      invalid(Locale.format())
  }
}

/**
 * Describes a field with values of type `string`.
 * @template N The nullability of the field.
 */
export class StringField<N> extends AnyField<string | N, StringField<N>> {
  private readonly _isEmptyAllowed: boolean
  private readonly _maxLength?: number

  public constructor(copyFrom?: StringField<N>, options?: StringFieldOpts<N>) {
    super(copyFrom, options)
    this._isEmptyAllowed = options?.isEmptyAllowed ?? copyFrom?._isEmptyAllowed ?? true
    this._maxLength = options?.maxLength ?? copyFrom?._maxLength
  }

  protected get defaultBlankValue(): string | N {
    return ''
  }

  protected cloneAsSelf(options: StringFieldOpts<N>): StringField<N> {
    return new StringField<N>(this, options)
  }

  //region Builder methods

  /**
   * Disallows empty strings or strings containing only whitespace characters
   */
  public get notEmpty(): StringField<N> {
    return this.cloneAsSelf({ isEmptyAllowed: false })
  }

  /**
   * Sets a maximum length on the contents of the field.
   * @param length The maximum number of characters (as returned by {@link String.length}).
   */
  public maxLength(length: number): StringField<N> {
    return this.cloneAsSelf({ maxLength: length })
  }

  public override get optional(): StringField<N | undefined> {
    return new StringField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): StringField<N | null> {
    return new StringField<N | null>(this, { blankValue: explicitBlankValue(null) })
  }

  //endregion
}
