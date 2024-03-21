import { Field } from './fields'

/**
 * Describes a collection of model objects.
 */
export interface ResourceDescriptor {
  /**
   * The name of the resource as it appears in the URL.
   */
  name: string

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
  : // if the descriptor is an object, we map each property of that object
    // to the type wrapped by the `ResourceFieldDescriptor`s
    {
      // copy each property
      [Property in keyof Descriptor['fields']]: Descriptor['fields'][Property] extends Field<infer T> ?
        // if that property is a descriptor, we use the type wrapped by it
        T
      : // otherwise its any
        any
    }

export interface Resource<ItemType> {}

export class CachedResourceImpl<ItemType> implements Resource<ItemType> {}
