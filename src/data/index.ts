import { Mapper } from '@module/mappers'
import { ValidationResult } from '@module/validation'

/**
 * An object describing a value mapped to the JavaScript type `T`.
 */
export interface DataDescriptor<T> {
  /**
   * Indicates whether this data may be received from the API.
   */
  readonly isReadable: boolean

  /**
   * Indicates whether this data may be sent to the API.
   */
  readonly isWritable: boolean

  /**
   * Indicates whether that field may be omitted when sending/receiving it from the API.
   */
  readonly isOptional: boolean

  /**
   * Creates a "blank" value to create new model objects.
   */
  makeBlankValue(): T

  /**
   * Check if a value meets the different requirements of the field before being sent.
   * @param value The value to check.
   */
  validate(value: T): ValidationResult

  /**
   * Creates a mapping for this field.
   */
  makeMapper(): Mapper<T>
}
