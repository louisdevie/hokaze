import {Check} from '~/abstractions/validation'
import {Mapper} from "~/abstractions/mappers";

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
   * Other requirements the data must meet.
   */
  readonly checks: CheckCollection<T>

  /**
   * Creates a mapper for this type of data.
   */
  createMapper(): Mapper<T>
}

/**
 * A read-only list of checks.
 */
export type CheckCollection<T> = Iterable<Check<NonNullable<T>>>

export {json} from './json'
export {text} from './text'
export {blob} from './blob'
