import { FetchHttpClient } from './fetch'
import type { HttpRequest } from './request'
import type { HttpResponse } from './response'

export interface HttpHandler {
  setNext(next: HttpHandler): void
  handle(request: HttpRequest): Promise<HttpResponse>
}

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>
}

export function createFetchHttpClient(): HttpClient {
  return new FetchHttpClient()
}

export { type HttpResponse, type HttpResponseBody, type HttpResponseHeaders } from './response'
export { type HttpRequest, type RequestBodyOrParams } from './request'
