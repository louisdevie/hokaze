import { Mapper } from '.'
import { RequestBodyOrParams, ResponseBody } from '../http'

export class PlainTextMapper implements Mapper<string> {
  public pack(value: string): RequestBodyOrParams {
    return new PlainTextRequestBody(value)
  }

  public unpack(response: ResponseBody): Promise<string> {
    return response.text()
  }

  public get expectedResponseType(): string {
    return 'text/plain'
  }
}

/** @internal */
class PlainTextRequestBody implements RequestBodyOrParams {
  private readonly _value: string

  public constructor(value: string) {
    this._value = value
  }

  public readonly type = 'text/plain'

  public intoBodyInit(): BodyInit | null {
    return this._value
  }
}
