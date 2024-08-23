import { ValueMapper } from 'eiktobel'
import __dayjs, { Dayjs } from 'dayjs'

export class JsonDayjsMapper<N> extends ValueMapper<Dayjs | N> {
  public packValue(value: Dayjs): unknown {
    return value.toJSON()
  }

  public unpackValue(response: unknown): Dayjs {
    return __dayjs(String(response))
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }
}
