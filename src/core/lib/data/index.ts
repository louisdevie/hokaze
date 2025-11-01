import { Mapper } from '@module/mappers'
import { ValidationResult } from '@module/validation'
import { ValidationPolicies } from '@module/validation'

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
   * Indicates whether that data may be omitted when sending/receiving it from the API.
   */
  readonly isOptional: boolean

  /**
   * Check if a value meets the different requirements of the field before being sent.
   * @param value The value to check.
   * @param policies
   */
  validate(value: T, policies: ValidationPolicies): ValidationResult

  /**
   * Creates a mapper for this data.
   */
  makeMapper(): Mapper<T>
}

export { json } from './json'
export { text } from './text'
export { blob } from './blob'
