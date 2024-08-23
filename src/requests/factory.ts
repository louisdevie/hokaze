import { CustomRequest, CustomRequestInit } from '.'
import { UrlTemplate } from '@module/url'
import { HttpClient } from '@module/backend'
import { GenericDeleteRequest, GenericGetRequest, GenericPostRequest, GenericPutRequest } from './generic'
import { Mapper } from '@module/mappers'

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
