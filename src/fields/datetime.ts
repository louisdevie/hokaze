import { AnyField, FieldOpts, explicitBlankValue } from './any'

interface DatetimeFieldOpts<N> extends FieldOpts<number | N> {
  integer?: boolean
}

/**
 * Describes a field with values of type `number`.
 * @template N The nullability of the field.
 */
export class DatetimeField<N> extends AnyField<number | N, DatetimeField<N>> {
  private readonly _integer: boolean

  public constructor(copyFrom?: DatetimeField<N>, options?: DatetimeFieldOpts<N>) {
    super(copyFrom, options)

    this._integer = options?.integer ?? copyFrom?._integer ?? false
  }

  protected get defaultBlankValue(): number | N {
    return 0
  }

  protected cloneAsSelf(options: DatetimeFieldOpts<N>): DatetimeField<N> {
    return new DatetimeField<N>(this, options)
  }

  //region Builder methods

  /**
   * Always floor the number to the nearest integer before sending it.
   */
  public get integer(): DatetimeField<N> {
    if (this._integer) console.warn('integer modifier used twice on the same field')
    return this.cloneAsSelf({ integer: true })
  }

  public override get optional(): DatetimeField<N | undefined> {
    return new DatetimeField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): DatetimeField<N | null> {
    return new DatetimeField<N | null>(this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}
