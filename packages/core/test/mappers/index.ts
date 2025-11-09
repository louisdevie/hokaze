import { ResponseData } from '~/mappers'

class TextMockResponseData implements ResponseData {
  private readonly _data: string

  public constructor(data: string) {
    this._data = data
  }

  public async getBlob(): Promise<Blob> {
    const te = new TextEncoder()
    return new Blob([te.encode(this._data)])
  }

  public async getText(): Promise<string> {
    return this._data
  }
}

class BlobMockResponseData implements ResponseData {
  private readonly _data: Blob

  public constructor(data: Blob) {
    this._data = data
  }

  public async getBlob(): Promise<Blob> {
    return this._data
  }

  public async getText(): Promise<string> {
    const td = new TextDecoder()
    return td.decode(await this._data.arrayBuffer())
  }
}

class EmptyMockResponseData implements ResponseData {
  public async getBlob(): Promise<Blob> {
    return new Blob()
  }

  public async getText(): Promise<string> {
    return ''
  }
}

export function responseData(data?: string | Blob): ResponseData {
  if (data instanceof Blob) {
    return new BlobMockResponseData(data)
  } else if (typeof data === 'string') {
    return new TextMockResponseData(data)
  } else {
    return new EmptyMockResponseData()
  }
}
