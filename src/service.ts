import { UrlTemplate } from './url'
import type { CollectionResource, ResourceItemType, ResourceDescriptor, SingleResource } from './resources'
import { DefaultHttpClient, HttpClient } from '@module/backend'
import { LayeredResourceFactory } from '@module/resources/layered/factory'
import { CustomRequest, CustomRequestDescriptor, RequestType, ResponseType } from '@module/requests'
import { RequestFactory } from '@module/requests/factory'

export interface Service {
  collection<Opts extends ResourceDescriptor>(options: Opts): CollectionResource<ResourceItemType<Opts>>

  single<Opts extends ResourceDescriptor>(options: Opts): SingleResource<ResourceItemType<Opts>>

  getRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  putRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  deleteRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>>

  postRequest<Opts extends CustomRequestDescriptor>(options: Opts): CustomRequest<RequestType<Opts>, ResponseType<Opts>>
}

export interface ServiceOptions {
  baseUrl: string | URL
}

/**
 * @internal
 */
class RestServiceImpl implements Service {
  private readonly _baseUrl: UrlTemplate
  private readonly _client: HttpClient

  public constructor(baseUrl: UrlTemplate, client: HttpClient) {
    this._baseUrl = baseUrl
    this._client = client
  }

  public collection<Opts extends ResourceDescriptor>(options: Opts): CollectionResource<ResourceItemType<Opts>> {
    return LayeredResourceFactory.makeCollectionResource({
      baseUrl: this._baseUrl,
      httpClient: this._client,
      descriptor: options,
    })
  }

  public single<Opts extends ResourceDescriptor>(options: Opts): SingleResource<ResourceItemType<Opts>> {
    return LayeredResourceFactory.makeSingleResource({
      baseUrl: this._baseUrl,
      httpClient: this._client,
      descriptor: options,
    })
  }

  public getRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makeGetRequest(this._baseUrl, this._client, options)
  }

  public postRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makePostRequest(this._baseUrl, this._client, options)
  }

  public putRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makePutRequest(this._baseUrl, this._client, options)
  }

  public deleteRequest<Opts extends CustomRequestDescriptor>(
    options: Opts,
  ): CustomRequest<RequestType<Opts>, ResponseType<Opts>> {
    return RequestFactory.makeDeleteRequest(this._baseUrl, this._client, options)
  }
}

export function service(init: string | URL | ServiceOptions): Service {
  if (typeof init === 'string' || init instanceof URL) {
    init = { baseUrl: init }
  }

  return new RestServiceImpl(new UrlTemplate(init.baseUrl, {}), new DefaultHttpClient())
}
