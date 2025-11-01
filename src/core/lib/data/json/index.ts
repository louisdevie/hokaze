import type { DataDescriptor } from '..'
import { ArrayElementType, ArrayValue } from './array'
import { AnyValue, AnyValueOptions } from './base'
import { BooleanValue } from './boolean'
import { DateValue } from './date'
import { EnumMember, EnumRecord, EnumValue, resolveEnumAdapter } from './enum'
import { NumberValue } from './number'
import { ObjectValue, PropertiesDescriptors } from './object'
import { ReferenceableValue, RefValue } from './ref'
import { StringValue } from './string'
import type { FieldRoleHints, Likelihood } from '@module/inference'
import { JsonMapper, ValueMapper } from '@module/mappers/json'

export type KeyKind =
  | 'literal' // treat the key as it is
  | 'integer' // treat the key as an integer

/**
 * An object describing a JSON value of type `T`.
 */
export interface ValueDescriptor<T> extends DataDescriptor<T> {
  /**
   * Creates a "blank" value to create new model objects.
   */
  makeBlankValue(): T

  /**
   * Indicates whether that field allows null as a value.
   */
  readonly isNullable: boolean

  /**
   * The kind of id this field is.
   */
  readonly keyKind: KeyKind | null

  /**
   * Check how likely it is for this field to be the id of its resource.
   */
  isKey(hints: FieldRoleHints): Likelihood

  /**
   * Creates a mapping for this field.
   */
  makeMapper(): ValueMapper<T>
}

/**
 * Describes JSON values.
 */
export class JsonData extends AnyValue<any, JsonData> {
  public constructor(copyFrom?: JsonData, options?: AnyValueOptions<any>) {
    super(copyFrom, options)
  }

  protected makeDefaultBlankValue(): any {
    return null
  }

  public get keyKind(): null {
    return null
  }

  protected cloneAsSelf(options: AnyValueOptions<any>): JsonData {
    return new JsonData(this, options)
  }

  public makeMapper(): ValueMapper<any> {
    return new JsonMapper()
  }

  public override get optional(): JsonData {
    return new JsonData(this, { isOptional: true })
  }

  public override get nullable(): JsonData {
    return new JsonData(this, { isNullable: true })
  }

  /**
   * Describes a JSON array.
   * @param elements A descriptor of the type of elements in the array.
   */
  public array<T>(elements: ValueDescriptor<T>): ArrayValue<T, never> {
    return new ArrayValue<T, never>(elements)
  }

  /**
   * Describes a JSON boolean value.
   */
  public get boolean(): BooleanValue<never> {
    return new BooleanValue()
  }

  /**
   * Describes a date in JSON.
   */
  public get date(): DateValue<never> {
    return new DateValue()
  }

