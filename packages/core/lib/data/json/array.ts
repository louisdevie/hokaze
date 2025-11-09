import { ValueMapper } from '../../mappers/json'
import { AnyValue, AnyValueOptions } from '@module/data/json/base'
import { ValueDescriptor } from '@module/data/json/index'
import { JsonArrayMapper } from '@module/mappers/json'
import { ValidationResult } from '@module/validation'

/**
 * Describes a JSON array.
 *
 * @template E The type of the elements in the array.
 * @template N Additional values the field can hold.
 */
export class ArrayValue<E, N> extends AnyValue<E[] | N, ArrayValue<E, N>> {
  private readonly _element: ValueDescriptor<E>

  public constructor(element: ValueDescriptor<E>, copyFrom?: ArrayValue<E, N>, options?: AnyValueOptions<E[] | N>) {
    super(copyFrom, options)

    this._element = element
  }

  protected makeDefaultBlankValue(): E[] | N {
    return []
  }

  protected cloneAsSelf(options: AnyValueOptions<E[] | N>): ArrayValue<E, N> {
    return new ArrayValue<E, N>(this._element, this, options)
  }

  public makeMapper(): ValueMapper<E[] | N> {
    return new JsonArrayMapper(this._element.makeMapper())
  }

  public validate(value: E[] | N): ValidationResult {
    let result = super.validate(value)
    if (Array.isArray(value)) {
      value.forEach((elt, i) => (result = result.mergeWithItem(i, this._element.validate(elt))))
    }
    return result
  }

  public override get optional(): ArrayValue<E, N | undefined> {
    return new ArrayValue<E, N | undefined>(this._element, this, {
      isOptional: true,
    })
  }

  public override get nullable(): ArrayValue<E, N | null> {
    return new ArrayValue<E, N | null>(this._element, this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }
}

export type ArrayElementType<ElementDescriptor> = ElementDescriptor extends ValueDescriptor<infer T> ? T : never
