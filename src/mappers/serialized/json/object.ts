import { ValueMapper } from '@module/mappers/serialized'
import { ObjectMapper } from '@module/mappers/serialized/object'
import { ResponseBody } from '@module/backend'
import { Key } from '@module/resources'

type FieldMappers<O> = [keyof O, ValueMapper<O[keyof O]>][]

export class JsonObjectMapper<O, N> extends ValueMapper<O | N> implements ObjectMapper<O | N> {
  private readonly _fieldMappers: FieldMappers<O>
  private _keyFieldIndex?: number

  public constructor(fieldMappers: FieldMappers<O>) {
    super()
    this._fieldMappers = fieldMappers
  }

  public setKeyProperty(value: string): void {
    this._keyFieldIndex = this._fieldMappers.findIndex(([property]) => property === value)
  }

  public packValue(value: O): unknown {
    const obj: { [p in keyof O]?: unknown } = {}
    for (const [field, mapper] of this._fieldMappers) {
      obj[field] = mapper.packValue(value[field])
    }
    return obj
  }

  public unpackValue(response: unknown): O {
    if (typeof response !== 'object' || response === null)
      throw new Error(`Expected an object, got ${JSON.stringify(response)}`)
    const obj: Partial<O> = {}
    for (const [field, mapper] of this._fieldMappers) {
      obj[field] = mapper.unpackValue((response as Record<keyof O, unknown>)[field])
    }
    return obj as O
  }

  public async tryToUnpackKey(response: ResponseBody): Promise<Key | undefined> {
    let key = undefined
    if (this._keyFieldIndex !== undefined) {
      let dto
      try {
        dto = await response.json()
      } catch {
        dto = undefined
      }
      if (typeof dto === 'object' && dto !== null) {
        const [property, mapper] = this._fieldMappers[this._keyFieldIndex]
        key = mapper.unpackValue((response as Record<keyof O, unknown>)[property])
      }
    }
    return key as Key | undefined
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }
}
