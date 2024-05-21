import type {
  CollectionDescriptor,
  CollectionResource,
  ResourceDescriptor,
  ResourceItemType,
  ResourceType,
  SingleResource,
} from '@module/resources'
import { makeCollectionResource, makeSingleResource } from '@module/resources/layered/factory'
import { CustomRequest, CustomRequestDescriptor, RequestType, ResponseType } from '@module/requests'
import { RequestFactory } from '@module/requests/factory'
import { UrlTemplate } from '@module/url'
import { HttpClient } from '@module/backend'

export interface RequestPathInit {
  baseUrl: UrlTemplate
  httpClient: HttpClient
}

/**
 * A path base from which resources and requests can be created.
 */
export interface RequestPath {
  /**
   * Creates a "collection" resource.
   * @param options An object describing the resource.
   */
  collection<Opts extends CollectionDescriptor>(options: Opts): CollectionResource<ResourceItemType<Opts>>

  /**
   * Creates a "single" resource.
   * @param options An object describing the resource.
   */
  single<Opts extends ResourceDescriptor>(options: Opts): SingleResource<ResourceType<Opts>>

  /**
   * Crates a custom GET request.
   * @param options An object describing the endpoint.
   */
  getRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  /**
   * Crates a custom POST request.
   * @param options An object describing the endpoint.
   */
  postRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  /**
   * Crates a custom PUT request.
   * @param options An object describing the endpoint.
   */
  putRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  /**
   * Crates a custom DELETE request.
   * @param options An object describing the endpoint.
   */
  deleteRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>>
}

/**
 * An implementation of {@link RequestPath} that uses the default factories.
 *
 * @internal
 */
export class DefaultRequestPath implements RequestPath {
  private readonly _baseUrl: UrlTemplate
  private readonly _httpClient: HttpClient

  public constructor(init: RequestPathInit) {
    this._baseUrl = init.baseUrl
    this._httpClient = init.httpClient
  }

  public collection<Opts extends CollectionDescriptor>(options: Opts): CollectionResource<ResourceItemType<Opts>> {
    return makeCollectionResource({
      baseUrl: this._baseUrl,
      httpClient: this._httpClient,
      descriptor: options,
    })
  }

  public single<Opts extends ResourceDescriptor>(options: Opts): SingleResource<ResourceType<Opts>> {
    return makeSingleResource({
      baseUrl: this._baseUrl,
      httpClient: this._httpClient,
      descriptor: options,
    })
  }

  public getRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makeGetRequest(this._baseUrl, this._httpClient, options)
  }

  public postRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makePostRequest(this._baseUrl, this._httpClient, options)
  }

  public putRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makePutRequest(this._baseUrl, this._httpClient, options)
  }

  public deleteRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makeDeleteRequest(this._baseUrl, this._httpClient, options)
  }
}
