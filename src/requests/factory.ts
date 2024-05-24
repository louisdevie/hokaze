import type { CustomRequest, CustomRequestDescriptor, RequestType, ResponseType } from '.'
import {
  GenericDeleteRequest,
  GenericGetRequest,
  GenericPostRequest,
  GenericPutRequest,
  OptionalMapper,
} from './generic'
import { HttpClient } from '@module/backend'
import { UrlTemplate } from '@module/url'
import { Mapper } from '@module/resources/mappers'

export function makeGetRequest<Opts extends CustomRequestDescriptor>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  options: Opts,
): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
  return new GenericGetRequest(client, baseUrl, options.path, makeRequestMapper(options), makeResponseMapper(options))
}

export function makePostRequest<Opts extends CustomRequestDescriptor>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  options: Opts,
): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
  return new GenericPostRequest(client, baseUrl, options.path, makeRequestMapper(options), makeResponseMapper(options))
}

export function makePutRequest<Opts extends CustomRequestDescriptor>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  options: Opts,
): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
  return new GenericPutRequest(client, baseUrl, options.path, makeRequestMapper(options), makeResponseMapper(options))
}

export function makeDeleteRequest<Opts extends CustomRequestDescriptor>(
  baseUrl: UrlTemplate,
  client: HttpClient,
  options: Opts,
): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
  return new GenericDeleteRequest(
    client,
    baseUrl,
    options.path,
    makeRequestMapper(options),
    makeResponseMapper(options),
  )
}

function makeRequestMapper<T>(options: CustomRequestDescriptor): OptionalMapper<T> {
  let mapper = undefined

  if (options.request !== undefined) {
    mapper = new Mapper(options.request)
  } else if (options.requestAndResponse !== undefined) {
    mapper = new Mapper(options.requestAndResponse)
  }

  return mapper as OptionalMapper<T>
}

function makeResponseMapper<T>(options: CustomRequestDescriptor): OptionalMapper<T> {
  let mapper = undefined

  if (options.response !== undefined) {
    mapper = new Mapper(options.response)
  } else if (options.requestAndResponse !== undefined) {
    mapper = new Mapper(options.requestAndResponse)
  }

  return mapper as OptionalMapper<T>
}
