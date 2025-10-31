import type { HttpClient, HttpResponse, HttpRequest } from '.'
import { HttpResponseBody, HttpResponseHeaders } from '@module/http/response'
import { MediaType } from '@module/mediaTypes'

/**
 * @internal
 */
export class FetchHttpClient implements HttpClient {
  public async request(request: HttpRequest): Promise<HttpResponse> {
    const response = await fetch(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
    })
    return new FetchHttpResponse(response)
  }
}

class FetchHttpResponse implements HttpResponse {
  private readonly _response: Response

  public constructor(response: Response) {
    this._response = response
  }

  public get body(): HttpResponseBody {
    return this._response
  }

  public get headers(): HttpResponseHeaders {
    return this._response.headers
  }

  public get ok(): boolean {
    return this._response.ok
  }

  public get status(): number {
    return this._response.status
  }

  public get statusText(): string {
    return this._response.statusText
  }
}
