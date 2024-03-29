/**
 * The result of a check.
 */
export type ValidationResult = { isValid: true } | { isValid: false; reason: string }

/**
 * Creates a *valid* result.
 */
export function valid(): ValidationResult {
  return { isValid: true }
}

/**
 * Creates an *invalid* result.
 * @param reason A sentence explaining what is wrong with the value.
 */
export function invalid(reason: string): ValidationResult {
  return { isValid: false, reason }
}
