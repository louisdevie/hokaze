import { AnyValue, AnyValueOptions } from '@module/data/serialized/base'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonIsoDateMapper } from '@module/mappers/serialized/json'

/**
 * Describes date value serialized in ISO format.
 * @template N Additional values the field can hold.
 */
export class IsoDateValue<N> extends AnyValue<Date | N, IsoDateValue<N>> {
  public constructor(copyFrom?: IsoDateValue<N>, options?: AnyValueOptions<N>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): Date | N {
    return new Date()
  }

  protected cloneAsSelf(options: AnyValueOptions<N>): IsoDateValue<N> {
    return new IsoDateValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<Date | N> {
    return new JsonIsoDateMapper()
  }

  //region Builder methods

  public override get optional(): IsoDateValue<N | undefined> {
    return new IsoDateValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): IsoDateValue<N | null> {
    return new IsoDateValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}
