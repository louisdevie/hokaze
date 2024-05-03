import { DexieCacheStorage, DexieResourceCacheStorage } from '@module/backend/dexie'
import { IDBFactory, IDBKeyRange, indexedDB } from 'fake-indexeddb'
import { Dexie, Transaction } from 'dexie'
import { ResourceCacheStorage } from '@module/backend'

function makeCacheStorage(factory?: IDBFactory): DexieCacheStorage {
  return new DexieCacheStorage({ factory: factory ?? indexedDB, keyRange: IDBKeyRange })
}

async function dumpTable(tableName: string, factory?: IDBFactory): Promise<any[]> {
  const dexie = new Dexie('eiktobel-cache', { indexedDB: factory ?? indexedDB, IDBKeyRange, allowEmptyDB: false })

  let open
  try {
    await dexie.open()
    open = true
  } catch (err) {
    if (err && (err as any).name === 'NoSuchDatabaseError') {
      open = false
    } else {
      throw err
    }
  }

  let result: any[] = []
  if (open) {
    await dexie.transaction('r', tableName, async (transaction) => {
      result = await transaction.table(tableName).toArray()
    })
  }

  return result
}

async function findMeta(tag: string, factory?: IDBFactory): Promise<any> {
  const dexie = new Dexie('eiktobel-cache', { indexedDB: factory ?? indexedDB, IDBKeyRange, allowEmptyDB: false })

  await dexie.open()

  let result = undefined
  await dexie.transaction('r', 'meta', async (transaction) => {
    result = await transaction.table('meta').where('[type+tag]').equals(['RES', tag]).first()
  })

  if (result === undefined) throw new Error(`could not find meta RES:${tag}`)
  return result
}

async function findMetaKey(tag: string, factory?: IDBFactory): Promise<number> {
  return (await findMeta(tag, factory))?.id
}

async function rwTransaction(
  tableName: string,
  scope: (transaction: Transaction) => Promise<void>,
  factory?: IDBFactory,
): Promise<void> {
  const dexie = new Dexie('eiktobel-cache', { indexedDB: factory ?? indexedDB, IDBKeyRange, allowEmptyDB: false })

  await dexie.open()
  await dexie.transaction('rw', tableName, scope)
}

beforeAll(async () => {
  await makeCacheStorage().getResourceCache('_init')
  const resourceId = await findMetaKey('_init')
  await rwTransaction('data', async (t) => {
    await t.table('data').add(
      // some other resource, should not be matched by ResourceCacheStorage methods
      { primaryKey: 3, resourceId, status: 'F', object: null },
    )
  })
})

describe('getResourceCache', () => {
  test('returns identical objects for identical resource names', async () => {
    const cache = makeCacheStorage()

    expect(await cache.getResourceCache('A')).toEqual(await cache.getResourceCache('A'))
    expect(await cache.getResourceCache('A')).not.toEqual(await cache.getResourceCache('B'))
  })

  test('creates an entry in the meta table on the first call', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const initialMeta = await dumpTable('meta', db)
    expect(initialMeta).toEqual([])

    await cache.getResourceCache('A')

    const metaAfterFirstCall = await dumpTable('meta', db)
    expect(metaAfterFirstCall).toMatchObject([{ type: 'RES', tag: 'A', globalStatus: 'X' }])

    await cache.getResourceCache('A')

    const metaAfterSecondCall = await dumpTable('meta', db)
    expect(metaAfterSecondCall).toEqual(metaAfterFirstCall)
  })
})

describe('isFresh and hasAny', () => {
  test('both return false if the resource cache has somehow not been initialized', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const resCache = new DexieResourceCacheStorage(cache, 327)

    await expect(resCache.isFresh()).resolves.toBeFalse()
    await expect(resCache.hasAny()).resolves.toBeFalse()
  })

  test('both return true if the resource is tagged as fresh', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const resCache = await cache.getResourceCache('A')
    const resCacheKey = await findMetaKey('A', db)

    await rwTransaction(
      'meta',
      async (t) => {
        await t.table('meta').update(resCacheKey, { globalStatus: 'F' })
      },
      db,
    )

    await expect(resCache.isFresh()).resolves.toBeTrue()
    await expect(resCache.hasAny()).resolves.toBeTrue()
  })

  test('return false and true respectively if the resource is tagged as outdated', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const resCache = await cache.getResourceCache('A')
    const resCacheKey = await findMetaKey('A', db)

    await rwTransaction(
      'meta',
      async (t) => {
        await t.table('meta').update(resCacheKey, { globalStatus: 'O' })
      },
      db,
    )

    await expect(resCache.isFresh()).resolves.toBeFalse()
    await expect(resCache.hasAny()).resolves.toBeTrue()
  })

  test('both return false if the resource is tagged as invalidated', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const resCache = await cache.getResourceCache('A')
    const resCacheKey = await findMetaKey('A', db)

    await rwTransaction(
      'meta',
      async (t) => {
        await t.table('meta').update(resCacheKey, { globalStatus: 'X' })
      },
      db,
    )

    await expect(resCache.isFresh()).resolves.toBeFalse()
    await expect(resCache.hasAny()).resolves.toBeFalse()
  })
})