  /**
   * Describes a field that can take a specific set of values. When deserializing, the names/keys of the enum are accepted
   * regardless or case and will be mapped to their respective values. The serialization behavior can be changed using
   * {@link EnumValue#useNames}.
   * @param enumObject An enum that lists the possible values.
   *
   * @example
   * // Usage with TypeScript enums :
   * enum MyEnum { A, B, C, D }
   *
   * // accepts values of MyEnum
   * const myEnumField = enumeration(MyEnum)
   *
   * @example
   * // Usage with a plain object :
   * // note that the keys of the object must be strings,
   * // and the values must be numbers or strings.
   * const MyEnum = { A: 0, B: 1, C: 2, D: 3 }
   *
   * // accepts values 0, 1, 2 or 3
   * // this has the advantage to work in JavaScript as well
   * const myEnumField = enumeration(MyEnum)
   */
  public enum<TypeOfEnum extends object>(enumObject: TypeOfEnum): EnumValue<TypeOfEnum[keyof TypeOfEnum], never>
  /**
   * Describes a field that can take only one specific value. Only number and strings are accepted.
   */
  public enum<T1 extends EnumMember>(value1: T1): EnumValue<T1, never>
  /**
   * Describes a field that can take one of two specific values. Only number and strings are accepted.
   */
  public enum<T1 extends EnumMember, T2 extends EnumMember>(value1: T1, value2: T2): EnumValue<T1 | T2, never>
  /**
   * Describes a field that can take one of three specific values. Only number and strings are accepted.
   */
  public enum<T1 extends EnumMember, T2 extends EnumMember, T3 extends EnumMember>(
    value1: T1,
    value2: T2,
    value3: T3,
  ): EnumValue<T1 | T2 | T3, never>
  /**
   * Describes a field that can take one of four specific values. Only number and strings are accepted.
   */
  public enum<T1 extends EnumMember, T2 extends EnumMember, T3 extends EnumMember, T4 extends EnumMember>(
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
  ): EnumValue<T1 | T2 | T3 | T4, never>
  /**
   * Describes a field that can take one of five specific values. Only number and strings are accepted.
   */
  public enum<
    T1 extends EnumMember,
    T2 extends EnumMember,
    T3 extends EnumMember,
    T4 extends EnumMember,
    T5 extends EnumMember,
  >(value1: T1, value2: T2, value3: T3, value4: T4, value5: T5): EnumValue<T1 | T2 | T3 | T4 | T5, never>
  /**
   * Describes a field that can take one of six specific values. Only number and strings are accepted.
   */
  public enum<
    T1 extends EnumMember,
    T2 extends EnumMember,
    T3 extends EnumMember,
    T4 extends EnumMember,
    T5 extends EnumMember,
    T6 extends EnumMember,
  >(
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
  ): EnumValue<T1 | T2 | T3 | T4 | T5 | T6, never>
  /**
   * Describes a field that can take one of seven specific values. Only number and strings are accepted.
   */
  public enum<
    T1 extends EnumMember,
    T2 extends EnumMember,
    T3 extends EnumMember,
    T4 extends EnumMember,
    T5 extends EnumMember,
    T6 extends EnumMember,
    T7 extends EnumMember,
  >(
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
    value7: T7,
  ): EnumValue<T1 | T2 | T3 | T4 | T5 | T6 | T7, never>
  /**
   * Describes a field that can take one of eight specific values. Only number and strings are accepted.
   */
  public enum<
    T1 extends EnumMember,
    T2 extends EnumMember,
    T3 extends EnumMember,
    T4 extends EnumMember,
    T5 extends EnumMember,
    T6 extends EnumMember,
    T7 extends EnumMember,
    T8 extends EnumMember,
  >(
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
    value7: T7,
    value8: T8,
  ): EnumValue<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8, never>
  /**
   * Describes a field that can take one of nine specific values. Only number and strings are accepted.
   */
  public enum<
    T1 extends EnumMember,
    T2 extends EnumMember,
    T3 extends EnumMember,
    T4 extends EnumMember,
    T5 extends EnumMember,
    T6 extends EnumMember,
    T7 extends EnumMember,
    T8 extends EnumMember,
    T9 extends EnumMember,
  >(
    value1: T1,
    value2: T2,
    value3: T3,
    value4: T4,
    value5: T5,
    value6: T6,
    value7: T7,
    value8: T8,
    value9: T9,
  ): EnumValue<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9, never>
  /**
   * Describes a field that can take a specific set of values. Only number and strings are accepted. Note that with ten or
   * more values, you loose the exact typing, but the values will still be checked.
   */
  public enum<T extends EnumMember>(...values: T[]): EnumValue<T, never>
  public enum(...args: (EnumRecord | EnumMember)[]): EnumValue<unknown, never> {
    return new EnumValue<unknown, never>(resolveEnumAdapter(args))
  }

  /**
   * Describes a JSON numeric value.
   */
  public get number(): NumberValue<never> {
    return new NumberValue()
  }

  /**
   * Describes a JSON object. If that object is another resource, consider using `ref` instead.
   * @param properties A description of the object. For each property, the value must be a descriptor.
   *
   * @example
   * const position = json.object({x: json.number, y: json.number})
   */
  public object<O extends Record<string, unknown>>(properties: PropertiesDescriptors<O>): ObjectValue<O, never> {
    return new ObjectValue<O, never>(Object.keys(properties).map((key) => [key, properties[key]]))
  }

  /**
   * Describes a JSON value that is a reference to another resource.
   */
  public ref<R>(resource: ReferenceableValue<R>): RefValue<R, never> {
    return new RefValue<R, never>(resource)
  }

  /**
   * Describes a JSON string value.
   */
  public get string(): StringValue<never> {
    return new StringValue()
  }
}

/**
 * Describes a JSON value.
 */
export const json: JsonData = new JsonData()
