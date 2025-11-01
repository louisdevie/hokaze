import { Mapper } from '.'
import { HttpResponseBody, RequestBodyOrParams } from '@module/http'
import { MediaTypes } from '@module/mediaTypes'

export class TextMapper implements Mapper<string> {
  public pack(value: string): RequestBodyOrParams {
    return {
      kind: 'text',
      text: value,
      mediaType: MediaTypes.Text.Preferred,
    }
  }

  public unpack(response: HttpResponseBody): Promise<string> {
    return response.text()
  }
}
