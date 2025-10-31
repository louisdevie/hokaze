import { ValueMapper } from '../../mappers/json'
import { AnyValue, AnyValueOptions } from './base'
import { JsonBooleanMapper } from '@module/mappers/json'

/**
 * Describes a serialized boolean value.
 * @template N Additional values the field can hold (e.g. undefined or null).
 */
export class BooleanValue<N> extends AnyValue<boolean | N, BooleanValue<N>> {
  public constructor(copyFrom?: BooleanValue<N>, options?: AnyValueOptions<N>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): boolean | N {
    return false
  }

  protected cloneAsSelf(options: AnyValueOptions<N>): BooleanValue<N> {
    return new BooleanValue<N>(this, options)
  }

  public makeMapper(): ValueMapper<boolean | N> {
    return new JsonBooleanMapper()
  }

  public override get optional(): BooleanValue<N | undefined> {
    return new BooleanValue<N | undefined>(this, { isOptional: true })
  }

  public override get nullable(): BooleanValue<N | null> {
    return new BooleanValue<N | null>(this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }
}
