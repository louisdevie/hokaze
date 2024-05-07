import { Key, ResourceDescriptor } from '@module/resources'
import { KeyKind } from '@module/fields'
import { FieldListManager } from '@module/resources/managers/fieldList'
import { FieldDescriptorsManager } from '@module/resources/managers/descriptorMap'

export interface Manager<ItemType> {
  /**
   * The name of the primary key used to index this resource.
   */
  readonly key: keyof ItemType

  /**
   * The type to expect for the primary key.
   */
  readonly keyKind: KeyKind

  /**
   * Checks if an item was just created.
   * @param item The item to check.
   * @returns `true` if the item has never been sent nor saved, `false` otherwise.
   */
  isNew(item: ItemType): boolean

  /**
   * Gets the value of the {@link key} property.
   * @param item The item to get the key of.
   */
  getKeyOf(item: ItemType): Key

  /**
   * Sets the value of the {@link key} property.
   * @param item The item to set the key of.
   * @param key The value to set for the property.
   */
  setKeyOf(item: ItemType, key: Key): void

  /**
   * Creates a new instance of an item filled with blank values.
   */
  createInstance(): ItemType
}

export function manager<T>(descriptor: ResourceDescriptor): Manager<T> {
  let manager
  if (Array.isArray(descriptor.fields)) {
    manager = new FieldListManager<T>(descriptor)
  } else {
    manager = new FieldDescriptorsManager<T>(descriptor)
  }
  return manager
}
