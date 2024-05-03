import { ResourceCache, ServiceCache } from '@module/resources/cache'
import { CacheStorage, ResourceCacheStorage } from '@module/backend'
import { Key } from '@module/resources'
import { OptionalSearchArgs } from '@module/resources/decorator'

class AlwaysRefreshGSC implements ServiceCache {
  private _storage: CacheStorage

  public constructor(storage: CacheStorage) {
    this._storage = storage
  }

  public async resource<T>(name: string): Promise<ResourceCache<T>> {
    return new AlwaysRefreshGRC(await this._storage.getResourceCache(name))
  }
}

class AlwaysRefreshGRC implements ResourceCache<any> {
  constructor(resourceCache: ResourceCacheStorage) {}

  onGet(key: Key, search: OptionalSearchArgs): Promise<T | undefined> {
    throw new Error('Method not implemented.')
  }

  onGetAll(search: OptionalSearchArgs): Promise<T[] | undefined> {
    throw new Error('Method not implemented.')
  }

  onSend(key: Key, item: T, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }

  onSendMany(keyAndItems: [Key, T][], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }

  onSave(key: Key, item: T, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onSaveMany(items: T[], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDelete(item: T, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteKey(key: Key, search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteMany(items: T[], search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  onDeleteAll(search: OptionalSearchArgs, result: Promise<void>): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
