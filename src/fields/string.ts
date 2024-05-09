import { AnyField, FieldOpts, explicitBlankValue } from './any'
import { MaximumLengthCheck } from '@module/fields/checks/string/maximumLength'
import { NotEmptyCheck } from '@module/fields/checks/string/notEmpty'
import { KeyKind } from '@module/fields/index'

type StringFieldOpts<N> = FieldOpts<string | N>

/**
 * Describes a field with values of type `string`.
 * @template N Additional values the field can hold.
 */
export class StringField<N> extends AnyField<string | N, StringField<N>> {
  public constructor(copyFrom?: StringField<N>, options?: StringFieldOpts<N>) {
    super(copyFrom, options)
  }

  protected get defaultBlankValue(): string | N {
    return ''
  }

  public get keyKind(): KeyKind {
    return 'literal'
  }

  protected cloneAsSelf(options: StringFieldOpts<N>): StringField<N> {
    return new StringField<N>(this, options)
  }

  //region Builder methods

  /**
   * Disallows empty strings or strings containing only whitespace characters
   */
  public get notEmpty(): StringField<N> {
    return this.cloneAsSelf({ checks: new NotEmptyCheck(this.currentChecks) })
  }

  /**
   * Sets a maximum length on the contents of the field.
   * @param length The maximum number of characters (as returned by {@link String.length}).
   */
  public maxLength(length: number): StringField<N> {
    return this.cloneAsSelf({ checks: new MaximumLengthCheck(this.currentChecks, length) })
  }

  public override get optional(): StringField<N | undefined> {
    return new StringField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): StringField<N | null> {
    return new StringField<N | null>(this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}
