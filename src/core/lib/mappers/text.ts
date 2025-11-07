import { BindingTarget, Mapper, RequestData, ResponseData } from '.'
import { isNullish } from '~/helpers'

export class TextMapper implements Mapper<string> {
  public pack(value: unknown): RequestData {
    let data: RequestData = {
      bindTo: [BindingTarget.RequestBody],
      value: null,
    }
    if (!isNullish(value)) {
      data.mediaType = 'text/plain;charset=utf-8'
      data.value = String(value)
    }
    return data
  }

  public unpack(response: ResponseData): Promise<string> {
    return response.getText()
  }
}
