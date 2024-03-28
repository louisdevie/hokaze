import { AnyField, FieldOpts, explicitBlankValue } from './any'

interface NumberFieldOpts<N> extends FieldOpts<number | N> {
  integer?: boolean
}

/**
 * Describes a field with values of type `number`.
 * @template N The nullability of the field.
 */
export class NumberField<N> extends AnyField<number | N, NumberField<N>> {
  private readonly _integer: boolean

  public constructor(copyFrom?: NumberField<N>, options?: NumberFieldOpts<N>) {
    super(copyFrom, options)

    this._integer = options?.integer ?? copyFrom?._integer ?? false
  }

  protected get defaultBlankValue(): number | N {
    return 0
  }

  protected cloneAsSelf(options: NumberFieldOpts<N>): NumberField<N> {
    return new NumberField<N>(this, options)
  }

  //region Builder methods

  /**
   * Always floor the number to the nearest integer before sending it.
   */
  public get integer(): NumberField<N> {
    if (this._integer) console.warn('integer modifier used twice on the same field')
    return this.cloneAsSelf({ integer: true })
  }

  public override get optional(): NumberField<N | undefined> {
    return new NumberField<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): NumberField<N | null> {
    return new NumberField<N | null>(this, { blankValue: explicitBlankValue(null) })
  }

  //endregion
}
