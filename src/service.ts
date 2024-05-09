import { UrlTemplate } from './url'
import type { CollectionResource, ResourceItemType, ResourceDescriptor } from './resources'
import { DefaultHttpClient, HttpClient } from '@module/backend'
import { LayeredResourceFactory } from '@module/resources/layered/factory'

export interface Service {}

export interface ServiceOptions {}

/**
 * @internal
 */
export class RestServiceImpl implements Service {
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
      descriptor: opts,
    })
  }
}

export function service(baseUrl: string | URL): Service {
  return new RestServiceImpl(new UrlTemplate(baseUrl, {}), new DefaultHttpClient())
}
