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
