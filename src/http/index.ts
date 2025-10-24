import type { HttpRequest } from './request'
import type { HttpResponse } from './response'

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>
}
