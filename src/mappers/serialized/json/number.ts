import { ValueMapper } from '@module/mappers/serialized'

export class JsonNumberMapper<N> extends ValueMapper<number | N> {
  private readonly _integer: boolean

  public constructor(integer: boolean) {
    super()
    this._integer = integer
  }

  public packValue(value: number): unknown {
    return this._integer ? Math.floor(value) : value
  }

  public unpackValue(response: unknown): number | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    const num = Number(response)
    return this._integer ? Math.floor(num) : num
  }
}
