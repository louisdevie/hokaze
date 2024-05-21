import { Field } from '../fields'
import { UrlSearchArgs } from '@module/url'
import { RequestPath } from '@module/requestPath'

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
 * The type of objects described by `Fields`.
 */
export type ObjectTypeFromFields<Fields extends ResourceFields> =
  // behold the power of typescript's type system
  Fields extends string[] ?
    // if the descriptor is a simple list, we have an object with `any` typed properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  : // if the descriptor is an object, we map each property of that object to the type wrapped by the field descriptors
    {
      // copy each property
      [Property in keyof Fields]: Fields[Property] extends Field<infer T> ?
        // if that property is a descriptor, we use the type wrapped by it
        T
      : // the fields will always extend Field<something>
        never
    }

/**
 * The type of model objects in a resource described by `Descriptor`.
 */
export type ResourceType<Descriptor extends ResourceDescriptor> = ObjectTypeFromFields<Descriptor['fields']>

/**
 * A {@link ResourceDescriptor} with specific options for collections.
 */
export interface CollectionDescriptor extends ResourceDescriptor {
  /**
   * Child resources and requests available for each of the items. This property can also be used to add custom methods
   * to the items.
   */
  forEach?: ResourceChildren
}

export type ResourceChildren = (requestPath: RequestPath) => Record<string, unknown>

/**
 * The type of objects described by `Children`.
 */
export type ObjectTypeFromChildren<Children extends ResourceChildren | undefined> =
  Children extends ResourceChildren ? ReturnType<Children> : Record<string, never>

/**
 * The type of item objects in a collection.
 */
export type ResourceItemType<Descriptor extends CollectionDescriptor> =
  ObjectTypeFromFields<Descriptor['fields']> & ObjectTypeFromChildren<Descriptor['forEach']> extends infer T ?
    { [Property in keyof T]: T[Property] }
  : never

/**
 * The types allowed as resource keys.
 */
export type Key = string | number

/**
 * Represents a REST resource as a list of items.
 */
export interface CollectionResource<ItemType> {
  readonly key: keyof ItemType

  readonly asPath: RequestPath

  /**
   * Reads one item from the resource.
   * @param key The primary key of the item.
   * @see getAll
   */
  get(key: Key): Promise<ItemType>

  /**
   * Reads all the items from the resource.
   * @param search Arguments to pass to the query parameters.
   * @see get
   */
  getAll(search?: UrlSearchArgs): Promise<ItemType[]>

  /**
   * Creates a new blank item to be added to the resource. This method does not request anything.
   */
  create(): ItemType

  /**
   * Sends an item to the resource. This method will always try to create a new items, use {@link save} instead if you
   * want to update it when it already exists.
   * @param item The item to store.
   * @see sendMany
   */
  send(item: ItemType): Promise<void>

  /**
   * Updates an item (or creates it if it's new).
   * @param item The item to store.
   * @see saveMany
   */
  save(item: ItemType): Promise<void>

  /**
   * Deletes an item. If the item hasn't been saved yet, this does nothing.
   * @param item The item to delete.
   * @see deleteKey
   * @see deleteMany
   * @see deleteAll
   */
  delete(item: ItemType): Promise<void>

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

/**
 * Represents a REST resource as a single item.
 */
export interface SingleResource<ItemType> {
  readonly asPath: RequestPath

  /**
   * Reads the value of resource.
   */
  get(): Promise<ItemType>

  /**
   * Creates a new blank item to be added to the resource. This method does not request anything.
   */
  create(): ItemType

  /**
   * Sends a value to the resource.
   * @param value The item to send.
   */
  send(value: ItemType): Promise<void>

  /**
   * Updates the value of the resource.
   * @param value The object obtained using the {@link get} or {@link create} methods.
   */
  save(value: ItemType): Promise<void>

  /**
   * Clears the value of the resource.
   */
  delete(): Promise<void>
}
