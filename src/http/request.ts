import { throwInternal } from '@module/errors'
import { MediaType } from '@module/mediaTypes'

export interface HttpRequestHeaders {
  has(name: string): boolean

  get(name: string): string | null

  set(name: string, value: string): void

  append(name: string, value: string): void

  delete(name: string): void
}

export interface HttpRequest {
  method: string
  url: URL
  headers: HttpRequestHeaders
  body: string | Blob | null
}

/**
 * @internal
 */
export type RequestBodyOrParams =
  | { kind: 'text'; mediaType: MediaType; text: string }
  | { kind: 'blob'; mediaType: MediaType; blob: Blob }
  | { kind: 'urlParams'; urlParams: [string, string][] }

/**
 * @internal
 */
export class HttpRequestBuilder {
  private _method?: string
  private _url?: URL
  private _urlSearchParams?: [string, string][]
  private _headers: Headers = new Headers()
  private _body?: string | Blob

  private _setHeader(name: string, value: string) {
    this._headers.set(name, value)
  }

  public withMethod(method: string): HttpRequestBuilder {
    this._method = method
    return this
  }

  public withURL(url: string | URL): HttpRequestBuilder {
    if (typeof url === 'string') {
      this._url = new URL(url)
    } else {
      this._url = url
    }
    return this
  }

  public withContent(requestBodyOrParams: RequestBodyOrParams): HttpRequestBuilder {
    if (requestBodyOrParams.kind === 'text') {
      this._body = requestBodyOrParams.text
      this._setHeader('Content-Type', requestBodyOrParams.mediaType.toString())
    } else if (requestBodyOrParams.kind === 'blob') {
      this._body = requestBodyOrParams.blob
      this._setHeader('Content-Type', requestBodyOrParams.mediaType.toString())
    } else if (requestBodyOrParams.kind === 'urlParams') {
      this._urlSearchParams = requestBodyOrParams.urlParams
    } else {
      throwInternal(`content '${requestBodyOrParams}' cannot be used in an http request.`)
    }
    return this
  }

  public withExpectedResponseType(expectedResponseType: MediaType): HttpRequestBuilder {
    this._setHeader('Accept', expectedResponseType.toString())
    return this
  }

  public build(): HttpRequest {
    let method
    if (this._method) {
      method = this._method.toUpperCase()
    } else {
      throwInternal('HttpRequestBuilder.build() called before the request method was set.')
    }

    let url
    if (this._url) {
      url = this._url
    } else {
      throwInternal('HttpRequestBuilder.build() called before the request URL was set.')
    }

    if (this._urlSearchParams) {
      for (const [name, value] of this._urlSearchParams) {
        url.searchParams.set(name, value)
      }
    }

    return { method, url, headers: this._headers, body: this._body ?? null }
  }
}
