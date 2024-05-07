import { Key, SendAndReceive } from '.'
import { HttpClient, CreationResult } from '@module/backend'
import { UrlSearchArgs, UrlTemplate } from '@module/url'
import { Mapper } from './mappers'
import { ResourceCache } from './cache'
import __ from '@module/locale'
import { Manager } from '@module/resources/managers'

export interface Layers<ItemType extends object> {
  readonly manager: Manager<ItemType>
  readonly mapper: Mapper<any, ItemType>
  readonly cache: ResourceCache<ItemType>
  readonly client: HttpClient
}

export class SendAndReceiveImpl<ItemType extends object> implements SendAndReceive<ItemType> {
  private readonly _layers: Layers<ItemType>
  private readonly _urlTemplate: UrlTemplate
  private readonly _urlPath: string
  private _keyExtractionMethods: KeyExtractionMethod[]
  private _foundBestMethod: boolean

  public constructor(
    layers: Layers<ItemType>,
    baseUrl: UrlTemplate,
    path: string,
    mapper: Mapper<any, ItemType>,
  ) {
    this._layers = layers
    this._urlTemplate = baseUrl
    this._urlPath = path

    this._keyExtractionMethods = [
      new ExtractFromObjectBody(mapper, this._layers.manager.key as string),
      new ExtractFromKeyBody(),
      new ExtractFromLocationUrl(baseUrl.getUrlForResource(path, {}), manager.keyTypeHint),
    ]
    this._foundBestMethod = false
  }

  private static async forMany<T>(
    items: T[],
    operation: (item: T) => Promise<void>,
    errorMessage: string,
  ): Promise<void> {
    let foundErrors = false
    for (const item of items) {
      try {
        await operation(item)
      } catch (error) {
        console.error(error)
        foundErrors = true
      }
    }
    if (foundErrors) throw new Error(errorMessage)
  }

  public async get(key: Key, search?: UrlSearchArgs): Promise<ItemType> {
    const cachedResponse = await this._cache.beforeGet(key, search)

    if (cachedResponse !== undefined) {
      return cachedResponse
    } else {
      const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})

      const dto = await this._client.getJson(url)

      const item = this._mapper.unpackItem(dto)
      if (!item.success) throw new Error(item.error)

      await this._cache.afterGet(key, search, item.value!)
      return item.value!
    }
  }

  public async getAll(search?: UrlSearchArgs): Promise<ItemType[]> {
    const cachedResponse = await this._cache.beforeGetAll(search)

    if (cachedResponse !== undefined) {
      return cachedResponse
    } else {
      const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})

      const dto = await this._client.getJson(url)

      const item = this._mapper.unpackItemsArray(dto)
      if (!item.success) throw new Error(item.error)

      await this._cache.afterGetAll(search, item.value!)
      return item.value!
    }
  }

  public async send(item: ItemType, search?: UrlSearchArgs): Promise<void> {

  }

  public sendMany(items: ItemType[], search?: UrlSearchArgs): Promise<void> {
    const cacheTasks = []
    let foundErrors = false
    for (const item of items) {
      try {
        const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})

        const dto = this._mapper.packItem(item)
        if (!dto.success) {
          console.error(dto.error)
          foundErrors = true
        }

        const postResult = this._client.postJson(url, dto.value!)
        await this._cache.onSend(this._manager.getKeyOf(item), item, search, postResult as unknown as Promise<void>)

        const id = this.tryToExtractId(await postResult)
        if (id !== undefined) {
          this._manager.setKeyOf(item, id)
        }
      } catch (error)
    }
    if (foundErrors) throw new Error(__.errorSendMany)
  }

  public async save(item: ItemType, search?: UrlSearchArgs): Promise<void> {
    if (this._manager.isNew(item)) {
      await this.send(item, search)
    } else {
      const url = this._urlTemplate.getUrlForItem(this._urlPath, this._manager.getKeyOf(item), search ?? {})

      const dto = this._mapper.packItem(item)
      if (!dto.success) throw new Error(dto.error)

      await this._client.putJson(url, dto.value!)
    }
  }

  public saveMany(items: ItemType[], search?: UrlSearchArgs): Promise<void> {
    return SendAndReceiveImpl.forMany(items, (item) => this.save(item, search), __.errorSaveMany)
  }

  public delete(item: ItemType, search?: UrlSearchArgs): Promise<void> {
    return this.deleteKey(this._manager.getKeyOf(item), search)
  }

  public async deleteKey(key: Key, search?: UrlSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForItem(this._urlPath, key, search ?? {})

    await this._client.delete(url)
  }

  public deleteMany(items: ItemType[], search?: UrlSearchArgs): Promise<void> {
    return SendAndReceiveImpl.forMany(items, (item) => this.delete(item, search), __.errorDeleteMany)
  }

  public async deleteAll(search?: UrlSearchArgs): Promise<void> {
    const url = this._urlTemplate.getUrlForResource(this._urlPath, search ?? {})

    await this._client.delete(url)
  }

  private tryToExtractId(postResult: CreationResult): Key | undefined {
    let keyFound = undefined
    let i
    for (i = 0; i < this._keyExtractionMethods.length && keyFound === undefined; i++) {
      keyFound = this._keyExtractionMethods[i].tryToExtractKey(postResult)
    }

    if (keyFound !== undefined && !this._foundBestMethod) {
      // if we found a method that worked, move it to the start of the list
      this._keyExtractionMethods.unshift(this._keyExtractionMethods.splice(i - 1, 1)[0])
      this._foundBestMethod = true
    }

    return keyFound
  }
}

