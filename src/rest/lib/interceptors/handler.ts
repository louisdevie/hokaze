import type { Interceptor, InterceptorFunction } from '.'
import { throwInternal } from '@module/errors'
import type { HttpHandler, HttpRequest, HttpResponse } from '@module/http'

export class InterceptorHttpHandler implements HttpHandler {
  private readonly _interceptor: Interceptor
  private _next?: HttpHandler

  public constructor(interceptor: Interceptor) {
    this._interceptor = interceptor
  }

  public setNext(next: HttpHandler): void {
    if (this._next === undefined) {
      this._next = next
    } else {
      this._next.setNext(next)
    }
  }

  public handle(request: HttpRequest): Promise<HttpResponse> {
    if (this._next === undefined) {
      throwInternal('InterceptorHttpHandler.handle() called before the next handler was set')
    }
    return Promise.resolve(this._interceptor.intercept(request, this._next))
  }
}

export function createInterceptorHttpHandler(interceptor: Interceptor | InterceptorFunction): HttpHandler {
  if (typeof interceptor === 'function') {
    return new InterceptorHttpHandler({ intercept: interceptor })
  } else {
    return new InterceptorHttpHandler(interceptor)
  }
}
