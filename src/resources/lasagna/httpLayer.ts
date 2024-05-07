import { Key } from '../index'
import { OptionalSearchArgs } from '../helpers'
import { HttpClient, CreationResult } from '@module/backend'
import { UrlTemplate } from '@module/url'
import { AsyncFeedback } from '@module/feedback'

/**
 * A lower-level version of {@link SendAndReceive} that deals directly with DTOs.
 */
export interface RawSendAndReceive {
  get(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<any>>
  getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<any[]>>
  saveNew(dto: any, search: OptionalSearchArgs): Promise<AsyncFeedback<CreationResult>>
  saveExisting(dto: any, key: Key, search: OptionalSearchArgs): Promise<void>
  deleteKey(key: Key, search: OptionalSearchArgs): Promise<void>
  deleteAll(search: OptionalSearchArgs): Promise<void>
}

export class HttpLayer implements RawSendAndReceive {
  private readonly _client: HttpClient
  private readonly _urlTemplate: UrlTemplate
  private readonly _urlPath: string

  public constructor(client: HttpClient, baseUrl: UrlTemplate, path: string) {
    this._client = client
    this._urlTemplate = baseUrl
    this._urlPath = path
  }

  public async get(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<any>> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    return new AsyncFeedback(await this._client.getJson(url))
  }

  public async getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<any[]>> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    return new AsyncFeedback(await this._client.getJson(url))
  }

  public async saveNew(dto: any, search: OptionalSearchArgs): Promise<AsyncFeedback<CreationResult>> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    return new AsyncFeedback(await this._client.postJson(url, dto))
  }

  public async saveExisting(dto: any, key: Key, search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    await this._client.putJson(url, dto)
  }

  public async deleteKey(key: Key, search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})
    await this._client.delete(url)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})
    await this._client.delete(url)
  }
}
