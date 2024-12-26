import { DataDescriptor } from '../index'
import { Likelihood } from '@module/inference'
import { BooleanValue } from '@module/data/serialized/boolean'
import { NumberValue } from '@module/data/serialized/number'
import { StringValue } from '@module/data/serialized/string'
import { ValueMapper } from '@module/mappers/serialized'

/**
 * Hints used to determine the role of a field in an object.
 */
export interface FieldRoleHints {
  fieldName: string
  resourceName: string
}

export type KeyKind =
  | 'literal' // treat the key as it is
  | 'integer' // treat the key as an integer

/**
 * An object describing a serialized value of type `T`.
 */
export interface ValueDescriptor<T> extends DataDescriptor<T> {
  /**
   * Indicates whether that field allows null as a value.
   */
  readonly isNullable: boolean

  /**
   * The kind of id this field is.
   */
  readonly keyKind: KeyKind | null

  /**
   * Check how likely it is for this field to be the id of its resource.
   */
  isKey(hints: FieldRoleHints): Likelihood

  /**
   * Creates a mapping for this field.
   */
  makeMapper(): ValueMapper<T>
}

/**
 * Describes a serialized boolean value.
 */
export const boolean: BooleanValue<never> = new BooleanValue()

/**
 * Describes a serialized numeric value.
 */
export const number: NumberValue<never> = new NumberValue()

/**
 * Describes a serialized string value.
 */
export const string: StringValue<never> = new StringValue()

// generic fields
export { jsonArrayFactory as array } from './array'
export { jsonEnumFactory as enumeration } from './enum'
export { jsonObjectFactory as object } from './object'
export { jsonRefFactory as ref } from './ref'
