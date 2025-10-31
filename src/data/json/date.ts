import { ValueMapper } from '../../mappers/json'
import { AnyValue, AnyValueOptions } from '@module/data/json/base'
import { JsonDateMapper } from '@module/mappers/json/date'

export type DateFormat = 'iso'

interface DateValueOptions<N> extends AnyValueOptions<Date | N> {
  format?: DateFormat
}

/**
 * Describes a date value.
 * @template N Additional values the field can hold.
 */
export class DateValue<N> extends AnyValue<Date | N, DateValue<N>> {
  private readonly _format: DateFormat

  public constructor(copyFrom?: DateValue<N>, options?: DateValueOptions<N>) {
    super(copyFrom, options)

    this._format = options?.format ?? copyFrom?._format ?? 'iso'
  }

  protected makeDefaultBlankValue(): Date | N {
    return new Date()
  }

  protected cloneAsSelf(options: AnyValueOptions<N>): DateValue<N> {
    return new DateValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<Date | N> {
    return new JsonDateMapper(this._format)
  }

  public override get optional(): DateValue<N | undefined> {
    return new DateValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): DateValue<N | null> {
    return new DateValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }
}
