export interface SimpleValidationConfig {
  typesPolicy: 'ignore' | 'convertOrIgnore' | 'convertOrReject' | 'reject'
  missingValuesPolicy: 'ignore' | 'reject'
  failedCheckPolicy: 'ignore' | 'fixOrIgnore' | 'fixOrReject' | 'reject'
  mixedNullUndefined: 'ignore' | 'convert' | 'reject'
}

export interface InputOutputValidationConfig {
  input: SimpleValidationConfig
  output: SimpleValidationConfig
}

export type ValidationConfig = SimpleValidationConfig | InputOutputValidationConfig

/**
 * A list of validation policies for common use cases.
 */
export const Validation: {
  /**
   * All checks must pass and the data always needs to be in the expected format.
   */
  readonly Strict: ValidationConfig

  /**
   * Skip all checks and never fail.
   */
  readonly Unchecked: ValidationConfig

  /**
   * Try to use automatic fixes when possible, and fail otherwise.
   */
  readonly FixOrFail: ValidationConfig

  /**
   * Allow any value to be null, undefined or missing.
   */
  readonly AllowNullUndefined: ValidationConfig
} = Object.freeze({
  Strict: Object.freeze({
    typesPolicy: 'reject',
    missingValuesPolicy: 'reject',
    failedCheckPolicy: 'reject',
    mixedNullUndefined: 'reject',
  }),

  Unchecked: Object.freeze({
    typesPolicy: 'ignore',
    missingValuesPolicy: 'ignore',
    failedCheckPolicy: 'ignore',
    mixedNullUndefined: 'ignore',
  }),

  FixOrFail: Object.freeze({
    typesPolicy: 'convertOrReject',
    missingValuesPolicy: 'reject',
    failedCheckPolicy: 'fixOrReject',
    mixedNullUndefined: 'convert',
  }),

  AllowNullUndefined: Object.freeze({
    typesPolicy: 'reject',
    missingValuesPolicy: 'ignore',
    failedCheckPolicy: 'reject',
    mixedNullUndefined: 'convert',
  }),
})
