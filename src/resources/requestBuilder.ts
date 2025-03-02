import { CreationResult, HttpClient, RequestBodyOrParams, ResponseBody } from '@module/backend'
import { DefaultRequestPath, RequestPath } from '@module/requestPath'
import { Key, ResourceRequestPath } from '@module/resources/index'
import { UrlSearchArgs, UrlTemplate } from '@module/url'

export class ResourceRequestBuilder implements ResourceRequestPath {
  private readonly _client: HttpClient
  private readonly _urlTemplate: UrlTemplate
  private readonly _resourceName: string

  public constructor(client: HttpClient, baseUrl: UrlTemplate, resourceName: string) {
    this._client = client
    this._urlTemplate = baseUrl
    this._resourceName = resourceName
  }

  public get resourcePath(): RequestPath {
    return new DefaultRequestPath({
      httpClient: this._client,
      baseUrl: new UrlTemplate(this._urlTemplate.getUrlForResource(this._resourceName, {})),
    })
  }

  /* FEATURE "DYNAMIC REQUEST PATHS" NOT SUPPORTED YET
  public itemPath(key: Key): RequestPathInit {
    return {
      httpClient: this._client,
      baseUrl: new UrlTemplate(this._urlTemplate.getUrlForItem(this._resourceName, key, {})),
    }
  }*/

  public getOne(key: Key, expectedResponseType: string): Promise<ResponseBody> {
    const url = this._urlTemplate.getUrlForItem(this._resourceName, key, {})
    return this._client.get(url, expectedResponseType)
  }

  public getAll(expectedResponseType: string, search?: UrlSearchArgs): Promise<ResponseBody> {
    const url = this._urlTemplate.getUrlForResource(this._resourceName, search ?? {})
    return this._client.get(url, expectedResponseType)
  }

  public saveNew(dto: RequestBodyOrParams, expectedResponseType: string): Promise<CreationResult> {
    const url = this._urlTemplate.getUrlForResource(this._resourceName, {})
    return this._client.post(url, dto, expectedResponseType)
  }

  public async saveExisting(dto: RequestBodyOrParams, key: Key, expectedResponseType: string): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._resourceName, key, {})
    await this._client.put(url, dto, expectedResponseType)
  }

  public async saveAll(dto: RequestBodyOrParams, expectedResponseType: string): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._resourceName, {})
    await this._client.put(url, dto, expectedResponseType)
  }

  public async deleteOne(key: Key, expectedResponseType: string): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._resourceName, key, {})
    await this._client.delete(url, expectedResponseType)
  }

  public async deleteAll(expectedResponseType: string, search?: UrlSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._resourceName, search ?? {})
    await this._client.delete(url, expectedResponseType)
  }
}
