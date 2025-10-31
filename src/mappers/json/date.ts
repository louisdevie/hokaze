import { ValueMapper } from './base'
import { DateFormat } from '@module/data/json/date'

export class JsonDateMapper<N> extends ValueMapper<Date | N> {
  private _format: DateFormat

  public constructor(format: DateFormat) {
    super()
    this._format = format
  }

  public packValue(value: Date): unknown {
    return value.toISOString()
  }

  public unpackValue(response: unknown): Date | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    return new Date(String(response))
  }
}
