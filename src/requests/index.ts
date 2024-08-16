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

export interface CustomRequest<Q, R> {
  send(request: Q): Promise<R>
}

export interface EmptyCustomRequest extends CustomRequest<undefined, void> {
  send(): Promise<void>
}

export interface TxOnlyCustomRequest<Q> extends CustomRequest<Q, void> {}

export interface RxOnlyCustomRequest<R> extends CustomRequest<undefined, R> {
  send(): Promise<R>
}

export type SpecificRequestType<Init extends CustomRequestInit<unknown, unknown>> =
  Init extends SymmetricCustomRequestInit<infer T> ? CustomRequest<T, T>
  : Init extends AsymmetricCustomRequestInit<infer Q, infer R> ? CustomRequest<Q, R>
  : Init extends RxOnlyCustomRequestInit<infer Q> ? RxOnlyCustomRequest<Q>
  : Init extends TxOnlyCustomRequestInit<infer R> ? TxOnlyCustomRequest<R>
  : EmptyCustomRequest
