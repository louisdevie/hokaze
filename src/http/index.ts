import { BrowserHttpClient } from './browser'
import type { HttpRequest } from './request'
import type { HttpResponse } from './response'

export { type HttpResponse, BadResponse } from './response'

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>
}

export function createBrowserHttpClient(): HttpClient {
  return new BrowserHttpClient()
}
