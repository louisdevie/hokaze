import type { DataDescriptor } from '@module/data'
import { ReferencableValue } from '@module/data/serialized/ref'
import type { RequestPath } from '@module/requestPath'
import { UrlSearchArgs } from '@module/url'

/**
 * The types allowed as resource keys.
 */
export type Key = string | number

export type TypeOfData<Descriptor extends DataDescriptor<unknown>> =
  Descriptor extends DataDescriptor<infer T> ? T : never

export interface ResourceRequestPath {
  readonly resourcePath: RequestPath

  /* FEATURE "DYNAMIC REQUEST PATHS" NOT SUPPORTED YET
  itemPath(key: Key): RequestPathInit
  */
}

/**
 * Represents a REST resource as a single value.
 */
export interface SingleResource<T> {
  readonly asPath: RequestPath

  readonly descriptor: DataDescriptor<T>

  /**
   * Reads the value of resource.
   */
  get(): Promise<T>

  /**
   * Creates a new blank value of the resource.
   */
  create(): T

  /**
   * Sends a value to the resource.
   * @param value The item to send.
   */
  send(value: T): Promise<void>

  /**
   * Updates the value of the resource.
   * @param value The object obtained using the {@link get} or {@link create} methods.
   */
  save(value: T): Promise<void>

  /**
   * Clears the value of the resource.
   */
  delete(): Promise<void>
}

/**
 * Represents a REST resource that is a collection of objects.
 */
export interface CollectionResource<T> {
  readonly asPath: RequestPath

  readonly asReferencable: ReferencableValue<T>

  /**
   * Reads one item from the resource.
   * @param key The primary key of the item.
   * @see getAll
   */
  get(key: Key): Promise<T>

  /**
   * Reads all the items from the resource.
   * @param search Arguments to pass to the query parameters.
   * @see get
   */
  getAll(search?: UrlSearchArgs): Promise<T[]>

  /**
   * Creates a new blank item to be added to the resource. This method does not request anything.
   */
  create(): T

  /**
   * Check if an item was newly created. The value returned by this method determines the behavior of {@link save} and
   * {@link delete}. It returns `true` in two and only two situations : when the value was created using the
   * {@link create} method and was never sent nor saved; or when its key property is `null` or `undefined`.
   * @param item The item to check.
   */
  isNew(item: T): boolean

  /**
   * Sends an item to the resource. This method will always try to create a new item, use {@link save} instead if you
   * want to update it when it already exists.
   * @param item The item to store.
   */
  send(item: T): Promise<void>

  /**
   * Updates an item (or creates it if it's new, see {@link isNew}).
   * @param item The item to store.
   */
  save(item: T): Promise<void>

  /**
   * Deletes an item. If the item hasn't been saved yet, this does nothing (see {@link isNew}).
   * @param item The item to delete.
   * @see deleteKey
   * @see deleteMany
   * @see deleteAll
   */
  delete(item: T): Promise<void>

  /**
   * Deletes the item corresponding to a key.
   * @param key The key of the item to delete.
   * @see delete
   * @see deleteMany
   * @see deleteAll
   */
  deleteKey(key: Key): Promise<void>

  /**
   * Deletes all the items from the resource.
   * @param search Arguments to pass to the query parameters.
   * @see delete
   * @see deleteKey
   * @see deleteMany
   */
  deleteAll(search?: UrlSearchArgs): Promise<void>
}
