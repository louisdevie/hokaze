import { HttpResponseBody, RequestBodyOrParams } from '@module/http'
import { MediaType } from '@module/mediaTypes'

export interface Mapper<T> {
  pack(value: T): RequestBodyOrParams

  readonly expectedResponseType: MediaType

  unpack(response: HttpResponseBody): Promise<T>
}
