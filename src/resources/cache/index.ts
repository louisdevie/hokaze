import type { Key } from '@module/resources'
import { OptionalSearchArgs } from '@module/resources/helpers'

export enum OperationFailureReason {
  /**
   * No response was received.
   */
  Offline,
  /**
   * A negative response was received.
   */
  Rejected,
}

export interface ResourceCache {
  /**
   * Triggered when a single item is about to be queried. If this method returns something other than `undefined`, the
   * request is interrupted and that value is returned instead.
   * @param key The primary key of the item.
   * @param search Additional arguments in the request.
   */
  beforeGettingOne(key: Key, search: OptionalSearchArgs): Promise<unknown>

  /**
   * Triggered when a single item has been received.
   * @param key The primary key of the item.
   * @param search Additional arguments in the request.
   * @param result The result of the request.
   */
  afterGettingOne(key: Key, search: OptionalSearchArgs, result: unknown): Promise<void>

  /**
   * Triggered when all the items are about to be queried. If this method returns something other than `undefined`, the
   * request is interrupted and that value is returned instead.
   * @param search Additional arguments in the request.
   */
  beforeGettingAll(search: OptionalSearchArgs): Promise<unknown>

  /**
   * Triggered when all the items have been received.
   * @param search Additional arguments in the request.
   * @param result The result of the request.
   */
  afterGettingAll(search: OptionalSearchArgs, result: unknown): Promise<void>

  /**
   * Triggered when an item is about to be saved.
   * @param dto The item that is being saved.
   * @param key The key of the item, or `null` if the item is new.
   * @param search Additional arguments in the request.
   */
  beforeSavingOne(dto: unknown, key: Key | null, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when an item was successfully saved.
   * @param dto The item that was saved.
   * @param key The key of the item, or `null` if the item is new.
   * @param search Additional arguments in the request.
   */
  afterSavingOne(dto: unknown, key: Key | null, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when an item failed to be saved.
   * @param dto The item with which the problem occurred.
   * @param key The key of the item, or `null` if the item is new.
   * @param search Additional arguments in the request.
   * @param reason The reason why the operation failed.
   */
  couldNotSaveOne(
    dto: unknown,
    key: Key | null,
    search: OptionalSearchArgs,
    reason: OperationFailureReason,
  ): Promise<void>

  /**
   * Triggered when all the items are about to be saved.
   * @param dto The resource that is being saved.
   * @param search Additional arguments in the request.
   */
  beforeSavingAll(dto: unknown, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when all the items were successfully saved.
   * @param dto The resource that was saved.
   * @param search Additional arguments in the request.
   */
  afterSavingAll(dto: unknown, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when some of the items failed to be saved.
   * @param dto The resource with which the problem occurred.
   * @param search Additional arguments in the request.
   * @param reason The reason why the operation failed.
   */
  couldNotSaveAll(dto: unknown, search: OptionalSearchArgs, reason: OperationFailureReason): Promise<void>

  /**
   * Triggered when an item is about to be deleted.
   * @param key The key of the item.
   * @param search Additional arguments in the request.
   */
  beforeDeletingOne(key: Key, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when an item was successfully deleted.
   * @param key The key of the item.
   * @param search Additional arguments in the request.
   */
  afterDeletingOne(key: Key, search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when an item failed to be deleted.
   * @param key The key of the item.
   * @param search Additional arguments in the request.
   * @param reason The reason why the operation failed.
   */
  couldNotDeleteOne(key: Key, search: OptionalSearchArgs, reason: OperationFailureReason): Promise<void>

  /**
   * Triggered when all the items are about to be deleted.
   * @param search Additional arguments in the request.
   */
  beforeDeletingAll(search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when all the items were successfully deleted.
   * @param search Additional arguments in the request.
   */
  afterDeletingAll(search: OptionalSearchArgs): Promise<void>

  /**
   * Triggered when some of the items failed to be deleted.
   * @param search Additional arguments in the request.
   * @param reason The reason why the operation failed.
   */
  couldNotDeleteAll(search: OptionalSearchArgs, reason: OperationFailureReason): Promise<void>
}

export interface ServiceCache {
  resource(name: string): Promise<ResourceCache>
}
