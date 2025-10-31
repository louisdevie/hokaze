import { ValueMapper } from '../../mappers/json'
import { AnyValue, AnyValueOptions } from './base'
import { KeyKind } from '@module/data/json/index'
import { JsonStringMapper } from '@module/mappers/json'

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
