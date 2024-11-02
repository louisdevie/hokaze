import __dayjs, { Dayjs } from 'dayjs'
import { AnyValue, AnyValueOptions, ValueMapper, ValueDescriptor } from '@hokaze/core'
import { JsonDayjsMapper } from './json'

export interface DayjsValuePublicAPI<N> extends ValueDescriptor<Dayjs | N> {
  withBlankValue(value: Dayjs): DayjsValue<N>
  withBlankValue(factory: () => Dayjs): DayjsValue<N>
  readonly readOnly: DayjsValue<N>
  readonly writeOnly: DayjsValue<N>
  readonly optional: DayjsValue<N | undefined>
  readonly nullable: DayjsValue<N | null>
}

/**
 * Describes a dayjs value serialized in ISO format.
 * @template N Additional values the field can hold.
 */
export class DayjsValue<N> extends AnyValue<Dayjs | N, DayjsValue<N>> implements DayjsValuePublicAPI<N> {
  public constructor(copyFrom?: DayjsValue<N>, options?: AnyValueOptions<N>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): Dayjs | N {
    return __dayjs()
  }

  protected cloneAsSelf(options: AnyValueOptions<N>): DayjsValue<N> {
    return new DayjsValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<Dayjs | N> {
    return new JsonDayjsMapper()
  }

  //region Builder methods

  public override get optional(): DayjsValue<N | undefined> {
    return new DayjsValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): DayjsValue<N | null> {
    return new DayjsValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}
