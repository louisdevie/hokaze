import { type EagerReferenceLoader, ValueMapper } from './base'

export class JsonMapper extends ValueMapper<any> {
  public packValue(value: any): unknown {
    return value
  }

  public unpackValue(response: unknown): any {
    return response
  }
}

export { JsonArrayMapper } from './array'
export { ValueMapper } from './base'
export { JsonBooleanMapper } from './boolean'
export { JsonIsoDateMapper } from './date'
export { JsonEnumMapper } from './enum'
export { JsonNumberMapper } from './number'
export { JsonObjectMapper, type ObjectMapper, type RefDataResult } from './object'
export { JsonRefMapper } from './ref'
export { JsonStringMapper } from './string'
