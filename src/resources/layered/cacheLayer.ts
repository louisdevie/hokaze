import type { Key } from '../index'
import { ResourceCache } from '../cache'
import { CreationResult } from '@module/backend'
import { OptionalSearchArgs } from '../helpers'
import { AsyncFeedback } from '@module/feedback'
import { RawSendAndReceive } from './abstractLayers'

export class CacheLayer implements RawSendAndReceive {
  private readonly _cache: ResourceCache
  private readonly _wrapped: RawSendAndReceive

  public constructor(cache: ResourceCache, wrappedLayer: RawSendAndReceive) {
    this._cache = cache
    this._wrapped = wrappedLayer
  }

  public async getOne(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<any>> {
    const cachedResponse = await this._cache.beforeGettingOne(key, search)

    if (cachedResponse !== undefined) {
      return new AsyncFeedback(cachedResponse)
    } else {
      const result = await this._wrapped.getOne(key, search)
      result.onAccepted(() => this._cache.afterGettingOne(key, search, result.value))
      return result
    }
  }

  public async getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<any>> {
    const cachedResponse = await this._cache.beforeGettingAll(search)

    if (cachedResponse !== undefined) {
      return new AsyncFeedback(cachedResponse)
    } else {
      const result = await this._wrapped.getAll(search)
      result.onAccepted(() => this._cache.afterGettingAll(search, result.value))
      return result
    }
  }

  public async saveNew(dto: any, search: OptionalSearchArgs): Promise<CreationResult> {
    await this._cache.beforeSavingOne(dto, null, search)
    const result = await this._wrapped.saveNew(dto, search)
    await this._cache.afterSavingOne(dto, null, search)
    return result
  }

  public async saveExisting(dto: any, key: Key, search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeSavingOne(dto, key, search)
    await this._wrapped.saveExisting(dto, key, search)
    await this._cache.afterSavingOne(dto, key, search)
  }

  public async saveAll(dto: any, search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeSavingAll(dto, search)
    await this._wrapped.saveAll(dto, search)
    await this._cache.afterSavingAll(dto, search)
  }

  public async deleteOne(key: Key, search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeDeletingOne(key, search)
    await this._wrapped.deleteOne(key, search)
    await this._cache.afterDeletingOne(key, search)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeDeletingAll(search)
    await this._wrapped.deleteAll(search)
    await this._cache.afterDeletingAll(search)
  }
}
