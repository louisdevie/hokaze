export interface ValidationConfigBase {
  typesPolicy: 'ignore' | 'convertOrIgnore' | 'convertOrReject' | 'reject'
  missingValuesPolicy: 'ignore' | 'reject'
  failedCheckPolicy: 'ignore' | 'fixOrIgnore' | 'fixOrReject' | 'reject'
  mixedNullUndefined: 'ignore' | 'convert' | 'reject'
}

export interface ValidationConfig {
  input: ValidationConfigBase
  output: ValidationConfigBase
}

export const DefaultValidationConfig: ValidationConfig = {
  input: {
    typesPolicy: 'ignore',
    missingValuesPolicy: 'ignore',
    failedCheckPolicy: 'ignore',
    mixedNullUndefined: 'ignore',
  },
  output: {
    typesPolicy: 'ignore',
    missingValuesPolicy: 'ignore',
    failedCheckPolicy: 'ignore',
    mixedNullUndefined: 'ignore',
  },
}

export type PartialValidationConfig =
  | Partial<ValidationConfigBase>
  | {
      input?: Partial<ValidationConfigBase>
      output?: Partial<ValidationConfigBase>
    }

/**
 * A list of validation policies for common use cases.
 */
export const Validation: {
  /**
   * All checks must pass and the data always needs to be in the expected format.
   */
  readonly Strict: ValidationConfigBase

  /**
   * Skip all checks and never fail.
   */
  readonly Unchecked: ValidationConfigBase

  /**
   * Try to use automatic fixes when possible, and fail otherwise.
   */
  readonly TryFixing: ValidationConfigBase

  /**
   * Allow any value to be null, undefined or missing.
   */
  readonly AllowNullUndefined: ValidationConfigBase
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

  TryFixing: Object.freeze({
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

export function mergeValidationConfig(
  base: ValidationConfig,
  override: PartialValidationConfig | undefined,
): ValidationConfig {
  let validation: ValidationConfig
  if (override === undefined) {
    validation = base
  } else if ('input' in override || 'output' in override) {
    validation = {
      input: mergeValidationConfigBase(base.input, override.input),
      output: mergeValidationConfigBase(base.output, override.output),
    }
  } else {
    validation = {
      input: mergeValidationConfigBase(base.input, override as Partial<ValidationConfigBase>),
      output: mergeValidationConfigBase(base.output, override as Partial<ValidationConfigBase>),
    }
  }
  return validation
}

function mergeValidationConfigBase(
  base: ValidationConfigBase,
  override: Partial<ValidationConfigBase> | undefined,
): ValidationConfigBase {
  return {
    failedCheckPolicy: override?.failedCheckPolicy ?? base.failedCheckPolicy,
    missingValuesPolicy: override?.missingValuesPolicy ?? base.missingValuesPolicy,
    mixedNullUndefined: override?.mixedNullUndefined ?? base.mixedNullUndefined,
    typesPolicy: override?.typesPolicy ?? base.typesPolicy,
  }
}
