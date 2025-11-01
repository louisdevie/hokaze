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
import {MediaType} from "~/mediaTypes";
import {throwInternal} from "~/shared";

/**
 * A collection of request/response HTTP headers.
 */
export interface HttpHeaders {
  /**
   * Returns a boolean indicating whether a header with the specified name is present or not.
   * @param name the case-insensitive name of the header to look up.
   */
  has(name: string): boolean

  /**
   * Returns the value of the specified header.
   * @param name the case-insensitive name of the header to look up.
   * @returns the value of the header or `undefined` if the header has not been set.
   */
  get(name: string): string | undefined

  /**
   * Adds or updates a header with a specified name and a value.
   * @param name The name of the header to add.
   * @param value The value of the header.
   * @returns The modified `HttpHeaders` object.
   */
  set(name: string, value: string): HttpHeaders

  /** Removes a header by its name.
   * @param name the case-insensitive name of the header to remove.
   * @returns the value of the header that was removed or `undefined` if the header was not present.
   */
  remove(name: string): string | undefined
}

/**
 * An HTTP request that is being sent.
 */
export interface HttpRequest {
  /**
   * The method of the request (`"GET"` or `"POST"` for example).
   */
  readonly method: string

  /**
   * The url of the request.
   */
  readonly url: URL

  /**
   * The headers of the request.
   */
  readonly headers: HttpHeaders

  /**
   * The content of the request.
   */
  readonly body: string | Blob | null
}

/**
 * The body of an HTTP response.
 */
export interface HttpResponseBody {
  /**
   * Reads the response body as text.
   */
  getText(): Promise<string>

  /**
   * Reads the response body as binary data.
   */
  getBlob(): Promise<Blob>
}

/**
 * An HTTP response that has been received.
 */
export interface HttpResponse {
  /**
   * The HTTP status code of the response.
   */
  readonly status: number

  /**
   * The status message corresponding to the {@link HttpResponse.status} property.
   */
  readonly statusText: string

  /**
   * This property is `true` if the response status is in the range 200-299.
   */
  readonly ok: boolean

  /**
   * The headers of the response.
   */
  readonly headers: HttpHeaders

  /**
   * The content of the response.
   */
  readonly body: HttpResponseBody
}

export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>
}
