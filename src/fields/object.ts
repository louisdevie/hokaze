import { AnyField, FieldOpts, explicitBlankValue } from './any'
import { Field } from '@module/fields/index'

type ObjectFieldOpts<O, N> = FieldOpts<O | N>

// inverse of ObjectItemType
type Fields<O> = { [p in keyof O]: Field<O[p]> }

/**
 * Describes a field with values that are objects.
 *
 * @template O The type of the object.
 * @template N Additional values the field can hold.
 */
export class ObjectField<O extends object, N> extends AnyField<O | N, ObjectField<O, N>> {
  private readonly _fields: Fields<O>

  public constructor(fields: Fields<O>, copyFrom?: ObjectField<O, N>, options?: ObjectFieldOpts<O, N>) {
    super(copyFrom, options)

    this._fields = fields
  }

  protected get defaultBlankValue(): O | N {
    let object: any = {}
    for (const property in this._fields) {
      object[property] = this._fields[property].blankValue
    }
    return object
  }

  protected cloneAsSelf(options: ObjectFieldOpts<O, N>): ObjectField<O, N> {
    return new ObjectField<O, N>(this._fields, this, options)
  }

  //region Builder methods

  public override get optional(): ObjectField<O, N | undefined> {
    return new ObjectField<O, N | undefined>(this._fields, this, { isOptional: true })
  }

  public override get nullable(): ObjectField<O, N | null> {
    return new ObjectField<O, N | null>(this._fields, this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}

type ObjectDescriptor = Record<string, Field<unknown>>

// inverse of Fields
type ObjectItemType<Descriptor extends ObjectDescriptor> = {
  [Property in keyof Descriptor]: Descriptor[Property] extends Field<infer T> ? T : any
}

/**
 * Describes a field that takes objects as values. If the object is another resource, consider using `ref` instead.
 * @param objectDescriptor A description of the object. For each property, the value must be a descriptor.
 *
 * @example
 * const posField = object({x: number, y: number})
 */
export function objectFieldFactory<Descriptor extends ObjectDescriptor>(
  objectDescriptor: Descriptor,
): ObjectField<ObjectItemType<Descriptor>, never> {
  // I think the compiler can't understand the round-trip (Fields<ObjectItemType<T>> is actually T)
  // because of the "infer T", so it just has to trust me
  return new ObjectField<ObjectItemType<Descriptor>, never>(objectDescriptor as any)
}
