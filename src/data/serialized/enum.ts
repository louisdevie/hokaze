import { AnyValue, AnyValueOptions } from './base'
import { ValueMapper } from '@module/mappers/serialized'
import { JsonEnumMapper } from '@module/mappers/serialized/json'
import console from 'node:console'

interface EnumValueOpts<E, N> extends AnyValueOptions<E | N> {
  useNames?: boolean
}

export interface EnumAdapter<E> {
  readonly hasNamedValues: boolean

  makeDefaultBlankValue(): E

  nameFor(value: E): unknown

  valueFor(name: unknown): E
}

/**
 * Describes a JSON value that belongs to a user-defined enum type.
 *
 * @template E The type of the enumeration.
 * @template N Additional values the field can hold.
 */
export class EnumValue<E, N> extends AnyValue<E | N, EnumValue<E, N>> {
  private readonly _adapter: EnumAdapter<E>
  private readonly _useNames: boolean

  public constructor(adapter: EnumAdapter<E>, copyFrom?: EnumValue<E, N>, options?: EnumValueOpts<E, N>) {
    super(copyFrom, options)

    this._adapter = adapter

    this._useNames = copyFrom?._useNames ?? options?.useNames ?? false
  }

  protected makeDefaultBlankValue(): E | N {
    return this._adapter.makeDefaultBlankValue()
  }

  protected cloneAsSelf(options: EnumValueOpts<E, N>): EnumValue<E, N> {
    return new EnumValue<E, N>(this._adapter, this, options)
  }

  public makeMapper(): ValueMapper<E | N> {
    return new JsonEnumMapper(this._useNames, this._adapter)
  }

  //region Builder methods

  /**
   * Use the names of the enumeration instead of the values when serializing this field. If the enum was declared from
   * a plain list of values (e.g. `enum(1, 2, 3)`), this has no effect.
   */
  public get useNames(): EnumValue<E, N> {
    if (!this._adapter.hasNamedValues) console.warn('useNames modifier used on an unnamed enumeration')
    return this.cloneAsSelf({ useNames: true })
  }

  public override get optional(): EnumValue<E, N | undefined> {
    return new EnumValue<E, N | undefined>(this._adapter, this, {
      isOptional: true,
    })
  }

  public override get nullable(): EnumValue<E, N | null> {
    return new EnumValue<E, N | null>(this._adapter, this, {
      isNullable: true,
      blankValueFactory: () => null,
    })
  }

  //endregion
}

type EnumRecord = Record<string | number, string | number>

class EnumObjectAdapter<TypeOfE extends EnumRecord> implements EnumAdapter<TypeOfE[keyof TypeOfE]> {
  private readonly _enumObject: TypeOfE
  private _reverseIndex?: Map<string | number, string | number>

  public constructor(enumObject: TypeOfE) {
    this._enumObject = enumObject
    this.rejectIfEmpty()

    if (!this.checkIndexing()) {
      this.buildReverseIndex()
    }
  }

  private rejectIfEmpty(): void {
    if (Object.keys(this._enumObject).length === 0) throw new Error('this enumeration is empty')
  }

  private checkIndexing(): boolean {
    let allValuesIndexed = true
    for (const key in this._enumObject) {
      if (allValuesIndexed && Object.hasOwn(this._enumObject, key)) {
        // the loose equality here is on purpose
        // (number values are, well, numbers, but the corresponding keys are strings, so we consider "0" and 0 to be the same)
        allValuesIndexed =
          (this._enumObject as Record<TypeOfE[keyof TypeOfE], keyof TypeOfE>)[this._enumObject[key]] == key
      }
    }
    return allValuesIndexed
  }

  private buildReverseIndex(): void {
    this._reverseIndex = new Map()

    for (const key in this._enumObject) {
      if (Object.hasOwn(this._enumObject, key)) {
        this._reverseIndex.set(this._enumObject[key], key)
      }
    }
  }

