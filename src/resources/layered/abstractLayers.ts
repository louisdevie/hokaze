import type { Key } from '@module/resources'
import { OptionalSearchArgs } from '@module/resources/helpers'
import { AsyncFeedback } from '@module/feedback'
import { CreationResult } from '@module/backend'
import type { RequestPathInit } from '@module/requestPath'

/**
 * All the CRUD operations that can be performed on a resource.
 */
export interface RawSendAndReceive {
  /**
   * Gets the request path to which the requests are made.
   */
  readonly requestPath: ResourceRequestPath

  /**
   * Makes a GET request to a specific item of the collection.
   * @param key The key of the item to fetch.
   * @param search Arguments to pass as query parameters.
   * @return The object received wrapped with {@link AsyncFeedback}.
   */
  getOne(key: Key, search: OptionalSearchArgs): Promise<AsyncFeedback<unknown>>

  /**
   * Makes a GET request to the whole resource.
   * @param search Arguments to pass as query parameters.
   */
  getAll(search: OptionalSearchArgs): Promise<AsyncFeedback<unknown>>

  /**
   * Makes a POST request to the resource.
   * @param dto The object to send as the body of the request.
   * @param search Arguments to pass as query parameters.
   */
  saveNew(dto: unknown, search: OptionalSearchArgs): Promise<CreationResult>

  /**
   * Makes a PUT request to a specific item of the collection.
   * @param dto The object to send as the body of the request.
   * @param key The key of the item to update.
   * @param search Arguments to pass as query parameters.
   */
  saveExisting(dto: unknown, key: Key, search: OptionalSearchArgs): Promise<void>

  /**
   * Makes a PUT request to the whole resource.
   * @param dto The object to send as the body of the request.
   * @param search Arguments to pass as query parameters.
   */
  saveAll(dto: unknown, search: OptionalSearchArgs): Promise<void>

  /**
   * Makes a DELETE request to a specific item of the collection.
   * @param key The key of the item to delete.
   * @param search Arguments to pass as query parameters.
   */
  deleteOne(key: Key, search: OptionalSearchArgs): Promise<void>

  /**
   * Makes a DELETE request to the whole resource.
   * @param search Arguments to pass as query parameters.
   */
  deleteAll(search: OptionalSearchArgs): Promise<void>
}

export interface ResourceRequestPath {
  readonly forResource: RequestPathInit

  forItem(key: Key): RequestPathInit
}

/**
 * Methods shared by {@link SendAndReceiveCollection} and {@link SendAndReceiveSingle}.
 */
interface SendAndReceive<T> {
  /**
   * Makes a GET request to the whole resource.
   * @param search Arguments to pass as query parameters.
   */
  getAll(search: OptionalSearchArgs): Promise<T>

  /**
   * Makes a DELETE request to the whole resource.
   * @param search Arguments to pass as query parameters.
   */
  deleteAll(search: OptionalSearchArgs): Promise<void>
}

/**
 * A higher-level version of {@link RawSendAndReceive} for collections of resources that deals with mapped objects
 * instead of DTOs.
 */
export interface SendAndReceiveCollection<T> extends SendAndReceive<T[]> {
  /**
   * Makes a GET request to a specific item of the collection.
   * @param key The key of the item to fetch.
   * @param search Arguments to pass as query parameters.
   * @return The object received wrapped with {@link AsyncFeedback}.
   */
  getOne(key: Key, search: OptionalSearchArgs): Promise<T>

  /**
   * Makes a POST request to the resource.
   * @param item The object to send as the body of the request.
   * @param search Arguments to pass as query parameters.
   */
  saveNew(item: T, search: OptionalSearchArgs): Promise<Key | undefined>

  /**
   * Makes a PUT request to a specific item of the collection.
   * @param item The object to send as the body of the request.
   * @param key The key of the item to update.
   * @param search Arguments to pass as query parameters.
   */
  saveExisting(item: T, key: Key, search: OptionalSearchArgs): Promise<void>

  /**
   * Makes a DELETE request to a specific item of the collection.
   * @param key The key of the item to delete.
   * @param search Arguments to pass as query parameters.
   */
  deleteOne(key: Key, search: OptionalSearchArgs): Promise<void>
}

/**
 * A higher-level version of {@link RawSendAndReceive} for single resources that deals with mapped objects instead of
 * DTOs.
 */
export interface SendAndReceiveSingle<T> extends SendAndReceive<T> {
  /**
   * Makes a POST request to the resource.
   * @param value The object to send as the body of the request.
   * @param search Arguments to pass as query parameters.
   */
  saveNew(value: T, search: OptionalSearchArgs): Promise<void>

  /**
   * Makes a PUT request to the whole resource.
   * @param value The object to send as the body of the request.
   * @param search Arguments to pass as query parameters.
   */
  saveExisting(value: T, search: OptionalSearchArgs): Promise<void>
}
