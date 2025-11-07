import { BindingTarget, Mapper, RequestData, ResponseData } from '.'
import { isIterable, isNullish } from '~/helpers'

export class BlobMapper implements Mapper<Blob> {
  public pack(value: unknown): RequestData {
    let data: RequestData = {
      bindTo: [BindingTarget.RequestBody],
      value: null,
    }
    if (!isNullish(value)) {
      let blobValue
      if (value instanceof Blob) {
        blobValue = value
      } else {
        try {
          if (isIterable(value)) {
            blobValue = new Blob(value as BlobPart[])
          } else {
            blobValue = new Blob([value as BlobPart])
          }
        } catch (e) {
          throw new Error(`Unable to pack as a Blob`, { cause: e })
        }
      }
      data.mediaType = blobValue.type || 'application/octet-stream'
      data.value = blobValue
    }
    return data
  }

  public unpack(response: ResponseData): Promise<Blob> {
    return response.getBlob()
  }
}
