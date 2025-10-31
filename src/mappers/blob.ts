import { Mapper } from '.'
import { HttpResponseBody, RequestBodyOrParams } from '@module/http'
import { MediaTypes } from '@module/mediaTypes'

export class BlobMapper implements Mapper<Blob> {
  public pack(value: Blob): RequestBodyOrParams {
    return {
      kind: 'blob',
      blob: value,
      mediaType: MediaTypes.Blob.Preferred,
    }
  }

  public unpack(response: HttpResponseBody): Promise<Blob> {
    return response.blob()
  }
}
