import { AnyValue, AnyValueOptions } from './base'
import { KeyKind } from '@module/data/serialized/index'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonNumberMapper } from '@module/mappers/serialized/json'

interface NumberValueOpts<N> extends AnyValueOptions<number | N> {
  integer?: boolean
}

/**
 * Describes a serialized numeric value.
 * @template N Additional values the field can hold (e.g. undefined or null).
 */
export class NumberValue<N> extends AnyValue<number | N, NumberValue<N>> {
  private readonly _integer: boolean

  public constructor(copyFrom?: NumberValue<N>, options?: NumberValueOpts<N>) {
    super(copyFrom, options)

    this._integer = options?.integer ?? copyFrom?._integer ?? false
  }

  protected makeDefaultBlankValue(): number | N {
    return 0
  }

  public get keyKind(): KeyKind {
    return 'integer'
  }

  protected cloneAsSelf(options: NumberValueOpts<N>): NumberValue<N> {
    return new NumberValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<number | N> {
    return new JsonNumberMapper(this._integer)
  }

  //region Builder methods

  /**
   * Makes this field the ID of the resource as an {@link integer}.
   */
  public get asKey(): NumberValue<N> {
    return super.asKey.integer
  }

  /**
   * Always floor the number to the nearest integer before sending it.
   */
  public get integer(): NumberValue<N> {
    if (this._integer) console.warn('integer modifier used twice on the same field')
    return this.cloneAsSelf({ integer: true })
  }

  public override get optional(): NumberValue<N | undefined> {
    return new NumberValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): NumberValue<N | null> {
    return new NumberValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}
