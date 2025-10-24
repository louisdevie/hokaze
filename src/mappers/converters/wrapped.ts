import { Converter } from '.'
import { RequestBodyOrParams, ResponseBody } from '../../http'
import { Key } from '@module'
import { Mapper } from '@module/mappers'
import { type EagerReferenceLoader } from '@module/mappers/serialized'
import { ObjectMapper, RefDataResult } from '@module/mappers/serialized/object'

export class WrappedMapper<V, T> implements Mapper<V> {
  private _converter: Converter<V, T>
  private _mapper: Mapper<T>

  public constructor(converter: Converter<V, T>, mapper: Mapper<T>) {
    this._converter = converter
    this._mapper = mapper
  }

  public pack(value: V): RequestBodyOrParams {
    const dto = this._converter.pack(value)
    return this._mapper.pack(dto)
  }

  public async unpack(response: ResponseBody): Promise<V> {
    const dto = await this._mapper.unpack(response)
    return this._converter.unpack(dto)
  }

  public get expectedResponseType(): string {
    return this._mapper.expectedResponseType
  }
}

export class WrappedObjectMapper<V, T> implements ObjectMapper<V> {
  private _converter: Converter<V, T>
  private _mapper: ObjectMapper<T>

  public constructor(converter: Converter<V, T>, mapper: ObjectMapper<T>) {
    this._converter = converter
    this._mapper = mapper
  }

  public pack(value: V): RequestBodyOrParams {
    const dto = this._converter.pack(value)
    return this._mapper.pack(dto)
  }

  public async unpack(response: ResponseBody): Promise<V> {
    const dto = await this._mapper.unpack(response)
    return this._converter.unpack(dto)
  }

  public get expectedResponseType(): string {
    return this._mapper.expectedResponseType
  }

  public packValue(value: V): unknown {
    return this._mapper.packValue(this._converter.pack(value))
  }

  public unpackValue(response: unknown, refLoader: EagerReferenceLoader): V {
    return this._converter.unpack(this._mapper.unpackValue(response, refLoader))
  }

  public setKeyProperty(value: string): void {
    this._mapper.setKeyProperty(value)
  }

  public tryToUnpackKey(responseBody: string): Key | undefined {
    return this._mapper.tryToUnpackKey(responseBody)
  }

  public tryToUnpackRef(responseValue: unknown, refLoader: EagerReferenceLoader): RefDataResult<V> {
    const rawResult: RefDataResult<T> = this._mapper.tryToUnpackRef(responseValue, refLoader)
    let convertedResult: RefDataResult<V>

    if (rawResult.found === 'value') {
      convertedResult = { found: 'value', value: this._converter.unpack(rawResult.value) }
    } else {
      convertedResult = rawResult
    }

    return convertedResult
  }
}
