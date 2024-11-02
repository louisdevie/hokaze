import { ValueMapper } from '@module/mappers/serialized'

export class JsonBooleanMapper<N> extends ValueMapper<boolean | N> {
  public packValue(value: boolean): unknown {
    return value
  }

  public unpackValue(response: unknown): boolean | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    return Boolean(response)
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }
}
