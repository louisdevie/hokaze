import { AnyValue, AnyValueOptions } from './base'
import { ConvertedObject } from '@module/data/serialized/converted'
import { KeyKind, ValueDescriptor } from '@module/data/serialized/index'
import { throwError } from '@module/errors'
import { Likelihood } from '@module/inference'
import L from '@module/locale/gen'
import { TransparentSelfConverter } from '@module/mappers/converters'
import { resolveTransparentSelfConverter } from '@module/mappers/converters/factory'
import { JsonObjectMapper } from '@module/mappers/serialized/json/object'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { ValidationResult } from '@module/validation'

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

  public validate(value: O | N): ValidationResult {
    let result = super.validate(value)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof value === 'object' && value !== null) {
      for (const [name, descriptor] of this._fields) {
        result = result.mergeWithProperty(name, descriptor.validate((value as O)[name]))
      }
    }
    return result
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
      throwError(L.couldNotInferKey(resourceName))
    }

    const [keyProperty, keyDescriptor] = this._fields[possibleKeys[0]]
    if (keyDescriptor.keyKind == null) throwError(L.badKeyType(resourceName, keyProperty))
    if (keyDescriptor.isOptional) throwError(L.optionalKey(resourceName, keyProperty))
    if (keyDescriptor.isNullable) throwError(L.nullableKey(resourceName, keyProperty))
    if (!keyDescriptor.isReadable) throwError(L.unreadableKey(resourceName, keyProperty))
    const kind = keyDescriptor.keyKind

    return { property: keyProperty, kind }
  }

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

  /**
   * Adds a self-converter that extends the original type to this descriptor.
   * @param cls A constructor that is used to convert the value on input.
   */
  public asInstanceOf<C extends O>(cls: TransparentSelfConverter<C, O>): ConvertedObject<C, O> {
    return new ConvertedObject(this as unknown as ObjectValue<O, never>, resolveTransparentSelfConverter(cls), null)
  }
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
