import { ServiceCache } from '@module/resources/cache'
import { CacheStorage } from '@module/backend'
import { AlwaysRefreshGSC } from './alwaysRefresh'
import { NoGSC } from './noCache'

class GenericCache_ {
  private readonly _storage: CacheStorage

  public constructor(storage: CacheStorage) {
    this._storage = storage
  }

  public get AlwaysRefresh(): ServiceCache {
    return new AlwaysRefreshGSC(this._storage)
  }

  public get None(): ServiceCache {
    return new NoGSC()
  }

  public get RollbackOnError(): ServiceCache {
    return new RollbackOnErrorGSC(this._storage)
  }

  public get WaitForSuccess(): ServiceCache {
    return new WaitForSuccessGSC(this._storage)
  }
}
