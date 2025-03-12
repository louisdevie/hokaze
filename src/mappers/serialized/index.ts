import { RequestBodyOrParams, ResponseBody } from '@module/backend'
import { Mapper } from '@module/mappers'
import { JsonRequestBody } from '@module/mappers/serialized/json/jsonRequestBody'

export abstract class ValueMapper<T> implements Mapper<T> {
  public pack(value: T): RequestBodyOrParams {
    return new JsonRequestBody(this.packValue(value))
  }

  public async unpack(response: ResponseBody): Promise<T> {
    const responseText = await response.text()
    if (!responseText || responseText.trim().length == 0) {
      return undefined as T
    } else {
      return this.unpackValue(JSON.parse(responseText))
    }
  }

  public get expectedResponseType(): string {
    return 'application/json'
  }

  public abstract packValue(value: T): unknown

  public abstract unpackValue(response: unknown): T
}
