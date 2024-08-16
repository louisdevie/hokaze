import { AnyValue, AnyValueOptions } from './base'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { JsonObjectMapper } from '@module/mappers/serialized/json/object'
import { KeyKind, ValueDescriptor } from '@module/data/serialized/index'
import { Likelihood } from '@module/inference'
import { throwError } from '@module/errors'
import __ from '@module/locale/gen'

// inverse of ObjectType
type Fields<O> = [keyof O & string, ValueDescriptor<O[keyof O & string]>][]

export interface ObjectDescriptor<T> extends ValueDescriptor<T> {
  makeMapper(): ObjectMapper<T>

  findKey(resourceName: string): { property: string; kind: KeyKind }
}

/**
 * Describes a field with values that are objects.
 *
 * @template O The type of the object.
 * @template N Additional values the field can hold.
 */
export class ObjectValue<O extends Record<string, unknown>, N>
  extends AnyValue<O | N, ObjectValue<O, N>>
  implements ObjectDescriptor<O | N>
{
  private readonly _fields: Fields<O>

  public constructor(fields: Fields<O>, copyFrom?: ObjectValue<O, N>, options?: AnyValueOptions<O | N>) {
    super(copyFrom, options)

    this._fields = fields
  }

  protected makeDefaultBlankValue(): O | N {
    const object: Partial<O> = {}
    for (const [property, descriptor] of this._fields) {
      object[property] = descriptor.makeBlankValue()
    }
    return object as O
  }

  protected cloneAsSelf(options: AnyValueOptions<O | N>): ObjectValue<O, N> {
    return new ObjectValue<O, N>(this._fields, this, options)
  }

  public makeMapper(): ObjectMapper<O | N> {
    return new JsonObjectMapper<O, N>(this._fields.map(([property, descriptor]) => [property, descriptor.makeMapper()]))
  }

  public findKey(resourceName: string): { property: string; kind: KeyKind } {
    const fieldsInfo: [number, string, Likelihood][] = this._fields.map(([name, descriptor], i) => [
      i,
      name,
      descriptor.isKey({ fieldName: name, resourceName }),
    ])
    let possibleKeys: number[] = []
    let highestLikelihood = Likelihood.implicit(0)
    for (const [i, , likelihood] of fieldsInfo) {
      if (likelihood.isMoreLikelyThan(highestLikelihood)) {
        highestLikelihood = likelihood
        possibleKeys = [i]
      } else if (likelihood.isAsLikelyAs(highestLikelihood)) {
        possibleKeys.push(i)
      }
    }

    if (possibleKeys.length !== 1 || !highestLikelihood.isMoreLikelyThan(Likelihood.implicit(0))) {
      throwError(__.couldNotInferKey(resourceName))
    }

    const [keyProperty, keyDescriptor] = this._fields[possibleKeys[0]]
    if (keyDescriptor.keyKind == null) throwError(__.badKeyType(resourceName, keyProperty))
    if (keyDescriptor.isOptional) throwError(__.optionalKey(resourceName, keyProperty))
    if (keyDescriptor.isNullable) throwError(__.nullableKey(resourceName, keyProperty))
    if (!keyDescriptor.isReadable) throwError(__.unreadableKey(resourceName, keyProperty))
    const kind = keyDescriptor.keyKind

    return { property: keyProperty, kind }
  }

  //region Builder methods

  public override get optional(): ObjectValue<O, N | undefined> {
    return new ObjectValue<O, N | undefined>(this._fields, this, {
      isOptional: true,
    })
  }

  public override get nullable(): ObjectValue<O, N | null> {
    return new ObjectValue<O, N | null>(this._fields, this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}

type FieldDescriptors = Record<string, ValueDescriptor<unknown>>

// inverse of Fields
type ObjectType<Descriptor extends FieldDescriptors> =
  {
    [Property in keyof Descriptor]: Descriptor[Property] extends ValueDescriptor<infer T> ? T : unknown
  } extends infer O ?
    { [Property in keyof O]: O[Property] }
  : never

/**
 * Describes a JSON object. If that object is another resource, consider using `ref` instead.
 * @param objectDescriptor A description of the object. For each property, the value must be a descriptor.
 *
 * @example
 * const position = object({x: number, y: number})
 */
export function jsonObjectFactory<Descriptor extends FieldDescriptors>(
  objectDescriptor: Descriptor,
): ObjectValue<ObjectType<Descriptor>, never> {
  // I think the compiler can't understand the round-trip (ObjectType<FieldDescriptors<T>> is actually T)
  // because of the "infer T", so it just has to trust me
  return new ObjectValue<ObjectType<Descriptor>, never>(
    Object.keys(objectDescriptor).map((key) => [key, objectDescriptor[key]]) as Fields<ObjectType<Descriptor>>,
  )
}
