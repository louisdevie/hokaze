import type { CacheStorage, ResourceCacheStorage } from '@module/backend/index'
import { Dexie, DexieOptions } from 'dexie'
import { Key } from '@module/resources'

interface DBProvider {
  factory: IDBFactory
  keyRange: DexieOptions['IDBKeyRange']
}

interface CacheStorageMetaBase {
  id?: number
  type: string
  tag: string
  version: number
}

enum CacheStatus {
  Invalid = 0,
  Fresh = 1,
  Outdated = 2,
}

interface CacheStorageMetaResource extends CacheStorageMetaBase {
  type: 'RES'
  globalStatus: CacheStatus
}

type CacheStorageMeta = CacheStorageMetaResource

interface CacheStorageSearch {
  id?: number
  query: string
  resourceId: number
  results: number[]
}

interface CacheStorageItem {
  id?: number
  primaryKey: Key
  resourceId: number
  status: CacheStatus
  object: object
}

export class DexieCacheStorage extends Dexie implements CacheStorage {
  public meta!: Dexie.Table<CacheStorageMeta>
  public search!: Dexie.Table<CacheStorageSearch>
  public data!: Dexie.Table<CacheStorageItem>

  public constructor(customProvider?: DBProvider) {
    super('eiktobel-cache', {
      indexedDB: customProvider?.factory,
      IDBKeyRange: customProvider?.keyRange,
    })

    this.version(1).stores({
      meta: '++id, &[type+tag]',
      search: '++id, &[query+resourceId]',
      data: '[primaryKey+resourceId], resourceId',
    })
  }

  public async init(): Promise<void> {}

  public async getResourceCache(name: string): Promise<ResourceCacheStorage> {
    const existingInfos = await this.meta.where('[type+tag]').equals(['RES', name]).first()

    let id
    if (existingInfos === undefined) {
      // create an entry for this resource
      id = await this.meta.add({ type: 'RES', tag: name, globalStatus: CacheStatus.Invalid, version: 0 })
    } else {
      id = existingInfos.id
    }

    if (typeof id !== 'number') {
      throw new Error(`invalid resource ID (type is '${typeof id}', value is ${JSON.stringify(id)})`)
    }

    return new DexieResourceCacheStorage(this, id)
  }
}

export class DexieResourceCacheStorage implements ResourceCacheStorage {
  private readonly _cache: DexieCacheStorage
  private readonly _resourceId: number

  public constructor(cache: DexieCacheStorage, resourceId: number) {
    this._cache = cache
    this._resourceId = resourceId
  }

  private lookupPrimaryKey(pk: Key): Promise<CacheStorageItem | undefined> {
    return this._cache.data.where('[primaryKey+resourceId]').equals([pk, this._resourceId]).first()
  }

  private async cacheIdForPrimaryKey(pk: Key): Promise<number | undefined> {
    return (await this.lookupPrimaryKey(pk))?.id
  }

  private async cacheIdsForPrimaryKeys(pks: Key[]): Promise<number[]> {
    const cacheIdsFound = await Promise.all(pks.map((key) => this.cacheIdForPrimaryKey(key)))
    return cacheIdsFound.filter((id) => id !== undefined) as number[]
  }

  public async isFresh(): Promise<boolean> {
    const infos = await this._cache.meta.get(this._resourceId)
    return infos?.globalStatus === CacheStatus.Fresh
  }

  public async hasAny(): Promise<boolean> {
    const infos = await this._cache.meta.get(this._resourceId)
    return infos !== undefined && infos.globalStatus !== CacheStatus.Invalid
  }

  public async markAsGloballyRefreshed(): Promise<void> {
    await this._cache.meta.update(this._resourceId, { globalStatus: CacheStatus.Fresh })
  }

  public async markAsGloballyOutdated(): Promise<void> {
    await this._cache.meta.update(this._resourceId, { globalStatus: CacheStatus.Outdated })
  }

  public async markAsGloballyInvalid(): Promise<void> {
    await this._cache.meta.update(this._resourceId, { globalStatus: CacheStatus.Invalid })
  }

  public async has(key: Key): Promise<boolean> {
    return (await this.lookupPrimaryKey(key)) !== undefined
  }

  public async hasFresh(key: Key): Promise<boolean> {
    const found = await this.lookupPrimaryKey(key)
    return found !== undefined && found.status === CacheStatus.Fresh
  }

  public async get(key: Key): Promise<any> {
    const entry = await this.lookupPrimaryKey(key)
    return entry?.object
  }

  public async getAll(): Promise<any[]> {
    const found = await this._cache.data.where('resourceId').equals(this._resourceId).toArray()
    return found.map((entry) => entry.object)
  }

  public async put(key: Key, value: any): Promise<void> {
    const existingId = await this.cacheIdForPrimaryKey(key)

    const newKey = await this._cache.data.put({
      id: existingId,
      primaryKey: key,
      resourceId: this._resourceId,
      status: CacheStatus.Fresh,
      object: value,
    })
  }

  public async putMany(entries: [Key, any][]): Promise<void> {
    const preparedEntries = await Promise.all(
      entries.map(async ([key, value]) => ({
        key,
        value,
        existingId: await this.cacheIdForPrimaryKey(key),
      })),
    )

    const newKeys = await this._cache.data.bulkPut(
      preparedEntries.map(({ key, value, existingId }) => ({
        id: existingId,
        primaryKey: key,
        resourceId: this._resourceId,
        status: CacheStatus.Fresh,
        object: value,
      })),
    )
  }

  private async changeStatusForOne(key: Key, status: CacheStatus): Promise<void> {
    await this._cache.data.where('[primaryKey+resourceId]').equals([key, this._resourceId]).modify({ status })
  }

  private async changeStatusForMany(keys: Key[], status: CacheStatus): Promise<void> {
    await this._cache.data
      .where('[primaryKey+resourceId]')
      .anyOf(keys.map((key) => [key, this._resourceId]))
      .modify({ status })
  }

  private async changeStatusForAll(status: CacheStatus): Promise<void> {
    await this._cache.data.where('resourceId').equals(this._resourceId).modify({ status })
  }

  public async makeOutdated(key: Key): Promise<void> {
    await this.changeStatusForOne(key, CacheStatus.Outdated)
  }

  public async makeManyOutdated(keys: Key[]): Promise<void> {
    await this.changeStatusForMany(keys, CacheStatus.Outdated)
  }

  public async makeAllOutdated(): Promise<void> {
    await this.changeStatusForAll(CacheStatus.Outdated)
  }

  public async invalidate(key: Key): Promise<void> {
    await this.changeStatusForOne(key, CacheStatus.Invalid)
  }

  public async invalidateMany(keys: Key[]): Promise<void> {
    await this.changeStatusForMany(keys, CacheStatus.Invalid)
  }

  public async invalidateAll(): Promise<void> {
    await this.changeStatusForAll(CacheStatus.Invalid)
  }
}
