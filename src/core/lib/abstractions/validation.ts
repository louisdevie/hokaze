/**
 * A check restricts what values are allowed by a descriptor.
 * The `@hokaze/validation` package provides checks for basic types and tools to enforce them.
 */
export interface Check<T> {
  validate(value: T): ValidationResult
}

export interface ValidationResult {
}
