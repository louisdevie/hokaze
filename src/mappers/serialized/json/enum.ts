import type { EnumAdapter } from '@module/data/serialized/enum'
import { ValueMapper } from '@module/mappers/serialized'

export class JsonEnumMapper<E, N> extends ValueMapper<E | N> {
  private readonly _useNames: boolean
  private _adapter: EnumAdapter<E>

  public constructor(useNames: boolean, adapter: EnumAdapter<E>) {
    super()
    this._useNames = useNames
    this._adapter = adapter
  }

  public packValue(value: E): unknown {
    return this._useNames ? this._adapter.nameFor(value) : value
  }

  public unpackValue(response: unknown): E | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    return this._useNames ? this._adapter.valueFor(response) : (response as E)
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }
}
