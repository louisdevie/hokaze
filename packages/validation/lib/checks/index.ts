import { ValidationResult } from '../result'

export { maxLength, minLength, length } from './length'
export { notEmpty } from './notEmpty'
export {
  between,
  exclusiveBetween,
  lessThan,
  greaterThan,
  lessThanOrEqualTo,
  greaterThanOrEqualTo,
  positive,
  negative,
  strictlyPositive,
  strictlyNegative,
} from './range'

export type AutoFixResult<T> = { success: false } | { success: true; value: T }

