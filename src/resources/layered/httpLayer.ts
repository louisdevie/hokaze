import type { Key } from '../index'
import { OptionalSearchArgs } from '../helpers'
import { CreationResult, HttpClient } from '@module/backend'
import { UrlTemplate } from '@module/url'
import { AsyncFeedback } from '@module/feedback'
import { RawSendAndReceive, ResourceRequestPath } from './abstractLayers'
import { RequestPathInit } from '@module/requestPath'

/**
 * @internal
 */
export class HttpLayer implements RawSendAndReceive, ResourceRequestPath {
  private readonly _client: HttpClient
  private readonly _urlTemplate: UrlTemplate
  private readonly _urlPath: string

  public constructor(client: HttpClient, baseUrl: UrlTemplate, path: string) {
    this._client = client
    this._urlTemplate = baseUrl
    this._urlPath = path
  }

  public get forResource(): RequestPathInit {
    return {
      httpClient: this._client,
      baseUrl: new UrlTemplate(this._urlTemplate.getUrlForResource(this._urlPath, {}), {}),
    }
  }

  public forItem(key: Key): RequestPathInit {
    return {
      httpClient: this._client,
      baseUrl: new UrlTemplate(this._urlTemplate.getUrlForItem(this._urlPath, key, {}), {}),
    }
  }

  public get requestPath(): ResourceRequestPath {
    return this
  }

  public async getOne(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<unknown>> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    return new AsyncFeedback(await this._client.getJson(url))
  }

  public async getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<unknown>> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    return new AsyncFeedback(await this._client.getJson(url))
  }

  public async saveNew(dto: unknown, search: OptionalSearchArgs): Promise<CreationResult> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    return await this._client.postJson(url, dto)
  }

  public async saveExisting(dto: unknown, key: Key, search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    await this._client.putJson(url, dto)
  }

  public async saveAll(dto: unknown, search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    await this._client.putJson(url, dto)
  }

  public async deleteOne(key: Key, search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    await this._client.delete(url)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    await this._client.delete(url)
  }
}
