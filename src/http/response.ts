import { throwInternal } from '@module/errors'
import { ContentType } from '@module/mappers'

export interface HttpResponseHeaders {
  get(name: string): string | null
  has(name: string): boolean
}

interface HttpResponseBase {
  readonly type: ContentType
  readonly body: unknown
  readonly status: number
  readonly statusText: string
  readonly ok: boolean
  readonly headers: HttpResponseHeaders
}

export interface TextHttpResponse extends HttpResponseBase {
  readonly type: 'text'
  readonly body: string
}

export interface BlobHttpResponse extends HttpResponseBase {
  readonly type: 'blob'
  readonly body: Blob
}

export interface JsonHttpResponse extends HttpResponseBase {
  readonly type: 'json'
  readonly body: unknown
}

export interface XmlHttpResponse extends HttpResponseBase {
  readonly type: 'xml'
  readonly body: Document
}

export type HttpResponse = TextHttpResponse | BlobHttpResponse | JsonHttpResponse | XmlHttpResponse

export class BadResponse extends Error implements HttpResponseBase {
  private _originalResponse: HttpResponseBase

  public constructor(response: HttpResponseBase) {
    super(`${response.status} ${response.statusText}`)
    if (response.ok) throwInternal('BadResponse constructor called with ok response')
    this._originalResponse = response
  }

  public get type(): ContentType {
    return this._originalResponse.type
  }

  public get body(): unknown {
    return this._originalResponse.body
  }

  public get headers(): HttpResponseHeaders {
    return this._originalResponse.headers
  }

  public get status(): number {
    return this._originalResponse.status
  }

  public get statusText(): string {
    return this._originalResponse.statusText
  }

  public get ok(): boolean {
    return false
  }
}
