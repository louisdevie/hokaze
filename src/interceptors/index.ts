import { HttpHandler, HttpRequest, HttpResponse } from '@module/http'

export interface Interceptor {
  intercept(request: HttpRequest, next: HttpHandler): HttpResponse | Promise<HttpResponse>
}

export type InterceptorFunction = (request: HttpRequest, next: HttpHandler) => HttpResponse | Promise<HttpResponse>