describe('markAsGlobally* methods', () => {
  test('change the status in the resource metadata', async () => {
    const db = new IDBFactory()
    const cache = makeCacheStorage(db)

    const resCache = await cache.getResourceCache('A')

    await resCache.markAsGloballyRefreshed()
    await expect(findMeta('A', db)).resolves.toMatchObject({ globalStatus: 'F' })

    await resCache.markAsGloballyInvalid()
    await expect(findMeta('A', db)).resolves.toMatchObject({ globalStatus: 'X' })

    await resCache.markAsGloballyOutdated()
    await expect(findMeta('A', db)).resolves.toMatchObject({ globalStatus: 'O' })
  })
})

describe('has and hasFresh', () => {
  let cache: DexieCacheStorage
  let resourceCache: ResourceCacheStorage
  let resourceId: number

  beforeAll(async () => {
    cache = makeCacheStorage()
    resourceCache = await cache.getResourceCache('has_test')
    resourceId = await findMetaKey('has_test')

    await rwTransaction('data', async (t) => {
      await t.table('data').bulkAdd([
        { primaryKey: 1, resourceId, status: 'F', object: null },
        { primaryKey: 2, resourceId, status: 'O', object: null },
      ])
    })
  })

  test('both return true if there is a fresh matching entry', async () => {
    await expect(resourceCache.has(1)).resolves.toBeTrue()
    await expect(resourceCache.hasFresh(1)).resolves.toBeTrue()
  })

  test('both return false if there is no matching entry', async () => {
    await expect(resourceCache.has(3)).resolves.toBeFalse()
    await expect(resourceCache.hasFresh(3)).resolves.toBeFalse()
  })

  test('return true and false respectively if there is an outdated matching entry', async () => {
    await expect(resourceCache.has(2)).resolves.toBeTrue()
    await expect(resourceCache.hasFresh(2)).resolves.toBeFalse()
  })
})

describe('get and getAll', () => {
  let cache: DexieCacheStorage
  let resourceCache: ResourceCacheStorage
  let resourceId: number

  beforeAll(async () => {
    cache = makeCacheStorage()
    resourceCache = await cache.getResourceCache('get_test')
    resourceId = await findMetaKey('get_test')

    await rwTransaction('data', async (t) => {
      await t.table('data').bulkAdd([
        { primaryKey: 1, resourceId, status: 'F', object: { id: 1, series: 'OT', volume: 1, arc: 'Index' } },
        { primaryKey: 2, resourceId, status: 'O', object: { id: 2, series: 'OT', volume: 2, arc: 'Deep Blood' } },
        { primaryKey: 3, resourceId, status: 'F', object: { id: 3, series: 'OT', volume: 3, arc: 'Sisters' } },
      ])
    })
  })

  test('returns the objects of matching entries', async () => {
    const fresh = await resourceCache.get(1)
    expect(fresh).toEqual({ id: 1, series: 'OT', volume: 1, arc: 'Index' })

    const outdated = await resourceCache.get(2)
    expect(outdated).toEqual({ id: 2, series: 'OT', volume: 2, arc: 'Deep Blood' })

    const all = await resourceCache.getAll()
    expect(all).toEqual([
      { id: 1, series: 'OT', volume: 1, arc: 'Index' },
      { id: 2, series: 'OT', volume: 2, arc: 'Deep Blood' },
      { id: 3, series: 'OT', volume: 3, arc: 'Sisters' },
    ])
  })

  test('get returns undefined if there is no matching entry', async () => {
    await expect(resourceCache.get(4)).resolves.toBeUndefined()
  })
})

describe('put and putMany', () => {
  let cache: DexieCacheStorage
  let resourceCache: ResourceCacheStorage
  let resourceId: number

  beforeAll(async () => {
    cache = makeCacheStorage()
    resourceCache = await cache.getResourceCache('put_test')
    resourceId = await findMetaKey('put_test')
  })

  test('add or update entries', async () => {
    const dataBefore = await dumpTable('data')
    expect(dataBefore).not.toPartiallyContain({ primaryKey: 1, resourceId })

    const location1 = { id: 1, district: 21, name: 'Ground Geo', type: 'Power staton' }
    await resourceCache.put(location1.id, location1)

    const dataAfterPut = await dumpTable('data')
    expect(dataAfterPut).toIncludeAllPartialMembers([{ primaryKey: 1, resourceId, object: location1 }])

    expect(dataAfterPut).not.toPartiallyContain({ primaryKey: 2, resourceId })
    expect(dataAfterPut).not.toPartiallyContain({ primaryKey: 3, resourceId })

    const location2 = { id: 2, district: 7, name: 'Pizza Hut', type: 'Restaurants and Cafes' }
    const location3 = { id: 3, district: 10, name: 'Graveyard Toweer', type: 'Infrastructure' }
    await resourceCache.putMany([
      [location2.id, location2],
      [location3.id, location3],
    ])

    const dataAfterPutMany = await dumpTable('data')
    expect(dataAfterPutMany).toIncludeAllPartialMembers([
      { primaryKey: 2, resourceId, object: location2 },
      { primaryKey: 3, resourceId, object: location3 },
    ])

    // putting the items again should update the entry instead of creating new ones

    // fixing typos...
    location1.type = 'Power station'
    location3.name = 'Graveyard Tower'
    await resourceCache.put(location1.id, location1)
    await resourceCache.putMany([[location3.id, location3]])

    // still 3 items
    const dataAfterPutAgain = await dumpTable('data')
    expect(dataAfterPutAgain.filter((entry) => entry.resourceId === resourceId)).toBeArrayOfSize(3)
  })
})

