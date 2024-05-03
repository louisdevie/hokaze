import { ResourceCache, ServiceCache } from '@module/resources/cache'
import { CacheStorage } from '@module/backend'
import { Key } from '@module/resources'
import { OptionalSearchArgs } from '@module/resources/decorator'

/**
 * Different modes for the embedded cache system.
 */
export enum GenericCacheMode {
  /**
   * When you make requests to modify data, the cache is invalidated. This is useful if the data returned by the API
   * changes often, and you want to stay in sync.
   */
  AlwaysRefresh = 'AR',

  /**
   * When you make requests to modify data, the cache is marked as outdated but kept. The modifications are applied to
   * the cache once a successful response is received from the API.
   */
  WaitForSuccess = 'WS',

  /**
   * When you make requests to modify data, the cache is marked as outdated but kept. The modifications are applied to
   * the cache immediately, and rolled back if an error is received from the API.
   */
  RollbackOnError = 'RE',
}

class GenericServiceCache implements ServiceCache {
  private _storage: CacheStorage

  public constructor(storage: CacheStorage) {
    this._storage = storage
  }

  public resource<T>(name: string): ResourceCache<T> {
    return new GenericResourceCache()
  }
}

class GenericResourceCache<T> implements ResourceCache<T> {
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
