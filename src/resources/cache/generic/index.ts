import { ServiceCache } from '@module/resources/cache'
import { CacheStorage } from '@module/backend'

class GenericCache_ {
  private readonly _storage: CacheStorage

  public constructor(storage: CacheStorage) {
    this._storage = storage
  }
}
