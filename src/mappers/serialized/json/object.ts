import { ValueMapper } from '@module/mappers/serialized'
import { ObjectMapper, RefDataResult } from '@module/mappers/serialized/object'
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

  public packValue(value: O | N): unknown {
    if (typeof value === 'object' && value !== null) {
      const obj: { [p in keyof O]?: unknown } = {}
      for (const [field, mapper] of this._fieldMappers) {
        obj[field] = mapper.packValue((value as O)[field])
      }
      return obj
    } else {
      return value
    }
  }

  public unpackValue(response: unknown): O | N {
    if (response === undefined) return undefined as N
    if (response === null) return null as N
    if (typeof response !== 'object') throw new Error(`Expected an object, got ${JSON.stringify(response)}`)
    const obj: Partial<O> = {}
    for (const [field, mapper] of this._fieldMappers) {
      obj[field] = mapper.unpackValue((response as Record<keyof O, unknown>)[field])
    }
    return obj as O
  }

  public tryToUnpackKey(response: string): Key | undefined {
    let key = undefined
    if (this._keyFieldIndex !== undefined) {
      let dto: unknown
      try {
        dto = JSON.parse(response)
      } catch {
        dto = undefined
      }
      if (typeof dto === 'object' && dto !== null) {
        const [property, mapper] = this._fieldMappers[this._keyFieldIndex]
        key = mapper.unpackValue((dto as Record<keyof O, unknown>)[property])
      }
    }
    return key as Key | undefined
  }

  public tryToUnpackRef(dto: unknown): RefDataResult<O> {
    if (typeof dto !== 'object' || dto === null) {
      return { found: 'nothing' }
    }
    if (this._keyFieldIndex === undefined) {
      return { found: 'nothing' }
    }

    const props = Object.keys(dto)
    const [keyProperty, keyMapper] = this._fieldMappers[this._keyFieldIndex]
    if (props.length === 1 && props[0] === keyProperty) {
      const key = keyMapper.unpackValue((dto as Record<keyof O, unknown>)[keyProperty])
      return { found: 'key', key }
    }

    const obj: Partial<O> = {}
    for (const [field, mapper] of this._fieldMappers) {
      obj[field] = mapper.unpackValue((dto as Record<keyof O, unknown>)[field])
    }
    return { found: 'value', value: obj as O }
  }
}
