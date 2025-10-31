import { throwInternal } from '@module/errors'

export interface HttpResponseBody {
  text(): Promise<string>

  blob(): Promise<Blob>
}

export interface HttpResponseHeaders {
  has(name: string): boolean

  get(name: string): string | null
}

export interface HttpResponse {
  readonly body: HttpResponseBody
  readonly status: number
  readonly statusText: string
  readonly ok: boolean
  readonly headers: HttpResponseHeaders
}
