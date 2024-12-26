import { ValueMapper } from '@module/mappers/serialized'

export class JsonIsoDateMapper<N> extends ValueMapper<Date | N> {
  public packValue(value: Date): unknown {
    return value
  }

  public unpackValue(response: unknown): Date | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    return new Date(String(response))
  }
}
