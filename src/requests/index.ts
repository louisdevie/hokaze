import { AuthScheme } from '@module/auth'
import { DataDescriptor } from '@module/data'

export interface TxOnlyPreparedRequestInit<Q> {
  /**
   * Describes the values sent.
   */
  request: DataDescriptor<Q>
}

export interface RxOnlyPreparedRequestInit<R> {
  /**
   * Describes the values received.
   */
  response: DataDescriptor<R>
}

export interface AsymmetricPreparedRequestInit<Q, R> {
  /**
   * Describes the values sent.
   */
  request: DataDescriptor<Q>

  /**
   * Describes the values received.
   */
  response: DataDescriptor<R>
}

export interface SymmetricPreparedRequestInit<T> {
  /**
   * Describes both the values sent and received.
   */
  requestAndResponse: DataDescriptor<T>
}

/**
 * Describes a custom HTTP request.
 */
export type PreparedRequestInit<Q = any, R = any> =
  | object
  | TxOnlyPreparedRequestInit<Q>
  | RxOnlyPreparedRequestInit<R>
  | AsymmetricPreparedRequestInit<Q, R>
  | SymmetricPreparedRequestInit<Q & R>

/**
 * A custom HTTP request.
 */
export interface PreparedRequest<Q, R> {
  /**
   * Sends the request.
   * @param request The value to put in the request body.
   * @returns The value extracted from the response body.
   */
  send(request: Q): Promise<R>

  /**
   * Appends the given headers to the request. If one of the headers doesn't accept multiple values,
   * any value already present will be replaced.
   * @param init The headers to add.
   */
  withHeaders(init: HeadersInit): PreparedRequest<Q, R>

  /**
   * Appends authorization headers to the request.
   * @param auth An {@link AuthScheme} to use for this request, or a string to put in the `Authorization` header.
   */
  withAuth(auth: AuthScheme | string): PreparedRequest<Q, R>

  /**
   * Sets the headers to send alongside the request, replacing all the existing headers.
   * @param init The headers to set for the request.
   */
  withExactHeaders(init: HeadersInit): PreparedRequest<Q, R>

  /**
   * Removes existing headers.
   * @param keys The name of the headers to remove.
   */
  withoutHeaders(...keys: string[]): PreparedRequest<Q, R>
}

/**
 * A custom HTTP request without request and response bodies.
 */
export interface EmptyPreparedRequest extends PreparedRequest<undefined, void> {
  send(): Promise<void>
  withHeaders(init: HeadersInit): EmptyPreparedRequest
  withAuth(auth: AuthScheme | string): EmptyPreparedRequest
  withExactHeaders(init: HeadersInit): EmptyPreparedRequest
  withoutHeaders(...keys: string[]): EmptyPreparedRequest
}

/**
 * A custom HTTP request with only a request body.
 */
export interface TxOnlyPreparedRequest<Q> extends PreparedRequest<Q, void> {
  withHeaders(init: HeadersInit): TxOnlyPreparedRequest<Q>
  withAuth(auth: AuthScheme | string): TxOnlyPreparedRequest<Q>
  withExactHeaders(init: HeadersInit): TxOnlyPreparedRequest<Q>
  withoutHeaders(...keys: string[]): TxOnlyPreparedRequest<Q>
}

/**
 * A custom HTTP request with only a response body.
 */
export interface RxOnlyPreparedRequest<R> extends PreparedRequest<undefined, R> {
  send(): Promise<R>
  withHeaders(init: HeadersInit): RxOnlyPreparedRequest<R>
  withAuth(auth: AuthScheme | string): RxOnlyPreparedRequest<R>
  withExactHeaders(init: HeadersInit): RxOnlyPreparedRequest<R>
  withoutHeaders(...keys: string[]): RxOnlyPreparedRequest<R>
}

export type SpecificRequestType<Init extends PreparedRequestInit<unknown, unknown>> =
  Init extends SymmetricPreparedRequestInit<infer T> ? PreparedRequest<T, T>
  : Init extends AsymmetricPreparedRequestInit<infer Q, infer R> ? PreparedRequest<Q, R>
  : Init extends RxOnlyPreparedRequestInit<infer Q> ? RxOnlyPreparedRequest<Q>
  : Init extends TxOnlyPreparedRequestInit<infer R> ? TxOnlyPreparedRequest<R>
  : EmptyPreparedRequest
