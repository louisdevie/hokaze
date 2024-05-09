import { AnyField, FieldOpts, explicitBlankValue } from './any'
import { KeyKind } from '@module/fields/index'

interface NumberFieldOpts<N> extends FieldOpts<number | N> {
  integer?: boolean
}

/**
 * Describes a field with values of type `number`.
 * @template N Additional values the field can hold.
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

  public get keyKind(): KeyKind {
    return 'integer'
  }

  protected cloneAsSelf(options: NumberFieldOpts<N>): NumberField<N> {
    return new NumberField<N>(this, options)
  }

  //region Builder methods

  /**
   * Makes this field the ID of the resource as an {@link integer}.
   */
  public get asKey(): NumberField<N> {
    return super.asKey.integer
  }

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
    return new NumberField<N | null>(this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}
