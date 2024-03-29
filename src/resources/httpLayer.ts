import { Key, Manager } from '@module/resources/index'
import { ResourceChain } from './chain'
import { HttpClient, PostResult } from '@module/backend'
import { UrlSearchArgs, UrlTemplate } from '@module/url'
import { Mapper } from './mappers'

export class ResourceHttpLayer<ItemType extends object> extends ResourceChain<ItemType> {
  private readonly _client: HttpClient
  private readonly _urlTemplate: UrlTemplate
  private readonly _urlPath: string
  private readonly _mapper: Mapper<any, ItemType>

  public constructor(
    manager: Manager<ItemType>,
    client: HttpClient,
    baseUrl: UrlTemplate,
    path: string,
    mapper: Mapper<any, ItemType>,
  ) {
    super(manager)

    this._client = client
    this._urlTemplate = baseUrl
    this._urlPath = path
    this._mapper = mapper
  }

  public async get(key: Key, args?: UrlSearchArgs): Promise<ItemType> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, args ?? {})

    const dto = await this._client.getJson(url)

    const item = this._mapper.unpackItem(dto)
    if (!item.success) throw new Error(item.error)
    return item.value!
  }

  public async getAll(args?: UrlSearchArgs): Promise<ItemType[]> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, args ?? {})

    const dto = await this._client.getJson(url)

    const item = this._mapper.unpackItemsArray(dto)
    if (!item.success) throw new Error(item.error)
    return item.value!
  }

  public async send(item: ItemType, args?: UrlSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, args ?? {})

    const dto = this._mapper.packItem(item)
    if (!dto.success) throw new Error(dto.error)

    const postResult = await this._client.postJson(url, dto.value!)

    const id = this.tryToExtractId(postResult)
    if (id !== undefined) {
      item[this.manager.key] = id as any
    }
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

  private tryToExtractId(postResult: PostResult): Key | undefined {
    let keyFound = undefined

    if (typeof this.manager.key === 'string') {
      keyFound = this._mapper.tryToUnpackKey(postResult.responseBody, this.manager.key)
    }

    if (keyFound === undefined) {
      try {
        const locationPath = new URL(postResult.location).pathname
        const resourcePath = this._urlTemplate.getUrlForResource(this._urlPath, {}).pathname + '/'
        if (locationPath.startsWith(resourcePath)) {
          const stringKey = locationPath.substring(resourcePath.length)
          
        }
      } catch {}
    }
  }
}
