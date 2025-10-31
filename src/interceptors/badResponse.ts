import type { Interceptor } from '.'
import { throwInternal } from '@module/errors'
import type { HttpHandler, HttpRequest, HttpResponse, HttpResponseBody, HttpResponseHeaders } from '@module/http'

/**
 * An error that implements the {@link HttpResponse} interface. This error is thrown by default when a response that
 * is not {@link ok} is received.
 */
export class BadResponse extends Error implements HttpResponse {
  private _originalResponse: HttpResponse

  public constructor(response: HttpResponse) {
    super(`${response.status} ${response.statusText}`)
    if (response.ok) throwInternal('BadResponse constructor called with ok response')
    this._originalResponse = response
  }

  public get body(): HttpResponseBody {
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

export function badResponse(): Interceptor {
  return {
    async intercept(request: HttpRequest, next: HttpHandler): Promise<HttpResponse> {
      const response = await next.handle(request)
      if (response.ok) {
        return response
      } else {
        throw new BadResponse(response)
      }
    },
  }
}