describe('makeOutdated, makeManyOutdated and makeAllOutdated', () => {
  let cache: DexieCacheStorage
  let resourceCache: ResourceCacheStorage
  let resourceId: number
  let items: any[] = [
    { id: 1, name: 'Item', status: 'Active' },
    { id: 2, name: 'Group', status: 'Disbanded' },
    { id: 3, name: 'Scavenger', status: 'Active' },
    { id: 4, name: 'Freshmen', status: 'Unknown' },
    { id: 5, name: 'Skill-Out', status: 'Active' },
  ]
  let expectedStatuses: [number, 'F' | 'O'][]

  const dumpStatuses = async () =>
    (await dumpTable('data'))
      .filter((entry) => entry.resourceId === resourceId)
      .map((entry) => [entry.primaryKey, entry.status])

  beforeAll(async () => {
    cache = makeCacheStorage()
    resourceCache = await cache.getResourceCache('makeOutdated_test')
    resourceId = await findMetaKey('makeOutdated_test')
  })

  beforeEach(async () => {
    await resourceCache.putMany(items.map((item) => [item.id, item]))
    expectedStatuses = items.map((item) => [item.id, 'F'])
  })

  test('makeOutdated changes the status of the matched entry', async () => {
    await resourceCache.makeOutdated(2)

    expectedStatuses[1][1] = 'O'
    const statuses = await dumpStatuses()
    expect(statuses).toIncludeSameMembers(expectedStatuses)
  })

  test('makeManyOutdated changes the status of the matched entries', async () => {
    await resourceCache.makeManyOutdated([1, 4])

    expectedStatuses[0][1] = 'O'
    expectedStatuses[3][1] = 'O'
    const statuses = await dumpStatuses()
    expect(statuses).toIncludeSameMembers(expectedStatuses)
  })

  test("makeOutdated and makeManyOutdated don't do anything if the object is not known", async () => {
    await resourceCache.makeOutdated(999)
    await resourceCache.makeManyOutdated([111, 222, 333])

    const statuses = await dumpStatuses()
    expect(statuses).toIncludeSameMembers(expectedStatuses)
  })

  test('makeOutdated changes the status of all entries in the resource', async () => {
    await resourceCache.makeAllOutdated()

    expectedStatuses.forEach((s) => (s[1] = 'O'))
    const statuses = await dumpStatuses()
    expect(statuses).toIncludeSameMembers(expectedStatuses)
  })
})

describe('invalidate* methods', () => {
  let cache: DexieCacheStorage
  let resourceCache: ResourceCacheStorage
  let resourceId: number
  let items: any[] = [
    { id: 1, name: 'Item', status: 'Active' },
    { id: 2, name: 'Group', status: 'Disbanded' },
    { id: 3, name: 'Scavenger', status: 'Active' },
    { id: 4, name: 'Freshmen', status: 'Unknown' },
    { id: 5, name: 'Skill-Out', status: 'Active' },
  ]

  const dumpPKs = async () =>
    (await dumpTable('data')).filter((entry) => entry.resourceId === resourceId).map((entry) => entry.primaryKey)

  beforeAll(async () => {
    cache = makeCacheStorage()
    resourceCache = await cache.getResourceCache('makeOutdated_test')
    resourceId = await findMetaKey('makeOutdated_test')
  })

  beforeEach(async () => {
    await resourceCache.putMany(items.map((item) => [item.id, item]))
  })

  test('invalidate removes the matched entry from the cache', async () => {
    await resourceCache.invalidate(3)

    const keys = await dumpPKs()
    expect(keys).toIncludeSameMembers([1, 2, 4, 5])
  })

  test('invalidateMany removes the matched entries from the cache', async () => {
    await resourceCache.invalidateMany([2, 5])

    const keys = await dumpPKs()
    expect(keys).toIncludeSameMembers([1, 3, 4])
  })

  test("invalidate and invalidateMany don't do anything if the object is not known", async () => {
    await resourceCache.invalidate(999)
    await resourceCache.invalidateMany([111, 222, 333])

    const keys = await dumpPKs()
    expect(keys).toIncludeSameMembers([1, 2, 3, 4, 5])
  })

  test('invalidateAll removes all the entries in the resource', async () => {
    await resourceCache.invalidateAll()

    const keys = await dumpPKs()
    expect(keys).toBeEmpty()
  })
})
