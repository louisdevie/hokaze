import { StringField } from './string'
import { NumberField } from './number'
import { BooleanField } from './boolean'
import { Likelihood } from '@module/inference'
import { ValidationResult } from '@module/validation'
import { MappedField } from '@module/resources/mappers/base'
import { MappingFactory } from '@module/resources/mappers/factory'

/**
 * Hints used to determine the role of a field.
 */
export interface FieldRoleHints {
  fieldName: string
  resourceName: string
}

export type KeyKind =
  | 'literal' // treat the key as it is
  | 'integer' // treat the key as an integer

/**
 * An object describing a field of type `FieldType`.
 */
export interface Field<T> {
  /**
   * A "blank" value to create new model objects.
   */
  readonly blankValue: T

  /**
   * Indicates whether that field may be received from the API.
   */
  readonly isReadable: boolean

  /**
   * Indicates whether that field may be sent to the API.
   */
  readonly isWritable: boolean

  /**
   * Indicates whether that field allows null as a value.
   */
  readonly isNullable: boolean

  /**
   * Indicates whether that field may be omitted when sending/receiving it from the API.
   */
  readonly isOptional: boolean

  /**
   * The kind of id this field is.
   */
  readonly keyKind: KeyKind | null

  /**
   * Check how likely it is for this field to be the id of the resource.
   */
  isKey(hints: FieldRoleHints): Likelihood

  /**
   * Check if a value meets the different requirements of the field before being sent.
   * @param value The value to check.
   */
  validate(value: T): ValidationResult

  /**
   * Creates a mapping for this field using the given factory.
   * @param factory The factory to use to create the mapping.
   */
  makeMapping(factory: MappingFactory): MappedField
}

/**
 * Describes a boolean field.
 */
export const boolean = new BooleanField<never>()

/**
 * Describes a number field.
 */
export const number = new NumberField<never>()

/**
 * Describes a string field.
 */
export const string = new StringField<never>()

// generic fields
export { arrayFieldFactory as array } from './array'
export { enumFieldFactory as enumeration } from './enum'
export { objectFieldFactory as object } from './object'
export { refFieldFactory as ref } from './ref'
