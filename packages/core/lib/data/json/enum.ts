import { ValueMapper } from '../../mappers/json'
import { AnyValue, AnyValueOptions } from './base'
import { JsonEnumMapper } from '@module/mappers/json'

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
    if (!this._adapter.hasNamedValues) XXXwarn('useNames modifier used on an unnamed enumeration')
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

export type EnumRecord = Record<string | number, string | number>

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

export type EnumMember = number | string

export function resolveEnumAdapter(args: (EnumRecord | EnumMember)[]): EnumAdapter<unknown> {
  let adapter

  if (typeof args[0] === 'object') {
    adapter = new EnumObjectAdapter(args[0])
  } else {
    adapter = new ValueListAdapter(args)
  }

  return adapter
}
