import type { CustomRequest, CustomRequestDescriptor, RequestType, ResponseType } from '.'
import {
  GenericDeleteRequest,
  GenericGetRequest,
  GenericPostRequest,
  GenericPutRequest,
  OptionalMapper,
} from './generic'
import { DefaultHttpClient, HttpClient } from '@module/backend'
import { UrlTemplate } from '@module/url'
import { Mapper } from '@module/resources/mappers'

export class RequestFactory {
  public static makeGetRequest<Opts extends CustomRequestDescriptor>(
    baseUrl: UrlTemplate,
    client: HttpClient,
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return new GenericGetRequest(
      client,
      baseUrl,
      options.path,
      this.makeRequestMapper(options),
      this.makeResponseMapper(options),
    )
  }

  public static makePostRequest<Opts extends CustomRequestDescriptor>(
    baseUrl: UrlTemplate,
    client: HttpClient,
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return new GenericPostRequest(
      client,
      baseUrl,
      options.path,
      this.makeRequestMapper(options),
      this.makeResponseMapper(options),
    )
  }

  public static makePutRequest<Opts extends CustomRequestDescriptor>(
    baseUrl: UrlTemplate,
    client: HttpClient,
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return new GenericPutRequest(
      client,
      baseUrl,
      options.path,
      this.makeRequestMapper(options),
      this.makeResponseMapper(options),
    )
  }

  public static makeDeleteRequest<Opts extends CustomRequestDescriptor>(
    baseUrl: UrlTemplate,
    client: HttpClient,
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return new GenericDeleteRequest(
      client,
      baseUrl,
      options.path,
      this.makeRequestMapper(options),
      this.makeResponseMapper(options),
    )
  }

  private static makeRequestMapper<T>(options: CustomRequestDescriptor): OptionalMapper<T> {
    let mapper = undefined

    if (options.request !== undefined) {
      mapper = new Mapper(options.request)
    } else if (options.requestAndResponse !== undefined) {
      mapper = new Mapper(options.requestAndResponse)
    }

    return mapper as OptionalMapper<T>
  }

  private static makeResponseMapper<T>(options: CustomRequestDescriptor): OptionalMapper<T> {
    let mapper = undefined

    if (options.response !== undefined) {
      mapper = new Mapper(options.response)
    } else if (options.requestAndResponse !== undefined) {
      mapper = new Mapper(options.requestAndResponse)
    }

    return mapper as OptionalMapper<T>
  }
}
