import { AnyValue, AnyValueOptions } from '@module/data/serialized/base'
import { ValueDescriptor } from '@module/data/serialized/index'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonArrayMapper } from '@module/mappers/serialized/json'
import { ValidationResult } from '@module/validation'

/**
 * Describes a serialized array of values.
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

  public validate(value: E[]): ValidationResult {
    let result = super.validate(value)
    if (result.isValid && Array.isArray(value)) {
      value.forEach((elt, i) => (result = result.mergeWithItem(i, this._element.validate(elt))))
    }
    return result
  }

  //region Builder methods

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

  //endregion
}

type ArrayElementType<ElementDescriptor> = ElementDescriptor extends ValueDescriptor<infer T> ? T : never

/**
 * Describes a JSON array.
 * @param elements A descriptor of the type of elements in the array.
 */
export function jsonArrayFactory<ElementDescriptor extends ValueDescriptor<unknown>>(
  elements: ElementDescriptor,
): ArrayValue<ArrayElementType<ElementDescriptor>, never> {
  // same as in objectFieldFactory, we need to cast
  return new ArrayValue<ArrayElementType<ElementDescriptor>, never>(
    elements as ValueDescriptor<ArrayElementType<ElementDescriptor>>,
  )
}
