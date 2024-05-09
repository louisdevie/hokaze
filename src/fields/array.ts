import { AnyField, FieldOpts, explicitBlankValue } from './any'
import { Field } from '.'

type ArrayFieldOpts<E, N> = FieldOpts<E[] | N>

/**
 * Describes a field with values of type `Array`.
 *
 * @template E The type of the elements in the array.
 * @template N Additional values the field can hold.
 */
export class ArrayField<E, N> extends AnyField<E[] | N, ArrayField<E, N>> {
  private readonly _element: Field<E>

  public constructor(element: Field<E>, copyFrom?: ArrayField<E, N>, options?: ArrayFieldOpts<E, N>) {
    super(copyFrom, options)

    this._element = element
  }

  protected get defaultBlankValue(): E[] | N {
    return []
  }

  protected cloneAsSelf(options: ArrayFieldOpts<E, N>): ArrayField<E, N> {
    return new ArrayField<E, N>(this._element, this, options)
  }

  //region Builder methods

  public override get optional(): ArrayField<E, N | undefined> {
    return new ArrayField<E, N | undefined>(this._element, this, { isOptional: true })
  }

  public override get nullable(): ArrayField<E, N | null> {
    return new ArrayField<E, N | null>(this._element, this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}

type ArrayElementType<ElementDescriptor> = ElementDescriptor extends Field<infer T> ? T : any

/**
 * Describes an array field.
 * @param elements A descriptor of the type of elements in the array.
 */
export function arrayFieldFactory<ElementDescriptor>(
  elements: ElementDescriptor,
): ArrayField<ArrayElementType<ElementDescriptor>, never> {
  // same as in objectFieldFactory, we need to cast to any
  return new ArrayField<ArrayElementType<ElementDescriptor>, never>(elements as any)
}
