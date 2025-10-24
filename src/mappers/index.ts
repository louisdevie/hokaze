import { RequestBodyOrParams, ResponseBody } from '../http'

export type ContentType = 'text' | 'blob' | 'json' | 'xml'

export interface Mapper<T> {
  pack(value: T): RequestBodyOrParams

  readonly responseType: string

  unpack(response: ResponseBody): Promise<T>
}
