import { Key, ResourceChain } from '@module/resources/index'
import { HttpClient } from '@module/backend/http'
import { UrlSearchArgs, UrlTemplate } from '@module/url'

export class ResourceHttpLayer<ItemType> extends ResourceChain<ItemType> {
  private _client: HttpClient
  private _urlTemplate: UrlTemplate
  private readonly _urlPath: string

  public constructor(keyProperty: keyof ItemType, client: HttpClient, baseUrl: UrlTemplate, path: string) {
    super(keyProperty)

    this._client = client
    this._urlTemplate = baseUrl
    this._urlPath = path
  }

  public get(key: Key, args?: UrlSearchArgs): ItemType {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, args ?? {})
    this._client.get(url)
  }
  public getAll(args?: UrlSearchArgs): ItemType[] {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, args ?? {})
  }
  public send(item: ItemType, args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public sendMany(items: ItemType[], args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public save(item: ItemType, args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public saveMany(items: ItemType[], args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public delete(item: ItemType, args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public deleteKey(key: Key, args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public deleteMany(items: ItemType[], args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
  public deleteAll(args?: UrlSearchArgs): void {
    throw new Error('Method not implemented.')
  }
}
