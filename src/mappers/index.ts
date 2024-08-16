import { RequestBodyOrParams, ResponseBody } from '@module/backend'

export interface Mapper<T> {
  pack(value: T): RequestBodyOrParams

  readonly expectedResponseType: string

  unpack(response: ResponseBody): Promise<T>
}
