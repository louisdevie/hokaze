import { Converter } from '.'
import { RequestBodyOrParams, ResponseBody } from '@module/backend'
import { Mapper } from '@module/mappers'

export class WrappedMapper<V, T> implements Mapper<V> {
  private _converter: Converter<V, T>
  private _mapper: Mapper<T>

  constructor(converter: Converter<V, T>, mapper: Mapper<T>) {
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
