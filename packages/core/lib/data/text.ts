import { AnyData, AnyDataOptions } from './base'
import { Mapper } from '~/mappers'
import { TextMapper } from '~/mappers/text'

/**
 * Describes a string value transferred as-is.
 * @template N Additional values the field can hold.
 */
export class TextData<N> extends AnyData<string | N, TextData<N>> {
  public constructor(copyFrom?: TextData<N>, options?: AnyDataOptions<N>) {
    super(copyFrom, options)
  }

  protected createDefaultBlankValue(): string | N {
    return ''
  }

  protected cloneAsSelf(options: AnyDataOptions<N>): TextData<N> {
    return new TextData<N>(this, options)
  }

  public createMapper(): Mapper<string | N> {
    return new TextMapper()
  }

  public override get optional(): TextData<N | undefined> {
    return new TextData<N | undefined>(this, { isOptional: true })
  }
}

/**
 * Describes a string value transferred as-is.
 */
export const text: TextData<never> = new TextData<never>()
