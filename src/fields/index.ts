import { StringField } from './string'
import { Likelihood } from '@module/inference'
import { ValidationResult } from '@module/validation'

/**
 * Hints used to determine the role of a field.
 */
export interface FieldRoleHints {
  fieldName: string
  resourceName: string
}

/**
 * An object describing a field of type `FieldType`.
 */
export interface Field<T> {
  /**
   * Gets a "blank" value to create new model objects.
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
   * Indicates whether that field may be omitted when sending/receiving it from the API.
   */
  readonly isOptional: boolean

  /**
   * Check how likely it is for this field to be the id of the resource.
   */
  isTheId(hints: FieldRoleHints): Likelihood

  /**
   * Check if a value meets the different requirements of the field before being sent.
   * @param value The value to check.
   */
  validate(value: T): ValidationResult
}

export const string = new StringField<never>()
