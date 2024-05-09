import type { Key } from '@module/resources'

export interface CreationResult {
  location: string | null
  responseBody: any
}

export interface HttpClient {
  getJson(url: URL): Promise<any>

  postJson(url: URL, payload: any): Promise<CreationResult>

  putJson(url: URL, payload: any): Promise<void>

  delete(url: URL): Promise<void>
}

export { FetchHttpClient as DefaultHttpClient } from './fetch'

/**
 * A store for cache data.
 */
export interface CacheStorage {
  /**
   * Performs the necessary operations to set up the storage.
   */
  init(): Promise<void>

  /**
   * Gets a store for a specific resource, creating one if necessary.
   * @param name The name used to identify the resource.
   */
  getResourceCache(name: string): Promise<ResourceCacheStorage>
}

/**
 * A store for cache data for a resource.
 */
export interface ResourceCacheStorage {
  /**
   * Checks if this resource is entirely fresh in the cache. This method will also return true if the resource has been
   * fetched but is empty.
   */
  isFresh(): Promise<boolean>

  /**
   * Checks if any items are present in the cache. This method will also return true if the resource has been fetched
   * but is empty.
   */
  hasAny(): Promise<boolean>

  /**
   * Mark the resource as fully refreshed.
   */
  markAsGloballyRefreshed(): Promise<void>

  /**
   * Mark the resource as partially (or fully) outdated.
   */
  markAsGloballyOutdated(): Promise<void>

  /**
   * Mark the resource as fully invalidated.
   */
  markAsGloballyInvalid(): Promise<void>

  /**
   * Checks if an item is present in the cache. This will return true even if the item is outdated.
   * @param key The primary key of the item to look up.
   */
  has(key: Key): Promise<boolean>

  /**
   * Checks if an item is present in the cache and is not outdated.
   * @param key The primary key of the item to look up.
   */
  hasFresh(key: Key): Promise<boolean>

  /**
   * Tries to get an item from the cache. If the item is missing, this method will return `undefined`.
   * @param key The primary key of the item to look up.
   */
  get(key: Key): Promise<any>

  /**
   * Gets all the items present in the cache.
   */
  getAll(): Promise<any[]>

  /**
   * Adds or update an item in the cache. After this operation, the item will be up-to-date again.
   * @param key The primary key of the item.
   * @param value The new value to store.
   */
  put(key: Key, value: any): Promise<void>

  /**
   * Adds or update a batch of items in the cache. After this operation, the items will be up-to-date again.
   * @param entries An array of [keys, values] to store.
   */
  putMany(entries: [Key, any][]): Promise<void>

  /**
   * Marks an item as outdated until it gets updated. After this operation, the item is still available.
   * @param key The primary key of the outdated item.
   */
  makeOutdated(key: Key): Promise<void>

  /**
   * Marks a batch of items as outdated until they get updated. After this operation, the items will still be available.
   * @param keys The primary keys of the outdated items.
   */
  makeManyOutdated(keys: Key[]): Promise<void>

  /**
   * Marks all the items of this resource as outdated until they get updated. After this operation, the items will still
   * be available.
   */
  makeAllOutdated(): Promise<void>

  /**
   * Marks an item as invalid. After this operation, the item will not be available again and will need to be re-added
   * to the cache.
   * @param key The primary key of the now invalid item.
   */
  invalidate(key: Key): Promise<void>

  /**
   * Marks a batch of items as invalid. After this operation, the items will not be available again and will need to be
   * re-added to the cache.
   * @param keys The primary keys of the now invalid items.
   */
  invalidateMany(keys: Key[]): Promise<void>

  /**
   * Marks all the items of this resource as invalid. After this operation, the items will not be available again and
   * will need to be re-added to the cache.
   */
  invalidateAll(): Promise<void>
}

export { DexieCacheStorage as DefaultCacheStorage } from './dexie'
