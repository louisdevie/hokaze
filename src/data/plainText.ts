import { MaximumLengthCheck } from '@module/checks/string/maximumLength'
import { NotEmptyCheck } from '@module/checks/string/notEmpty'
import { AnyData, AnyDataOptions } from '@module/data/base'
import { Mapper } from '@module/mappers'
import { PlainTextMapper } from '@module/mappers/plainText'

/**
 * Describes a field with values of type `string`.
 * @template N Additional values the field can hold.
 */
export class PlainText<N> extends AnyData<string | N, PlainText<N>> {
  public constructor(copyFrom?: PlainText<N>, options?: AnyDataOptions<N>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): string | N {
    return ''
  }

  protected cloneAsSelf(options: AnyDataOptions<N>): PlainText<N> {
    return new PlainText<N>(this, options)
  }

  public makeMapper(): Mapper<string | N> {
    return new PlainTextMapper()
  }

  //region Builder methods

  /**
   * Disallows empty strings or strings containing only whitespace characters
   */
  public get notEmpty(): PlainText<N> {
    return this.cloneAsSelf({ checks: new NotEmptyCheck(this.currentChecks) })
  }

  /**
   * Sets a maximum length on the contents of the field.
   * @param length The maximum number of characters (as returned by {@link String.length}).
   */
  public maxLength(length: number): PlainText<N> {
    return this.cloneAsSelf({
      checks: new MaximumLengthCheck(this.currentChecks, length),
    })
  }

  public override get optional(): PlainText<N | undefined> {
    return new PlainText<N | undefined>(this, { isOptional: true })
  }

  //endregion
}

/**
 * Describes a string value transferred as-is.
 */
export const plainText: PlainText<never> = new PlainText<never>()
