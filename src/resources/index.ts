import { Field } from '../fields'
import { UrlSearchArgs } from '@module/url'

/**
 * Describes a model object or a collection of such objects.
 */
export interface ResourceDescriptor {
  /**
   * The name of the resource as it appears in the URL.
   */
  name: string

  /**
   * Whether the whole resource should be read-only.
   */
  readOnly?: boolean

  /**
   * Whether the whole resource should be write-only.
   */
  writeOnly?: boolean

  /**
   * Describes the fields of a single model object.
   */
  fields: ResourceFields
}

/**
 * Either a list of the fields names, which will give the fields the *any* type, or an object describing each field.
 */
export type ResourceFields = string[] | Record<string, Field<unknown>>

/**
 * The type of model objects in a resource described by `Descriptor`.
 */
export type ResourceItemType<Descriptor extends ResourceDescriptor> =
  // behold the power of typescript's type system
  Descriptor['fields'] extends string[] ?
    // if the descriptor is a simple list, we have an object with `any` typed properties
    Record<string, any>
  : // if the descriptor is an object, we map each property of that object to the type wrapped by the field descriptors
    {
      // copy each property
      [Property in keyof Descriptor['fields']]: Descriptor['fields'][Property] extends Field<infer T> ?
        // if that property is a descriptor, we use the type wrapped by it
        T
      : // otherwise its any
        any
    }

export type Key = string | number

export interface SendAndReceive<ItemType> {
  /**
   * Reads one item from the resource.
   * @param key The primary key of the item.
   * @param args Arguments to pass to the query parameters.
   * @see getAll
   */
  get(key: Key, args?: UrlSearchArgs): Promise<ItemType>

  /**
   * Reads all the items from the resource.
   * @param args Arguments to pass to the query parameters.
   * @see get
   */
  getAll(args?: UrlSearchArgs): Promise<ItemType[]>

  /**
   * Sends an item to the resource. This method will always try to create a new items, use {@link save} instead if you
   * want to update it when it already exists.
   * @param item The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see sendMany
   */
  send(item: ItemType, args?: UrlSearchArgs): Promise<void>

  /**
   * Sends a list of items to the resource. This method will always try to create new items, use {@link saveMany}
   * instead if you want to update them when they already exists.
   * @param items The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see send
   */
  sendMany(items: ItemType[], args?: UrlSearchArgs): Promise<void>

  /**
   * Updates an item (or creates it if it's new).
   * @param item The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see saveMany
   */
  save(item: ItemType, args?: UrlSearchArgs): Promise<void>

  /**
   * Updates a list of items.
   * @param items The items to store.
   * @param args Arguments to pass to the query parameters.
   * @see save
   */
  saveMany(items: ItemType[], args?: UrlSearchArgs): Promise<void>

  /**
   * Deletes an item. If the item hasn't been saved yet, this does nothing.
   * @param item The item to delete.
   * @param args Arguments to pass to the query parameters.
   * @see deleteKey
   * @see deleteMany
   * @see deleteAll
   */
  delete(item: ItemType, args?: UrlSearchArgs): Promise<void>

  /**
   * Deletes the item corresponding to a key.
   * @param key The key of the item to delete.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteMany
   * @see deleteAll
   */
  deleteKey(key: Key, args?: UrlSearchArgs): Promise<void>

  /**
   * Deletes a list of items. If no item has been saved yet, this does nothing.
   * @param items The items to delete.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteKey
   * @see deleteAll
   */
  deleteMany(items: ItemType[], args?: UrlSearchArgs): Promise<void>

  /**
   * Deletes all the items from the resource.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteKey
   * @see deleteMany
   */
  deleteAll(args?: UrlSearchArgs): Promise<void>
}

/**
 * Represents an REST resource as a list of items.
 */
export interface CollectionResource<ItemType> extends SendAndReceive<ItemType> {
  /**
   * Creates a new blank item to be added to the resource. This method does not request anything.
   */
  create(): ItemType

  /**
   * The name of the primary key used to index this resource.
   */
  key: keyof ItemType
}

/**
 * Represents an REST resource as a single items.
 */
export interface SingleResource<ItemType> {
  /**
   * Reads the value of resource.
   * @param args Arguments to pass to the query parameters.
   */
  get(args?: UrlSearchArgs): Promise<ItemType>

  /**
   * Sends a value to the resource.
   * @param value The item to send.
   * @param args Arguments to pass to the query parameters.
   */
  send(value: ItemType, args?: UrlSearchArgs): Promise<void>

  /**
   * Updates the value of the resource.
   * @param value The object obtained using the {@link get} method after it has been modified.
   * @param args Arguments to pass to the query parameters.
   */
  save(value: ItemType, args?: UrlSearchArgs): Promise<void>

  /**
   * Clears the value of the resource.
   * @param args Arguments to pass to the query parameters.
   */
  delete(args?: UrlSearchArgs): Promise<void>
}
