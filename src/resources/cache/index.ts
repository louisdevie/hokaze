import type { Key } from '@module/resources'

export interface ResourceCache<T> {
  /**
   * Triggered when a single item is about to be queried. If this method returns something other than `undefined`, the
   * request is interrupted and that value is returned instead.
   * @param key The primary key of the item.
   * @param search Additional arguments in the request.
   */
  beforeGet(key: Key, search: SearchArgs | undefined): Promise<T | undefined>

  /**
   * Triggered when a single item has been received.
   * @param key The primary key of the item.
   * @param search Additional arguments in the request.
   * @param result The result of the request.
   */
  afterGet(key: Key, search: SearchArgs | undefined, result: T): Promise<void>

  /**
   * Triggered when all the items are about to be queried. If this method returns something other than `undefined`, the
   * request is interrupted and that value is returned instead.
   * @param search Additional arguments in the request.
   */
  beforeGetAll(search: SearchArgs | undefined): Promise<T[] | undefined>

  /**
   * Triggered when all the items have been received.
   * @param search Additional arguments in the request.
   * @param result The result of the request.
   */
  afterGetAll(search: SearchArgs | undefined, result: T[]): Promise<void>

  /**
   * Triggered when an item is about to be sent.
   * @param key The key of the item.
   * @param item The item that is being sent.
   * @param search Additional arguments in the request.
   * @param result A promise representing the sending operation.
   */
  onSend(key: Key, item: T, search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  /**
   * Triggered when multiple items are about to be sent.
   * @param keyAndItems The items that are being sent and their respective keys.
   * @param search Additional arguments in the request.
   * @param result A promise representing the sending operation.
   */
  onSendMany(keyAndItems: [Key, T][], search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onSave(key: Key, item: T, search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onSaveMany(items: T[], search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onDelete(item: T, search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onDeleteKey(key: Key, search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onDeleteMany(items: T[], search: SearchArgs | undefined, result: Promise<void>): Promise<void>

  onDeleteAll(search: SearchArgs | undefined, result: Promise<void>): Promise<void>
}

export interface ServiceCache {
  resource<T>(name: string): Promise<ResourceCache<T>>
}
