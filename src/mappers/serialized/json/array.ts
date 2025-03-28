import { type EagerReferenceLoader, ValueMapper } from '@module/mappers/serialized'

export class JsonArrayMapper<E, N> extends ValueMapper<E[] | N> {
  private _elementMapper: ValueMapper<E>

  public constructor(mapper: ValueMapper<E>) {
    super()
    this._elementMapper = mapper
  }

  public packValue(value: E[]): unknown {
    if (Array.isArray(value)) {
      return value.map((e) => this._elementMapper.packValue(e))
    } else {
      return value
    }
  }

  public unpackValue(response: unknown, refLoader: EagerReferenceLoader): E[] | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    if (!Array.isArray(response)) throw new Error(`Expected an array, got ${JSON.stringify(response)}`)
    return response.map((e) => this._elementMapper.unpackValue(e, refLoader))
  }
}
