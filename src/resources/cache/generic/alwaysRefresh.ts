import { ResourceCache, ServiceCache } from '@module/resources/cache'
import { CacheStorage, ResourceCacheStorage } from '@module/backend'
import { Key } from '@module/resources'
import { noArgs, OptionalSearchArgs } from '@module/resources/helpers'

export class AlwaysRefreshGSC implements ServiceCache {
  private _storage: CacheStorage
  private _isInit: boolean

  public constructor(storage: CacheStorage) {
    this._storage = storage
    this._isInit = false
  }

  public async resource<T>(name: string): Promise<ResourceCache<T>> {
    if (!this._isInit) {
      await this._storage.init()
      this._isInit = true
    }

    return new AlwaysRefreshGRC(await this._storage.getResourceCache(name))
  }
}

class AlwaysRefreshGRC implements ResourceCache<any> {
  private _storage: ResourceCacheStorage

  constructor(storage: ResourceCacheStorage) {
    this._storage = storage
  }

  public async beforeGet(key: Key, search: OptionalSearchArgs): Promise<any> {
    if (noArgs(search) && (await this._storage.hasFresh(key))) {
      return this._storage.get(key)
    }
  }

  public async afterGet(key: Key, search: OptionalSearchArgs, result: any): Promise<void> {
    if (noArgs(search) && (await this._storage.hasFresh(key))) {
      return this._storage.get(key)
    }
  }

  public async beforeGetAll(search: OptionalSearchArgs): Promise<any[] | undefined> {
    if (noArgs(search)) {
      if (await this._storage.isFresh()) {
        return this._storage.getAll()
      }
    } else {
      if (await this._storage.isFresh()) {
      }
    }
  }

  public async onSend(key: Key, _: any, _: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    await this._storage.invalidate(key)
  }

  onSendMany(keyAndItems: [Key, any][], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }

  onSave(key: Key, item: any, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onSaveMany(items: any[], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDelete(item: any, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteKey(key: Key, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteMany(items: any[], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteAll(search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
