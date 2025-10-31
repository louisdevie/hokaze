import { ValueMapper } from './base'

export class JsonStringMapper<N> extends ValueMapper<string | N> {
  public packValue(value: string): unknown {
    return value
  }

  public unpackValue(response: unknown): string | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    return String(response)
  }
}
