/**
 * The result of a check.
 */
export type ValidationResult = { isValid: true } | { isValid: false; reason: string }

/**
 * Creates a *valid* result.
 */
export const valid = (): ValidationResult => ({ isValid: true })

/**
 * Creates an *invalid* result.
 * @param reason A sentence explaining what is wrong with the value.
 */
export const invalid = (reason: string): ValidationResult => ({ isValid: false, reason })
