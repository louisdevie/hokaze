import { PreparedRequestInit, SpecificRequestType } from '.'
import { HttpClient } from '../http'
import { PartialConfig } from '@module/config'
import { DataDescriptor } from '@module/data'
import { Mapper } from '@module/mappers'
import { UrlTemplate } from '@module/url'

interface GetRequestInit<R> extends PartialConfig {
  /**
   * The url of the request.
   */
  GET: string | URL

  /**
   * Describes the values received.
   */
  response?: DataDescriptor<R>
}

interface AsymmetricPostRequestInit<Q, R> extends PartialConfig {
  /**
   * The url of the request.
   */
  POST: string | URL

  /**
   * Describes the values sent.
   */
  request?: DataDescriptor<Q>

  /**
   * Describes the values received.
   */
  response?: DataDescriptor<R>
}

interface SymmetricPostRequestInit<T> extends PartialConfig {
  /**
   * The url of the request.
   */
  POST: string | URL

  /**
   * Describes both the values sent and received.
   */
  requestAndResponse: DataDescriptor<T>
}

interface AsymmetricPutRequestInit<Q, R> extends PartialConfig {
  /**
   * The url of the request.
   */
  PUT: string | URL

  /**
   * Describes the values sent.
   */
  request?: DataDescriptor<Q>

  /**
   * Describes the values received.
   */
  response?: DataDescriptor<R>
}

interface SymmetricPutRequestInit<T> extends PartialConfig {
  /**
   * The url of the request.
   */
  PUT: string | URL

  /**
   * Describes both the values sent and received.
   */
  requestAndResponse: DataDescriptor<T>
}

interface DeleteRequestInit<R> extends PartialConfig {
  /**
   * The url of the request.
   */
  DELETE: string | URL

  /**
   * Describes the values received.
   */
  response?: DataDescriptor<R>
}

interface AsymmetricCustomRequestInit<Q, R> extends PartialConfig {
  /**
   * The HTTP method to use.
   */
  method: string

  /**
   * The url of the request.
   */
  url: string | URL

  /**
   * Describes the values sent.
   */
  request?: DataDescriptor<Q>

  /**
   * Describes the values received.
   */
  response?: DataDescriptor<R>
}

interface SymmetricCustomRequestInit<T> extends PartialConfig {
  /**
   * The HTTP method to use.
   */
  method: string

  /**
   * The url of the request.
   */
  url: string | URL

  /**
   * Describes both the values sent and received.
   */
  requestAndResponse: DataDescriptor<T>
}

/**
 * Describes a stand-alone HTTP request.
 */
export type StandalonePreparedRequestInit<Q = any, R = any> =
  | GetRequestInit<R>
  | AsymmetricPostRequestInit<Q, R>
  | SymmetricPostRequestInit<Q & R>
  | AsymmetricPutRequestInit<Q, R>
  | SymmetricPutRequestInit<Q & R>
  | DeleteRequestInit<R>
  | AsymmetricCustomRequestInit<Q, R>
  | SymmetricCustomRequestInit<Q & R>

export function createRequest<Init extends StandalonePreparedRequestInit>(init: Init): SpecificRequestType<Init> {
  if ('GET' in init) {
    return new GenericPre()
  }
}

export function makeGetRequest<Q, R>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  init: CustomRequestInit<Q, R>,
): CustomRequest<Q, R> {
  return new GenericGetRequest({
    client,
    baseUrl,
    path: init.path,
    requestMapper: makeRequestMapper(init),
    responseMapper: makeResponseMapper(init),
  })
}

export function makePostRequest<Q, R>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  init: CustomRequestInit<Q, R>,
): CustomRequest<Q, R> {
  return new GenericPostRequest({
    client,
    baseUrl,
    path: init.path,
    requestMapper: makeRequestMapper(init),
    responseMapper: makeResponseMapper(init),
  })
}

export function makePutRequest<Q, R>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  init: CustomRequestInit<Q, R>,
): CustomRequest<Q, R> {
  return new GenericPutRequest({
    client,
    baseUrl,
    path: init.path,
    requestMapper: makeRequestMapper(init),
    responseMapper: makeResponseMapper(init),
  })
}

export function makeDeleteRequest<Q, R>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  init: CustomRequestInit<Q, R>,
): CustomRequest<Q, R> {
  return new GenericDeleteRequest({
    client,
    baseUrl,
    path: init.path,
    requestMapper: makeRequestMapper(init),
    responseMapper: makeResponseMapper(init),
  })
}

function makeRequestMapper<T>(init: CustomRequestInit<T, unknown>): Mapper<T> | null {
  let mapper = null

  if ('request' in init) {
    mapper = init.request.makeMapper()
  } else if ('requestAndResponse' in init) {
    mapper = init.requestAndResponse.makeMapper()
  }

  return mapper
}

function makeResponseMapper<T>(init: CustomRequestInit<unknown, T>): Mapper<T> | null {
  let mapper = null

  if ('response' in init) {
    mapper = init.response.makeMapper()
  } else if ('requestAndResponse' in init) {
    mapper = init.requestAndResponse.makeMapper()
  }

  return mapper
}
