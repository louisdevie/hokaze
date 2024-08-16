import { ValueMapper } from '@module/mappers/serialized'

export class JsonArrayMapper<E, N> extends ValueMapper<E[] | N> {
  private _elementMapper: ValueMapper<E>

  public constructor(mapper: ValueMapper<E>) {
    super()
    this._elementMapper = mapper
  }

  public packValue(value: E[]): unknown {
    return value.map((e) => this._elementMapper.packValue(e))
  }

  public unpackValue(response: unknown): E[] {
    if (!Array.isArray(response)) throw new Error(`Expected an array, got ${JSON.stringify(response)}`)
    return response.map((e) => this._elementMapper.unpackValue(e))
  }

  public get expectedResponseType(): string {
    return "application/json";
  }
}
