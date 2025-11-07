/**
 * A check restricts what values are allowed by a descriptor.
 * The `@hokaze/validation` package provides checks for basic types and tools to enforce them.
 */
export interface Check<T> {
  validate(value: T): ValidationResult
}

/**
 * A read-only list of checks.
 */
export interface CheckCollection<T> extends Iterable<Check<T>> {
  map<U>(callback: (check: Check<T>) => U): U[]
}

export interface ValidationResult {}
