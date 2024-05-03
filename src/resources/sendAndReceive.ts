import { Key, Manager, SendAndReceive } from '.'
import { HttpClient, PostResult } from '@module/backend'
import { UrlSearchArgs, UrlTemplate } from '@module/url'
import { Mapper } from './mappers'
import { ResourceCache } from './cache'
import __ from '@module/locale'

export class SendAndReceiveImpl<ItemType extends object> implements SendAndReceive<ItemType> {
  private readonly _manager: Manager<ItemType>
  private readonly _client: HttpClient
  private readonly _cache: ResourceCache<ItemType>
  private readonly _urlTemplate: UrlTemplate
  private readonly _urlPath: string
  private readonly _mapper: Mapper<any, ItemType>
  private _keyExtractionMethods: KeyExtractionMethod[]
  private _foundBestMethod: boolean

  public constructor(
    manager: Manager<ItemType>,
    cache: ResourceCache<ItemType>,
    client: HttpClient,
    baseUrl: UrlTemplate,
    path: string,
    mapper: Mapper<any, ItemType>,
  ) {
    this._manager = manager
    this._cache = cache
    this._client = client
    this._urlTemplate = baseUrl
    this._urlPath = path
    this._mapper = mapper

    this._keyExtractionMethods = [
      new ExtractFromObjectBody(mapper, manager.key as string),
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

  private tryToExtractId(postResult: PostResult): Key | undefined {
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

interface KeyExtractionMethod {
  tryToExtractKey(postResult: PostResult): Key | undefined
}

class ExtractFromObjectBody implements KeyExtractionMethod {
  private readonly _mapper: Mapper<any, any>
  private readonly _key: string

  public constructor(mapper: Mapper<any, any>, key: string) {
    this._mapper = mapper
    this._key = key
  }

  public tryToExtractKey(postResult: PostResult): Key | undefined {
    let keyFound = undefined

    if (typeof postResult.responseBody === 'object') {
      keyFound = this._mapper.tryToUnpackKey(postResult.responseBody, this._key).value
    }

    return keyFound
  }
}

class ExtractFromKeyBody implements KeyExtractionMethod {
  public tryToExtractKey(postResult: PostResult): Key | undefined {
    let keyFound = undefined

    if (typeof postResult.responseBody === 'string' || typeof postResult.responseBody === 'number') {
      keyFound = postResult.responseBody
    }

    return keyFound
  }
}

class ExtractFromLocationUrl implements KeyExtractionMethod {
  private readonly _plainResourceUrl: URL
  private readonly _keyTypeHint: 'string' | 'number'

  public constructor(plainResourceUrl: URL, keyTypeHint: 'string' | 'number') {
    this._plainResourceUrl = plainResourceUrl
    this._keyTypeHint = keyTypeHint
  }

  public tryToExtractKey(postResult: PostResult): Key | undefined {
    let keyFound = undefined

    if (postResult.location !== null) {
      try {
        const locationPath = new URL(postResult.location).pathname
        const resourcePath = this._plainResourceUrl.pathname + '/'

        if (locationPath.startsWith(resourcePath)) {
          const stringKey = locationPath.substring(resourcePath.length)
          const intKey = parseInt(stringKey)

          if (!isNaN(intKey) && this._keyTypeHint === 'number') {
            keyFound = intKey
          } else {
            keyFound = stringKey
          }
        }
      } catch {
        /* ignore TypeErrors when creating the location URL */
      }
    }

    return keyFound
  }
}
