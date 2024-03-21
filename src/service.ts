import ResourceUrl from "./resourceUrl";
import { FetchHttpClient, HttpClient } from "./backend/http";
import { Resource, ResourceItemType, ResourceDescriptor } from "./resource";

export interface Service {}

/**
 * @internal
 */
export class RestServiceImpl implements Service {
  private readonly _baseUrl: ResourceUrl;
  private readonly _client: HttpClient;

  public constructor(baseUrl: ResourceUrl, client: HttpClient) {
    this._baseUrl = baseUrl;
    this._client = client;
  }

  public resource<Opts extends ResourceDescriptor>(
    options: Opts,
  ): Resource<ResourceItemType<Opts>> {
    return {};
  }
}

export function service(baseUrl: string | URL): Service {
  return new RestServiceImpl(new ResourceUrl(baseUrl), new FetchHttpClient());
}
