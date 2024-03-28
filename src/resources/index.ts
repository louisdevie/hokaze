import { Field } from '../fields'

/**
 * Describes a collection of model objects.
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

interface SendAndReceive<ItemType> {
  /**
   * Reads one item from the resource.
   * @param key The primary key of the item.
   * @param args Arguments to pass to the query parameters.
   * @see getAll
   */
  get(key: Key, args?: Record<string, any>): ItemType

  /**
   * Reads all the items from the resource.
   * @param args Arguments to pass to the query parameters.
   * @see get
   */
  getAll(args?: Record<string, any>): ItemType[]

  /**
   * Sends an item to the resource. This method will always try to create a new items, use {@link save} instead if you
   * want to update it when it already exists.
   * @param item The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see sendMany
   */
  send(item: ItemType, args?: Record<string, any>): void

  /**
   * Sends a list of items to the resource. This method will always try to create new items, use {@link saveMany}
   * instead if you want to update them when they already exists.
   * @param items The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see send
   */
  sendMany(items: ItemType[], args?: Record<string, any>): void

  /**
   * Updates an item (or creates it if it's new).
   * @param item The item to store.
   * @param args Arguments to pass to the query parameters.
   * @see saveMany
   */
  save(item: ItemType, args?: Record<string, any>): void

  /**
   * Updates a list of items.
   * @param items The items to store.
   * @param args Arguments to pass to the query parameters.
   * @see save
   */
  saveMany(items: ItemType[], args?: Record<string, any>): void

  /**
   * Deletes an item. If the item hasn't been saved yet, this does nothing.
   * @param item The item to delete.
   * @param args Arguments to pass to the query parameters.
   * @see deleteKey
   * @see deleteMany
   * @see deleteAll
   */
  delete(item: ItemType, args?: Record<string, any>): void

  /**
   * Deletes the item corresponding to a key.
   * @param key The key of the item to delete.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteMany
   * @see deleteAll
   */
  deleteKey(key: Key, args?: Record<string, any>): void

  /**
   * Deletes a list of items. If no item has been saved yet, this does nothing.
   * @param items The items to delete.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteKey
   * @see deleteAll
   */
  deleteMany(items: ItemType[], args?: Record<string, any>): void

  /**
   * Deletes all the items from the resource.
   * @param args Arguments to pass to the query parameters.
   * @see delete
   * @see deleteKey
   * @see deleteMany
   */
  deleteAll(args?: Record<string, any>): void
}

export interface Resource<ItemType> extends SendAndReceive<ItemType> {
  /**
   * Creates a new blank item to be added to the resource. This method does not request anything.
   */
  create(): ItemType

  /**
   * The name of the primary key used to index this resource.
   */
  key: keyof ItemType
}

export abstract class ResourceChain<ItemType> implements SendAndReceive<ItemType> {
  private readonly _keyName: keyof ItemType
  private _next?: ResourceChain<ItemType>

  public constructor(keyName: keyof ItemType) {
    this._keyName = keyName
  }

  public addNext(next: ResourceChain<ItemType>): void {
    this._next = next
  }

  protected get keyName(): keyof ItemType {
    return this._keyName
  }

  public abstract get(key: Key, args?: Record<string, any> | undefined): ItemType

  public abstract getAll(args?: Record<string, any> | undefined): ItemType[]

  public abstract send(item: ItemType, args?: Record<string, any> | undefined): void

  public abstract sendMany(items: ItemType[], args?: Record<string, any> | undefined): void

  public abstract save(item: ItemType, args?: Record<string, any> | undefined): void

  public abstract saveMany(items: ItemType[], args?: Record<string, any> | undefined): void

  public abstract delete(item: ItemType, args?: Record<string, any> | undefined): void

  public abstract deleteKey(key: Key, args?: Record<string, any> | undefined): void

  public abstract deleteMany(items: ItemType[], args?: Record<string, any> | undefined): void

  public abstract deleteAll(args?: Record<string, any> | undefined): void
}
