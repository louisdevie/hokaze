import { UrlTemplate } from './url'
import { FetchHttpClient, HttpClient } from './backend/http'
import { Resource, ResourceItemType, ResourceDescriptor } from './resources'

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

  public resource<Opts extends ResourceDescriptor>(options: Opts): Resource<ResourceItemType<Opts>> {
    return {}
  }
}

export function service(baseUrl: string | URL): Service {
  return new RestServiceImpl(new UrlTemplate(baseUrl, {}), new FetchHttpClient())
}
