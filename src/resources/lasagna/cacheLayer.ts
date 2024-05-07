import { Key } from '../index'
import { OperationFailureReason, ResourceCache } from '../cache'
import { RawSendAndReceive } from './httpLayer'
import { CreationResult } from '@module/backend'
import { OptionalSearchArgs } from '@module/resources/helpers'
import { AsyncFeedback } from '@module/feedback'

export class CacheLayer implements RawSendAndReceive {
  private readonly _cache: ResourceCache
  private readonly _wrapped: RawSendAndReceive

  public constructor(cache: ResourceCache, wrappedLayer: RawSendAndReceive) {
    this._cache = cache
    this._wrapped = wrappedLayer
  }

  public async get(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<any>> {
    const cachedResponse = await this._cache.beforeGettingOne(key, search)

    if (cachedResponse !== undefined) {
      return new AsyncFeedback(cachedResponse)
    } else {
      const result = await this._wrapped.get(key, search)
      result.onAccepted(() => this._cache.afterGettingOne(key, search, result.value))
      return result
    }
  }

  public async getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<any[]>> {
    const cachedResponse = await this._cache.beforeGettingAll(search)

    if (cachedResponse !== undefined) {
      return new AsyncFeedback(cachedResponse)
    } else {
      const result = await this._wrapped.getAll(search)
      result.onAccepted(() => this._cache.afterGettingAll(search, result.value))
      return result
    }
  }

  public async saveNew(dto: any, search: OptionalSearchArgs): Promise<AsyncFeedback<CreationResult>> {
    await this._cache.beforeSavingOne(dto, null, search)
    const result = await this._wrapped.saveNew(dto, search)
    result.onAccepted(() => this._cache.afterSavingOne(dto, null, search))
    return result
  }

  public async saveExisting(dto: any, key: Key, search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeSavingOne(dto, key, search)
    await this._wrapped.saveExisting(dto, key, search)
    await this._cache.afterSavingOne(dto, key, search)
  }

  public async deleteKey(key: Key, search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeDeletingOne(key, search)
    await this._wrapped.deleteKey(key, search)
    await this._cache.afterDeletingOne(key, search)
  }

  public async deleteAll(search: OptionalSearchArgs): Promise<void> {
    await this._cache.beforeDeletingAll(search)
    await this._wrapped.deleteAll(search)
    await this._cache.afterDeletingAll(search)
  }
}
