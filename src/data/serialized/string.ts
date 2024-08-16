import { AnyValue, AnyValueOptions } from './base'
import { MaximumLengthCheck, NotEmptyCheck } from '@module/checks/string'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonStringMapper } from '@module/mappers/serialized/json'
import { KeyKind } from '@module/data/serialized/index'

/**
 * Describes a serialized string value.
 * @template N Additional values the field can hold (e.g. undefined or null).
 */
export class StringValue<N> extends AnyValue<string | N, StringValue<N>> {
  public constructor(copyFrom?: StringValue<N>, options?: AnyValueOptions<N>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): string | N {
    return ''
  }

  public get keyKind(): KeyKind {
    return 'literal'
  }

  protected cloneAsSelf(options: AnyValueOptions<N>): StringValue<N> {
    return new StringValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<string | N> {
    return new JsonStringMapper()
  }

  //region Builder methods

  /**
   * Disallows empty strings or strings containing only whitespace characters
   */
  public get notEmpty(): StringValue<N> {
    return this.cloneAsSelf({ checks: new NotEmptyCheck(this.currentChecks) })
  }

  /**
   * Sets a maximum length on the contents of the field.
   * @param length The maximum number of characters (as returned by {@link String.length}).
   */
  public maxLength(length: number): StringValue<N> {
    return this.cloneAsSelf({
      checks: new MaximumLengthCheck(this.currentChecks, length),
    })
  }

  public override get optional(): StringValue<N | undefined> {
    return new StringValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): StringValue<N | null> {
    return new StringValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}
