import { AuthScheme } from '@module/auth'
import { DataDescriptor } from '@module/data'

export interface EmptyCustomRequestInit {
  /**
   * The name of the resource as it appears in the URL.
   */
  path: string
}

export interface TxOnlyCustomRequestInit<Q> extends EmptyCustomRequestInit {
  /**
   * Describes the values sent.
   */
  request: DataDescriptor<Q>
}

export interface RxOnlyCustomRequestInit<R> extends EmptyCustomRequestInit {
  /**
   * Describes the values received.
   */
  response: DataDescriptor<R>
}

export interface AsymmetricCustomRequestInit<Q, R> extends TxOnlyCustomRequestInit<Q>, RxOnlyCustomRequestInit<R> {}

export interface SymmetricCustomRequestInit<T> extends EmptyCustomRequestInit {
  /**
   * Describes both the values sent and received.
   */
  requestAndResponse: DataDescriptor<T>
}

/**
 * Describes a custom request.
 */
export type CustomRequestInit<Q, R> =
  | EmptyCustomRequestInit
  | TxOnlyCustomRequestInit<Q>
  | RxOnlyCustomRequestInit<R>
  | AsymmetricCustomRequestInit<Q, R>
  | SymmetricCustomRequestInit<Q & R>

/**
 * A custom HTTP request.
 */
export interface CustomRequest<Q, R> {
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
  withHeaders(init: HeadersInit): CustomRequest<Q, R>

  /**
   * Appends authorization headers to the request.
   * @param auth An {@link AuthScheme} to use for this request, or a string to put in the `Authorization` header.
   */
  withAuth(auth: AuthScheme | string): CustomRequest<Q, R>

  /**
   * Sets the headers to send alongside the request, replacing all the existing headers.
   * @param init The headers to set for the request.
   */
  withExactHeaders(init: HeadersInit): CustomRequest<Q, R>

  /**
   * Removes existing headers.
   * @param keys The name of the headers to remove.
   */
  withoutHeaders(...keys: string[]): CustomRequest<Q, R>
}

/**
 * A custom HTTP request without request and response bodies.
 */
export interface EmptyCustomRequest extends CustomRequest<undefined, void> {
  send(): Promise<void>
  withHeaders(init: HeadersInit): EmptyCustomRequest
  withAuth(auth: AuthScheme | string): EmptyCustomRequest
  withExactHeaders(init: HeadersInit): EmptyCustomRequest
  withoutHeaders(...keys: string[]): EmptyCustomRequest
}

/**
 * A custom HTTP request with only a request body.
 */
export interface TxOnlyCustomRequest<Q> extends CustomRequest<Q, void> {
  withHeaders(init: HeadersInit): TxOnlyCustomRequest<Q>
  withAuth(auth: AuthScheme | string): TxOnlyCustomRequest<Q>
  withExactHeaders(init: HeadersInit): TxOnlyCustomRequest<Q>
  withoutHeaders(...keys: string[]): TxOnlyCustomRequest<Q>
}

/**
 * A custom HTTP request with only a response body.
 */
export interface RxOnlyCustomRequest<R> extends CustomRequest<undefined, R> {
  send(): Promise<R>
  withHeaders(init: HeadersInit): RxOnlyCustomRequest<R>
  withAuth(auth: AuthScheme | string): RxOnlyCustomRequest<R>
  withExactHeaders(init: HeadersInit): RxOnlyCustomRequest<R>
  withoutHeaders(...keys: string[]): RxOnlyCustomRequest<R>
}

export type SpecificRequestType<Init extends CustomRequestInit<unknown, unknown>> =
  Init extends SymmetricCustomRequestInit<infer T> ? CustomRequest<T, T>
  : Init extends AsymmetricCustomRequestInit<infer Q, infer R> ? CustomRequest<Q, R>
  : Init extends RxOnlyCustomRequestInit<infer Q> ? RxOnlyCustomRequest<Q>
  : Init extends TxOnlyCustomRequestInit<infer R> ? TxOnlyCustomRequest<R>
  : EmptyCustomRequest
