import { AnyField, FieldOpts, explicitBlankValue } from './any'

interface DateFieldOpts<N> extends FieldOpts<Date | N> {}

/**
 * Describes a field with values of type `Date` that appear in the API as ISO strings.
 * @template N Additional values the field can hold.
 */
export class DateField<N> extends AnyField<Date | N, DateField<N>> {
  public constructor(copyFrom?: DateField<N>, options?: DateFieldOpts<N>) {
    super(copyFrom, options)
  }

  protected get defaultBlankValue(): Date | N {
    return new Date()
  }

  protected cloneAsSelf(options: DateFieldOpts<N>): DateField<N> {
    return new DateField<N>(this, options)
  }

  //region Builder methods

  public override get optional(): DateField<N | undefined> {
    return new DateField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): DateField<N | null> {
    return new DateField<N | null>(this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}
