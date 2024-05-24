import { AnyField, FieldOpts, explicitBlankValue } from './any'

interface EnumFieldOpts<E, N> extends FieldOpts<E | N> {
  useNames?: boolean
}

interface EnumAdapter<E> {
  defaultBlankValue: E
}

/**
 * Describes a field with values of user-defined enum types.
 *
 * @template E The type of the enumeration.
 * @template N Additional values the field can hold.
 */
export class EnumField<E, N> extends AnyField<E | N, EnumField<E, N>> {
  private readonly _adapter: EnumAdapter<E>
  private readonly _useNames: boolean

  public constructor(adapter: EnumAdapter<E>, copyFrom?: EnumField<E, N>, options?: EnumFieldOpts<E, N>) {
    super(copyFrom, options)

    this._adapter = adapter

    this._useNames = copyFrom?._useNames ?? options?.useNames ?? false
  }

  protected get defaultBlankValue(): E | N {
    return this._adapter.defaultBlankValue
  }

  protected cloneAsSelf(options: EnumFieldOpts<E, N>): EnumField<E, N> {
    return new EnumField<E, N>(this._adapter, this, options)
  }

  //region Builder methods

  /**
   * Use the names of the enumeration instead of the values when serializing this field.
   */
  public get useNames(): EnumField<E, N> {
    return this.cloneAsSelf({ useNames: true })
  }

  public override get optional(): EnumField<E, N | undefined> {
    return new EnumField<E, N | undefined>(this._adapter, this, { isOptional: true })
  }

  public override get nullable(): EnumField<E, N | null> {
    return new EnumField<E, N | null>(this._adapter, this, { isNullable: true, blankValue: explicitBlankValue(null) })
  }

  //endregion
}

type EnumRecord = Record<string | number, string | number>

class EnumObjectAdapter<TypeOfE extends EnumRecord> implements EnumAdapter<TypeOfE[keyof TypeOfE]> {
  private readonly _enumObject: TypeOfE
  private readonly _isIndexedBothWays: boolean
  private readonly _reverseIndex?: Map<TypeOfE[keyof TypeOfE], keyof TypeOfE>

  public constructor(enumObject: TypeOfE) {
    this._enumObject = enumObject
    this.rejectIfEmpty()

    this._isIndexedBothWays = this.checkIndexing()

    if (!this._isIndexedBothWays) {
      this._reverseIndex = this.buildReverseIndex()
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

  private buildReverseIndex(): Map<TypeOfE[keyof TypeOfE], keyof TypeOfE> {
    const reverseIndex: Map<TypeOfE[keyof TypeOfE], keyof TypeOfE> = new Map()

    for (const key in this._enumObject) {
      if (Object.hasOwn(this._enumObject, key)) {
        reverseIndex.set(this._enumObject[key], key)
      }
    }

    return reverseIndex
  }

  public get defaultBlankValue(): TypeOfE[keyof TypeOfE] {
    this.rejectIfEmpty()
    return this._enumObject[Object.keys(this._enumObject)[0] as keyof TypeOfE]
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

  public get defaultBlankValue(): UnionType {
    return this._values[0]
  }
}

type EnumValue = number | string

/**
 * Describes a field that can take a specific set of values. When deserializing, the names/keys of the enum are accepted
 * regardless or case and will be mapped to their respective values. The serialization behavior can be changed using
 * {@link EnumField#useNames}.
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
export function enumFieldFactory<TypeOfEnum extends object>(
  enumObject: TypeOfEnum,
): EnumField<TypeOfEnum[keyof TypeOfEnum], never>
/**
 * Describes a field that can take only one specific value. Only number and strings are accepted.
 */
export function enumFieldFactory<T1 extends EnumValue>(value1: T1): EnumField<T1, never>
/**
 * Describes a field that can take one of two specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<T1 extends EnumValue, T2 extends EnumValue>(
  value1: T1,
  value2: T2,
): EnumField<T1 | T2, never>
/**
 * Describes a field that can take one of three specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<T1 extends EnumValue, T2 extends EnumValue, T3 extends EnumValue>(
  value1: T1,
  value2: T2,
  value3: T3,
): EnumField<T1 | T2 | T3, never>
/**
 * Describes a field that can take one of four specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
>(value1: T1, value2: T2, value3: T3, value4: T4): EnumField<T1 | T2 | T3 | T4, never>
/**
 * Describes a field that can take one of five specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
>(value1: T1, value2: T2, value3: T3, value4: T4, value5: T5): EnumField<T1 | T2 | T3 | T4 | T5, never>
/**
 * Describes a field that can take one of six specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
  T6 extends EnumValue,
>(value1: T1, value2: T2, value3: T3, value4: T4, value5: T5, value6: T6): EnumField<T1 | T2 | T3 | T4 | T5 | T6, never>
/**
 * Describes a field that can take one of seven specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
  T6 extends EnumValue,
  T7 extends EnumValue,
>(
  value1: T1,
  value2: T2,
  value3: T3,
  value4: T4,
  value5: T5,
  value6: T6,
  value7: T7,
): EnumField<T1 | T2 | T3 | T4 | T5 | T6 | T7, never>
/**
 * Describes a field that can take one of eight specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
  T6 extends EnumValue,
  T7 extends EnumValue,
  T8 extends EnumValue,
>(
  value1: T1,
  value2: T2,
  value3: T3,
  value4: T4,
  value5: T5,
  value6: T6,
  value7: T7,
  value8: T8,
): EnumField<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8, never>
/**
 * Describes a field that can take one of nine specific values. Only number and strings are accepted.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
  T6 extends EnumValue,
  T7 extends EnumValue,
  T8 extends EnumValue,
  T9 extends EnumValue,
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
): EnumField<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9, never>
/**
 * Describes a field that can take a specific set of values. Only number and strings are accepted. Note that with ten or
 * more values, you loose the exact typing, but the values will still be checked.
 */
export function enumFieldFactory<
  T1 extends EnumValue,
  T2 extends EnumValue,
  T3 extends EnumValue,
  T4 extends EnumValue,
  T5 extends EnumValue,
  T6 extends EnumValue,
  T7 extends EnumValue,
  T8 extends EnumValue,
  T9 extends EnumValue,
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
  ...otherValues: EnumValue[]
): EnumField<EnumValue, never>
export function enumFieldFactory(
  objectOrFirstValue: EnumRecord | EnumValue,
  ...otherValues: EnumValue[]
): EnumField<unknown, never> {
  let adapter

  if (typeof objectOrFirstValue === 'object') {
    adapter = new EnumObjectAdapter(objectOrFirstValue)
  } else {
    adapter = new ValueListAdapter([objectOrFirstValue, ...otherValues])
  }

  return new EnumField<unknown, never>(adapter)
}