  public makeDefaultBlankValue(): TypeOfE[keyof TypeOfE] {
    this.rejectIfEmpty()
    return this._enumObject[Object.keys(this._enumObject)[0] as keyof TypeOfE]
  }

  public readonly hasNamedValues = true

  public nameFor(value: TypeOfE[keyof TypeOfE]): unknown {
    let name
    if (this._reverseIndex !== undefined) {
      name = this._reverseIndex.get(value)
    } else {
      name = this._enumObject[value]
    }
    return String(name !== undefined ? name : value)
  }

  public valueFor(name: unknown): TypeOfE[keyof TypeOfE] {
    return this._enumObject[String(name)] as TypeOfE[keyof TypeOfE]
  }
}

class ValueListAdapter<UnionType> implements EnumAdapter<UnionType> {
  private readonly _values: UnionType[]

  public constructor(values: UnionType[]) {
    this._values = values
    this.rejectIfEmpty()
  }

  private rejectIfEmpty(): void {
    if (this._values.length === 0) throw new Error('this enumeration is empty')
  }

  public makeDefaultBlankValue(): UnionType {
    return this._values[0]
  }

  public readonly hasNamedValues = false

  // see EnumValue.useNames for the two methods below

  public nameFor(value: UnionType): unknown {
    return value
  }

  public valueFor(name: unknown): UnionType {
    return name as UnionType
  }
}

type EnumMember = number | string

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
export function jsonEnumFactory<TypeOfEnum extends object>(
  enumObject: TypeOfEnum,
): EnumValue<TypeOfEnum[keyof TypeOfEnum], never>
/**
 * Describes a field that can take only one specific value. Only number and strings are accepted.
 */
export function jsonEnumFactory<T1 extends EnumMember>(value1: T1): EnumValue<T1, never>
/**
 * Describes a field that can take one of two specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<T1 extends EnumMember, T2 extends EnumMember>(
  value1: T1,
  value2: T2,
): EnumValue<T1 | T2, never>
/**
 * Describes a field that can take one of three specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<T1 extends EnumMember, T2 extends EnumMember, T3 extends EnumMember>(
  value1: T1,
  value2: T2,
  value3: T3,
): EnumValue<T1 | T2 | T3, never>
/**
 * Describes a field that can take one of four specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<
  T1 extends EnumMember,
  T2 extends EnumMember,
  T3 extends EnumMember,
  T4 extends EnumMember,
>(value1: T1, value2: T2, value3: T3, value4: T4): EnumValue<T1 | T2 | T3 | T4, never>
/**
 * Describes a field that can take one of five specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<
  T1 extends EnumMember,
  T2 extends EnumMember,
  T3 extends EnumMember,
  T4 extends EnumMember,
  T5 extends EnumMember,
>(value1: T1, value2: T2, value3: T3, value4: T4, value5: T5): EnumValue<T1 | T2 | T3 | T4 | T5, never>
/**
 * Describes a field that can take one of six specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<
  T1 extends EnumMember,
  T2 extends EnumMember,
  T3 extends EnumMember,
  T4 extends EnumMember,
  T5 extends EnumMember,
  T6 extends EnumMember,
>(value1: T1, value2: T2, value3: T3, value4: T4, value5: T5, value6: T6): EnumValue<T1 | T2 | T3 | T4 | T5 | T6, never>
/**
 * Describes a field that can take one of seven specific values. Only number and strings are accepted.
 */
export function jsonEnumFactory<
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
export function jsonEnumFactory<
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
export function jsonEnumFactory<
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
export function jsonEnumFactory(...values: EnumMember[]): EnumValue<EnumMember, never>
export function jsonEnumFactory(
  objectOrFirstValue: EnumRecord | EnumMember,
  ...otherValues: EnumMember[]
): EnumValue<unknown, never> {
  let adapter

  if (typeof objectOrFirstValue === 'object') {
    adapter = new EnumObjectAdapter(objectOrFirstValue)
  } else {
    adapter = new ValueListAdapter([objectOrFirstValue, ...otherValues])
  }

  return new EnumValue<unknown, never>(adapter)
}
