import { AnyField, FieldOpts, explicitBlankValue } from './any'

type BooleanFieldOpts<N> = FieldOpts<boolean | N>

/**
 * Describes a field with values of type `boolean`.
 * @template N Additional values the field can hold.
 */
export class BooleanField<N> extends AnyField<boolean | N, BooleanField<N>> {
  public constructor(copyFrom?: BooleanField<N>, options?: BooleanFieldOpts<N>) {
    super(copyFrom, options)
  }

  protected get defaultBlankValue(): boolean | N {
    return false
  }

  protected cloneAsSelf(options: BooleanFieldOpts<N>): BooleanField<N> {
    return new BooleanField<N>(this, options)
  }

  //region Builder methods

  public override get optional(): BooleanField<N | undefined> {
    return new BooleanField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): BooleanField<N | null> {
    return new BooleanField<N | null>(this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}
